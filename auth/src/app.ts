import express, { NextFunction, Request, Response } from "express";
import morgan from "morgan";
// express-async-errors package is used, if we throw error inside async function, it will be caught by express and passed to error handler middleware
import "express-async-errors";
import cookieSession from "cookie-session";

import { NotFoundError, errorHandler } from "@cgecommerceproject/common";
import { currentUserRouter } from "./routes/currentUser";
import { signinRouter } from "./routes/signin";
import { signoutRouter } from "./routes/signout";
import { signupRouter } from "./routes/signup";

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

app.use(currentUserRouter);
app.use(signinRouter);
app.use(signoutRouter);
app.use(signupRouter);

app.all("*", () => {
  throw new NotFoundError();
});

// catch errors from our app router
app.use((err: Error, req: Request, res: Response, next: NextFunction): void => {
  errorHandler(err, req, res, next);
});

export { app };

// *Note - this export is done to make sure that we just configure app in this file and not start listening to incoming requests. This is done so that we can write tests for this file without starting up the server. This will help in writing tests for the routes and middlewares using supertest.
