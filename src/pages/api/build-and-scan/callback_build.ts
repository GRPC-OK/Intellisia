// src/pages/api/image-build/result.ts

import type { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient, StepStatus } from '@prisma/client'

// Prisma 인스턴스 생성
const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    // POST 외에는 거절
    if (req.method !== 'POST') return res.status(405).end('Method Not Allowed')

    // GitHub Actions는 쿼리스트링으로 전달하므로 req.query에서 추출
    const versionName = req.query.versionName as string
    const projectIdRaw = req.query.projectId
    const status = req.query.status as string

    const projectId = parseInt(projectIdRaw as string, 10)

    if (!versionName || isNaN(projectId) || !['success', 'fail'].includes(status)) {
        return res.status(400).json({ error: 'Invalid or missing parameters' })
    }

    try {
        const enumStatus = status === 'success' ? StepStatus.success : StepStatus.fail;
        // 해당 versionId에 해당하는 빌드 상태 업데이트
        await prisma.version.update({
            where: {
                projectId_name: {
                    projectId,
                    name: versionName,
                },
            },
            data: { buildStatus: enumStatus },
        });

        return res.status(200).json({ message: 'Build status updated successfully' })
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to update build status'
        console.error('[result.ts] DB update error:', message)
        return res.status(500).json({ error: message })
    }
}