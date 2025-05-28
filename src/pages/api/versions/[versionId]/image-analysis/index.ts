// src/pages/api/build-and-scan/image-analysis.ts

import type { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).end('Method Not Allowed')

  const { versionId } = req.query

  if (!versionId) return res.status(400).json({ error: 'Missing versionId' })

  try {
    const analysis = await prisma.codeAnalysis.findUnique({
      where: { versionId: Number(versionId) },
      select: {
        id: true,
        versionId: true,
        status: true,
        sarifUrl: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    if (!analysis) return res.status(404).json({ error: 'Analysis not found' })

    res.status(200).json({ analysis })
  } catch (err) {
    console.error('[get_analysis.ts] Error:', err)
    res.status(500).json({ error: 'Internal Server Error' })
  }
}
