import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { pedidosOracao } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

// PUT - Atualizar status ou orações
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { status, oracoes } = await request.json();
    const id = parseInt(params.id);
    
    const updateData: any = {};
    if (status) updateData.status = status;
    if (oracoes !== undefined) updateData.oracoes = oracoes;
    if (status === 'concluido') updateData.respondido_em = new Date();
    
    const pedidoAtualizado = await db
      .update(pedidosOracao)
      .set(updateData)
      .where(eq(pedidosOracao.id, id))
      .returning();
    
    return NextResponse.json(pedidoAtualizado[0]);
  } catch (error) {
    console.error('Erro ao atualizar pedido:', error);
    return NextResponse.json({ error: 'Erro ao atualizar pedido' }, { status: 500 });
  }
}