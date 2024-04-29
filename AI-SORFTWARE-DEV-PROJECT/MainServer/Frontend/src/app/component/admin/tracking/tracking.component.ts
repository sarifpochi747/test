import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ApiResponse, checkImgRes, imgB64Req } from 'src/app/declaration/declaration';
import { SocketService } from 'src/app/service/socket/socket.service';
import { UserClient } from 'src/app/service/user-client/user-client.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-tracking',
  templateUrl: './tracking.component.html',
  styleUrls: ['./tracking.component.css']
})
export class TrackingComponent implements OnInit {
  page: number = 1;
  pageBar: number[] = [];
  maxPage!: number;

  allDataLength!: number
  memory: { [key: string]: trackingInterface[] } = {}
  render: trackingInterface[] = []

  camList: cameraInterface[] = []
  isAddModalShow: boolean = false;

  emotionVal: string = 'Emotion'
  cameraVal: string = 'All'

  startDateVal!: string;
  endDateVal!: string;
  imageFile!: string | undefined;
  @ViewChild('imgInput') imgInput!: ElementRef
  @ViewChild('updateResponse') updateResponse!: ElementRef;
  constructor(
    private readonly http: HttpClient,
    private readonly socketService: SocketService,
    private readonly user: UserClient,
  ) { }

  ngOnInit() {
    if (this.socketService.socket.active) {
      this.socketService.socket.on(this.user.client.dataUser.organizationId + '-admin-detection', (data) => {
        if (this.render.length < 50)
          this.render.push(JSON.parse(data))
      });
      this.socketService.socket.on(this.user.client.dataUser.organizationId + '-admin-detection-closed', () => {
        this.socketService.socket.off<string>(this.user.client.dataUser.organizationId + '-admin-detection');
        this.socketService.socket.off<string>(this.user.client.dataUser.organizationId + '-admin-detection-closed');
      });
      this.socketService.socket.on(this.user.client.dataUser.organizationId + '-admin-detection-rtc', (data) => {
        this.render.unshift(JSON.parse(data))
        this.memory[this.page] = this.render
      });
    }
    this.getCamera()
    this.queryData()
  }

  async getCamera() {
    try {
      await new Promise((resolve, reject) => {
        this.http.get<ApiResponse>(environment.paths.getCamera + '/', { withCredentials: true }).subscribe(res => {
          this.camList = res.data
        }, err => {
          reject(err)
        })
      })
    } catch (e) {
      console.error(e)
    }
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

  onImageUploadClick() {
    this.imgInput.nativeElement.click()
  }


  async findImageCaptureByImage() {

    if (!this.imageFile) {
      this.updateLog("Error", "กรุณาอัพโหลดรูปภาพ");
      this.imageFile = undefined
      this.imgInput.nativeElement.value = ''
    }
    else if (!this.startDateVal || !this.endDateVal) {
      this.updateLog("Error", "กรุณากรอกวันที่ด้วย");
      this.imageFile = undefined
      this.imgInput.nativeElement.value = ''
    }
    else {
      this.render = []
      const body = {} as {
        image: string,
        startDate: string,
        endDate: string
      }
      body.image = this.imageFile!
      body.startDate = this.startDateVal
      body.endDate = this.endDateVal
      try {
        this.socketService.socket.on(this.user.client.dataUser.organizationId + '-admin-detection', (data) => {
            this.render.push(JSON.parse(data))
        });
        await new Promise(async (resolve, reject) => {
          this.http.post<ApiResponse>(environment.paths.gettDetectionByImage, body, { withCredentials: true }).subscribe(
            async (res) => {
              this.maxPage = Math.ceil(res.data / 50);
              this.memory[this.page] = this.render;
              this.isAddModalShow = false
              this.generatePageBar();
            }, err => {
              reject(err)
            })
        })
      } catch (e) {
        console.error(e)
      }

    }


  }

  onDelImgClick() {
    this.imageFile = undefined
    this.imgInput.nativeElement.value = '';
  }
  async onImgInputChange(e: any) {
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
  cancleSearchImg() {
    this.isAddModalShow = false
    this.imgInput.nativeElement.value = '';
    this.imageFile = undefined;
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

  async queryData() {

    if ((this.startDateVal && !this.endDateVal) || (!this.startDateVal && this.endDateVal)) {
      return
    }

    const body = {} as {
      emotion: string,
      cameraId: string,
      image: string,
      startDate: string,
      endDate: string
    }
    if (this.emotionVal) {
      body.emotion = this.emotionVal
    }
    if (this.cameraVal) {
      body.cameraId = this.cameraVal
    }
    if (this.imageFile) {
      body.image = this.imageFile
    }
    if (this.startDateVal && this.endDateVal) {
      body.startDate = this.startDateVal
      body.endDate = this.endDateVal
    }

    if (this.memory[this.page] && !body.cameraId && !body.emotion && !body.endDate && !body.startDate && !body.image) {
      this.render = this.memory[this.page]
      return
    }
    this.render = []
    this.socketService.socket.on(this.user.client.dataUser.organizationId + '-admin-detection', (data) => {
      if (this.render.length < 50)
        this.render.push(JSON.parse(data))
    });
    this.socketService.socket.on(this.user.client.dataUser.organizationId + '-admin-detection-closed', () => {
      this.socketService.socket.off<string>(this.user.client.dataUser.organizationId + '-admin-detection');
      this.socketService.socket.off<string>(this.user.client.dataUser.organizationId + '-admin-detection-closed');
    });
    try {
      await new Promise(async (resolve, reject) => {
        await this.http.post<ApiResponse>(environment.paths.getAllDetection + '?page=' + this.page + '&pageSize=50', body, { withCredentials: true }).subscribe(
          async (res) => {
            this.maxPage = Math.ceil(res.data / 50);
            this.memory[this.page] = this.render;
            this.generatePageBar();
          }, err => {
            reject(err)
          })
      })
    } catch (e) {
      console.error(e)
    }

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
