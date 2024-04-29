import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { ApiResponse, CameraDataForm } from 'src/app/declaration/declaration';
import { environment } from 'src/environments/environment';
import { FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-sadmin-camera',
  templateUrl: './sadmin-camera.component.html',
  styleUrls: ['./sadmin-camera.component.css']
})
export class SAdminCameraComponent implements OnInit {
  isAddModalShow!: boolean;
  isUpadateStatusCheck!: boolean;
  inputModel: cameraInterface = {} as cameraInterface
  page: number = 1;
  pageBar: number[] = [];
  maxPage!: number;

  filter: string | null = null;
  allDataLength!: number
  memory: { [key: string]: cameraInterface[] } = {}
  render: cameraInterface[] = []

  cameras!: cameraInterface
  cameraform!: cameraInterface
  form: CameraDataForm = {
    cameraName: new FormControl(null, Validators.required),
    cameraDetail: new FormControl(null, Validators.required),
    cameraSpec: new FormControl(null, Validators.required),
    dateInstall: new FormControl(null, Validators.required),
    organization: new FormControl(null, Validators.required),
  } as CameraDataForm
  cameraId!: string;


  isEdit: boolean = false;
  currentIndex?: number;
  cameraNameEditInput?: string;
  cameraDetailEditInput?: string;
  cameraSpecEditInput?: string;
  cameraDateEditInput?: string;
  @ViewChild('updateResponse') updateResponse!: ElementRef;

