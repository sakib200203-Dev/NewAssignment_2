import { pool } from "../../database/schema";
import type { Issue } from "./issue.interface";

const createIssueDB=async(payLoad:Issue)=>{
    const {title,description,type,reporter_id}=payLoad;
    const result=await pool.query(`
    INSERT INTO issues(title,description,type,reporter_id)
    VALUES($1,$2,$3,$4) RETURNING *
    `,[title,description,type,reporter_id])
    return result;
}
const getSingleIssueDB=async(id:Number)=>{
    const result=await pool.query(`
    SELECT * FROM issues WHERE id=$1 `,[id])
    return result;
}    
export const issueService={
    createIssueDB,
    getSingleIssueDB
}