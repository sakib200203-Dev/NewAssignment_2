import type { Request, Response } from "express"
import { sendResponse } from "../../utility/sendResponse";
import { issueService } from "./issue.service";
 


const createIssue=async(req:Request,res:Response)=>{
    try{ 
        const payload={
            ...req.body,
            reporter_id:req.user!.id
        }
       const  result=await issueService.createIssueDB(payload);
       return sendResponse(res, {
        statusCode: 201,
        success: true,
        message: "Issue created successfully",
        data: result.rows[0]
    });

    }catch(error:any){
        return sendResponse(res, {
            statusCode: 500,
            success: false,
            message: "Failed to create issue",
            error: error.message
        });
    }
}
export const issueController={
    createIssue
}