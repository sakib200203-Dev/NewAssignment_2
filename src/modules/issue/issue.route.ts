import {Router,type Request,type Response} from "express";
import middleAuth from "../middleware/authentication";
import { issueController } from "./issue.controller";
import {USER_ROLES} from "../../types/role";
import {verifyToken} from "../middleware/authentication";
import { isMaintainer, IssueRole } from "../middleware/IssueRole";

const route=Router();
route.post("/",middleAuth(USER_ROLES.contributor,USER_ROLES.maintainer),issueController.createIssue);
route.get("/",issueController.getAllIssues);
route.get("/:id",issueController.getSingleIssue);
route.put("/:id",verifyToken,IssueRole,issueController.UpdateIssue);
route.delete("/:id",verifyToken,isMaintainer,issueController.DeleteIssue);

export const issueRouter=route;