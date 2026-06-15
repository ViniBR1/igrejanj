import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export async function POST(request: Request) {
  try {
    const { items, total, cliente } = await request.json();

    const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN;
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';

    const preference = {
      items: items.map((item: any) => ({
        title: item.title,
        quantity: item.quantity,
        unit_price: item.unit_price,
        currency_id: 'BRL',
      })),
      payer: {
        name: cliente.nome,
        email: cliente.email || '',
        phone: {
          number: cliente.telefone || '',
        },
        identification: {
          type: 'CPF',
          number: cliente.cpf || '',
        },
      },
      back_urls: {
        success: `${baseUrl}/checkout/sucesso`,
        failure: `${baseUrl}/checkout/erro`,
        pending: `${baseUrl}/checkout/pendente`,
      },
      statement_descriptor: 'NJ STORE',
      external_reference: 'loja_nj',
    };

    const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(preference),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Erro MP:', data);
      return NextResponse.json({ error: data.message }, { status: response.status });
    }

    if (data.id && data.init_point) {
      // Salvar pedido no banco com dados do cliente
      const pedido = await sql`
        INSERT INTO pedidos (cliente_nome, cliente_email, cliente_telefone, cliente_cpf, total, preference_id, status)
        VALUES (${cliente.nome}, ${cliente.email || ''}, ${cliente.telefone || ''}, ${cliente.cpf || ''}, ${total}, ${data.id}, 'pendente')
        RETURNING id
      `;

      // Salvar itens do pedido
      for (const item of items) {
        await sql`
          INSERT INTO pedido_itens (pedido_id, nome_produto, tamanho, quantidade, preco_unitario, subtotal)
          VALUES (${pedido[0].id}, ${item.title}, ${item.tamanho || 'Único'}, ${item.quantity}, ${item.unit_price}, ${item.unit_price * item.quantity})
        `;
      }

      return NextResponse.json({ 
        initPoint: data.init_point,
        preferenceId: data.id
      });
    } else {
      throw new Error('Resposta inválida do Mercado Pago');
    }

  } catch (error: any) {
    console.error('Erro detalhado:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao processar pagamento' },
      { status: 500 }
    );
  }
}