import express,{type Application,type Request,type Response} from "express";
import { authRouter } from "./modules/authentication/auth.route";
 
const app:Application=express();
app.use(express.json()); 
app.use(express.urlencoded({extended:true}));
app.use("/api/auth",authRouter)
export default app;