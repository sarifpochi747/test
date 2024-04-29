import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiResponse, sadminOrganizationData } from 'src/app/declaration/declaration';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-sadmin-organization-profile',
  templateUrl: './sadmin-organization-profile.component.html',
  styleUrls: ['./sadmin-organization-profile.component.css']
})
export class SAdminOrganizationProfileComponent implements OnInit {

  profileData = {} as sadminOrganizationData
  profileDataLog = {} as sadminOrganizationData

  uniqueColumn: {
    uniqColId: string,
    uniqColName: string
  }[] = []

  uniqueColumnLog: {
    uniqColId: string,
    uniqColName: string
  }[] = []

  newUniqueColumn: {
    uniqColName: string
  }[] = []

  organizationId!: string;
  camera: cameraInterface[] = []

  passwordInput!: string;
  confirmPasswordInput!: string;

  currentIndex: number | undefined = undefined
  isEdit: boolean = false;
  isUniqColEdit: boolean = false;
  isDelete: boolean = false;

  @ViewChild('updateResponse') updateResponse!: ElementRef;
  constructor(
    private route: ActivatedRoute,
    private http: HttpClient
  ) { }

  async ngOnInit() {
    this.route.params.subscribe((param) => {
      this.organizationId = param['organizationId']
      this.organizationId = this.base64decrpt(this.organizationId)
    });
    this.queryDataById()
    this.queryCameraByOrganizationId();
  }

  onEditBtnClick() {
    this.isEdit = !this.isEdit
    if (!this.isEdit) {
      this.profileData = { ...this.profileDataLog };
    }
  }


  onUniqEditBtnClick() {
    this.isUniqColEdit = !this.isUniqColEdit
    if (!this.isUniqColEdit) {
      this.uniqueColumn = []
      for (const data of this.uniqueColumnLog) {
        this.uniqueColumn.push({ ...data })
      }
    }
  }

  base64decrpt(text: string | number | undefined) {
    if (text !== undefined) {
      return String(text)
    }
    return ''
  }

  async queryDataById() {
    try {
      await new Promise((resolve, reject) => {
        this.http.get<ApiResponse>(environment.paths.getOrganizationById + `/${this.organizationId}`, {
          withCredentials: true
        }).subscribe(res => {
          this.profileData = { ...res.data };
          this.profileDataLog = { ...res.data };
          resolve(res)
        }, err => {
          reject(err)
        })
      })
    } catch (error) {
      console.error(error)
    }
    try {
      await new Promise((resolve, reject) => {
        this.http.get<ApiResponse>(environment.paths.getUniqueColumn + `/${this.organizationId}`, {
          withCredentials: true
        }).subscribe(res => {
          for (const data of res.data) {
            this.uniqueColumn.push({ ...data })
            this.uniqueColumnLog.push({ ...data })
          }
          resolve(res)
        }, err => {
          reject(err)
        })
      })
    } catch (error) {
      console.error(error)
    }
  }
  async queryCameraByOrganizationId() {
    try {
      await new Promise((resolve, reject) => {
        this.http.get<ApiResponse>(environment.paths.getCamera + `/${this.organizationId}`, {
          withCredentials: true
        }).subscribe(res => {
          this.camera = res.data;
          resolve(res)
        }, err => {
          reject(err)
        })
      })
    } catch (error) {
      console.error(error)

    }
  }

