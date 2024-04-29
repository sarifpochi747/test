import { Status } from "./status";

declare interface camAuthData {
    id: string;
    jwtSecret?:string;
    status?: Status;
  }