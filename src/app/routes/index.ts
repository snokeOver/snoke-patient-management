import express from "express";

import adminRoutes from "../modules/admin/admin.route";
import authRoutes from "../modules/auth/auth.routes";
import userRotes from "../modules/user/user.route";
import specialitiesRoutes from "../modules/specialities/specialities.route";
import doctorRoutes from "../modules/doctor/doctor.route";

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
];

routes.forEach((route) => {
  router.use(route.path, route.route);
});

export default router;
