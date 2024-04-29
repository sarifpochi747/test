import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { ApiResponse } from 'src/app/declaration/declaration';

@Component({
  selector: 'app-member',
  templateUrl: './member.component.html',
  styleUrls: ['./member.component.css']
})
export class MemberComponent implements OnInit {
  page: number = 1;
  pageBar: number[] = [];
  maxPage!: number;

  filter: string | null = null;
  allDataLength!: number
  memory: { [key: string]: memberData[] } = {}
  render: memberData[] = []

  memberDeletingId!: string;
  deleteAlert: boolean = false;

  @ViewChild('updateResponse') updateResponse!: ElementRef;
  constructor(
    private readonly http: HttpClient,
  ) { }

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

  async getEmployeeNumber() {
    try {
      await new Promise(async (resolve, reject) => {
        this.http.get<ApiResponse>(environment.paths.getMemberNumber + (
          this.filter && this.filter !== '' &&
            this.filter !== ' ' ? '&filter=' + this.filter : ''
        ), { withCredentials: true }).subscribe(async (res) => {
          this.maxPage = Math.floor(res.data / 50)
          await this.queryData();
        }, err => {
          reject(err)
        })
      })
    } catch (e) {
      console.error(e)
    }
  }

  async queryData() {
    if (this.memory[this.page] && this.filter?.trim() === '') {
      this.render = this.memory[this.page]
      return
    }
    this.render = []
    try {
      await new Promise((resolve, reject) => {
        this.http.get<ApiResponse>(environment.paths.getAllMember + '?page=' + this.page + '&pageSize=50' + (
          this.filter && this.filter !== '' &&
            this.filter !== ' ' ? '&filter=' + this.filter : ''
        ),
          { withCredentials: true }
        ).subscribe(res => {
          this.render = res.data
          if (!this.filter || this.filter.trim() === '') {
            this.memory[this.page] = this.render
          }
          this.generatePageBar();
        }, err => {
          reject(err)
        })
      })
    } catch (e) {
      console.error(e)
    }
  }

  onDeleteMemberClick(memberId: string) {
    this.memberDeletingId = memberId;
    this.deleteAlert = true;
  }

  async connfirmDeleteMemberClick() {
    try {
      await new Promise((resolve, reject) => {
        this.http.delete<ApiResponse>(environment.paths.deleteMember + '/' + this.memberDeletingId,
          { withCredentials: true }
        ).subscribe(res => {
          if (res.statusCode === 200) {
            this.cancleDelete()
            this.updateLog("Success", "ลบสำเร็จ")
            this.queryData();
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
    this.memberDeletingId = '';
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
    await this.getEmployeeNumber();

  }
}
