import dotenv from 'dotenv';
import path from 'path';
dotenv.config({
  path:path.join(process.cwd(),".env"),
});
const config={
  CONNECTION_STRING:process.env.CONNECTIONSTRING  as string || "",
  port:process.env.PORT ||5000,
  jwt_secret_key:process.env.JWT_SECRET_KEY as string || "",
};
if(!config.CONNECTION_STRING){
  throw new Error("CONNECTION_STRING is not defined in environment variables");
}
export default config;  

