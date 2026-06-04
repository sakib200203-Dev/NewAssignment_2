// src/app.ts
import express from "express";

// src/modules/authentication/auth.route.ts
import { Router } from "express";

// src/database/schema.ts
import { Pool } from "pg";

// src/config/index.ts
import dotenv from "dotenv";
import path from "path";
dotenv.config({
  path: path.join(process.cwd(), ".env")
});
var config = {
  CONNECTION_STRING: process.env.CONNECTIONSTRING || "",
  port: process.env.PORT || 5e3,
  secret: process.env.JWT_SECRET_KEY || ""
};
if (!config.CONNECTION_STRING) {
  throw new Error("CONNECTION_STRING is not defined in environment variables");
}
var config_default = config;

// src/database/schema.ts
var pool = new Pool({
  connectionString: config_default.CONNECTION_STRING,
  ssl: {
    rejectUnauthorized: false
  }
});
var SchemaDB = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users(
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'contributor',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
    )
    
    `);
  await pool.query(`
      CREATE TABLE IF NOT EXISTS issues(
         id SERIAL PRIMARY KEY,
         title VARCHAR(150) NOT NULL,
         description  TEXT NOT NULL,
         type VARCHAR(30) NOT NULL
         CHECK(type IN('bug','feature_request')),
         status VARCHAR(30) DEFAULT 'open' CHECK(status IN('open','in_progress','resolved')),
         reporter_id INTEGER NOT NULL,
         created_at TIMESTAMP DEFAULT NOW(),
         updated_at TIMESTAMP DEFAULT NOW()
         


      
      )

        `);
};

// src/modules/authentication/auth.service.ts
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
var createAccountDB = async (payLoad) => {
  const { name, email, password, role } = payLoad;
  const hashPassword = await bcrypt.hash(password, 10);
  if (role !== "contributor" && role !== "maintainer") {
    throw new Error("Invalid role");
  }
  const result = await pool.query(`
          
            INSERT INTO users(name,email,password,role)
          VALUES($1,$2,$3,$4)   RETURNING *


            `, [name, email, hashPassword, role]);
  delete result.rows[0].password;
  return result;
};
var loginUserDB = async (payLoad) => {
  const { email, password } = payLoad;
  const UserData = await pool.query(`
    SELECT * FROM users WHERE email=$1
  `, [email]);
  if (UserData.rows.length === 0) {
    throw new Error("User not found");
  }
  const user = UserData.rows[0];
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new Error("Invalid password");
  }
  const jwtpayload = {
    id: user.id,
    name: user.name,
    role: user.role
  };
  const token = jwt.sign(jwtpayload, config_default.jwt_secret_key, { expiresIn: "20d" });
  return {
    token,
    user
  };
};
var authService = {
  createAccountDB,
  loginUserDB
};

// src/utility/sendResponse.ts
var sendResponse = (res, data) => {
  res.status(data.statusCode).json({
    success: data.success,
    message: data.message,
    data: data.data,
    error: data.error
  });
};

// src/modules/authentication/auth.controller.ts
var createAccount = async (req, res) => {
  try {
    const result = await authService.createAccountDB(req.body);
    return sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "User registered successfully",
      data: result.rows[0]
    });
  } catch (error) {
    return sendResponse(res, {
      statusCode: 500,
      success: false,
      message: "Failed to register user",
      error: error.message
    });
  }
};
var loginUser = async (req, res) => {
  try {
    const result = await authService.loginUserDB(req.body);
    return sendResponse(res, {
      statusCode: 200,
      success: true,
      message: " Login successfully",
      data: result
    });
  } catch (error) {
    return sendResponse(res, {
      statusCode: 500,
      success: false,
      message: "Failed to login user",
      error: error.message
    });
  }
};
var authController = {
  createAccount,
  loginUser
};

// src/modules/authentication/auth.route.ts
var route = Router();
route.post("/signup", authController.createAccount);
route.post("/login", authController.loginUser);
var authRouter = route;

// src/modules/issue/issue.route.ts
import { Router as Router2 } from "express";

// src/modules/middleware/authentication.ts
import jwt2 from "jsonwebtoken";
var middleAuth = (...roles) => {
  return async (req, res, next) => {
    try {
      const token = req.headers.authorization?.split(" ")[1];
      if (!token) {
        return sendResponse(res, {
          statusCode: 401,
          success: false,
          message: "Unauthorized: No token provided"
        });
      }
      const decoded = jwt2.verify(token, process.env.JWT_SECRET_KEY);
      const userData = await pool.query(`
            SELECT * FROM users WHERE id=$1
            
            `, [decoded.id]);
      if (userData.rows.length === 0) {
        return sendResponse(res, {
          statusCode: 400,
          success: false,
          message: "User not found"
        });
      }
      const user = userData.rows[0];
      req.user = decoded;
      if (!roles.includes(user.role)) {
        return sendResponse(res, {
          statusCode: 403,
          success: false,
          message: "Forbidden: Insufficient permissions"
        });
      }
      next();
    } catch (error) {
      next(error);
    }
  };
};
var verifyToken = (req, res, next) => {
  const Header = req.headers.authorization;
  if (!Header) {
    return sendResponse(res, {
      statusCode: 401,
      success: false,
      message: "Unauthorized: No token provided"
    });
  }
  const token = Header.split(" ")[1];
  if (!token) {
    return sendResponse(res, {
      statusCode: 401,
      success: false,
      message: "Invalid token"
    });
  }
  try {
    const decoded = jwt2.verify(token, process.env.JWT_SECRET_KEY);
    req.user = decoded;
    next();
  } catch (error) {
    return sendResponse(res, {
      statusCode: 401,
      success: false,
      message: "Unauthorized: Invalid token"
    });
  }
};
var authentication_default = middleAuth;

// src/modules/issue/issue.service.ts
import "process";
import "domain";
var createIssueDB = async (payLoad) => {
  const { title: title2, description, type, reporter_id } = payLoad;
  const result = await pool.query(`
    INSERT INTO issues(title,description,type,reporter_id)
    VALUES($1,$2,$3,$4) RETURNING *
    `, [title2, description, type, reporter_id]);
  return result;
};
var getAllIssueDB = async () => {
  const IssuesResult = await pool.query(`
        SELECT * FROM issues ORDER BY created_at ASC;
        
        `);
  const Issues = IssuesResult.rows;
  const reporter_id = Issues.map((issues) => issues.reporter_id);
  const UserDetails = await pool.query(`
            SELECT * FROM users WHERE id=ANY($1)


            `, [reporter_id]);
  const UserInfo = /* @__PURE__ */ new Map();
  UserDetails.rows.forEach((user) => {
    UserInfo.set(user.id, user.name);
  });
  const result = Issues.map((issue) => ({
    id: issue.id,
    title: issue.title,
    description: issue.description,
    type: issue.type,
    status: issue.status,
    reporter: UserInfo.get(issue.reporter_id),
    created_at: issue.created_at,
    updated_at: issue.updated_at
  }));
  return result;
};
var getSingleIssueDB = async (id) => {
  const result = await pool.query(`
    SELECT * FROM issues WHERE id=$1 `, [id]);
  return result;
};
var getUpdateIssueDB = async (id, payLoad) => {
  const { title: title2, description, type } = payLoad;
  const result = await pool.query(`
    UPDATE issues SET title=COALESCE($1, title), description=COALESCE($2,description), type=COALESCE($3,type) WHERE id=$4 RETURNING *
    `, [title2, description, type, id]);
  return result;
};
var DeleteIssueDB = async (id) => {
  const result = await pool.query(`
        DELETE  FROM issues WHERE id=$1 RETURNING *
        
        `, [id]);
  return result.rows[0];
};
var issueService = {
  createIssueDB,
  getSingleIssueDB,
  getUpdateIssueDB,
  DeleteIssueDB,
  getAllIssueDB
};

// src/modules/issue/issue.controller.ts
var createIssue = async (req, res) => {
  try {
    const payload = {
      ...req.body,
      reporter_id: req.user.id
    };
    const result = await issueService.createIssueDB(payload);
    return sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "Issue created successfully",
      data: result.rows[0]
    });
  } catch (error) {
    return sendResponse(res, {
      statusCode: 500,
      success: false,
      message: "Failed to create issue",
      error: error.message
    });
  }
};
var getAllIssues = async (req, res) => {
  try {
    const result = await issueService.getAllIssueDB();
    return sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Issues retrived successfully",
      data: result
    });
  } catch (error) {
    return sendResponse(res, {
      statusCode: 500,
      success: false,
      message: "Failed to get issue",
      error: error.message
    });
  }
};
var getSingleIssue = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await issueService.getSingleIssueDB(Number(id));
    if (result.rows.length === 0) {
      return sendResponse(res, {
        statusCode: 404,
        success: false,
        message: "Issue not found"
      });
    }
    return sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Issue retrived successfully",
      data: result.rows[0]
    });
  } catch (error) {
    return sendResponse(res, {
      statusCode: 500,
      success: false,
      message: "Failed to get issue",
      error: error.message
    });
  }
};
var UpdateIssue = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await issueService.getUpdateIssueDB(Number(id), req.body);
    if (result.rows.length === 0) {
      return sendResponse(res, {
        statusCode: 404,
        success: false,
        message: "Issue not found"
      });
    }
    return sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Issue updated successfully",
      data: result.rows[0]
    });
  } catch (error) {
    return sendResponse(res, {
      statusCode: 500,
      success: false,
      message: "Failed to update issue",
      error: error.message
    });
  }
};
var DeleteIssue = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const DeleteInfo = await issueService.DeleteIssueDB(id);
    if (!DeleteInfo) {
      return sendResponse(res, {
        statusCode: 400,
        success: false,
        message: "Issue not found"
      });
    }
    return sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Issue deleted successfully",
      data: {}
    });
  } catch (error) {
    return sendResponse(res, {
      statusCode: 500,
      success: false,
      message: "Failed to delete  issue",
      error: error.message
    });
  }
};
var issueController = {
  createIssue,
  getSingleIssue,
  UpdateIssue,
  DeleteIssue,
  getAllIssues
};

// src/types/role.ts
var USER_ROLES = {
  contributor: "contributor",
  maintainer: "maintainer"
};

// src/modules/middleware/IssueRole.ts
import "jsonwebtoken";
import "process";
var IssueRole = async (req, res, next) => {
  const issueId = req.params.id;
  ;
  const result = await pool.query(`SELECT * FROM issues WHERE id=$1`, [issueId]);
  const issue = result.rows[0];
  if (!issue) {
    return sendResponse(res, {
      statusCode: 404,
      success: false,
      message: "Issue not found"
    });
  }
  if (req.user?.role === "maintainer") {
    req.issue = issue;
    return next();
  }
  if (req.user?.role === "contributor" && issue.reporter_id === req.user.id && issue.status === "open") {
    req.issue = issue;
    return next();
  }
  return sendResponse(res, {
    statusCode: 403,
    success: false,
    message: "Forbidden:  You  are not authorized to perform this action"
  });
};
var isMaintainer = async (req, res, next) => {
  try {
    const issueId = req.params.id;
    ;
    const result = await pool.query(`SELECT * FROM issues WHERE id=$1`, [issueId]);
    const issue = result.rows[0];
    if (!issue) {
      return sendResponse(res, {
        statusCode: 404,
        success: false,
        message: "Issue not found"
      });
    }
    if (req.user?.role === "maintainer") {
      req.issue = issue;
      return next();
    } else {
      return sendResponse(res, {
        statusCode: 403,
        success: false,
        message: "Maintainer access required"
      });
    }
  } catch (error) {
    return sendResponse(res, {
      statusCode: 500,
      success: false,
      message: "Error Middleware",
      error: error.message
    });
  }
};

// src/modules/issue/issue.route.ts
var route2 = Router2();
route2.post("/", authentication_default(USER_ROLES.contributor, USER_ROLES.maintainer), issueController.createIssue);
route2.get("/", issueController.getAllIssues);
route2.get("/:id", issueController.getSingleIssue);
route2.put("/:id", verifyToken, IssueRole, issueController.UpdateIssue);
route2.delete("/:id", verifyToken, isMaintainer, issueController.DeleteIssue);
var issueRouter = route2;

// src/modules/middleware/globalError.ts
var globalErrorHandler = (err, req, res, next) => {
  console.error(err);
  res.status(500).json({
    message: "Internal Server Error"
  });
};
var globalError_default = globalErrorHandler;

// src/app.ts
var app = express();
app.use(express.json());
app.get("/", (req, res) => {
  res.json({ message: "Welcome to Issue Tracker API" });
});
app.use(express.urlencoded({ extended: true }));
app.use("/api/auth", authRouter);
app.use("/api/issue", issueRouter);
app.use(globalError_default);
var app_default = app;

// src/server.ts
var main = async () => {
  await SchemaDB();
};
main();
var server_default = app_default;
export {
  server_default as default
};
//# sourceMappingURL=server.js.map