import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export async function POST() {
  try {
    // Buscar pedidos pendentes
    const pedidos = await sql`
      SELECT * FROM pedidos 
      WHERE status = 'pendente' AND preference_id IS NOT NULL
    `;
    
    const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN;
    let atualizados = 0;
    
    for (const pedido of pedidos) {
      // Buscar preferência no Mercado Pago
      const response = await fetch(`https://api.mercadopago.com/checkout/preferences/${pedido.preference_id}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });
      
      const preference = await response.json();
      
      // Se tiver pagamento aprovado
      if (preference.payments && preference.payments.length > 0) {
        const paymentId = preference.payments[0].id;
        
        // Buscar status do pagamento
        const paymentResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        });
        
        const payment = await paymentResponse.json();
        
        if (payment.status === 'approved') {
          await sql`
            UPDATE pedidos 
            SET status = 'aprovado', payment_id = ${paymentId}
            WHERE id = ${pedido.id}
          `;
          atualizados++;
        }
      }
    }
    
    return NextResponse.json({ atualizados });
  } catch (error) {
    console.error('Erro:', error);
    return NextResponse.json({ error: 'Erro' }, { status: 500 });
  }
}