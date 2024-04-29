import { FormControl } from "@angular/forms";

declare class UniqueColumn {
    uniqColId: string;
    uniqColName: string;
    uniqColData: string;
}

declare interface organizationData {
    id?: string;
    name?: string;
    email: string;
    phone?: string;
    address?: string;
    status?: 'Active' | 'Disable'
    password?:string;
    UniqueColumn?: UniqueColumn
}

declare interface sadminOrganizationData {
    organizationId?: string;
    organizationName?: string;
    email: string;
    phone?: string;
    address?: string;
    password?:string;
    organizeStatus?: 'Active' | 'Disable'
    UniqueColumn?: UniqueColumn
}

declare interface DataUser {
    email: string;

    //only organization
    organizationId?: string;
    organizationName?: string;
    address?: string;
    phone?: string;
    organizeStatus?: 'Active' | 'Disable';
}
declare interface systemAdminData {
    email: string;
}

declare interface authData {
    dataUser: DataUser;
    isAdmin: boolean;
    isSystemAdmin: boolean;
}

declare interface upDateLog {
    response: string;
    status: 'Success' | 'Error';
}
declare interface ApiResponse {
    message: string,
    statusCode: number,
    data?: any,
    number?:number
}

declare interface imgB64Req {
    imgB64: string;
    employeeId?: string;
}

declare interface checkImgRes {
    isPass: boolean;
    message?: string;
    imgB64?: string;
}


declare interface OrganizationDataForm {
    name: FormControl;
    email: FormControl;
    phone: FormControl;
    address: FormControl;
    password: FormControl;
  }

declare interface CameraDataForm {
    cameraName: FormControl;
    cameraDetail: FormControl;
    cameraSpec: FormControl;
    dateInstall: FormControl;
    organization:FormControl
}

declare interface GreetingDto {
    greetingId:string;
    message?:string;
    emotion:'happy'|'surprise'|'surprise'|'sad'|'fear'|'disgust'|'angry'|'neutral';
    organizationId?:string;
    organization?:{
        organizationId: string
        organizationName : string
    };
}
