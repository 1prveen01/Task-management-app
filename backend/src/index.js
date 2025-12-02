import dotenv from "dotenv";
dotenv.config({ path: "./.env", override: true, quiet: true });


import connectDB from "./db/index.js";
import app from "./app.js"


console.log("ENV CHECK:", {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    hasSecret: !!process.env.CLOUDINARY_API_SECRET
});


connectDB()
.then(() => {
    app.listen(process.env.PORT || 8000 , () => {
        console.log(`⚙️  Server is running at PORT : ${process.env.PORT}`)
    })
})
.catch((err)=>{
    console.err("MongoDB connection failed !!! ", err)
});
