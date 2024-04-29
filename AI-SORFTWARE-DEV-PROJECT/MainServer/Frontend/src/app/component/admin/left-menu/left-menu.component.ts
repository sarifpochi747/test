import { Component, ElementRef, OnInit, ViewChild, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { UserClient } from 'src/app/service/user-client/user-client.service';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
@Component({
  selector: 'app-left-menu',
  templateUrl: './left-menu.component.html',
  styleUrls: ['./left-menu.component.css']
})
export class LeftMenuComponent implements OnInit {
  isShowState!: boolean;
  isFocusState: boolean = false;
  shouldDisplay: boolean = false;
  logoutAlert: boolean = false;

  compName: string = 'COMPANY NAME';
  pageSelected: string = 'dashboard';
  @ViewChild('leftBar') leftBar!: ElementRef;
  @ViewChild('updateResponse') updateResponse!: ElementRef;
  constructor(readonly user: UserClient,
    private readonly http: HttpClient,
    private readonly router: Router) {}

  onMenuClick(page: string) {
    this.pageSelected = page;
    this.logoutAlert = false;
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

  async onConfirmLogout() {
    try {
      await new Promise<Response>((resolve, reject) => {
        this.http.put<Response>(environment.paths.logout, null, { withCredentials: true, }
        ).subscribe(async res => {
          this.user.client.isAdmin = false
          this.router.navigate(['login'])
          this.logoutAlert = false
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

  show(){
    this.isFocusState = true
    this.leftBar.nativeElement.classList = 'left-bar-container left-bar-show'
  }

  hidden(){
    this.isFocusState = false
    this.leftBar.nativeElement.classList = 'left-bar-container left-bar-hidden'
  }

  ngOnInit() {
    this.isShowState = (this.user.client.isAdmin && !this.router.url.includes('login'))
    this.pageSelected = this.router.url.split('/')[1];
  }

}
