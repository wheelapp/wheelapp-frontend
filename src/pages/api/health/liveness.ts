import { NextApiRequest, NextApiResponse } from 'next';

// Allow to check the server's liveness before integrating it in a new deployment.

export default (req: NextApiRequest, res: NextApiResponse) => {
  res.status(200).json({ status: 'OK' });
};
