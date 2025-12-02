
import { z} from 'zod '

export const registerSchema = z.object({
    email :z.email("Invalid email address"),
    fullName : z.string().min(3 , "Name must be at least 3 charecters long"),
    password : z.string().min(6 , "password must be atleast 6 charecters long"),
    avatar : z.url("Avatar must be a valid url").optional()

})

export const loginSchema = z.object({
    email: z.email("Invalid email address"),
    password : z.string().min(6, "password must be atleast 6 charecters long")
});