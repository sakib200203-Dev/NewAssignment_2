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
const getUpdateIssueDB=async(id:Number,payLoad:Issue)=>{
    const {title,description,type}=payLoad;
    const result=await pool.query(`
    UPDATE issues SET title=COALESCE($1, title), description=COALESCE($2,description), type=COALESCE($3,type) WHERE id=$4 RETURNING *
    `,[title,description,type,id])
    return result;
}
const DeleteIssueDB=async(id:Number)=>{
    const result=await pool.query(`
        DELETE  FROM issues WHERE id=$1 RETURNING *
        
        `,[id]);
        return result.rows[0];

}
export const issueService={
    createIssueDB,
    getSingleIssueDB,
    getUpdateIssueDB,
    DeleteIssueDB
} 