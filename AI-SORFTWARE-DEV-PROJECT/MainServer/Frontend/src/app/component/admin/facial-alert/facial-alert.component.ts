import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SocketService } from 'src/app/service/socket/socket.service';
import { UserClient } from '../../../service/user-client/user-client.service';
import { environment } from 'src/environments/environment';
import { ApiResponse, checkImgRes, imgB64Req } from 'src/app/declaration/declaration';

@Component({
  selector: 'app-facial-alert',
  templateUrl: './facial-alert.component.html',
  styleUrls: ['./facial-alert.component.css']
})
export class FacialAlertComponent implements OnInit, OnDestroy {
  page: number = 1;
  pageBar: number[] = [];
  maxPage!: number;
  dataArr: any[] = [];

  allDataLength!: number
  memory: { [key: string]: facialAlertData[] } = {}
  render: facialAlertData[] = []

  alertNameInput!: string

  currentIndex!: number;
  imageFile!: string | undefined;
  @ViewChild('imgInput') imgInput!: ElementRef;

  isAddModalShow: boolean = false;

  @ViewChild('updateResponse') updateResponse!: ElementRef;

  alertDeletingId!: number | undefined;
  deleteAlert: boolean = false;

  constructor(
    private readonly http: HttpClient,
    public readonly user: UserClient,
    private readonly socketService: SocketService,
  ) {

  }

  async ngOnInit() {
    if (this.socketService.socket.active) {
      this.socketService.socket.on<string>(this.user.client.dataUser.organizationId + '-admin-facial', (data: string) => {
        if (this.render.length < 50)
          this.render.push(JSON.parse(data))
      });
      this.socketService.socket.on<string>(this.user.client.dataUser.organizationId + '-admin-facial-closed', () => {
        this.socketService.socket.off<string>(this.user.client.dataUser.organizationId + '-admin-facial')
        this.socketService.socket.off<string>(this.user.client.dataUser.organizationId + '-admin-facial-closed')
      });
    }
    await this.queryData()
  }

  ngOnDestroy() {
    this.socketService.socket.off<string>(this.user.client.dataUser.organizationId + '-admin-facial');
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
    if (this.memory[this.page]) {
      this.render = this.memory[this.page]
      return
    }
    this.render = []
    try {
      await new Promise((resolve, reject) => {
        this.http.get<ApiResponse>(environment.paths.getAlert + '?page=' + this.page + '&pageSize=50', { withCredentials: true }).subscribe(res => {
          this.memory[this.page] = this.render
          this.maxPage = Math.ceil(res.data / 50)
          this.generatePageBar()
        }, err => {
          reject(err)
        })
      })
    } catch (e) {
      console.error(e)
    }
  }

  onUploadImgClick() {
    this.imgInput.nativeElement.click()
  }

  onImgInputChange(e: any) {
    const file = e.target?.files[0];

    if (file) {
      const reader = new FileReader();

      reader.onload = (e: any) => {
        const base64String = e.target.result;
        this.checkImg(base64String)
      };
      reader.readAsDataURL(file);
    }
  }

  async checkImg(imgB64: string) {
    try {
      const imgChecked = await new Promise<checkImgRes>((resolve, reject) => {
        this.http.post<checkImgRes>(environment.paths.checkImg, {
          imgB64: imgB64
        } as imgB64Req, { withCredentials: true, }
        ).subscribe(res => {
          this.imageFile = res.imgB64
          resolve(res)
        }, err => {
          reject(err)
        })
      })
      if (!imgChecked.isPass || !imgChecked.imgB64) {
        this.updateLog("Error", String(imgChecked.message));
        this.imgInput.nativeElement.value = '';
      }
    } catch (e: any) {
      if (e.status === 413) {
        this.updateLog("Error", "รูปขนาดใหญ่เกินไป");
      } else {
        this.updateLog("Error", "มีข้อผิดพลาดเกิดขึ้นกับภาพ");
      }
    }
  }

  handleUpload(event: any) {
    const files = event.target.files[0];
    try {
      const reader = new FileReader();
      reader.readAsDataURL(files);
      reader.onload = async () => {
        if (typeof reader.result === 'string') {
          await this.checkImg(reader.result)
          this.imageFile = undefined;
        }
      }
    } catch {
      this.updateLog("Error", "มีข้อผิดพลาดเกิดขึ้น");
    }
  }

  onDelImgClick() {
    this.imageFile = undefined
    this.imgInput.nativeElement.value = '';
  }


  async createAlert() {
    try {
      await new Promise<ApiResponse>((resolve, reject) => {
        this.http.post<ApiResponse>(environment.paths.createAlert, {
          imgFile: this.imageFile,
          alertName: this.alertNameInput,
          organizationId: this.user.client.dataUser.organizationId,
        }, { withCredentials: true, }
        ).subscribe(res => {
          if (res.statusCode === 201) {
            this.updateLog("Success", "สร้างการแจ้งเตือนเสร็จสิ้น");
            this.cancleCreate()
            this.render.unshift(res.data)
            this.generatePageBar()
          }
          resolve(res)
        }, err => {
          reject(err)
        })
      })
    } catch (e: any) {
      this.updateLog("Error", "มีข้อผิดพลาดเกิดขึ้น");
    }

  }

  cancleCreate() {
    this.isAddModalShow = false
    this.imgInput.nativeElement.value = '';
    this.alertNameInput = '';
    this.imageFile = undefined;
  }

  onDeleteAlertClick(id: number) {
    this.alertDeletingId = id;
    this.deleteAlert = true;
  }

  async connfirmDeleteAlertClick() {
    try {
      await new Promise((resolve, reject) => {
        if (this.alertDeletingId === undefined) {
          this.updateLog("Error", "มีข้อผิดพลาดเกิดขึ้น")
          return
        }
        this.http.delete<ApiResponse>(environment.paths.deleteAlert + '/' + this.render[this.alertDeletingId].id,
          { withCredentials: true }
        ).subscribe(res => {
          if (res.statusCode === 200) {
            if (this.alertDeletingId === undefined) {
              this.updateLog("Error", "มีข้อผิดพลาดเกิดขึ้น")
              return
            }
            this.render.splice(this.alertDeletingId, 1)
            this.memory[this.page] = this.render
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
    this.alertDeletingId = undefined;
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
