// pages/api/image-build/image-build.ts
import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const latestVersion = await prisma.version.findFirst({
      where: {
        buildStatus: { in: ['success', 'fail'] },
      },
      orderBy: { createdAt: 'desc' },
      select: {
        imageTag: true,
        buildStatus: true,
      },
    })

    if (!latestVersion) {
      return res.status(404).json({ message: 'No completed build found' })
    }

    return res.status(200).json(latestVersion)
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' })
  }
}
