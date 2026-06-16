import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export async function GET() {
  try {
    // Verificar se a tabela existe
    const tableCheck = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'configuracoes'
      );
    `;
    
    // Valores padrão caso a tabela não exista
    const defaultConfig = {
      nome_igreja: 'Igreja Nova Jerusalém',
      endereco: 'Av. Abílio Augusto Távora',
      numero: '532',
      complemento: 'Cabuçu',
      bairro: 'Cabuçu',
      cidade: 'Nova Iguaçu',
      estado: 'RJ',
      cep: '26291-200',
      telefone: '(21) 98534-5627',
      whatsapp: '5521985345627',
      latitude: '-22.7592',
      longitude: '-43.4511',
      horarios: 'Terças 9h | Quartas 20h | Domingos 18h',
      acessibilidade: 'Entrada e estacionamento acessíveis para cadeirantes'
    };
    
    if (!tableCheck[0].exists) {
      return NextResponse.json(defaultConfig);
    }
    
    const configuracoes = await sql`
      SELECT chave, valor FROM configuracoes
    `;
    
    const configObj: Record<string, string> = { ...defaultConfig };
    
    configuracoes.forEach((c: any) => {
      configObj[c.chave] = c.valor;
    });
    
    return NextResponse.json(configObj);
  } catch (error) {
    console.error('Erro ao buscar configurações:', error);
    return NextResponse.json({
      nome_igreja: 'Igreja Nova Jerusalém',
      endereco: 'Av. Abílio Augusto Távora',
      numero: '532',
      complemento: 'Cabuçu',
      bairro: 'Cabuçu',
      cidade: 'Nova Iguaçu',
      estado: 'RJ',
      cep: '26291-200',
      telefone: '(21) 98534-5627',
      whatsapp: '5521985345627',
      latitude: '-22.7592',
      longitude: '-43.4511',
      horarios: 'Terças 9h | Quartas 20h | Domingos 18h',
      acessibilidade: 'Entrada e estacionamento acessíveis para cadeirantes'
    });
  }
}