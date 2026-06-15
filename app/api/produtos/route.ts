import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

const sql = neon(process.env.DATABASE_URL!);

// GET - Buscar produtos
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const categoria = searchParams.get('categoria');
    const ativos = searchParams.get('ativos') === 'true';
    
    let query;
    if (categoria && categoria !== 'todas') {
      query = await sql`
        SELECT * FROM produtos 
        WHERE ativo = true AND categoria = ${categoria}
        ORDER BY criado_em DESC
      `;
    } else {
      query = await sql`
        SELECT * FROM produtos 
        WHERE ativo = true
        ORDER BY criado_em DESC
      `;
    }
    
    return NextResponse.json(query);
  } catch (error) {
    console.error('Erro ao buscar produtos:', error);
    return NextResponse.json([], { status: 500 });
  }
}

// POST - Criar produto
export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const nome = formData.get('nome') as string;
    const descricao = formData.get('descricao') as string;
    const preco = parseFloat(formData.get('preco') as string);
    const categoria = formData.get('categoria') as string;
    const estoque = parseInt(formData.get('estoque') as string);
    const tamanhos = JSON.parse(formData.get('tamanhos') as string || '[]');
    const criado_por = formData.get('criado_por') as string;
    const file = formData.get('file') as File;

    if (!nome || !preco) {
      return NextResponse.json({ error: 'Nome e preço são obrigatórios' }, { status: 400 });
    }

    let imagem_url = '';

    // Salvar imagem se tiver
    if (file && file.size > 0) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      
      const uniqueName = `${Date.now()}-${file.name.replace(/\s/g, '-')}`;
      const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'produtos');
      
      await mkdir(uploadDir, { recursive: true });
      
      const filePath = path.join(uploadDir, uniqueName);
      await writeFile(filePath, buffer);
      
      imagem_url = `/uploads/produtos/${uniqueName}`;
    }

    const novoProduto = await sql`
      INSERT INTO produtos (nome, descricao, preco, categoria, imagem_url, estoque, tamanhos, criado_por)
      VALUES (${nome}, ${descricao || ''}, ${preco}, ${categoria || ''}, ${imagem_url}, ${estoque || 0}, ${tamanhos}, ${criado_por})
      RETURNING *
    `;

    return NextResponse.json(novoProduto[0]);
  } catch (error) {
    console.error('Erro ao criar produto:', error);
    return NextResponse.json({ error: 'Erro ao criar produto' }, { status: 500 });
  }
}

// PUT - Atualizar produto
export async function PUT(request: Request) {
  try {
    const { id, nome, descricao, preco, categoria, imagem_url, estoque, tamanhos, ativo } = await request.json();
    
    const produtoAtualizado = await sql`
      UPDATE produtos 
      SET nome = ${nome}, 
          descricao = ${descricao},
          preco = ${preco},
          categoria = ${categoria},
          imagem_url = ${imagem_url},
          estoque = ${estoque},
          tamanhos = ${tamanhos},
          ativo = ${ativo}
      WHERE id = ${id}
      RETURNING *
    `;
    
    return NextResponse.json(produtoAtualizado[0]);
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao atualizar produto' }, { status: 500 });
  }
}

// DELETE - Remover produto
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    await sql`DELETE FROM produtos WHERE id = ${id}`;
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao remover produto' }, { status: 500 });
  }
}