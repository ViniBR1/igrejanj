import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

// GET - Buscar avisos ativos
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const ativos = searchParams.get('ativos') === 'true';
    
    let query;
    if (ativos) {
      query = await sql`
        SELECT * FROM avisos 
        WHERE ativo = true 
        AND (data_fim IS NULL OR data_fim > NOW())
        ORDER BY prioridade DESC, criado_em DESC
      `;
    } else {
      query = await sql`
        SELECT * FROM avisos 
        ORDER BY prioridade DESC, criado_em DESC
      `;
    }
    
    return NextResponse.json(query);
  } catch (error) {
    console.error('Erro ao buscar avisos:', error);
    return NextResponse.json([], { status: 500 });
  }
}

// POST - Criar novo aviso
export async function POST(request: Request) {
  try {
    const { titulo, mensagem, tipo, prioridade, data_fim, criado_por } = await request.json();
    
    const novoAviso = await sql`
      INSERT INTO avisos (titulo, mensagem, tipo, prioridade, data_fim, criado_por)
      VALUES (${titulo}, ${mensagem}, ${tipo}, ${prioridade}, ${data_fim || null}, ${criado_por})
      RETURNING *
    `;
    
    return NextResponse.json(novoAviso[0]);
  } catch (error) {
    console.error('Erro ao criar aviso:', error);
    return NextResponse.json({ error: 'Erro ao criar aviso' }, { status: 500 });
  }
}

// PUT - Atualizar aviso
export async function PUT(request: Request) {
  try {
    const { id, titulo, mensagem, tipo, prioridade, data_fim, ativo } = await request.json();
    
    const avisoAtualizado = await sql`
      UPDATE avisos 
      SET titulo = ${titulo}, 
          mensagem = ${mensagem}, 
          tipo = ${tipo},
          prioridade = ${prioridade},
          data_fim = ${data_fim || null},
          ativo = ${ativo}
      WHERE id = ${id}
      RETURNING *
    `;
    
    return NextResponse.json(avisoAtualizado[0]);
  } catch (error) {
    console.error('Erro ao atualizar aviso:', error);
    return NextResponse.json({ error: 'Erro ao atualizar aviso' }, { status: 500 });
  }
}

// DELETE - Remover aviso
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    await sql`
      DELETE FROM avisos WHERE id = ${id}
    `;
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao remover aviso' }, { status: 500 });
  }
}