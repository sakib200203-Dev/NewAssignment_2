import   { Router,type Request,type Response} from "express";
import { authController } from "./auth.controller";
const route=Router();
route.post("/signup",authController.createAccount);


export const authRouter=route;