import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { UserClient } from 'src/app/service/user-client/user-client.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-sadmin-login',
  templateUrl: './sadmin-login.component.html',
  styleUrls: ['./sadmin-login.component.css']
})
export class SAdminLoginComponent implements OnInit {
  usernameInputValue!: string;
  passwordInputValue!: string

  loginerror: boolean = false;
  errormessage: string = "Username หรือ Password ไม่ถูกต้อง";

  @ViewChild('loginstatus') loginstatus!: ElementRef;
  constructor(
    private readonly router: Router,
    private readonly user: UserClient,
    private readonly http:HttpClient
  ) { }

  async ngOnInit(): Promise<void> {
  }
  
  updateLog(status: string,msg:string) {
    if(status == "Success"){

    }else {
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
      await new Promise<Response>((resolve,reject)=>{
        this.http.post<Response>(environment.paths.systemAdminLogin,{
          email:this.usernameInputValue,
          password:this.passwordInputValue
        },{withCredentials:true}
        ).subscribe(res => {
          this.router.navigate(["system-admin/dashboard"]); 
          resolve(res);       
        },err=>{
          reject(err);
        })
      })
    } catch (error) {
      console.error(error)
      this.updateLog("Error", "มีข้อผิดพลาดเกิดขึ้น");
    }
    // this.user.setRoleDev('system-admin')

  }
}
