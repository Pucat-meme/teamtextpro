import { NextApiRequest, NextApiResponse } from 'next'
import prisma from '../../../lib/prisma'
import bcrypt from 'bcryptjs'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { username, password, isAdmin } = req.body
    const hashedPassword = await bcrypt.hash(password, 10)
    try {
      const user = await prisma.user.create({
        data: { username, password: hashedPassword, isAdmin },
      })
      res.status(201).json({ id: user.id, username: user.username, isAdmin: user.isAdmin })
    } catch (error) {
      res.status(400).json({ error: 'Username already exists' })
    }
  } else if (req.method === 'GET') {
    const users = await prisma.user.findMany({
      select: { id: true, username: true, isAdmin: true },
    })
    res.status(200).json(users)
  } else {
    res.status(405).end()
  }
}