

import express from "express";
import { createTask, getAllTasks , getMyTasks , getTaskById , updateTask , deleteTask, taskStatsForAdmin, taskStatsForUser } from "../controllers/tasks.controller.js";

import { verifyJWT } from "../middlewares/auth.middleware.js";
import { verifyRole } from "../middlewares/role.middlware.js";

const router = express.Router();

// Admin Only
router.route("/create-task").post(verifyJWT ,verifyRole("admin") ,  createTask)
router.route("/get-all-tasks").get(verifyJWT , verifyRole("admin") , getAllTasks)
router.route("/delete-task/:id").delete(verifyJWT , verifyRole("admin"), deleteTask)
router.route("/task-stats-for-admin").get(verifyJWT, verifyRole("admin"), taskStatsForAdmin)



// User
router.get("/my-task", verifyJWT, getMyTasks);
router.route("/task-stats-for-user").get(verifyJWT , taskStatsForUser)


// Shared
router.get("/get-task-by-id/:id", verifyJWT, getTaskById);
router.patch("/update-task/:id", verifyJWT, updateTask);


export default router;