  constructor(
    private http: HttpClient,
    private readonly router: Router,

  ) { }
  async ngOnInit() {
    this.isAddModalShow = false;
    this.isUpadateStatusCheck = false;
    await this.queryData();


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
      this.queryData();
    } else {
      this.render = this.memory[this.page];
      this.generatePageBar();
    }
  }
  prevPage() {
    this.page--;
    if (this.memory[this.page] === undefined) {
      this.queryData();
    } else {
      this.render = this.memory[this.page];
      this.generatePageBar();
    }
  }
  nextPage() {
    this.page++;
    if (this.memory[this.page] === undefined) {
      this.queryData();
    } else {
      this.render = this.memory[this.page];
      this.generatePageBar();
    }
  }
  async queryData() {
    if (this.memory[this.page] && (!this.filter || this.filter.trim() === '')) {
      this.render = this.memory[this.page]
      return
    }
    this.render = []
    try {
      await new Promise((resolve, reject) => {
        this.http.get<ApiResponse>(environment.paths.getCamera + `?page=${this.page}&pageSize=50${(this.filter && this.filter.trim() !== '') ? '&filter=' + this.filter : ''}`, {
          withCredentials: true
        }).subscribe(res => {
          this.render = res.data;
          this.memory[this.page] = this.render
          resolve(res);
        }, err => {
          reject(err)
          this.updateLog("Error", "มีข้อผิดพลาดเกิดขึ้น")
        })
      })
    } catch (error) {

    }
    this.generatePageBar();
  }
  base64encrypt(text: string | number) {
    return btoa(String(text))
  }
  async addCamera() {
    if (this.form.cameraName.invalid ||
      this.form.cameraSpec.invalid ||
      this.form.cameraDetail.invalid ||
      this.form.dateInstall.invalid ||
      this.form.organization.invalid) {
      return;
    }


    this.cameraform = {
      cameraName: this.form.cameraName.value,
      cameraDetail: this.form.cameraDetail.value,
      cameraSpec: this.form.cameraSpec.value,
      dateInstall: this.form.dateInstall.value,
      organizationId: this.form.organization.value,
      status: "Active",
    }
    this.isAddModalShow = false;
    await this.insertData();
    await this.queryData();

  }

  async insertData() {
    try {
      await new Promise((resolve, reject) => {
        this.http.post<ApiResponse>(environment.paths.createCamera, {
          cameraName: this.cameraform.cameraName,
          cameraSpec: this.cameraform.cameraSpec,
          cameraDetail: this.cameraform.cameraDetail,
          dateInstall: this.cameraform.dateInstall,
          status: this.cameraform.status,
          organizationId: this.cameraform.organizationId
        }, { withCredentials: true }).subscribe(res => {
          resolve(res)
          this.updateLog("Success", "เพิ่มสำเร็จ")
        }, err => {
          reject(err)
        })
      })
    } catch (error) {
      console.error(error)
      this.updateLog("Error", "มีข้อผิดพลาดเกิดขึ้น")
    }
  }

  async updateCamera(camera: cameraInterface) {
    try {
      await new Promise((resolve, reject) => {
        this.http.put<ApiResponse>(environment.paths.systemAdminUpdateCamera, {
          cameraId: camera.cameraId,
          cameraName: camera.cameraName,
          cameraSpec: camera.cameraSpec,
          cameraDetail: camera.cameraDetail,
          dateInstall: camera.dateInstall,
          status: camera.status,
          organizationId: camera.organizationId

        }, { withCredentials: true }
        ).subscribe(res => {
          resolve(res)
          this.updateLog("Success", "อัพเดทสำเร็จ")
        }, err => {
          reject(err)
        })
      })
    } catch (error) {
      console.error(error)
      this.updateLog("Error", "มีข้อผิดพลาดเกิดขึ้น")
    }
  }

  async deleteCamera() {
    for (const camera of this.render) {
      if (camera.cameraId === this.cameraId) {
        camera.status = camera.status === "Active" ? "Disable" : "Active"
        this.isUpadateStatusCheck = false
        await this.updateCamera(camera);
      }
    }
  }

  async alertChangeStatusCamera(cameraID: any) {
    this.isUpadateStatusCheck = true
    this.cameraId = cameraID;
  }

  editCamera(index: number) {
    this.currentIndex = index;
    this.cameraNameEditInput = this.render[index].cameraName;
    this.cameraDetailEditInput = this.render[index].cameraDetail;
    this.cameraDateEditInput = this.dateInputFormat(this.render[index].dateInstall || '');
    this.cameraSpecEditInput = this.render[index].cameraSpec;
    this.isEdit = true;
  }

  async submitEditCamera() {
    try {
      if (!this.cameraNameEditInput || this.cameraNameEditInput.trim() === '') {
        this.updateLog("Error", "ชื่อต้องไม่เป็นช่องว่าง");
        return
      }
      if (!this.cameraDetailEditInput || this.cameraDetailEditInput.trim() === '') {
        this.updateLog("Error", "รายละเอียดต้องไม่เป็นช่องว่าง");
        return
      }
      if (!this.cameraDateEditInput || this.cameraDateEditInput.trim() === '') {
        this.updateLog("Error", "วันที่ติดตั้งต้องไม่เป็นช่องว่าง");
        return
      }
      if (!this.cameraSpecEditInput || this.cameraSpecEditInput.trim() === '') {
        this.updateLog("Error", "สเปคต้องไม่เป็นช่องว่าง");
        return
      }

      await new Promise<ApiResponse>((resolve, reject) => {
        if (typeof this.currentIndex !== 'number') {
          this.updateLog("Error", "มีข้อผิดพลาดเกิดขึ้น");
          return
        }
        this.http.put<ApiResponse>(environment.paths.systemAdminUpdateCamera, {
          cameraId: this.render[this.currentIndex].cameraId,
          cameraName: this.cameraNameEditInput,
          cameraDetail: this.cameraDetailEditInput,
          dateInstall: this.cameraDateEditInput,
          cameraSpec: this.cameraSpecEditInput,
        }, { withCredentials: true, }
        ).subscribe(res => {
          if (res.statusCode === 200) {
            this.updateLog("Success", "อัพเดทสำเร็จ");
            if (typeof this.currentIndex !== 'number') {
              this.queryData()
              return
            }
            this.render[this.currentIndex].cameraName = this.cameraNameEditInput;
            this.render[this.currentIndex].cameraDetail = this.cameraDetailEditInput;
            this.render[this.currentIndex].dateInstall = this.cameraDateEditInput;
            this.render[this.currentIndex].cameraSpec = this.cameraSpecEditInput;
            this.memory[this.page] = this.render
            this.cancleEdit()
          }
          resolve(res)
        }, err => {
          reject(err)
        })
      })
    } catch (e) {
      console.error(e)
      this.updateLog("Error", "มีข้อผิดพลาดเกิดขึ้น");
    }
  }

  cancleEdit() {
    this.currentIndex = undefined;
    this.cameraNameEditInput = undefined;
    this.cameraDetailEditInput = undefined;
    this.cameraSpecEditInput = undefined;
    this.cameraDateEditInput = undefined;
    this.isEdit = false;
  }

  dateInputFormat(str: string) {
    return new Date(str).toISOString().slice(0, 10)
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
