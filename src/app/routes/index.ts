import express from "express";
import userRotes from "../modules/user/user.route";
import adminRoutes from "../modules/admin/admin.route";
const router = express.Router();

const routes = [
  {
    path: "/user",
    route: userRotes,
  },
  {
    path: "/admin",
    route: adminRoutes,
  },
];

routes.forEach((route) => {
  router.use(route.path, route.route);
});

export default router;
