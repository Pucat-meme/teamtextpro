import { NextApiRequest, NextApiResponse } from 'next'
import prisma from '../../../lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query

  if (req.method === 'PUT') {
    try {
      const { name } = req.body
      const updatedChannel = await prisma.channel.update({
        where: { id: Number(id) },
        data: { name },
      })
      res.status(200).json(updatedChannel)
    } catch (error) {
      res.status(500).json({ error: 'Failed to update channel' })
    }
  } else if (req.method === 'DELETE') {
    try {
      await prisma.channel.delete({
        where: { id: Number(id) },
      })
      res.status(200).json({ message: 'Channel deleted successfully' })
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete channel' })
    }
  } else {
    res.setHeader('Allow', ['PUT', 'DELETE'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}