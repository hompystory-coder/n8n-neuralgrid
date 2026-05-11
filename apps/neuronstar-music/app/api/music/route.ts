import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * GET /api/music
 * Fetch music list with pagination and filtering
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const genre = searchParams.get('genre');

    const skip = (page - 1) * limit;

    // Build query conditions
    const where: any = {};
    if (genre && genre !== 'all') {
      where.genre = genre;
    }

    // Fetch music with pagination
    const [music, total] = await Promise.all([
      prisma.music.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.music.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: music,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error('❌ Failed to fetch music:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
