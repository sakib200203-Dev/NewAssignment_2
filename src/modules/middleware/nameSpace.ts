import type { JwtPayload } from "jsonwebtoken";
 
import type { Issue } from "../issue/issue.interface";
import type { authUser } from "../issue/issue.interface";

declare global{
    namespace Express{
        interface Request{
            user?: authUser
            issue?: Issue
               }       }
}
export{}