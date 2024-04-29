import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiResponse } from 'src/app/declaration/declaration';
import { SocketService } from 'src/app/service/socket/socket.service';
import { UserClient } from 'src/app/service/user-client/user-client.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-tracking-detail',
  templateUrl: './tracking-detail.component.html',
  styleUrls: ['./tracking-detail.component.css']
})
export class TrackingDetailComponent implements OnInit, OnDestroy {

  render: trackingInterface[] = [];
  imageCaptureData: ImagrCaptureData = {} as ImagrCaptureData;
  imageBefore: ImagrCaptureData[] = [];
  imageAfter: ImagrCaptureData[] = [];

  @ViewChild('updateResponse') updateResponse!: ElementRef;
  constructor(
    private readonly http: HttpClient,
    private readonly socketService: SocketService,
    private readonly user: UserClient,
    private route: ActivatedRoute,
    private readonly router: Router,
  ) { }

  ngOnInit() {
    if (this.socketService.socket.active) {
      this.socketService.socket.on(this.user.client.dataUser.organizationId + '-admin-detection', (data) => {
        if (this.render.length < 50)
          this.render.push(JSON.parse(data))
      });
      this.socketService.socket.on(this.user.client.dataUser.organizationId + '-admin-image-before', (data) => {
        if (this.imageBefore.length < 5)
          this.imageBefore.push(JSON.parse(data))
      });
      this.socketService.socket.on(this.user.client.dataUser.organizationId + '-admin-image-after', (data) => {
        if (this.imageAfter.length < 5)
          this.imageAfter.push(JSON.parse(data))
      });
      this.socketService.socket.on(this.user.client.dataUser.organizationId + '-admin-detection-closed', () => {
        this.socketService.socket.off(this.user.client.dataUser.organizationId + '-admin-detection')
        this.socketService.socket.off(this.user.client.dataUser.organizationId + '-admin-detection-closed')
      });
      this.socketService.socket.on(this.user.client.dataUser.organizationId + '-admin-image-before-closed', () => {
        this.socketService.socket.off(this.user.client.dataUser.organizationId + '-admin-image-before')
        this.socketService.socket.off(this.user.client.dataUser.organizationId + '-admin-image-before-closed')
      });
      this.socketService.socket.on(this.user.client.dataUser.organizationId + '-admin-image-after-closed', () => {
        this.socketService.socket.off(this.user.client.dataUser.organizationId + '-admin-image-after')
        this.socketService.socket.off(this.user.client.dataUser.organizationId + '-admin-image-after-closed')
      });
    }
    this.getImageCaptureData()
    this.getDetection()
  }
  ngOnDestroy() {
    this.socketService.socket.off(this.user.client.dataUser.organizationId + '-admin-detection');
    this.socketService.socket.off(this.user.client.dataUser.organizationId + '-admin-image-before');
    this.socketService.socket.off(this.user.client.dataUser.organizationId + '-admin-image-after');
  }

  async getImageCaptureData() {
    try {
      let imgCapId: number | null = null
      // get id member from parameter
      this.route.params.subscribe(params => {
        imgCapId = params['imagecaptureId'];
      });
      // no id member
      if (!imgCapId) {
        this.updateLog('Error', "มีข้อผิดพลาดเกิดขึ้น")
        this.router.navigate(['tracking'])
        return
      }

      await new Promise(async (resolve, reject) => {
        this.http.get<ApiResponse>(environment.paths.getImageCapture + '/?imagecaptureId=' + (imgCapId ? imgCapId : ''), { withCredentials: true }).subscribe(
          async (res) => {
            this.imageCaptureData = res.data
          },
          err => {
            reject(err)
          })
      })
    } catch (e) {
      this.updateLog('Error', "มีข้อผิดพลาดเกิดขึ้น")
      this.router.navigate(['tracking'])
      console.error(e)
    }
  }

  async getDetection() {
    try {
      let imgCapId: number | null = null
      this.route.params.subscribe(params => {
        imgCapId = params['imagecaptureId'];
      });
      if (!imgCapId) {
        this.updateLog('Error', "มีข้อผิดพลาดเกิดขึ้น")
        this.router.navigate(['tracking'])
        return
      }
      await new Promise(async (resolve, reject) => {
        this.http.post<ApiResponse>(environment.paths.getAllDetection + '/?imagecaptureId=' + (imgCapId ? imgCapId : ''), {}, { withCredentials: true }).subscribe(
          async (res) => {
            this.getNearest()
          },
          err => {
            reject(err)
          })
      })
    } catch (e) {
      this.updateLog('Error', "มีข้อผิดพลาดเกิดขึ้น")
      this.router.navigate(['tracking'])
      console.error(e)
    }
  }


  
  async getNearest() {
    try {
      let imgCapId: number | null = null
      this.route.params.subscribe(params => {
        imgCapId = params['imagecaptureId'];
      });
      if (!imgCapId) {
        this.updateLog('Error', "มีข้อผิดพลาดเกิดขึ้น")
        this.router.navigate(['tracking'])
        return
      }
      await new Promise(async (resolve, reject) => {
        this.http.get<ApiResponse>(environment.paths.getNearestImageCapture + '/?imagecaptureId=' + (imgCapId ? imgCapId + '&cameraId=' + this.imageCaptureData.cameraId : '/?cameraId=' + this.imageCaptureData.cameraId), { withCredentials: true }).subscribe(
          async (res) => { },
          err => {
            reject(err)
          })
      })
    } catch (e) {
      this.updateLog('Error', "มีข้อผิดพลาดเกิดขึ้น")
      this.router.navigate(['tracking'])
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

  routerClick(id: number) {
    this.router.navigateByUrl('/refresh', { skipLocationChange: true }).then(() => {
      this.router.navigate(['tracking-detail/' + id]);
    });
  }
}