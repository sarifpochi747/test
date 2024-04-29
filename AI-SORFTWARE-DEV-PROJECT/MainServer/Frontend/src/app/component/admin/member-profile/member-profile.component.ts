import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { environment } from 'src/environments/environment';
import { ActivatedRoute, Router } from '@angular/router';
import { WebcamImage } from 'ngx-webcam';
import { Observable, Subject } from 'rxjs';
import { ApiResponse, checkImgRes, imgB64Req } from 'src/app/declaration/declaration';
import { SocketService } from 'src/app/service/socket/socket.service';
import { UserClient } from 'src/app/service/user-client/user-client.service';

@Component({
  selector: 'app-member-profile',
  templateUrl: './member-profile.component.html',
  styleUrls: ['./member-profile.component.css']
})
export class MemberProfileComponent implements OnInit, OnDestroy {

  page: number = 1;
  pageBar: number[] = [];
  maxPage!: number;
  allDataLength!: number
  memory: { [key: string]: trackingInterface[] } = {}
  render: trackingInterface[] = []

  isEdit: boolean = false;

  videoElement: any;
  webcamImage!: WebcamImage;
  isUsingCamera: boolean = false;
  stream!: MediaStream | undefined;
  trigger: Subject<any> = new Subject();
  nextWebcam: Subject<any> = new Subject();

  userData: memberData = {} as memberData;
  userDataLog!: memberData;

  tracking: trackingInterface[] = [];

  deleteAlert: boolean = false;

  imageFile!: File | null;
  @ViewChild('imgInput') imgInput!: ElementRef;
  @ViewChild('updateResponse') updateResponse!: ElementRef;

  get invokeObservable(): Observable<any> {
    return this.trigger.asObservable();
  }

  get nextWebcamObservable(): Observable<any> {
    return this.nextWebcam.asObservable();
  }

  constructor(
    private readonly http: HttpClient,
    private route: ActivatedRoute,
    private readonly router: Router,
    private readonly socketService: SocketService,
    public readonly user: UserClient,
  ) {

  }


  generatePageBar() {
    this.pageBar = []
    for (let pageNum = this.page - 4 > 0 ? this.page - 4 : 1; pageNum < this.page && pageNum > 0; pageNum++) {
      this.pageBar.push(pageNum);
    }
    this.pageBar.push(this.page)
    for (let pageNum = this.page + 1; (pageNum < this.page + 4 || this.pageBar.length < 9) && this.maxPage >= pageNum; pageNum++) {
      this.pageBar.push(pageNum);
    }
  }
  onPageBarClick(pnum: number) {
    this.page = pnum;
    if (this.memory[this.page] === undefined) {
      this.queryDetection();
    } else {
      this.render = this.memory[this.page];
      this.generatePageBar();
    }
  }

  onEditBtnClick() {
    this.isEdit = !this.isEdit
  }

  async queryData() {
    let memberId: string = '';

    this.route.params.subscribe(params => {
      memberId = params['memberId'];
    });

    if (!memberId || memberId.trim() === '') {
      this.router.navigate(['all-member'])
    }
    try {
      const foundMember = await new Promise((resolve, reject) => {
        this.http.get<ApiResponse>(environment.paths.getSpecificMember + "/" + memberId
          , { withCredentials: true }).subscribe(res => {
            this.userData = res.data
            this.userDataLog = JSON.parse(JSON.stringify(res.data))
            resolve(res.data)
          }, err => {
            reject(err)
          })
      })
      if (!foundMember) {
        this.router.navigate(['all-member'])
      }
    } catch (e) {
      console.error(e)
    }
  }

  async queryDetection() {
    let memberId: string = '';

    this.route.params.subscribe(params => {
      memberId = params['memberId'];
    });

    if (!memberId || memberId.trim() === '') {
      this.router.navigate(['all-member'])
    }

    if (this.memory[this.page]) {
      this.render = this.memory[this.page]
      return
    }
    this.render = []

    try {
      await new Promise((resolve, reject) => {
        this.http.get<ApiResponse>(environment.paths.getDetectionSpecificMember + "/" + memberId + '?page=' + this.page + '&pageSize=50'
          , { withCredentials: true }).subscribe(res => {
            this.maxPage = Math.ceil(res.data / 50)
            this.generatePageBar()
            resolve(res)
          }, err => {
            reject(err)
          })
      })
    } catch (e) {
      console.error(e)
    }
    this.memory[this.page] = this.render
  }

  cancleEdit() {
    this.isEdit = false;
    this.userData = { ...this.userDataLog }
  }

