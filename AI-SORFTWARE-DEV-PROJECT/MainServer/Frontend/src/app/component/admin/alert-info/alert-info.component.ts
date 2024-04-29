import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, OnDestroy, OnInit, ViewChild, Renderer2 } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiResponse } from 'src/app/declaration/declaration';
import { SocketService } from 'src/app/service/socket/socket.service';
import { UserClient } from 'src/app/service/user-client/user-client.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-alert-info',
  templateUrl: './alert-info.component.html',
  styleUrls: ['./alert-info.component.css']
})
export class AlertInfoComponent implements OnInit, OnDestroy {
  page: number = 1;
  pageBar: number[] = [];
  maxPage!: number;
  dataArr: any[] = [];

  allDataLength!: number
  memory: { [key: string]: AlertInfo[] } = {}
  render: AlertInfo[] = []

  alertNameInput!: string

  imageFile: string = '';

  isDeleteAlertShow: boolean = false;
  alertData: facialAlertData = {} as facialAlertData;

  @ViewChild('imgInput') imgInput!: ElementRef;
  @ViewChild('audioElement') audioElement!: ElementRef;

  constructor(
    private readonly http: HttpClient,
    private route: ActivatedRoute,
    private readonly socketService: SocketService,
    public readonly user: UserClient,
    private renderer: Renderer2
  ) { 
  }

  ngOnInit() {
    if (this.socketService.socket.active) {
      this.socketService.socket.on<string>(this.user.client.dataUser.organizationId + '-admin-alert-detection', (data: string) => {
        if (this.render.length < 50)
          this.render.push(JSON.parse(data))
      });
      this.socketService.socket.on<string>(this.user.client.dataUser.organizationId + '-admin-alert-detection-closed', (data: string) => {
        this.socketService.socket.off<string>(this.user.client.dataUser.organizationId + '-admin-alert-detection')
        this.socketService.socket.off<string>(this.user.client.dataUser.organizationId + '-admin-alert-detection-closed')
      });
    }
    this.getAlertDetection()
    this.queryData()
  }
  ngOnDestroy() {
    this.socketService.socket.off<string>(this.user.client.dataUser.organizationId + '-admin-alert-detection');
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
      this.getAlertDetection();
    } else {
      this.render = this.memory[this.page];
      this.generatePageBar();
    }
  }
  prevPage() {
    this.page--;
    if (this.memory[this.page] === undefined) {
      this.getAlertDetection();
    } else {
      this.render = this.memory[this.page];
      this.generatePageBar();
    }
  }
  nextPage() {
    this.page++;
    if (this.memory[this.page] === undefined) {
      this.getAlertDetection();
    } else {
      this.render = this.memory[this.page];
      this.generatePageBar();
    }
  }
  async queryData() {
    let alertId: string = '';
    this.route.params.subscribe(params => {
      alertId = params['alertId'];
    });
    try {
      await new Promise((resolve, reject) => {
        this.http.get<ApiResponse>(environment.paths.getSpecificAlert + '/' + alertId, { withCredentials: true }).subscribe(res => {
          this.alertData = res.data
        }, err => {
          reject(err)
        })
      })
    } catch (e) {
      console.error(e)
    }
  }

  async getAlertDetection() {
    let alertId: string = '';
    this.route.params.subscribe(params => {
      alertId = params['alertId'];
      this.alertData.id = parseInt(alertId)
      this.socketService.socket.on<string>(this.user.client.dataUser.organizationId + '-admin-alert-detection-rtc' + this.alertData.id, async (data: string) => {
        this.render.unshift(JSON.parse(data))
      });
    });
    try {
      await new Promise((resolve, reject) => {
        this.http.get<ApiResponse>(environment.paths.getAlertDetection + '/' + alertId + '?page=' + this.page + '&pageSize=50', { withCredentials: true }).subscribe(res => {
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
}
