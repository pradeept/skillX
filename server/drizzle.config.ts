// drizzle configuration file 
import {defineConfig} from "drizzle-kit"
import 'dotenv/config'

export default defineConfig({
    out:'./src/db/drizzle/', //path to store migrations
    schema:'./src/db/drizzle/schema.ts', 
    dialect:'postgresql',
    dbCredentials:{
        url:process.env.DATABASE_URL as string
    },
    verbose:true, //logs migration changes
    strict:true //warns during migration generation if migration causes BREAKING changes like deleting or altering table
})