import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { ApiResponse } from 'src/app/declaration/declaration';

@Component({
  selector: 'app-camera',
  templateUrl: './camera.component.html',
  styleUrls: ['./camera.component.css']
})
export class CameraComponent implements OnInit {
  page: number = 1;
  pageBar: number[] = [];
  maxPage!: number;
  dataArr: cameraInterface[] = [];

  filter?: string;
  allDataLength!: number
  memory: { [key: string]: cameraInterface[] } = {}
  render: cameraInterface[] = []

  isEdit: boolean = false;
  cameraNameEditInput?: string;
  cameraDetailEditInput?: string;

  currentIndex?: number;

  @ViewChild('updateResponse') updateResponse!: ElementRef;
  constructor(
    private readonly http: HttpClient,
  ) { }

  ngOnInit(): void {
    this.queryData()
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
        this.http.get<ApiResponse>(environment.paths.getCamera+`?page=${this.page}&pageSize=50${(this.filter && this.filter.trim()!=='') ? '&filter='+this.filter:''}`, { withCredentials: true }).subscribe(res => {
          this.render = res.data
          this.maxPage = res.number || 0
          if (!this.filter || this.filter.trim() === '') {
            this.memory[this.page] = this.render
          }
          this.generatePageBar()
        }, err => {
          reject(err)
        })
      })
    } catch (e) {
      console.error(e)
    }
    this.generatePageBar();
  }

  editCamera(index: number) {
    this.currentIndex = index;
    this.cameraNameEditInput = this.render[index].cameraName;
    this.cameraDetailEditInput = this.render[index].cameraDetail;
    this.isEdit = true;
  }

  async submitEditCamera() {
    try {
      if (!this.cameraNameEditInput || this.cameraNameEditInput.trim() === '') {
        this.updateLog("Error", "ชื่อต้องไม่เป็นช่องว่าง");
        return
      }

      await new Promise<ApiResponse>((resolve, reject) => {
        if (typeof this.currentIndex !== 'number') {
          this.updateLog("Error", "มีข้อผิดพลาดเกิดขึ้น");
          return
        }
        this.http.put<ApiResponse>(environment.paths.adminUpdateCamera, {
          cameraId: this.render[this.currentIndex].cameraId,
          cameraName: this.cameraNameEditInput,
          cameraDetail: this.cameraDetailEditInput,
        }, { withCredentials: true, }
        ).subscribe(res => {
          if (res.statusCode === 200) {
            this.updateLog("Success", "อัพเดทสำเร็จ");
            if (typeof this.currentIndex !== 'number') {
              this.queryData()
              return
            }
            this.render[this.currentIndex].cameraName = this.cameraNameEditInput;
            this.render[this.currentIndex].cameraDetail = this.cameraDetailEditInput;
            this.memory[this.page] = this.render
            this.cancleEdit()
          }
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

  cancleEdit() {
    this.currentIndex = undefined;
    this.cameraNameEditInput = undefined;
    this.cameraDetailEditInput = undefined;
    this.isEdit = false;
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