  async checkImg(imgB64: string) {
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
        this.userData.profileImage = imgChecked.imgB64;
        this.closCamera()
      } else {
        this.updateLog("Error", String(imgChecked?.message));
      }
    } catch (e: any) {
      if (e.status === 413) {
        this.updateLog("Error", "รูปขนาดใหญ่เกินไป");
      } else {
        this.updateLog("Error", "มีข้อผิดพลาดเกิดขึ้นกับภาพ");
      }
    }
  }

  handleUpload(event: any) {
    try {
      const reader = new FileReader();
      reader.readAsDataURL(event.target.files[0]);
      reader.onload = async () => {
        if (typeof reader.result === 'string') {
          await this.checkImg(reader.result)
          this.imageFile = null;
        }
      }
    } catch {
      this.updateLog("Error", "มีข้อผิดพลาดเกิดขึ้นกับภาพ");
    }
  }

  async initCamera() {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ video: true });
      this.videoElement.srcObject = this.stream;
    } catch (error) {
    }
  }

  openCamera() {
    this.isUsingCamera = true;
    this.stream = undefined
    this.initCamera();
  }

  closCamera() {
    this.isUsingCamera = false;
    this.stream = undefined;
  }

  public getSnapshot(): void {
    this.trigger.next(void 0);
  }

  imgUpload() {
    this.imgInput.nativeElement.click()
  }

  async captureImg(webcamImage: WebcamImage): Promise<void> {
    try {
      this.webcamImage = webcamImage;
    } catch {
      this.updateLog("Error", "มีข้อผิดพลาดเกิดขึ้นกับภาพ");
    }
    this.checkImg(webcamImage!.imageAsDataUrl)
  }

  async updateData() {
    if (!this.userData.name || this.userData.name.trim() === '') {
      this.updateLog("Error", "ชื่อไม่ถูกต้อง")
      return
    }

    if (!this.userData.address || this.userData.address.trim() === '') {
      this.updateLog("Error", "ที่อยู่ไม่ถูกต้อง")
      return
    }

    if (!this.userData.birthday || this.userData.birthday.trim() === '') {
      this.updateLog("Error", "วันเกิดไม่ถูกต้อง")
      return
    }

    if (!this.userData.gender || !["Man", "Woman"].includes(this.userData.gender)) {
      this.updateLog("Error", "เพศไม่ถูกต้อง")
      return
    }

    if (!this.userData.phone || this.userData.phone.trim() === '' || this.userData.phone.length !== 10 || this.userData.phone[0] !== '0') {
      this.updateLog("Error", "เบอร์มือถือไม่ถูกต้อง")
      return
    }

    if (!this.userData.profileImage || this.userData.profileImage.trim() === '') {
      this.updateLog("Error", "ภาพโปรไฟล์ไม่ถูกต้อง")
      return
    }

    try {
      await new Promise<ApiResponse>((resolve, reject) => {
        this.http.put<ApiResponse>(environment.paths.updateMember, {
          employeeId: this.userData.employeeId,
          name: this.userData.name,
          phone: this.userData.phone,
          gender: this.userData.gender,
          address: this.userData.address,
          birthday: this.userData.birthday,
          profileImage: this.userData.profileImage,
          status: 'Active',
          uniqueData: this.userData.uniqueData

        }, { withCredentials: true, }
        ).subscribe(res => {
          this.userDataLog = JSON.parse(JSON.stringify(this.userData))
          this.isEdit = false
          this.updateLog("Success", "อัพเดทข้อมูลสำเร็จ");
          resolve(res)
        }, err => {
          reject(err)
        })
      })
    } catch {
      this.updateLog("Error", "มีข้อผิดพลาดเกิดขึ้น");
    }
  }

  onDeleteMemberClick() {
    this.deleteAlert = true;
  }

  async connfirmDeleteMemberClick() {
    try {
      await new Promise((resolve, reject) => {
        this.http.delete<ApiResponse>(environment.paths.deleteMember + '/' + this.userData.employeeId,
          { withCredentials: true }
        ).subscribe(res => {
          if (res.statusCode === 200) {
            this.cancleDelete()
            this.updateLog("Success", "ลบสำเร็จ")
            this.router.navigate(['all-member'])
          } else {
            this.updateLog("Error", "มีข้อผิดพลาดเกิดขึ้น")
          }
        }, err => {
          reject(err)
          this.updateLog("Error", "มีข้อผิดพลาดเกิดขึ้น")
        })
      })
    } catch (e) {
      console.error(e)
    }
  }

  cancleDelete() {
    this.deleteAlert = false;
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

  async ngOnInit() {
    if (this.socketService.socket.active) {
      this.socketService.socket.on<string>(this.user.client.dataUser.organizationId + '-admin-specific-user-detection', (data: string) => {
        if (this.tracking.length < 50)
          this.tracking.push(JSON.parse(data))
      });
      this.socketService.socket.on<string>(this.user.client.dataUser.organizationId + '-admin-specific-user-detection-closed', () => {
        this.socketService.socket.off<string>(this.user.client.dataUser.organizationId + '-admin-specific-user-detection')
        this.socketService.socket.off<string>(this.user.client.dataUser.organizationId + '-admin-specific-user-detection-closed')
      });
    }
    await Promise.all([
      this.queryData(),
      this.queryDetection()
    ])
  }
  ngOnDestroy() {
    this.socketService.socket.off<string>(this.user.client.dataUser.organizationId + '-admin-specific-user-detection')
  }
}
