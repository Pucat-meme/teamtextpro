import { NextApiRequest, NextApiResponse } from 'next'
import prisma from '../../../lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { name } = req.body
    const channel = await prisma.channel.create({ data: { name } })
    res.status(201).json(channel)
  } else if (req.method === 'GET') {
    const channels = await prisma.channel.findMany()
    res.status(200).json(channels)
  } else {
    res.status(405).end()
  }
}