import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { ApiResponse, GreetingDto } from 'src/app/declaration/declaration';
import { UserClient } from 'src/app/service/user-client/user-client.service';

@Component({
  selector: 'app-greeting',
  templateUrl: './greeting.component.html',
  styleUrls: ['./greeting.component.css']
})
export class GreetingComponent implements OnInit {
  page: number = 1;
  pageBar: number[] = [];
  maxPage!: number;

  filter?: string;
  allDataLength!: number
  memory: { [key: string]: GreetingDto[] } = {}
  render: GreetingDto[] = []

  isEdit: boolean = false;
  isAdd: boolean = false;
  deleteAlert: boolean = false;

  messageEditInput?: string;
  addEmotionInput: 'happy' | 'surprise' | 'surprise' | 'sad' | 'fear' | 'disgust' | 'angry' | 'neutral' = 'happy';

  currentIndex?: number;

  @ViewChild('updateResponse') updateResponse!: ElementRef;
  constructor(
    private readonly http: HttpClient,
    public readonly user: UserClient,
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
    if (!this.isAdd && this.memory[this.page] && (!this.filter || this.filter.trim() === '')) {
      this.render = this.memory[this.page]
      return
    }
    this.render = []
    try {
      await new Promise((resolve, reject) => {
        this.http.get<ApiResponse>(environment.paths.getGreeting + (this.filter ? '/?filter=' + this.filter : '/'), { withCredentials: true }).subscribe(res => {
          this.render = res.data
          if (!this.filter || this.filter.trim() === '') {
            this.memory[this.page] = this.render
          }
          this.maxPage = Math.ceil((res.number||0) / 50)
          this.clearInput()
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
    this.messageEditInput = this.render[index].message;
    this.addEmotionInput = this.render[index].emotion;
    this.isEdit = true;
  }
  async submitCreate() {
    try {
      if (!this.messageEditInput || this.messageEditInput.trim() === '') {
        this.updateLog("Error", "ข้อความต้องไม่เป็นช่องว่าง");
        return
      }

      await new Promise<ApiResponse>((resolve, reject) => {
        this.http.post<ApiResponse>(environment.paths.createGreeting, {
          organizationId: this.user.client.dataUser.organizationId,
          emotion: this.addEmotionInput,
          message: this.messageEditInput,
        }, { withCredentials: true, }
        ).subscribe(async res => {
          if (res.statusCode === 201) {
            this.render.push({
              greetingId: res.data,
              emotion: this.addEmotionInput,
              message: this.messageEditInput,
            })
            this.updateLog("Success", "เพิ่มสำเร็จ");
            this.clearInput()
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

  async submitEdit() {
    try {
      if (!this.messageEditInput || this.messageEditInput.trim() === '') {
        this.updateLog("Error", "ข้อความต้องไม่เป็นช่องว่าง");
        return
      }

      await new Promise<ApiResponse>((resolve, reject) => {
        if (typeof this.currentIndex !== 'number') {
          this.updateLog("Error", "มีข้อผิดพลาดเกิดขึ้น");
          return
        }
        this.http.put<ApiResponse>(environment.paths.updateGreeting, {
          greetingId: this.render[this.currentIndex].greetingId,
          emotion: this.addEmotionInput,
          message: this.messageEditInput,
        }, { withCredentials: true, }
        ).subscribe(res => {
          if (res.statusCode === 200) {
            this.updateLog("Success", "อัพเดทสำเร็จ");
            if (typeof this.currentIndex !== 'number') {
              this.queryData()
              return
            }
            this.render[this.currentIndex].message = this.messageEditInput || '';
            this.render[this.currentIndex].emotion = this.addEmotionInput || 'happy';
            this.memory[this.page] = this.render
            this.clearInput()
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

  clearInput() {
    this.currentIndex = undefined;
    this.messageEditInput = undefined;
    this.addEmotionInput = 'happy';
    this.isEdit = false;
    this.isAdd = false;
  }

  onDeleteMemberClick(id: number) {
    this.currentIndex = id;
    this.deleteAlert = true;
  }

  async connfirmDeleteMemberClick() {
    try {
      await new Promise((resolve, reject) => {
        if (this.currentIndex === undefined) {
          this.updateLog("Error", "มีข้อผิดพลาดเกิดขึ้น")
          return
        }
        this.http.delete<ApiResponse>(environment.paths.deleteGreeting + '/' + this.render[this.currentIndex].greetingId,
          { withCredentials: true }
        ).subscribe(res => {
          if (res.statusCode === 200) {
            this.updateLog("Success", "ลบสำเร็จ");
            if (typeof this.currentIndex !== 'number') {
              this.queryData()
              return
            }
            this.render.splice(this.currentIndex, 1)
            this.memory[this.page] = this.render
            this.cancleDelete()
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
    this.currentIndex = undefined;
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
      return (new Date(date)).toISOString().slice(0, 10)
    return
  }
}
