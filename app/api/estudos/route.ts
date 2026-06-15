import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

const sql = neon(process.env.DATABASE_URL!);

export const config = {
  api: {
    bodyParser: false,
  },
};

// GET - Buscar todos os estudos
export async function GET() {
  try {
    const estudos = await sql`
      SELECT * FROM estudos 
      WHERE ativo = true 
      ORDER BY criado_em DESC
    `;
    return NextResponse.json(estudos);
  } catch (error) {
    console.error('Erro ao buscar estudos:', error);
    return NextResponse.json([], { status: 500 });
  }
}

// POST - Criar novo estudo com upload
export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const titulo = formData.get('titulo') as string;
    const descricao = formData.get('descricao') as string;
    const categoria = formData.get('categoria') as string;
    const criado_por = formData.get('criado_por') as string;
    const file = formData.get('file') as File;

    console.log('Dados recebidos:', { titulo, descricao, categoria, criado_por, fileName: file?.name });

    if (!titulo || !file) {
      console.log('Erro: Título ou arquivo faltando');
      return NextResponse.json({ error: 'Título e arquivo são obrigatórios' }, { status: 400 });
    }

    // Verificar tipo de arquivo
    if (file.type !== 'application/pdf') {
      console.log('Erro: Arquivo não é PDF');
      return NextResponse.json({ error: 'Apenas arquivos PDF são permitidos' }, { status: 400 });
    }

    // Verificar tamanho (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'Arquivo muito grande. Máximo 10MB' }, { status: 400 });
    }

    let arquivo_url = '';

    // Salvar arquivo
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Criar nome único para o arquivo
    const uniqueName = `${Date.now()}-${file.name.replace(/\s/g, '-')}`;
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'estudos');
    
    console.log('Diretório de upload:', uploadDir);
    
    // Criar pasta se não existir
    await mkdir(uploadDir, { recursive: true });
    
    // Salvar arquivo
    const filePath = path.join(uploadDir, uniqueName);
    await writeFile(filePath, buffer);
    
    arquivo_url = `/uploads/estudos/${uniqueName}`;
    console.log('Arquivo salvo em:', filePath);

    // Salvar no banco
    const novoEstudo = await sql`
      INSERT INTO estudos (titulo, descricao, categoria, arquivo_url, criado_por)
      VALUES (${titulo}, ${descricao || ''}, ${categoria || ''}, ${arquivo_url}, ${criado_por || 'Pastor'})
      RETURNING *
    `;

    console.log('Estudo salvo no banco:', novoEstudo[0]);

    return NextResponse.json(novoEstudo[0]);
  } catch (error: any) {
    console.error('Erro detalhado:', error);
    return NextResponse.json({ error: error.message || 'Erro ao criar estudo' }, { status: 500 });
  }
}

// DELETE - Remover estudo
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    await sql`
      DELETE FROM estudos WHERE id = ${id}
    `;
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao remover estudo' }, { status: 500 });
  }
}