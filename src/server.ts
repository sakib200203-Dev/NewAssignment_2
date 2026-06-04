import app from "./app.js";
import config from "./config";
import {SchemaDB} from "./database/schema";
const main=async()=>{
     await SchemaDB();
 
}
main();
export default app;