import {Router,type Request,type Response} from "express";
import middleAuth from "../middleware/authentication";
import { issueController } from "./issue.controller";
import {USER_ROLES} from "../../types/role";
const route=Router();
route.post("/",middleAuth(USER_ROLES.contributor,USER_ROLES.maintainer),issueController.createIssue);

export const issueRouter=route;