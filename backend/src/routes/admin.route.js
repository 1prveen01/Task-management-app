import { Router } from "express"
import { verifyJWT } from "../middlewares/auth.middleware.js"
import { verifyRole } from "../middlewares/role.middlware.js"


import { deleteUser, getAllUsers } from "../controllers/admin.controller.js"



const router = Router()

//admin routes
router.route("admin-only").get(verifyJWT, verifyRole("admin"))

router.route("/get-all-users").get(verifyJWT, verifyRole("admin"), getAllUsers);
router.delete("/delete-user/:id", verifyJWT, verifyRole("admin"), deleteUser);


export default router