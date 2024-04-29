import { Component, ElementRef, OnInit, ViewChild, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { UserClient } from 'src/app/service/user-client/user-client.service';

@Component({
  selector: 'app-sadmin-left-menu',
  templateUrl: './sadmin-left-menu.component.html',
  styleUrls: ['./sadmin-left-menu.component.css']
})
export class SAdminLeftMenuComponent implements OnInit {
  isShowState!: boolean;
  isFocusState: boolean = false;
  shouldDisplay: boolean = false;
  logoutAlert: boolean = false;

  compName: string = 'COMPANY NAME';
  pageSelected: string = 'dashboard';
  @ViewChild('leftBar') leftBar!: ElementRef;
  constructor(readonly user: UserClient, private readonly router: Router) {}

  onMenuClick(page: string) {
    this.pageSelected = page;
  }

  onConfirmLogout() {
    this.router.navigate(['login'])
    this.logoutAlert = false;
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
    this.isShowState = (this.user.client.isSystemAdmin && !this.router.url.includes('login'))
    this.pageSelected = this.router.url.split('/')[1];
  }
}
