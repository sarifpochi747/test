import {Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import {  ArcElement, Chart, DoughnutController } from 'chart.js';
import { UserClient } from '../../../service/user-client/user-client.service';
import { LineController, CategoryScale, LinearScale, PointElement, LineElement, Title } from 'chart.js';
import { HttpClient } from '@angular/common/http';
import { ApiResponse } from 'src/app/declaration/declaration';
import { environment } from 'src/environments/environment';
Chart.register(ArcElement, DoughnutController, LineController, CategoryScale, LinearScale, PointElement, LineElement, Title);

@Component({
  selector: 'app-sadmin-dashboard',
  templateUrl: './sadmin-dashboard.component.html',
  styleUrls: ['./sadmin-dashboard.component.css']
})
export class SAdminDashboardComponent implements OnInit {
  @ViewChild('parentLineChart') parentLineChart!: ElementRef;
  @ViewChild('monthLineChart') monthLineChartCanvasElement!: HTMLCanvasElement;
  lineChart!: any;
  @ViewChild('domainChart') domainChartCanvasElement!: ElementRef<HTMLCanvasElement>;
  pieChart!: any;

  yAxisIsShow: boolean = window.innerWidth > 600;
  alert: boolean = true;

  xValuesLine: string[] = [];
  yValuesLine: number[] = [];

  tempcamera!:cameraInterface

  camera: cameraInterface[] = []
  tracking: organizationTracking[] = []

  transactionFilter: string = 'Month';

  startDate!: string;
  endDate!: string;
  constructor(
    public readonly user: UserClient,
    private readonly http:HttpClient
    ) {
      const now = new Date()
      let year = now.getFullYear()
      let month = now.getMonth() + 1
      let day = now.getDate()
      const dayInMonth = [0, 31, year % 4 === 0 ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
      this.endDate = year + "-" + month.toString().padStart(2, '0') + "-" + day.toString().padStart(2, '0')
      day -= dayInMonth[month-1]
      if (day <= 0) {
        month -= 1
        if (month <= 0) {
          year -= 1;
          month = 12 + month
        }
        day = dayInMonth[month] + day
      }
      this.startDate = year + "-" + month.toString().padStart(2, '0') + "-" + day.toString().padStart(2, '0')
    }
  
  async ngOnInit() {
    await Promise.all([
      this.getTransactionGraph(),
      this.queryData(),
      this.getOrganizationTransaction()
    ])

  }


  async queryData() {
    try {
      await new Promise((resolve,reject)=>{
        this.http.get<ApiResponse>(environment.paths.getCamera,{withCredentials:true
        }).subscribe(res=>{
          this.camera = res.data;
          resolve(res);
        },err=>{
          reject(err)
        })
      })
    } catch (error) {
      console.error(error)
    }
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

  async getOrganizationTransaction(){
    try {
      await new Promise((resolve,reject)=>{
        this.http.get<ApiResponse>(environment.paths.getOrganizationTransaction+`/?startDate=${this.startDate}&endDate=${this.endDate}`,{withCredentials:true
        }).subscribe(res=>{
          this.tracking = res.data;
          resolve(res);
        },err=>{
          reject(err)
        })
      })
    } catch (error) {
      console.error(error)
    }
  }
}
