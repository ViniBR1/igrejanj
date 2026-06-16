import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import bcrypt from 'bcryptjs';

const sql = neon(process.env.DATABASE_URL!);

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tipo = searchParams.get('tipo');
    
    let query;
    if (tipo) {
      query = await sql`
        SELECT id, nome, email, tipo, telefone, criado_em
        FROM usuarios
        WHERE tipo = ${tipo}
        ORDER BY nome
      `;
    } else {
      query = await sql`
        SELECT id, nome, email, tipo, telefone, criado_em
        FROM usuarios
        ORDER BY nome
      `;
    }
    
    return NextResponse.json(query);
  } catch (error) {
    console.error('Erro:', error);
    return NextResponse.json([], { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { nome, email, senha, tipo, telefone } = await request.json();
    
    // Verificar se email já existe
    const existe = await sql`
      SELECT id FROM usuarios WHERE email = ${email}
    `;
    
    if (existe.length > 0) {
      return NextResponse.json({ error: 'Email já cadastrado' }, { status: 400 });
    }
    
    // Hash da senha
    const hashedPassword = await bcrypt.hash(senha, 10);
    
    const novoUsuario = await sql`
      INSERT INTO usuarios (nome, email, senha, tipo, telefone)
      VALUES (${nome}, ${email}, ${hashedPassword}, ${tipo}, ${telefone})
      RETURNING id, nome, email, tipo
    `;
    
    return NextResponse.json(novoUsuario[0]);
  } catch (error) {
    console.error('Erro:', error);
    return NextResponse.json({ error: 'Erro ao criar usuário' }, { status: 500 });
  }
}