import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export async function GET() {
  try {
    const areas = await sql`
      SELECT * FROM areas WHERE ativo = true ORDER BY nome
    `;
    return NextResponse.json(areas);
  } catch (error) {
    return NextResponse.json([], { status: 500 });
  }
}