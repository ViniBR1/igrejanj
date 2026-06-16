import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

// POST - Adicionar música à escala
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { musica_id } = await request.json();
    const escalaId = parseInt(params.id);
    
    // Verificar se a música já está na escala
    const existe = await sql`
      SELECT id FROM escala_musica_musicas 
      WHERE escala_id = ${escalaId} AND musica_id = ${musica_id}
    `;
    
    if (existe.length > 0) {
      return NextResponse.json({ error: 'Música já adicionada' }, { status: 400 });
    }
    
    // Buscar a próxima ordem
    const ultimaOrdem = await sql`
      SELECT COALESCE(MAX(ordem), -1) as max_ordem 
      FROM escala_musica_musicas 
      WHERE escala_id = ${escalaId}
    `;
    
    const novaOrdem = (ultimaOrdem[0]?.max_ordem || -1) + 1;
    
    await sql`
      INSERT INTO escala_musica_musicas (escala_id, musica_id, ordem)
      VALUES (${escalaId}, ${musica_id}, ${novaOrdem})
    `;
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao adicionar música:', error);
    return NextResponse.json({ error: 'Erro ao adicionar música' }, { status: 500 });
  }
}

// DELETE - Remover música da escala
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const musicaId = searchParams.get('musicaId');
    const escalaId = parseInt(params.id);
    
    if (!musicaId) {
      return NextResponse.json({ error: 'musicaId é obrigatório' }, { status: 400 });
    }
    
    await sql`
      DELETE FROM escala_musica_musicas 
      WHERE escala_id = ${escalaId} AND musica_id = ${musicaId}
    `;
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao remover música:', error);
    return NextResponse.json({ error: 'Erro ao remover música' }, { status: 500 });
  }
}