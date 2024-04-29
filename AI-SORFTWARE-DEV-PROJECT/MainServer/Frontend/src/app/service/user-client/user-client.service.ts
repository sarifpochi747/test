
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { authData } from 'src/app/declaration/declaration';
import { environment } from 'src/environments/environment';


class colorTeam {
  'bg': '#18191A' | '#F4F7FE';
  'elementBg': '#343536' | '#fff';
  'text': '#E4E6EB' | '#667085';
  'topicText': '#36438D' | '#E4E6EB'
}

@Injectable({
  providedIn: 'root',
})
export class UserClient {
  client: authData = {} as authData;
  domainList!: { [ket: string]: string };
  selectedPage: string = ''
  mode: string = 'light';

  public colorTeam = new colorTeam()

  constructor(private readonly http: HttpClient, private readonly router: Router) {
    this.mode = String(localStorage.getItem('mode'));
    this.mode = this.mode ? this.mode : 'light'
    this.mode = 'light'
    if (this.mode === 'light') {
      this.mode = 'light';
      this.colorTeam.bg = '#F4F7FE'
      this.colorTeam.elementBg = '#fff'
      this.colorTeam.text = '#667085'
      this.colorTeam.topicText = '#36438D'
    } else {
      this.mode = 'dark';
      this.colorTeam.bg = '#18191A'
      this.colorTeam.elementBg = '#343536'
      this.colorTeam.text = '#E4E6EB'
      this.colorTeam.topicText = '#E4E6EB'
    }
  }

  public changeMode() {
    if (this.mode === 'light') {
      this.mode = 'dark';
      this.colorTeam.bg = '#18191A'
      this.colorTeam.elementBg = '#343536'
      this.colorTeam.text = '#E4E6EB'
    } else {
      this.mode = 'light';
      this.colorTeam.bg = '#F4F7FE'
      this.colorTeam.elementBg = '#fff'
      this.colorTeam.text = '#667085'
      this.colorTeam.topicText = '#36438D'
    }
    localStorage.setItem('mode', this.mode);
  }

  private getSessionData() {
    return new Promise((resolve) => {
      this.http.get<authData>(environment.paths.checkSessionActive, { withCredentials: true, }).subscribe(
        (e) => {
          this.client = e;
          resolve(true);
        },
        (error) => {
          if (!this.router.url.includes('login')) {
            this.router.navigate(['login']);
          }
          console.error('Error fetching session data:', error);
          resolve(false);
        }
      );
    });
  }

  async isSessionAdmin() {
    if (this.client.isAdmin === undefined) {
      await this.getSessionData();
    }
    return this.client.isAdmin;
  }

  async isSessionSystemAdmin() {
    if (this.client.isSystemAdmin === undefined) {
      await this.getSessionData();
    }
    return this.client.isSystemAdmin;
  }
}
