import express from "express";

import adminRoutes from "../modules/admin/admin.route";
import authRoutes from "../modules/auth/auth.routes";
import userRotes from "../modules/user/user.route";
import specialitiesRoutes from "../modules/specialities/specialities.route";
import doctorRoutes from "../modules/doctor/doctor.route";
import patientRoutes from "../modules/patient/patient.route";
import scheduleRoutes from "../modules/schedule/schedule.route";
import { doctorScheduleRoutes } from "../modules/doctorSchedule/doctorSchedule.route";

const router = express.Router();

const routes = [
  {
    path: "/auth",
    route: authRoutes,
  },
  {
    path: "/user",
    route: userRotes,
  },
  {
    path: "/patient",
    route: patientRoutes,
  },
  {
    path: "/admin",
    route: adminRoutes,
  },
  {
    path: "/doctor",
    route: doctorRoutes,
  },
  {
    path: "/specialities",
    route: specialitiesRoutes,
  },
  {
    path: "/schedule",
    route: scheduleRoutes,
  },
  {
    path: "/doctor-schedule",
    route: doctorScheduleRoutes,
  },
];

routes.forEach((route) => {
  router.use(route.path, route.route);
});

export default router;
