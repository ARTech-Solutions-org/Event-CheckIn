import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import attendeesRouter from "./attendees";
import checkInsRouter from "./check-ins";
import dashboardRouter from "./dashboard";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(attendeesRouter);
router.use(checkInsRouter);
router.use(dashboardRouter);

export default router;
