import express, { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { body } from "express-validator";
import { BadRequestError, validateRequest } from "@cgecommerceproject/common";
import { User } from "../models/user";

const router = express.Router();

router.post(
  "/api/users/signup",
  [
    body("username").notEmpty().withMessage("Username is required"),
    body("email").isEmail().withMessage("Email must be valid"),
    body("password")
      .trim()
      .isLength({ min: 4, max: 20 })
      .withMessage("Password must be between 4 and 20 characters"),
    body("role").notEmpty().withMessage("Role is required"),
    body("role").isIn(["user", "seller"]).withMessage("Invalid role"),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { username, email, password, role } = req.body;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      console.log("Email already in use");
      throw new BadRequestError("Email already in use");
    }

    const user = User.build({ username, email, password, role });
    await user.save();

    const userJwt = jwt.sign(
      {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_KEY!
    );

    req.session = {
      jwt: userJwt,
    };

    console.log("User created!");

    res.status(201).send(user);
  }
);

export { router as signupRouter };
