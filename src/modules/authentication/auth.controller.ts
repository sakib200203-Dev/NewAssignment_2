import type {Request,Response} from "express";
import { authService } from "./auth.service";
import { sendResponse } from "../../utility/sendResponse";

const createAccount=async(req:Request,res:Response)=>{
    try {
        const result=await authService.createAccountDB(req.body);
       
      return  sendResponse(res, {
            statusCode: 201,
            success: true,
            message: "User registered successfully",
            data: result.rows[0]
        });

        
    } catch (error:any) {
      return sendResponse(res, {
            statusCode: 500,
            success: false,
            message: "Failed to register user",
            error: error.message
        });
    }
                 
    

}
const loginUser=async(req:Request,res:Response)=>{
    try{
       const result=await authService.loginUserDB(req.body);
         return sendResponse(res, {
            statusCode: 200,
            success: true,
            message: " Login successfully",
            data:  result
        });
    }catch(error:any){
       return sendResponse(res, {
            statusCode: 500,
            success: false,
            message: "Failed to login user",
            error: error.message
        });
    }
}

export const authController={
    createAccount,loginUser
}