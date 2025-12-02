
import { Task } from "../models/tasks.model.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";


// create task (only admin)
 const createTask = asyncHandler(async (req, res) => {
    if (req.user.role !== "admin") {
        throw new ApiError(403, "Only admin can create tasks");
    }

    const { title, description, status, priority, dueDate, assignedTo } = req.body;

    if (!title || !description) {
        throw new ApiError(400, "Title and description are required");
    }

    const task = await Task.create({
        title,
        description,
        status: status || "pending",
        priority: priority || "medium",
        dueDate: dueDate || null,
        assignedTo: assignedTo || null,
    });

    return res
        .status(201)
        .json(new ApiResponse(201, task, "Task created successfully"));
});


// get all tasks (admin only)
 const getAllTasks = asyncHandler(async (req, res) => {
    if (req.user.role !== "admin") {
        throw new ApiError(403, "Only admin can view all tasks");
    }

    const tasks = await Task.find().populate("assignedTo", "fullName email");

    return res
        .status(200)
        .json(new ApiResponse(200, tasks, "All tasks fetched successfully"));
});



// delete task (only admin)
 const deleteTask = asyncHandler(async (req, res) => {
    if (req.user.role !== "admin") {
        throw new ApiError(403, "Only admin can delete tasks");
    }

    const task = await Task.findByIdAndDelete(req.params.id);

    if (!task) throw new ApiError(404, "Task not found");

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Task deleted successfully"));
});


// get my tasks (User)
 const getMyTasks = asyncHandler(async (req, res) => {
    const tasks = await Task.find({ assignedTo: req.user._id });

    return res
        .status(200)
        .json(new ApiResponse(200, tasks, "My tasks fetched successfully"));
});


//get task by id
 const getTaskById = asyncHandler(async (req, res) => {
    const task = await Task.findById(req.params.id).populate(
        "assignedTo",
        "fullName email"
    );

    if (!task) throw new ApiError(404, "Task not found");

    // User can fetch only their assigned tasks; Admin can fetch all
    if (
        req.user.role !== "admin" &&
        task.assignedTo?.toString() !== req.user._id.toString()
    ) {
        throw new ApiError(403, "You are not authorized to view this task");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, task, "Task details fetched"));
});


// update task
 const updateTask = asyncHandler(async (req, res) => {
    const task = await Task.findById(req.params.id);

    if (!task) throw new ApiError(404, "Task not found");

    const isAdmin = req.user.role === "admin";
    const isAssignee =
        task.assignedTo?.toString() === req.user._id.toString();

    // Only admin OR assigned user can update
    if (!isAdmin && !isAssignee) {
        throw new ApiError(403, "You are not allowed to update this task");
    }

    const allowedFields = ["title", "description", "status", "priority", "dueDate", "assignedTo"];
    const updates = req.body;

    Object.keys(updates).forEach((key) => {
        if (allowedFields.includes(key)) {
            task[key] = updates[key];
        }
    });

    await task.save();

    return res
        .status(200)
        .json(new ApiResponse(200, task, "Task updated successfully"));
});


const taskStatsForAdmin = asyncHandler(async(req, res ) => {
    const totalTasks = await Task.countDocuments();
    const completedTasks = await Task.countDocuments({ status: "completed" });
    const inProgressTasks = await Task.countDocuments({ status: "in-progress" });
    const pendingTasks = await Task.countDocuments({ status: "pending" });

    return res.status(200).json(new ApiResponse(200, {
        totalTasks,
        completedTasks,
        inProgressTasks,
        pendingTasks,
    },"Task statistics fetched succcessfully"

    ));
})


const taskStatsForUser = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    const totalTasks = await Task.countDocuments({ assignedTo: userId });
    const completedTasks = await Task.countDocuments({ assignedTo: userId, status: "completed" });
    const inProgressTasks = await Task.countDocuments({ assignedTo: userId, status: "in-progress" });
    const pendingTasks = await Task.countDocuments({ assignedTo: userId, status: "pending" });

    return res.status(200).json(new ApiResponse(200, {
        totalTasks,
        completedTasks,
        inProgressTasks,
        pendingTasks,
    }, "Your task statistics fetched successfully"));
});





export { createTask, getAllTasks , deleteTask ,updateTask , getTaskById, getMyTasks , taskStatsForAdmin, taskStatsForUser}