import { Router } from "express"
import { addSkill, getSkill, updateSkill } from "../controllers/skillController.ts";
import { isAuthorized } from "../middlewares/authorize.ts";
const skillRouter = Router()

// Get skill of a user - offering/wanting
skillRouter.get('/',isAuthorized,getSkill)

// add new skill 
skillRouter.post('/',addSkill);

// update skills of a user - offering/wanting
skillRouter.put('/', updateSkill)