import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('Webhook recebido:', JSON.stringify(body, null, 2));
    
    const { type, data } = body;

    if (type === 'payment') {
      const paymentId = data.id;
      
      console.log(`Processando pagamento ${paymentId}`);
      
      // Buscar o pagamento no Mercado Pago
      const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN;
      const paymentResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });
      
      const payment = await paymentResponse.json();
      console.log('Status do pagamento:', payment.status);
      console.log('Preference ID:', payment.preference_id);
      
      if (payment.status === 'approved') {
        // Buscar pedido pelo preference_id
        const pedidos = await sql`
          SELECT * FROM pedidos 
          WHERE preference_id = ${payment.preference_id}
        `;
        
        console.log('Pedidos encontrados:', pedidos.length);
        
        if (pedidos.length > 0) {
          await sql`
            UPDATE pedidos 
            SET status = 'aprovado', 
                payment_id = ${paymentId}
            WHERE id = ${pedidos[0].id}
          `;
          console.log(`✅ Pedido ${pedidos[0].id} atualizado para aprovado`);
        } else {
          // Se não encontrou, tenta atualizar o mais recente pendente
          await sql`
            UPDATE pedidos 
            SET status = 'aprovado', 
                payment_id = ${paymentId}
            WHERE status = 'pendente'
            ORDER BY id DESC
            LIMIT 1
          `;
          console.log(`✅ Último pedido pendente atualizado para aprovado`);
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Erro no webhook:', error);
    return NextResponse.json({ error: 'Erro' }, { status: 500 });
  }
}