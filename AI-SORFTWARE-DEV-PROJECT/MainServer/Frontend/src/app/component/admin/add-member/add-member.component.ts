import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, ViewChild, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';
import { WebcamImage } from 'ngx-webcam';
import { Observable, Subject } from 'rxjs';
import { Router } from '@angular/router';
import { ApiResponse, UniqueColumn, checkImgRes, imgB64Req } from 'src/app/declaration/declaration';

class memberInputObj {
  isSubmitted: boolean = false;
  isAllImgPass: boolean = false;
  memberId?: string;
  nameInput: string = '';
  phoneInput: string = '';
  genderInputstring = 'gender';
  birthdayInput: string = '';
  addressInput: string = '';
  uniqueColumn: UniqueColumn[] = [];
  imgArray: { imgSrc: string, message: string }[] = [];
}

@Component({
  selector: 'app-add-member',
  templateUrl: './add-member.component.html',
  styleUrls: ['./add-member.component.css']
})
export class AddMemberComponent implements OnInit {

  videoElement: any;
  isUsingCamera: boolean = false;

  UniqueColumnModel!: UniqueColumn[];
  memberInputObjModel: memberInputObj = new memberInputObj()

  inputArray: memberInputObj[] = []

  currentIndex!: number;
  imageFile!: File | null;
  @ViewChild('imgInput') imgInput!: ElementRef;

  @ViewChild('updateResponse') updateResponse!: ElementRef;
  @ViewChild('birthdayInputEle') birthdayInputEle!: ElementRef;
  @ViewChild('scrollContainer') scrollContainer!: ElementRef;

  private stream!: MediaStream | undefined;
  private trigger: Subject<any> = new Subject();
  public webcamImage!: WebcamImage;
  private nextWebcam: Subject<any> = new Subject();


  constructor(
    private readonly http: HttpClient,
    private readonly router: Router
  ) { }

  async ngOnInit() {
    await this.getUniqueData();

  }

  async getUniqueData() {
    try {
      await new Promise((resolve, reject) => {
        this.http.get<ApiResponse>(environment.paths.getUniqueColumn, { withCredentials: true }).subscribe(res => {
          for (let column of res.data) {
            this.memberInputObjModel.uniqueColumn.push(Object.assign({}, column))
          }
          this.addInputBox()
        }, err => {
          reject(err)
        })
      })
    } catch (e) {
      console.error(e)
    }
  }

  async checkImg(imgB64: string, index: number) {
    const imgArrLenght = this.inputArray[this.currentIndex].imgArray.length
    try {
      const imgChecked = await new Promise<checkImgRes>((resolve, reject) => {
        this.http.post<checkImgRes>(environment.paths.checkImg, {
          imgB64: imgB64
        } as imgB64Req, { withCredentials: true, }
        ).subscribe(res => {
          resolve(res)
        }, err => {
          reject(err)
        })
      })
      if (imgChecked.isPass && imgChecked.imgB64) {
        this.inputArray[this.currentIndex].imgArray.push({
          message: '',
          imgSrc: imgChecked.imgB64
        })
        this.updateLog("Success", "เพิ่มรูปภาพสำเร็จ");
      } else {
        this.updateLog("Error", "ภาพที่ " + (imgArrLenght + index + 1) + " :" + imgChecked.message);
      }
    } catch (e: any) {
      if (e.status === 413) {
        this.updateLog("Error", "รูปที่ " + (index + 1) + " ขนาดใหญ่เกินไป");
      } else {
        this.updateLog("Error", "มีข้อผิดพลาดเกิดขึ้นกับภาพที่ " + (imgArrLenght + index + 1));
      }
    }
  }

  public getSnapshot(): void {
    this.trigger.next(void 0);
  }

