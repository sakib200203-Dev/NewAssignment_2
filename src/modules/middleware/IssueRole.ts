import type { NextFunction, Request, Response } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";
import { pool, SchemaDB } from "../../database/schema";
import { sendResponse } from "../../utility/sendResponse";
 
 
  
 

 export const IssueRole = async (req:Request,res:Response,next:NextFunction)=>{
     const issueId=req.params.id;;
     const result=await pool.query(`SELECT * FROM issues WHERE id=$1`,[issueId]);
     const issue=result.rows[0];
        if(!issue){
            return sendResponse(res,{
                statusCode:404,
                success:false,
                message: "Issue not found"
            });
        }
        if(req.user?.role ==="maintainer"  ){
            req.issue=issue;
            return next();
        } 
        if(req.user?.role==="contributor" && issue.reporter_id===req.user.id && issue.status==="open"){
            req.issue=issue;
            return next();
        }
        return sendResponse(res,{
            statusCode:403,
            success:false,            
            message: "Forbidden:  You  are not authorized to perform this action"
        });
    }