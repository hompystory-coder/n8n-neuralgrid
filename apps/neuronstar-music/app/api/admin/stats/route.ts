import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const totalMusic = await prisma.music.count();
    const todayGenerated = await prisma.music.count({
      where: { createdAt: { gte: today } },
    });
    const totalDownloads = await prisma.music.aggregate({
      _sum: { downloadCount: true },
    });

    return NextResponse.json({
      success: true,
      totalMusic,
      todayGenerated,
      totalDownloads: totalDownloads._sum.downloadCount || 0,
      quota: { completed: todayGenerated, target: 20 },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
