import express, { Request, Response } from "express";

const router = express.Router();

// Keep the original health endpoint for backward compatibility
router.get("/api/payments/health", async (req: Request, res: Response) => {
  res.status(200).send({ status: "ok" });
});

// Add the new healthz endpoint to match Kubernetes configuration
router.get("/api/payments/healthz", async (req: Request, res: Response) => {
  res.status(200).send({ status: "ok" });
});

export { router as healthCheckRouter };
