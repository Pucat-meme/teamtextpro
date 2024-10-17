import { NextApiRequest, NextApiResponse } from 'next'
import prisma from '../../../lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { channelId } = req.query
  if (req.method === 'GET') {
    const messages = await prisma.message.findMany({
      where: { channelId: Number(channelId) },
      include: { user: true },
      orderBy: { timestamp: 'asc' },
    })
    res.status(200).json(messages)
  } else {
    res.status(405).end()
  }
}