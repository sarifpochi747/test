import * as expressSession from 'express-session';
import { camAuthData } from 'src/declarations/camera-auth';
import { Status } from 'src/declarations/status';

export const session = expressSession({
  name: "sessionId",
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: false,
    maxAge: 10800000, //3 hours
    sameSite: 'lax'
  },
})

export class DataUser{
  email: string;

  organizationId?: string;
  organizationName?: string;
  address?: string;
  phone?: string;
  organizeStatus?: Status;
}

declare module 'express-session' {
  interface AuthData {
    dataUser: DataUser;
    isAdmin?: boolean;
    isSystemAdmin?: boolean;
  }
  interface SessionData {
    user: AuthData;
    camera: camAuthData;
  }
}