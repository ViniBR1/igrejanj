import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export async function POST(request: Request) {
  try {
    const { id } = await request.json();
    
    console.log('Recebido request para atualizar:', { id });
    
    if (id) {
      // Atualizar pedido específico
      const result = await sql`
        UPDATE pedidos 
        SET status = 'aprovado'
        WHERE id = ${id}
        RETURNING *
      `;
      
      console.log('Pedido atualizado:', result[0]);
      
      if (result.length > 0) {
        return NextResponse.json({ success: true, pedido: result[0] });
      } else {
        return NextResponse.json({ error: 'Pedido não encontrado' }, { status: 404 });
      }
    } else {
      // Atualizar todos os pendentes
      const result = await sql`
        UPDATE pedidos 
        SET status = 'aprovado'
        WHERE status = 'pendente'
        RETURNING *
      `;
      
      console.log(`Atualizados ${result.length} pedidos`);
      
      return NextResponse.json({ success: true, atualizados: result.length });
    }
    
  } catch (error) {
    console.error('Erro detalhado:', error);
    return NextResponse.json({ error: 'Erro ao atualizar pedido' }, { status: 500 });
  }
}