import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ApiResponse, organizationData } from 'src/app/declaration/declaration';
import { UserClient } from 'src/app/service/user-client/user-client.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

  profileData = {} as organizationData

  currenrPasswordInput!: string;
  passwordInput!: string;
  confirmPasswordInput!: string;

  isEdit: boolean = false;

  @ViewChild('updateResponse') updateResponse!: ElementRef;
  constructor(
    public readonly user: UserClient,
    private readonly http: HttpClient,
  ) {
    this.profileData.name = this.user.client.dataUser.organizationName;
    this.profileData.email = this.user.client.dataUser.email;
    this.profileData.phone = this.user.client.dataUser.phone;
    this.profileData.address = this.user.client.dataUser.address;
  }
  async updatePassword() {
    if (!this.passwordInput || this.passwordInput.trim() === '') {
      this.updateLog("Error", "รหัสผ่านใหม่ไม่ถูกต้อง")
      return
    }
    if (this.passwordInput.length < 8) {
      this.updateLog("Error", "รหัสผ่านใหม่สั้นเกินไป")
      return
    }
    if (this.passwordInput !== this.confirmPasswordInput) {
      this.updateLog("Error", "รหัสผ่านไม่ตรงกัน")
      return
    }

    try {
      await new Promise<ApiResponse>((resolve, reject) => {
        this.http.put<ApiResponse>(environment.paths.updatePassword, {
          currentPassword: this.currenrPasswordInput,
          newPassword: this.passwordInput,
          confirmPassword: this.confirmPasswordInput,
        }, { withCredentials: true, }
        ).subscribe(res => {
          this.isEdit = false
          this.updateLog("Success", "อัพเดทข้อมูลสำเร็จ");
          resolve(res)
        }, err => {
          reject(err)
          this.updateLog("Error", "มีข้อผิดพลาดเกิดขึ้น");
        })
      })
    } catch {
      this.updateLog("Error", "มีข้อผิดพลาดเกิดขึ้น");
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
  onEditBtnClick() {
    this.isEdit = !this.isEdit
  }
  ngOnInit() { }

}
