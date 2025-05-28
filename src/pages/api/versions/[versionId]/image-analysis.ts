export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const versionId = Number(req.query.versionId);
  
  try {
    // DB에서 SARIF URL 가져오기
    const version = await prisma.version.findUnique({
      where: { id: versionId },
      select: { 
        imageAnalysisS3Url: true,
        name: true,
        project: {
          select: {
            name: true,
            owner: { select: { name: true } }
          }
        }
      }
    });

    if (!version?.imageAnalysisS3Url) {
      return res.status(404).json({ message: 'No analysis result found' });
    }

    // S3에서 SARIF 파일 가져오기
    const sarifResponse = await fetch(version.imageAnalysisS3Url);
    const sarifData = await sarifResponse.json();

    return res.status(200).json({
      version: {
        id: versionId,
        name: version.name,
        project: version.project,
      },
      sarifData, // 실제 SARIF 데이터
      status: 'success',
      hasAnalysisResult: true,
    });
  } catch (error) {
    console.error('[IMAGE ANALYSIS API ERROR]', error);
    return res.status(500).json({ 
      message: 'Failed to fetch image analysis results',
      error: String(error),
    });
  }
}