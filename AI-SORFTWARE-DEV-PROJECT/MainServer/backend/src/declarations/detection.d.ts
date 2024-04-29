declare interface FaceInfo {
    name:string;
    facial_area: string;
    emotion:string;
    age: number;
    gender: string;
}

declare interface Detection {
    captureImg: string;
    detection: FaceInfo[];
    timeStamp: number;
    cameraId: string;
    accessToken:string;
}