  async initCamera() {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ video: true });
      this.videoElement.srcObject = this.stream;
    } catch (error) {
    }
  }

  openCamera(index: number) {
    this.currentIndex = index;
    this.isUsingCamera = true;
    this.stream = undefined
    this.initCamera();
  }

  closCamera() {
    this.isUsingCamera = false;
    this.stream = undefined;
  }

  async captureImg(webcamImage: WebcamImage): Promise<void> {
    const imgArrLenght = this.inputArray[this.currentIndex].imgArray.length
    try {
      this.webcamImage = webcamImage;
    } catch {
      this.updateLog("Error", "มีข้อผิดพลาดเกิดขึ้นกับภาพที่ " + (imgArrLenght + 1));
    }
    this.checkImg(webcamImage!.imageAsDataUrl, 0)
  }

  get invokeObservable(): Observable<any> {
    return this.trigger.asObservable();
  }

  get nextWebcamObservable(): Observable<any> {
    return this.nextWebcam.asObservable();
  }

  handleUpload(event: any) {
    const files = event.target.files;
    const imgArrLenght = this.inputArray[this.currentIndex].imgArray.length
    for (let index = 0; index < files.length; index++) {
      try {
        const reader = new FileReader();
        reader.readAsDataURL(files[index]);
        reader.onload = async () => {
          if (typeof reader.result === 'string') {
            await this.checkImg(reader.result, index)
            this.imageFile = null;
          }
        }
      } catch {
        this.updateLog("Error", "มีข้อผิดพลาดเกิดขึ้นกับภาพที่ " + (imgArrLenght + index + 1));
      }
    }
  }

  imgUpload(index: number) {
    this.currentIndex = index;
    this.imgInput.nativeElement.click()
  }

  addInputBox() {
    this.inputArray.push(JSON.parse(JSON.stringify(this.memberInputObjModel)))
    this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
  }

  deletemg(member: memberInputObj, index: number) {
    member.imgArray.splice(index, 1)
  }

  async createMember(requestEmp: memberInputObj, index: number) {
    if (!requestEmp.nameInput || requestEmp.nameInput.trim() === '') {
      this.updateLog("Error", "ชื่อไม่ถูกต้อง")
      return
    }

    if (!requestEmp.addressInput || requestEmp.addressInput.trim() === '') {
      this.updateLog("Error", "ที่อยู่ไม่ถูกต้อง")
      return
    }

    if (!requestEmp.birthdayInput || requestEmp.birthdayInput.trim() === '') {
      this.updateLog("Error", "วันเกิดไม่ถูกต้อง")
      return
    }

    if (!requestEmp.genderInputstring || !["Man", "Woman"].includes(requestEmp.genderInputstring)) {
      this.updateLog("Error", "เพศไม่ถูกต้อง")
      return
    }

    if (!requestEmp.phoneInput || requestEmp.phoneInput.trim() === '' || requestEmp.phoneInput.length !== 10 || requestEmp.phoneInput[0] !== '0') {
      this.updateLog("Error", "เบอร์มือถือไม่ถูกต้อง")
      return
    }

    if (!requestEmp.imgArray[0] || requestEmp.imgArray[0].imgSrc.trim() === '') {
      this.updateLog("Error", "ภาพโปรไฟล์ไม่ถูกต้อง")
      return
    }
    for (const column of requestEmp.uniqueColumn) {
      if(!column.uniqColData || column.uniqColData.trim() === ''){
        this.updateLog("Error", "คนที่ " + (index+1) + " : มีข้อมูลที่เป็นช่องว่าง");
        return
      }
    }
    try {
      let memberId: any = requestEmp.memberId
      if (!memberId) {
        memberId = await new Promise<ApiResponse>((resolve, reject) => {
          this.http.post<ApiResponse>(environment.paths.createMember, {
            name: requestEmp.nameInput,
            phone: requestEmp.phoneInput,
            gender: requestEmp.genderInputstring,
            address: requestEmp.addressInput,
            birthday: requestEmp.birthdayInput,
            profileImage: requestEmp.imgArray[0].imgSrc,
            status: 'Active',
            uniqueData: requestEmp.uniqueColumn

          }, { withCredentials: true, }
          ).subscribe(res => {
            resolve(res)
          }, err => {
            reject(err)
          })
        })
        if (memberId.data.uniqueColumnErr.length > 0) {
          this.updateLog("Error", "คนที่ " + (index+1) + " : มีข้อผิดพลาดเกิดขึ้น");
          const url = this.router.serializeUrl(
            this.router.createUrlTree([`/member/${memberId.data.employeeId}`])
          );
          window.open(url, '_blank');
        }


        memberId = memberId.data.employeeId
      }
      if (memberId) {
        let errCount: number = 0
        requestEmp.isSubmitted = true;
        requestEmp.memberId = memberId
        let index = 0
        let length = requestEmp.imgArray.length
        while (index < length) {
          const img = requestEmp.imgArray[index]
          try {
            const imgAdded: ApiResponse = await new Promise<ApiResponse>((resolve, reject) => {
              this.http.post<ApiResponse>(environment.paths.createEmbedded,
                { imgB64: img.imgSrc, employeeId: memberId } as imgB64Req,
                { withCredentials: true, }
              ).subscribe(res => {
                resolve(res)
              }, err => {
                reject(err)
              })
            })
            if (imgAdded.statusCode === 201) {
              requestEmp.imgArray.splice(index, 1)
              length = requestEmp.imgArray.length
            } else {
              this.updateLog("Error", "คนที่ " + (index+1) + " : ภาพที่ " + (errCount + index + 1) + " : มีข้อผิดพลาดเกิดขึ้น");
              errCount += 1
              index += 1
            }
          } catch (e: any) {
            if (e.status === 413) {
              this.updateLog("Error", "รูปที่ " + (index + 1) + " ขนาดใหญ่เกินไป");
            } else {
              this.updateLog("Error", "คนที่ " + (index+1) + " : มีข้อผิดพลาดเกิดขึ้นกับภาพที่ " + (errCount + index + 1));
            }
            errCount += 1
            index += 1
          }
        }
        if (errCount === 0) {
          requestEmp.isAllImgPass = true
          this.updateLog("Success", "คนที่ " + (index+1) + " : เพิ่มสำเร็จ");
        }
      } else {
        this.updateLog("Error", "คนที่ " + (index+1) + " : มีข้อผิดพลาดเกิดขึ้น");
      }
    } catch (e: any) {
      this.updateLog("Error", "คนที่ " + (index+1) + " : มีข้อผิดพลาดเกิดขึ้น");
    }
  }

  async createMemberList() {
    let i = 0;
    let n = this.inputArray.length

    while (i < n) {
      try {
        await this.createMember(this.inputArray[i], i)
        if (this.inputArray[i].isAllImgPass && this.inputArray[i].isSubmitted) {
          this.inputArray.splice(i, 1);
          n = this.inputArray.length
        } else {
          i++
        }
      } catch {
        this.updateLog("Error", "คนที่ " + i + " : มีข้อผิดพลาดเกิดขึ้น");
        i++
      }
    }
    if (this.inputArray.length === 0) {
      this.addInputBox()
    }
  }

  updateLog(status: string, msg: string) {
    const logDeteail = document.createElement('div')

    this.updateResponse.nativeElement.replaceChildren()
    if (status === 'Success') {
      this.updateResponse.nativeElement.classList = ('responseLog-popup logDeteail success popup')
      logDeteail.innerHTML = msg;
    } else {
      this.updateResponse.nativeElement.classList = ('responseLog-popup logDeteail error popup')
      logDeteail.innerHTML = msg;
    }
    this.updateResponse.nativeElement.appendChild(logDeteail)
    let counter = 0;
    const interval = setInterval(() => {
      counter++;
      if (counter === 2) {
        this.updateResponse.nativeElement.classList = ('responseLog-popup logDeteail')
      }
      if (counter === 3) {
        clearInterval(interval);
      }
    }, 1000);
  }
}
