import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    
    if (!email) {
      return NextResponse.json({ exists: false });
    }
    
    const users = await sql`
      SELECT id FROM usuarios WHERE email = ${email}
    `;
    
    return NextResponse.json({ exists: users.length > 0 });
  } catch (error) {
    return NextResponse.json({ exists: false });
  }
}