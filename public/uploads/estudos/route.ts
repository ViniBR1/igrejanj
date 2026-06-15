import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

const sql = neon(process.env.DATABASE_URL!);

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

    if (!titulo || !file) {
      return NextResponse.json({ error: 'Título e arquivo são obrigatórios' }, { status: 400 });
    }

    let arquivo_url = '';

    // Se tiver arquivo, fazer upload
    if (file && file.size > 0) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      
      // Criar nome único para o arquivo
      const uniqueName = `${Date.now()}-${file.name.replace(/\s/g, '-')}`;
      const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'estudos');
      
      // Criar pasta se não existir
      await mkdir(uploadDir, { recursive: true });
      
      // Salvar arquivo
      const filePath = path.join(uploadDir, uniqueName);
      await writeFile(filePath, buffer);
      
      arquivo_url = `/uploads/estudos/${uniqueName}`;
    }

    // Salvar no banco
    const novoEstudo = await sql`
      INSERT INTO estudos (titulo, descricao, categoria, arquivo_url, criado_por)
      VALUES (${titulo}, ${descricao}, ${categoria}, ${arquivo_url}, ${criado_por})
      RETURNING *
    `;

    return NextResponse.json(novoEstudo[0]);
  } catch (error) {
    console.error('Erro ao criar estudo:', error);
    return NextResponse.json({ error: 'Erro ao criar estudo' }, { status: 500 });
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