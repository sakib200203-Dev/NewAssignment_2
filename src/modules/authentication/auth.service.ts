import { pool } from "../../database/schema";
import type {User} from "./auth.interface";
import bcrypt from "bcrypt";
const createAccountDB=async(payLoad:User)=>{
         const {name,email,password,role}=payLoad;
         const hashPassword=await bcrypt.hash(password,10);
         if (role !== "contributor" && role !== "maintainer") {
        throw new Error("Invalid role");
    }
         const result=await pool.query(`
          
            INSERT INTO users(name,email,password,role)
          VALUES($1,$2,$3,$4)   RETURNING *


            `,[name,email,hashPassword,role])
            delete result.rows[0].password;
            return result;
         
        
}
export  const authService={
    createAccountDB,
}