import { NextApiRequest, NextApiResponse } from 'next'
import prisma from '../../../lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { username } = req.query

  if (req.method === 'GET') {
    try {
      const user = await prisma.user.findUnique({
        where: { username: String(username) },
      })
      if (user) {
        res.status(200).json(user)
      } else {
        res.status(404).json({ error: 'User not found' })
      }
    } catch (error) {
      res.status(500).json({ error: 'Failed to load user' })
    }
  } else if (req.method === 'PUT') {
    try {
      const { password } = req.body
      const updatedUser = await prisma.user.update({
        where: { username: String(username) },
        data: { password },
      })
      res.status(200).json(updatedUser)
    } catch (error) {
      res.status(500).json({ error: 'Failed to update user' })
    }
  } else if (req.method === 'DELETE') {
    try {
      await prisma.user.delete({
        where: { username: String(username) },
      })
      res.status(200).json({ message: 'User deleted successfully' })
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete user' })
    }
  } else {
    res.setHeader('Allow', ['GET', 'PUT', 'DELETE'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}