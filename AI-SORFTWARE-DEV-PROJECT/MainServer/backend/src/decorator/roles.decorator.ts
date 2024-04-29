import { Reflector } from "@nestjs/core";

export enum Role {
    SYSTEMADMIN = "SYSTEMADMIN",
    ADMIN = "ADMIN",
    CAMERA = "CAMERA"
} 

export const Roles = Reflector.createDecorator<Array<Role>>();