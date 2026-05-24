import dotenv from "dotenv";
import path from "node:path";
dotenv.config({
    path:path.join(process.cwd(),".env")
})
const config={
    connection_string:process.env.CONNECTIONSTRING as string,
    port:process.env.PORT as string
}
export default config;