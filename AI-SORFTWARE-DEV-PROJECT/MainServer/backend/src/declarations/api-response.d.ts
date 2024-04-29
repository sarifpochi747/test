declare interface ApiResponse {
    message:string,
    statusCode:HttpStatus,
    data ?: any,
    number?:number
}
