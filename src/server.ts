import config from "./config/index";
import app from "./app";
import {SchemaDB} from "./database/schema";
const port=config.port;
const main=()=>{
     SchemaDB();
    app.listen(port,()=>{
        console.log(`Server is running on port ${port}`);
    }) 
}
main();