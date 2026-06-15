import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export async function POST(request: Request) {
  try {
    const { nome, valor, tipo, email, telefone, mensagem } = await request.json();

    // Validações básicas
    if (!nome || !valor || !tipo) {
      return NextResponse.json(
        { error: 'Preencha todos os campos obrigatórios' },
        { status: 400 }
      );
    }

    if (parseFloat(valor) < 1) {
      return NextResponse.json(
        { error: 'O valor mínimo é R$ 1,00' },
        { status: 400 }
      );
    }

    // URL base (para desenvolvimento)
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';

    // Construir o objeto de preferência
    const preference = {
      items: [
        {
          title: tipo === 'dizimo' ? 'Dízimo - Igreja Nova Jerusalém' : 'Oferta - Igreja Nova Jerusalém',
          description: `Contribuição de ${nome}`,
          quantity: 1,
          currency_id: 'BRL',
          unit_price: Number(parseFloat(valor).toFixed(2)),
        },
      ],
      payer: {
        name: nome,
        email: email || '',
        ...(telefone && { phone: { number: telefone.replace(/\D/g, '') } }),
      },
      back_urls: {
        success: `${baseUrl}/pagamento/sucesso`,
        failure: `${baseUrl}/pagamento/erro`,
        pending: `${baseUrl}/pagamento/pendente`,
      },
      external_reference: tipo,
      statement_descriptor: 'IGREJA NJ',
    };

    console.log('Enviando para MP:', JSON.stringify(preference, null, 2));

    // Chamada direta à API do Mercado Pago
    const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.MERCADO_PAGO_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(preference),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Erro MP:', data);
      return NextResponse.json(
        { error: data.message || 'Erro ao criar preferência' },
        { status: response.status }
      );
    }

    if (data.id && data.init_point) {
      // Salvar transação no banco
      await sql`
        INSERT INTO transacoes (nome_doador, valor, tipo, status, preference_id, email, telefone, mensagem)
        VALUES (${nome}, ${valor}, ${tipo}, 'pendente', ${data.id}, ${email || null}, ${telefone || null}, ${mensagem || null})
      `;

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
      { error: error.message || 'Erro interno ao processar pagamento' },
      { status: 500 }
    );
  }
}