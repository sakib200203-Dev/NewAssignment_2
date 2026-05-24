import { pool } from "../../database/schema";
import type {User,LoginUser} from "./auth.interface";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import config from "../../config";
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
const loginUserDB=async(payLoad:LoginUser)=>{
  const {email,password}=payLoad;
  const UserData=await pool.query(`
    SELECT * FROM users WHERE email=$1
  `,[email])
  if(UserData.rows.length===0){
    throw new Error("User not found");
  }
  const user=UserData.rows[0];
  const isPasswordValid=await bcrypt.compare(password,user.password);
  if(!isPasswordValid){
    throw new Error("Invalid password");
  }
  const jwtpayload={
    id:user.id,
    name:user.name,
    role:user.role 
  }
  const token=jwt.sign(jwtpayload,config.jwt_secret_key,{expiresIn:"20d"});
  return {  token,
    user
    };

}
export  const authService={
    createAccountDB,
    loginUserDB
} 