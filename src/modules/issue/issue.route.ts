import {Router,type Request,type Response} from "express";
import middleAuth from "../middleware/authentication";
import { issueController } from "./issue.controller";
import {USER_ROLES} from "../../types/role";
import {verifyToken} from "../middleware/authentication";
import { IssueRole } from "../middleware/IssueRole";

const route=Router();
route.post("/",middleAuth(USER_ROLES.contributor,USER_ROLES.maintainer),issueController.createIssue);
route.get("/:id",issueController.getSingleIssue);
route.put("/:id",verifyToken,IssueRole,issueController.UpdateIssue);

export const issueRouter=route;