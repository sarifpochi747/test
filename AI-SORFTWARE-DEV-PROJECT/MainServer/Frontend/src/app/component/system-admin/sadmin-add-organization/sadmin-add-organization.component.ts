import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiResponse, OrganizationDataForm, organizationData, upDateLog } from 'src/app/declaration/declaration';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-sadmin-add-organization',
  templateUrl: './sadmin-add-organization.component.html',
  styleUrls: ['./sadmin-add-organization.component.css']
})
export class SAdminAddOrganizationComponent {

  form: OrganizationDataForm = {
    name: new FormControl(null, Validators.required),
    email: new FormControl(null, [Validators.required, Validators.email]),
    phone: new FormControl(null, Validators.required),
    password: new FormControl(null, Validators.required),
    address: new FormControl(null, Validators.required),
  } as OrganizationDataForm


  organizationData: organizationData = {} as organizationData
  uniqueColumn: { uniqueColumnName: string }[] = []

  @ViewChild('updateResponse') updateResponse!: ElementRef;
  constructor(
    private readonly http: HttpClient,
    private readonly router: Router

  ) { }

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


  async addOrganization(): Promise<any> {

    if (this.form.name.invalid) {
      this.updateLog("Error", "ชื่อไม่ถูกต้อง")
      return;
    }
    if (this.form.email.invalid) {
      this.updateLog("Error", "อีเมลไม่ถูกต้อง")
      return;
    }
    if (this.form.address.invalid) {
      this.updateLog("Error", "ที่อยู่ไม่ถูกต้อง")
      return;
    }
    if (this.form.phone.invalid ||
      this.form.phone.value.trim() === '' ||
      this.form.phone.value.length !== 10 ||
      this.form.phone.value[0] !== '0') {
      this.updateLog("Error", "เบอร์มือถือไม่ถูกต้อง")
      return;
    }
    if (this.form.password.invalid || this.form.password.value.length < 8) {
      this.updateLog("Error", "รหัสผ่านไม่ถูกต้องหรือสั้นเกินไป")
      return;
    }

    for (const input of this.uniqueColumn) {
      if (!input.uniqueColumnName || input.uniqueColumnName.trim() === '') {
        this.updateLog("Error", "ชื่อคอลัมน์ต้องไม่เป็นช่องว่าง")
        return
      }
    }


    this.organizationData = {
      name: this.form.name.value,
      email: this.form.email.value,
      address: this.form.address.value,
      phone: this.form.phone.value,
      password: this.form.password.value,
      status: "Active"
    }
    await this.InsertData();

  }

  addInputBox() {
    this.uniqueColumn.push({} as { uniqueColumnName: string })
  }

  delInputBox(index: number) {
    this.uniqueColumn.splice(index, 1)
  }

  async InsertData(): Promise<void> {
    try {
      await new Promise<ApiResponse>((resolve, reject) => {
        this.http.post<ApiResponse>(environment.paths.createOrganization, {
          name: this.organizationData.name,
          email: this.organizationData.email,
          address: this.organizationData.address,
          phone: this.organizationData.phone,
          password: this.organizationData.password,
          status: this.organizationData.status,
          uniqueColumn: this.uniqueColumn
        }, { withCredentials: true }
        ).subscribe((res) => {
          if (res.statusCode === 201) {
            this.router.navigate(["system-admin/all-organization"])
          } else {
            this.updateLog("Error", "มีข้อผิดพลาดเกิดขึ้น")
          }
          resolve(res)
        }, err => {
          this.updateLog("Error", "มีข้อผิดพลาดเกิดขึ้น")
          reject(err)
        })
      })
    } catch (error) {
      console.error(error)

    }
  }
}
