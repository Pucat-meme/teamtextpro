import { NextApiRequest, NextApiResponse } from 'next'
import prisma from '../../../lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { channelId, userId, content, type } = req.body
    const message = await prisma.message.create({
      data: { channelId, userId, content, type },
    })
    res.status(201).json(message)
  } else {
    res.status(405).end()
  }
}