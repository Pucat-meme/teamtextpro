import { NextApiRequest, NextApiResponse } from 'next'
import prisma from '../../../lib/prisma'
import bcrypt from 'bcryptjs'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { username, password } = req.body
    const user = await prisma.user.findUnique({ where: { username } })
    if (user && await bcrypt.compare(password, user.password)) {
      res.status(200).json({ id: user.id, username: user.username, isAdmin: user.isAdmin })
    } else {
      res.status(401).json({ error: 'Invalid credentials' })
    }
  } else {
    res.status(405).end()
  }
}