import { Component, ElementRef, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { ArcElement, Chart, DoughnutController } from 'chart.js';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { SocketService } from 'src/app/service/socket/socket.service';
import { UserClient } from '../../../service/user-client/user-client.service';
import { LineController, CategoryScale, LinearScale, PointElement, LineElement, Title } from 'chart.js';
import { ApiResponse } from 'src/app/declaration/declaration';
Chart.register(ArcElement, DoughnutController, LineController, CategoryScale, LinearScale, PointElement, LineElement, Title);

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit, OnDestroy {
  isStart: boolean = true;

  @ViewChild('parentLineChart') parentLineChart!: ElementRef;
  @ViewChild('monthLineChart') monthLineChartCanvasElement!: HTMLCanvasElement;
  lineChart!: any;
  @ViewChild('domainChart') domainChartCanvasElement!: ElementRef<HTMLCanvasElement>;
  pieChart!: any;

  yAxisIsShow: boolean = window.innerWidth > 600;
  alert: boolean = true;

  xValuesLine: string[] = [];
  yValuesLine: number[] = [];

  xValuesPie: string[] = [];
  yValuesPie: number[] = [];
  colorSetPie!: string[];

  camera: cameraInterface[] = []
  tracking: trackingInterface[] = []

  transactionFilter: string = 'Month';
  emotionStartDate!: string;
  emotionEndDate!: string;
  constructor(
    public readonly user: UserClient,
    private readonly http: HttpClient,
    private readonly socketService: SocketService,
  ) {
    const now = new Date()
    let year = now.getFullYear()
    let month = now.getMonth() + 1
    let day = now.getDate()
    const dayInMonth = [0, 31, year % 4 === 0 ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
    this.emotionEndDate = year + "-" + month.toString().padStart(2, '0') + "-" + day.toString().padStart(2, '0')
    day -= dayInMonth[month - 1]
    if (day <= 0) {
      month -= 1
      if (month <= 0) {
        year -= 1;
        month = 12 + month
      }
      day = dayInMonth[month] + day
    }
    this.emotionStartDate = year + "-" + month.toString().padStart(2, '0') + "-" + day.toString().padStart(2, '0')

    if (this.socketService.socket.active) {
      this.socketService.socket.on<string>(this.user.client.dataUser.organizationId + '-admin-detection', (data: string) => {
        if (this.isStart) {
          this.tracking.push(JSON.parse(data))
        }
      });
      this.socketService.socket.on(this.user.client.dataUser.organizationId + '-admin-detection-closed', () => {
        this.socketService.socket.off<string>(this.user.client.dataUser.organizationId + '-admin-detection');
        this.socketService.socket.off<string>(this.user.client.dataUser.organizationId + '-admin-detection-closed');
      });
      this.socketService.socket.on(this.user.client.dataUser.organizationId + '-admin-detection-rtc', (data) => {
        this.tracking.unshift(JSON.parse(data))
      });
    }
  }

  async ngOnInit() {
    await Promise.all([
      this.getTracking(),
      this.getCamera(),
      this.getEmotionGraph(),
      this.getTransactionGraph(),
    ])
  }

  ngOnDestroy() {
    this.socketService.socket.off<string>(this.user.client.dataUser.organizationId + '-admin-detection');
    this.socketService.socket.off(this.user.client.dataUser.organizationId + '-admin-detection-rtc');
  }

  getEmotionGraph() {
    this.xValuesPie = []
    this.yValuesPie = []
    this.colorSetPie = ['#0F3AA8', '#034BD9', '#2B61EC', '#527EEE', '#8EABF6', '#CAD9FE', '#EFF4FB']
    try {
      new Promise((resolve, reject) => {
        this.http.get<ApiResponse>(environment.paths.getEmotionGraph + '/?startDate=' + this.emotionStartDate + '&endDate=' + this.emotionEndDate, { withCredentials: true }).subscribe(async (res) => {
          for (const data of res.data) {
            this.xValuesPie.push(data.emotion)
            this.yValuesPie.push(data.value)
          }
          if (this.xValuesPie.length === 0) {
            this.xValuesPie = ['ไม่พบข้อมูล']
            this.yValuesPie = [100]
            this.colorSetPie = ['#EFF4FB']
          }

          this.plotPieGraph()
        }, err => {
          reject(err)
        })
      })
    } catch (e) {
      console.error(e)
    }
  }

  async plotPieGraph() {
    if (this.pieChart) {
      this.pieChart.destroy()
    }
    const data = {
      labels: this.xValuesPie,
      chart: {
        width: 380,
      },
      datasets: [
        {
          data: this.yValuesPie,
          backgroundColor: this.colorSetPie,
          bodyFontColor: "#858796",
          borderWidth: 1,

          options: {
            plugins: {
              label: {
                display: true,
              },
            },
          },
        }
      ],

    };

    this.pieChart = new Chart(this.domainChartCanvasElement.nativeElement, {
      type: 'doughnut',
      data: data,
      options: {
        maintainAspectRatio: true,
        responsive: true,
        plugins: {
          tooltip: {
            padding: 15,
            caretPadding: 10,
          },
          legend: {
            display: false,
            position: 'bottom',
            align: 'center',
            labels: {
              boxWidth: 15,
              boxHeight: 15,
            },
            maxHeight: 1000,
          },
        },
      },
    });

  }

  getTransactionGraph() {
    this.xValuesLine = []
    this.yValuesLine = []
    try {
      new Promise((resolve, reject) => {
        this.http.get<ApiResponse>(environment.paths.getTransactionGraph + '/?filter=' + this.transactionFilter.toLocaleLowerCase(), { withCredentials: true }).subscribe(async (res) => {
          for (const data of res.data) {
            const key = Object.keys(data)[0]
            this.xValuesLine.push(key)
            this.yValuesLine.push(data[key])
          }
          this.plotGraph()
        }, err => {
          reject(err)
        })
      })
    } catch (e) {
      console.error(e)
    }
  }
  async plotGraph() {
    if (this.lineChart) {
      this.lineChart.destroy()
    }

    const monthAreaChartData = {
      labels: this.xValuesLine,
      datasets: [{
        data: this.yValuesLine,
        label: 'transactions',
        pointRadius: false,
        backgroundColor: '#78CD5030',
        borderColor: this.user.colorTeam.topicText,
      },
      ]
    }

    const areaChartOptions = {
      responsive: true,
      maintainAspecRatio: false,
      scales: {
        x: {
          grid: {
            display: false,
          },
        },
        y: {
          grid: {
            display: false,
          },
        },

      },
      elements: {
        line: {
          tension: 0.4,
        },
      },
      plugins: {
        title: {
          display: false,
        },
        legend: {
          display: false,
        }
      },
    }
    this.parentLineChart.nativeElement.style.width = '100%';
    this.parentLineChart.nativeElement.style.display = 'block';

    this.monthLineChartCanvasElement = document.createElement('canvas');
    this.monthLineChartCanvasElement.style.width = '100%';
    this.monthLineChartCanvasElement.style.height = '100%';

    this.parentLineChart.nativeElement.innerHTML = '';

    this.parentLineChart.nativeElement.appendChild(this.monthLineChartCanvasElement);

    new Chart(this.monthLineChartCanvasElement, {
      type: 'line',//@ts-ignore
      data: monthAreaChartData,
      options: areaChartOptions,
    });
  }

  async getTracking() {
    try {
      // await new Promise(async (resolve, reject) => {
      this.http.post(environment.paths.getAllDetection + '?page=1&pageSize=50', {}, { withCredentials: true }).subscribe(async (res) => {
        this.socketService.socket.off<string>(this.user.client.dataUser.organizationId + '-admin-detection')
        //   const interval = setInterval(()=>{
        //   clearInterval(interval)
        // },2000)
        // }, err => {
        // reject(err)
      })
      // })
    } catch (e) {
      console.error(e)
    }

  }

  async getCamera() {
    try {
      await new Promise((resolve, reject) => {
        this.http.get<ApiResponse>(environment.paths.getCamera + '/', { withCredentials: true }).subscribe(res => {
          this.camera = res.data
        }, err => {
          reject(err)
        })
      })
    } catch (e) {
      console.error(e)
    }
  }

}
