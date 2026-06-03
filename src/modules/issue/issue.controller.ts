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
const getAllIssues=async(req:Request,res:Response)=>{
    try {
        const result=await issueService.getAllIssueDB();
        return sendResponse(res,{
            statusCode:200,
            success:true,
            message: "Issues retrived successfully",
            data: result
        });


    } catch (error:any) {
         return sendResponse(res,{
            statusCode:500,
            success:false,
            message: "Failed to get issue",
            error: error.message
        });
        
    }
}
const getSingleIssue=async(req:Request,res:Response)=>{
     
    try{ 
         const {id}=req.params;
        const result=await issueService.getSingleIssueDB(Number(id));
        if(result.rows.length===0){
            return sendResponse(res,{
                statusCode:404,
                success:false,
                message: "Issue not found"
            });
        }
        return sendResponse(res,{
            statusCode:200,
            success:true,
            message: "Issue retrived successfully",
            data: result.rows[0]
        });
    }catch(error:any){
        return sendResponse(res,{
            statusCode:500,
            success:false,
            message: "Failed to get issue",
            error: error.message
        });
    }
}
const UpdateIssue=async(req:Request,res:Response)=>{
    try{
        const {id}=req.params;
        const result=await issueService.getUpdateIssueDB(Number(id),req.body);
        if(result.rows.length===0){
            return sendResponse(res,{
                statusCode:404,
                success:false,
                message: "Issue not found"
            });
        }
        return sendResponse(res,{
            statusCode:200,
            success:true,
            message: "Issue updated successfully",
            data: result.rows[0]
        });

    }catch(error:any){
        return sendResponse(res,{
            statusCode:500,
            success:false,
            message: "Failed to update issue",
            error: error.message
        });
    }
}
const DeleteIssue=async(req:Request,res:Response)=>{
    try {
        const id =Number(req.params.id);
        const DeleteInfo=await issueService.DeleteIssueDB(id);
        if(!DeleteInfo){
            return sendResponse(res,{
                statusCode:400,
                success:false,
                message:"Issue not found"
            })
        }
        
           return sendResponse(res,{
            statusCode:200,
            success:true,
            message: "Issue deleted successfully",
            data: {}
        });
    } catch (error:any) {
         return sendResponse(res,{
            statusCode:500,
            success:false,
            message: "Failed to delete  issue",
            error: error.message
        });
    }

}
export const issueController={
    createIssue,
    getSingleIssue,
    UpdateIssue,
    DeleteIssue,
    getAllIssues
}