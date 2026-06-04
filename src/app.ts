import express,{type Application,type Request,type Response} from "express";
import { authRouter } from "./modules/authentication/auth.route";
import { issueRouter } from "./modules/issue/issue.route";
import globalErrorHandler from "./modules/middleware/globalError";
 
const app:Application=express();
app.use(express.json()); 
app.use(express.urlencoded({extended:true}));
app.use("/api/auth",authRouter);
app.use("/api/issue",issueRouter);
app.use(globalErrorHandler );
export default app; 