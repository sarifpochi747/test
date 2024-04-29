import { MessageBody, OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    transports: ['websocket', 'polling'],
    credentials: true,
  },
  allowEIO3: true,
})
export class AppGateway implements OnGatewayConnection, OnGatewayDisconnect,OnGatewayInit {

  @WebSocketServer() server: Server;

  afterInit(server: Server) {
    server.emit('server-restarted', { 'message': 'server restarted' });

  }

  async handleConnection(client: any, ...args: any[]) {
    client.setMaxListeners(20);
  }

  async handleDisconnect(client: any) { }

  @SubscribeMessage('admin-check-cameara-active')
  async adminCheckCamearaActive(@MessageBody() data: {
    organizationId: string
  }): Promise<void> {
    this.server.emit(data.organizationId + '-camera-isActive', data.organizationId)
  }

  @SubscribeMessage('cameara-active-response')
  async camearaActiveResponse(@MessageBody() data: {
    cameraId: string,
    organizationId: string
  }): Promise<void> {
    this.server.emit(data.organizationId + '-admin-camera-isActive', data.cameraId)
  }

}
