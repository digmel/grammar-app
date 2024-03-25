import type { NextApiRequest, NextApiResponse } from "next";

type Data = {
  result?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {}
