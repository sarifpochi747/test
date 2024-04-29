import { Component, OnInit } from '@angular/core';
import { UserClient } from './service/user-client/user-client.service';
import { SocketService } from './service/socket/socket.service';
import { Router } from '@angular/router';

interface alertDetection {
  image: string,
  camera: string,
  dateTime: string
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  constructor(
    readonly user: UserClient,
    private readonly socketService: SocketService
  ) { }

  async ngOnInit() {}
}