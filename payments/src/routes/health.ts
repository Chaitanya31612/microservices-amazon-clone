import express, { Request, Response } from "express";

const router = express.Router();

router.get("/api/payments/health", async (req: Request, res: Response) => {
  res.send("Payments service is running");
});

export { router as healthCheckRouter };
