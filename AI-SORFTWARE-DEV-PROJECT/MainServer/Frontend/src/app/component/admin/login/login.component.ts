import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { UserClient } from 'src/app/service/user-client/user-client.service';
import { environment } from 'src/environments/environment';
import { Response } from 'express';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  usernameInputValue!: string;
  passwordInputValue!: string

  loginerror: boolean = false;
  errormessage: string = "Username หรือ Password ไม่ถูกต้อง";

  @ViewChild('loginstatus') loginstatus!: ElementRef;

  constructor(
    private readonly router: Router,
    private readonly user: UserClient,
    private readonly http: HttpClient,
  ) { }

  async ngOnInit(): Promise<void> {
    if (await this.user.isSessionAdmin() && this.user.client.isAdmin) {
      this.router.navigate(['dashboard']);
    }
  }

  updateLog(status: string, msg: string) {
    if (status === 'Success') {

    } else {
      const logDeteail = document.createElement('div')
      logDeteail.innerHTML = msg
      logDeteail.className = 'logDeteailLabel'
      this.loginstatus.nativeElement.replaceChildren()
      this.loginstatus.nativeElement.appendChild(logDeteail)
      this.loginstatus.nativeElement.classList = ('logDeteail error')
    }
  }
  
  async onLoginClick() {
    try {
      await new Promise<Response>((resolve, reject) => {
        this.http.post<Response>(environment.paths.adminLogin, {
          email: this.usernameInputValue,
          password: this.passwordInputValue
        }, { withCredentials: true, }
        ).subscribe(res => {
          this.router.navigate(['dashboard']);
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
}
