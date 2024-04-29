import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { ApiResponse, sadminOrganizationData } from 'src/app/declaration/declaration';
@Component({
  selector: 'app-sadmin-organization',
  templateUrl: './sadmin-organization.component.html',
  styleUrls: ['./sadmin-organization.component.css']
})
export class SAdminOrganizationComponent implements OnInit {
  page: number = 1;
  pageBar: number[] = [];
  maxPage!: number;
  dataArr: any[] = [];
  isUpadateStatusCheck: boolean = true;
  currentOrganizationId!: number | undefined;
  filter: string | null = null;
  allDataLength!: number
  memory: { [key: string]: sadminOrganizationData[] } = {}
  render: sadminOrganizationData[] = [];
  organization!: sadminOrganizationData;

  @ViewChild('updateResponse') updateResponse!: ElementRef;

  constructor(
    private readonly http: HttpClient
  ) { }

  async ngOnInit() {
    this.isUpadateStatusCheck = false;
    await this.getOrganization();
  }


  async getOrganization() {
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
        this.http.get<ApiResponse>(environment.paths.getAllOrganization + '?page=1&pageSize=50' + ((this.filter && this.filter.trim() !== '') ? '&filter=' + this.filter : ''), {
          withCredentials: true
        }).subscribe(res => {
          this.render = res.data
          resolve(res)
        }, err => {
          reject(err)
        })
      })
    } catch (error) {
      console.error(error)

    }
    this.generatePageBar();
  }

  async updateOrg() {
    try {
      await new Promise((resolve, reject) => {
        if (this.currentOrganizationId === undefined) {
          this.updateLog("Error", "มีข้อผิดพลาดเกิดขึ้น")
          return
        }

        const newStatus = this.render[this.currentOrganizationId].organizeStatus === "Active" ? "Disable" : "Active"
        this.http.put<ApiResponse>(environment.paths.updateOrganization + `/${this.render[this.currentOrganizationId].organizationId}`, {
          status: newStatus,
          email: this.render[this.currentOrganizationId].email,
        }, { withCredentials: true }
        ).subscribe(res => {
          if (this.currentOrganizationId === undefined) {
            this.updateLog("Error", "มีข้อผิดพลาดเกิดขึ้น")
            return
          }
          this.render[this.currentOrganizationId].organizeStatus = newStatus
          this.updateLog("Success", "อัพเดทสำเร็จ")
          this.cancleDelete()
          resolve(res)
        }, err => {
          reject(err)
        })
      })
    } catch (error) {
      console.error(error)
    }
  }
  async alertChangeStatusOrganization(index: number) {
    this.currentOrganizationId = index;
    this.isUpadateStatusCheck = true;
  }
  cancleDelete() {
    this.isUpadateStatusCheck = false;
    this.currentOrganizationId = undefined
  }
  async deleteOrganization(index: number) {
    this.currentOrganizationId = index;
    this.isUpadateStatusCheck = true
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
