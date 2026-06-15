import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { pedidosOracao } from '@/lib/db/schema';

// GET - Buscar todos os pedidos
export async function GET() {
  try {
    const pedidos = await db.select().from(pedidosOracao).orderBy(pedidosOracao.criado_em);
    return NextResponse.json(pedidos);
  } catch (error) {
    console.error('Erro ao buscar pedidos:', error);
    return NextResponse.json({ error: 'Erro ao buscar pedidos' }, { status: 500 });
  }
}

// POST - Criar novo pedido
export async function POST(request: Request) {
  try {
    const { nome, motivo, contato } = await request.json();
    
    const novoPedido = await db.insert(pedidosOracao).values({
      nome,
      motivo,
      contato,
      status: 'pendente',
      oracoes: 0
    }).returning();
    
    return NextResponse.json(novoPedido[0]);
  } catch (error) {
    console.error('Erro ao criar pedido:', error);
    return NextResponse.json({ error: 'Erro ao criar pedido' }, { status: 500 });
  }
}