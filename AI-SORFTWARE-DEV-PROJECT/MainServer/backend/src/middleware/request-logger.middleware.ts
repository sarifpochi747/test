import { Injectable, NestMiddleware, RequestTimeoutException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class RequestLoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const { method,baseUrl,headers,protocol} = req;
    req.setTimeout(60000,()=>{
      throw new RequestTimeoutException()
    })
    next();
    console.log(`${'\x1b[32m'}${('['+method+']').padEnd(7,' ')}${'\x1b[0m'} ${protocol.padEnd(6,' ')} ${headers['host'].padEnd(15,' ')} ${baseUrl.padEnd(20,' ')} - status `+ (res.statusCode >= 200 && res.statusCode <= 300 ? `${'\x1b[32m'}${res.statusCode}${'\x1b[0m'}`:`${'\x1b[31m'}${res.statusCode}${'\x1b[0m'}`));
  }
}
