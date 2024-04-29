import { Injectable } from '@angular/core';
import { io } from "socket.io-client";
import { UserClient } from '../user-client/user-client.service';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  socket = io(environment.baseUrl)
  constructor(
    readonly user: UserClient,
  ) {}

}