interface TResponse<T>{
    statusCode:number;
    success:boolean;
    message:string;
    data?:T;
    error?:any;
}
export type {TResponse}