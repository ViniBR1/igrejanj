import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

// GET - Buscar músicas
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const busca = searchParams.get('busca') || '';
    
    const musicas = await sql`
      SELECT * FROM musicas 
      WHERE ativo = true 
      AND (titulo ILIKE ${`%${busca}%`} OR artista ILIKE ${`%${busca}%`})
      ORDER BY titulo
    `;
    
    return NextResponse.json(musicas);
  } catch (error) {
    console.error('Erro:', error);
    return NextResponse.json([], { status: 500 });
  }
}

// POST - Criar música
export async function POST(request: Request) {
  try {
    const { titulo, artista, link, tom, letra, cor_paleta, cifra, criado_por } = await request.json();
    
    const nova = await sql`
      INSERT INTO musicas (titulo, artista, link, tom, letra, cor_paleta, cifra, criado_por)
      VALUES (${titulo}, ${artista}, ${link}, ${tom}, ${letra}, ${cor_paleta}, ${cifra}, ${criado_por})
      RETURNING *
    `;
    
    return NextResponse.json(nova[0]);
  } catch (error) {
    console.error('Erro:', error);
    return NextResponse.json({ error: 'Erro ao criar música' }, { status: 500 });
  }
}

// PUT - Atualizar música
export async function PUT(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const { titulo, artista, link, tom, letra, cor_paleta, cifra } = await request.json();
    
    const atualizada = await sql`
      UPDATE musicas 
      SET titulo = ${titulo}, 
          artista = ${artista}, 
          link = ${link}, 
          tom = ${tom}, 
          letra = ${letra}, 
          cor_paleta = ${cor_paleta}, 
          cifra = ${cifra}
      WHERE id = ${id}
      RETURNING *
    `;
    
    return NextResponse.json(atualizada[0]);
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao atualizar música' }, { status: 500 });
  }
}

// DELETE - Remover música
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    await sql`
      UPDATE musicas SET ativo = false WHERE id = ${id}
    `;
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao remover música' }, { status: 500 });
  }
}