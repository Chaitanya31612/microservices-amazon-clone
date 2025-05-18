import express, { NextFunction, Request, Response } from "express";
import morgan from "morgan";
// express-async-errors package is used, if we throw error inside async function, it will be caught by express and passed to error handler middleware
import "express-async-errors";
import cookieSession from "cookie-session";

import {
  NotFoundError,
  currentUser,
  errorHandler,
} from "@cgecommerceproject/common";
import { newOrderRouter } from "./routes/new";
import { showOrderRouter } from "./routes/show";
import { indexOrderRouter } from "./routes";
import { deleteOrderRouter } from "./routes/delete";

const app = express();
app.set("trust proxy", true); // trust traffic from ingress-nginx proxy
app.use(express.json());
app.use(
  cookieSession({
    signed: false, // disable encryption
    // secure: true, // only use cookies over https connection
  })
);

app.use(morgan("tiny"));
app.use(currentUser); // for authentication and setting of req.currentUser

app.use(indexOrderRouter);
app.use(newOrderRouter);
app.use(showOrderRouter);
app.use(deleteOrderRouter);

app.all("*", () => {
  throw new NotFoundError();
});

// catch errors from our app router
app.use((err: Error, req: Request, res: Response, next: NextFunction): void => {
  errorHandler(err, req, res, next);
});

export { app };

// *Note - this export is done to make sure that we just configure app in this file and not start listening to incoming requests. This is done so that we can write tests for this file without starting up the server. This will help in writing tests for the routes and middlewares using supertest.
