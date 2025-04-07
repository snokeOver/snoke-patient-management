import express, { Application } from "express";
import cors from "cors";
import userRotes from "./add/modules/user/user.route";

const app: Application = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send({
    message: "Hello from Snoke Patient management API",
  });
});

app.use("/api/v1/user", userRotes);

export default app;
