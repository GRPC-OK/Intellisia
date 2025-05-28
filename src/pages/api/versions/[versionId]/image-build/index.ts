// src/pages/api/build-and-scan/image-build.ts

import type { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { projectName, versionId } = req.query

  const versionIdNum = parseInt(versionId as string, 10)

  if (!projectName || isNaN(versionIdNum)) {
    return res.status(400).json({ error: 'Missing or invalid parameters' })
  }

  try {
    // Version + Project 조인 쿼리
    const version = await prisma.version.findFirst({
      where: {
        id: versionIdNum,
        project: { name: projectName as string },
      },
      select: {
        name: true,
        buildStatus: true,
        imageTag: true,
        createdAt: true,
      },
    })

    if (!version) {
      return res.status(404).json({ error: 'Version not found' })
    }

    res.status(200).json({ version })
  } catch (err) {
    console.error('[image-build.ts] DB query error:', err)
    res.status(500).json({ error: 'Internal Server Error' })
  }
}
