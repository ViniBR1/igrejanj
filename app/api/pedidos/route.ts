import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    
    console.log('Buscando pedidos...');
    
    // Buscar pedidos
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
    
    console.log(`Encontrados ${pedidos.length} pedidos`);
    
    // Buscar itens para cada pedido
    for (let i = 0; i < pedidos.length; i++) {
      const itens = await sql`
        SELECT * FROM pedido_itens 
        WHERE pedido_id = ${pedidos[i].id}
      `;
      pedidos[i].itens = itens || [];
    }
    
    return NextResponse.json(pedidos);
  } catch (error) {
    console.error('Erro detalhado ao buscar pedidos:', error);
    return NextResponse.json({ error: 'Erro ao buscar pedidos' }, { status: 500 });
  }
}