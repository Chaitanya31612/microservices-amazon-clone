import express, { Request, Response } from 'express';

const router = express.Router();

router.get('/api/users/healthz', (req: Request, res: Response) => {
  res.status(200).send({ status: 'ok' });
});

export { router as healthzRouter };
