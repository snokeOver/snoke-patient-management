import express, { Application, Request, Response } from "express";
import cors from "cors";
import router from "./app/routes";

import notFound from "./app/middleWares/notFound";
import { globalErrorHandler } from "./app/middleWares/errorHandler";

const app: Application = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req: Request, res: Response) => {
  res.send({
    message: "Hello from Snoke Patient management API",
  });
});

app.use("/api/v1", router);

app.use(globalErrorHandler);

app.use(notFound);

export default app;