  async updateData() {
    const body: { [key: string]: string } = {}

    if (!this.profileData.organizationName || this.profileData.organizationName.trim() === '') {
      this.updateLog("Error", "ชื่อไม่ถูกต้อง")
      return
    }

    if (!this.profileData.address || this.profileData.address.trim() === '') {
      this.updateLog("Error", "ที่อยู่ไม่ถูกต้อง")
      return
    }

    if (!this.profileData.phone || this.profileData.phone.trim() === '' || this.profileData.phone.length !== 10 || this.profileData.phone[0] !== '0') {
      this.updateLog("Error", "เบอร์มือถือไม่ถูกต้อง")
      return
    }

    if (!this.profileData.email || this.profileData.email.trim() === '' || !this.profileData.email.includes('@')) {
      this.updateLog("Error", "อีเมลไม่ถูกต้อง")
      return
    }

    if (!this.profileData.email || this.profileData.email.trim() === '' || !this.profileData.email.includes('@')) {
      this.updateLog("Error", "อีเมลไม่ถูกต้อง")
      return
    }

    if (this.passwordInput &&
      this.confirmPasswordInput &&
      this.passwordInput.trim() !== '' &&
      this.passwordInput === this.confirmPasswordInput) {
      body['newPassword'] = this.passwordInput
      body['confirmPassword'] = this.confirmPasswordInput
    } else if (this.passwordInput || this.confirmPasswordInput) {
      this.updateLog("Error", "รหัสผ่านไม่ถูกต้อง")
      return
    }

    try {
      await new Promise<ApiResponse>((resolve, reject) => {
        this.http.put<ApiResponse>(environment.paths.updateOrganization + '/' + this.profileData.organizationId, {
          organizationName: this.profileData.organizationName,
          phone: this.profileData.phone,
          address: this.profileData.address,
          email: this.profileData.email,
          ...body
        }, { withCredentials: true, }
        ).subscribe(res => {
          this.isEdit = false
          this.profileDataLog = { ...this.profileData }
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

  async updateUniqCol() {
    let errCount = 0
    for (const index in this.uniqueColumn) {
      if (this.uniqueColumn[index].uniqColName !== this.uniqueColumnLog[index].uniqColName) {
        try {
          await new Promise<ApiResponse>((resolve, reject) => {
            this.http.put<ApiResponse>(environment.paths.updateUniqueColumn, {
              uniqueColumnId: this.uniqueColumn[index].uniqColId,
              uniqueColumnName: this.uniqueColumn[index].uniqColName
            }, { withCredentials: true, }
            ).subscribe(res => {
              this.uniqueColumnLog[index] = { ...this.uniqueColumn[index] }
              resolve(res)
            }, err => {
              reject(err)
            })
          })
        } catch {
          errCount++;
          this.updateLog("Error", "มีข้อผิดพลาดเกิดขึ้น");
        }
      }
    }

    for (const index in this.newUniqueColumn) {
      if (this.newUniqueColumn[index].uniqColName && this.newUniqueColumn[index].uniqColName.trim() !== '') {
        try {
          await new Promise<ApiResponse>((resolve, reject) => {
            this.http.post<ApiResponse>(environment.paths.createUniqueColumn, {
              organizationId: this.profileData.organizationId,
              uniqueColumnName: this.newUniqueColumn[index].uniqColName
            }, { withCredentials: true, }
            ).subscribe(res => {
              this.uniqueColumn.push({
                uniqColId: res.data,
                uniqColName: this.newUniqueColumn[index].uniqColName
              })
              this.uniqueColumnLog.push({
                uniqColId: res.data,
                uniqColName: this.newUniqueColumn[index].uniqColName
              })
              resolve(res)
            }, err => {
              reject(err)
            })
          })
        } catch {
          errCount++;
          this.updateLog("Error", "มีข้อผิดพลาดเกิดขึ้น");
        }
      }
    }

    if (errCount === 0) {
      this.isUniqColEdit = false
      this.isUniqColEdit = false
      this.updateLog("Success", "อัพเดทข้อมูลสำเร็จ");
    }
  }
  addInputBox() {
    this.newUniqueColumn.push({} as {
      uniqColName: string
    })
  }

  onDeleteClick(index: number) {
    this.isDelete = true;
    this.currentIndex = index;
  }

  async submitDelete() {
    try {
      await new Promise((resolve, reject) => {
        if (this.currentIndex === undefined) {
          this.updateLog("Error", "มีข้อผิดพลาดเกิดขึ้น")
          return
        }
        this.http.delete<ApiResponse>(environment.paths.deleteUniqueColumn + '/' + this.uniqueColumn[this.currentIndex].uniqColId,
          { withCredentials: true }
        ).subscribe(res => {
          if (res.statusCode === 200) {
            if (this.currentIndex !== undefined) {

              this.uniqueColumn.splice(this.currentIndex, 1)
              this.uniqueColumnLog.splice(this.currentIndex, 1)

              this.updateLog("Success", "ลบสำเร็จ")
            } else {
              this.queryDataById()
            }
            this.cancleDelete()
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
    this.isDelete = false;
    this.currentIndex = undefined;
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

  dateFormater(date: string | undefined) {
    if (date)
      return (new Date(date)).toISOString().slice(0,10)
    return
  }

}
