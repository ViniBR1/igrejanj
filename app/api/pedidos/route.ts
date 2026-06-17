import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

export const dynamic = 'force-dynamic';

const sql = neon(process.env.DATABASE_URL!);

// GET - Buscar pedidos
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    
    let pedidos;
    if (status && status !== 'todos') {
      pedidos = await sql`
        SELECT * FROM pedidos 
        WHERE status = ${status}
        ORDER BY criado_em DESC
      `;
    } else {
      pedidos = await sql`
        SELECT * FROM pedidos 
        ORDER BY criado_em DESC
      `;
    }
    
    // Buscar itens para cada pedido
    const pedidosComItens = await Promise.all(
      pedidos.map(async (pedido) => {
        const itens = await sql`
          SELECT * FROM pedido_itens 
          WHERE pedido_id = ${pedido.id}
        `;
        return { ...pedido, itens };
      })
    );
    
    return NextResponse.json(pedidosComItens);
  } catch (error) {
    console.error('Erro ao buscar pedidos:', error);
    return NextResponse.json([], { status: 500 });
  }
}

// POST - Criar pedido
export async function POST(request: Request) {
  try {
    const { cliente_nome, cliente_email, cliente_telefone, cliente_cpf, total, preference_id } = await request.json();
    
    const novoPedido = await sql`
      INSERT INTO pedidos (cliente_nome, cliente_email, cliente_telefone, cliente_cpf, total, preference_id)
      VALUES (${cliente_nome}, ${cliente_email}, ${cliente_telefone}, ${cliente_cpf}, ${total}, ${preference_id})
      RETURNING *
    `;
    
    return NextResponse.json(novoPedido[0]);
  } catch (error) {
    console.error('Erro ao criar pedido:', error);
    return NextResponse.json({ error: 'Erro ao criar pedido' }, { status: 500 });
  }
}

// PUT - Atualizar status do pedido
export async function PUT(request: Request) {
  try {
    const { id, status } = await request.json();
    
    await sql`
      UPDATE pedidos 
      SET status = ${status}
      WHERE id = ${id}
    `;
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao atualizar pedido:', error);
    return NextResponse.json({ error: 'Erro ao atualizar pedido' }, { status: 500 });
  }
}

// DELETE - Excluir pedido
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    await sql`
      DELETE FROM pedidos WHERE id = ${id}
    `;
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao excluir pedido:', error);
    return NextResponse.json({ error: 'Erro ao excluir pedido' }, { status: 500 });
  }
}