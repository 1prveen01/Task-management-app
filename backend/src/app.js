

import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'

const app = express()

const allowedOrigins = process.env.CORS_ORIGIN.split(',').map(origin => origin.trim())
// This is an ARRAY: ['http://localhost:3000', 'https://task-management-app-nu-seven.vercel.app']

app.use(cors({
    origin: allowedOrigins,  // Now it accepts multiple origins
    credentials: true,
}))

app.use(express.json(
    {limit : '16kb'}
))

app.use(express.urlencoded({
    extended: true,
    limit : '16kb'
}))

app.use(express.static('public'))
app.use(cookieParser())

//import routes
import userRouter from "../src/routes/users.route.js"
import adminRouter from "../src/routes/admin.route.js"
import taskRouter from "../src/routes/tasks.route.js"

//routes declaration 

app.use("/api/v1/users" , userRouter)
app.use("/api/v1/admin" , adminRouter)
app.use("/api/v1/tasks" , taskRouter)



export default app