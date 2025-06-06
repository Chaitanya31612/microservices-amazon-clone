import express from "express";
import { currentUser } from "@cgecommerceproject/common";

const router = express.Router();

router.get("/api/users/currentuser", currentUser, (req, res) => {
  res.send(req.currentUser || null);
});

export { router as currentUserRouter };
