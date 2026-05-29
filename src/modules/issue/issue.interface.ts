import type {Request} from "express";

interface Issue{
    title:string;
    description:string;
    type:string;
    reporter_id:number;
    issue:string;
}
export type{Issue}
 
 import type { JwtPayload } from "jsonwebtoken";

export interface CustomJwtPayload extends JwtPayload {
   id: number;
   role: string;
   user:string
   
}
export interface authUser{
    id:number;
    role:"contributor"|"maintainer";
}