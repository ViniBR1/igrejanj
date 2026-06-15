import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

// GET - Buscar todos os eventos
export async function GET() {
  try {
    const eventos = await sql`
      SELECT * FROM eventos 
      WHERE ativo = true 
      ORDER BY data_evento ASC
    `;
    return NextResponse.json(eventos);
  } catch (error) {
    console.error('Erro ao buscar eventos:', error);
    return NextResponse.json([], { status: 500 });
  }
}

// POST - Criar novo evento
export async function POST(request: Request) {
  try {
    const { titulo, descricao, data_evento, local, imagem_url, criado_por } = await request.json();
    
    const novoEvento = await sql`
      INSERT INTO eventos (titulo, descricao, data_evento, local, imagem_url, criado_por)
      VALUES (${titulo}, ${descricao}, ${data_evento}, ${local}, ${imagem_url}, ${criado_por})
      RETURNING *
    `;
    
    return NextResponse.json(novoEvento[0]);
  } catch (error) {
    console.error('Erro ao criar evento:', error);
    return NextResponse.json({ error: 'Erro ao criar evento' }, { status: 500 });
  }
}

// PUT - Atualizar evento existente
export async function PUT(request: Request) {
  try {
    const { id, titulo, descricao, data_evento, local, imagem_url } = await request.json();
    
    const eventoAtualizado = await sql`
      UPDATE eventos 
      SET titulo = ${titulo}, 
          descricao = ${descricao}, 
          data_evento = ${data_evento}, 
          local = ${local}, 
          imagem_url = ${imagem_url}
      WHERE id = ${id}
      RETURNING *
    `;
    
    return NextResponse.json(eventoAtualizado[0]);
  } catch (error) {
    console.error('Erro ao atualizar evento:', error);
    return NextResponse.json({ error: 'Erro ao atualizar evento' }, { status: 500 });
  }
}

// DELETE - Remover evento
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    await sql`
      DELETE FROM eventos WHERE id = ${id}
    `;
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao remover evento:', error);
    return NextResponse.json({ error: 'Erro ao remover evento' }, { status: 500 });
  }
}