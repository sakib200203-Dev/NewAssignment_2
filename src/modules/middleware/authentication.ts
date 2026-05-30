import type { NextFunction, Request, Response } from "express";
import { sendResponse } from "../../utility/sendResponse";
import jwt, { type JwtPayload } from "jsonwebtoken";
import { pool } from "../../database/schema";
import type { ROLES } from "../../types/role";
import type { authUser } from "../issue/issue.interface";

const middleAuth=(...roles:ROLES[])=>{
      return async(req:Request,res:Response,next:NextFunction)=>{
       try{
             const token=req.headers.authorization?.split(" ")[1];
             
        if(!token){
            return sendResponse(res,{
                statusCode:401,
                success:false,
                message: "Unauthorized: No token provided"
            });
        } const decoded=jwt.verify(token,process.env.JWT_SECRET_KEY as string) as authUser;
        const userData=await pool.query(`
            SELECT * FROM users WHERE id=$1
            
            `,[decoded.id])
            if(userData.rows.length===0){
                return sendResponse(res,{
                    statusCode:400,
                    success:false,
                    message: "User not found"
                });
            }
            const user=userData.rows[0];
            req.user=decoded;
            if(!roles.includes(user.role)){
                return sendResponse(res,{
                    statusCode:403,
                    success:false,
                    message: "Forbidden: Insufficient permissions"
                });
            }
            next();
       }catch(error){
          next(error)
       }
    };
    } 
const verifyToken=(req:Request,res:Response,next:NextFunction)=>{
    const Header= req.headers.authorization;
    if(!Header){
        return sendResponse(res,{
            statusCode:401,
            success:false,
            message: "Unauthorized: No token provided"
        });
    }
    const token=Header.split(" ")[1];
    if(!token){
        return sendResponse(res,{
            statusCode:401,
            success:false,
            message: "Invalid token"
        });
    }   
    try{
        const decoded=jwt.verify(token,process.env.JWT_SECRET_KEY as string) as authUser;
        req.user=decoded;
        next();
    }catch(error){
        return sendResponse(res,{
            statusCode:401,
            success:false,
            message: "Unauthorized: Invalid token"
        });
    }

}

export default middleAuth; 
export {verifyToken};