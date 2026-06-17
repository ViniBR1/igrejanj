import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

export const dynamic = 'force-dynamic';

const sql = neon(process.env.DATABASE_URL!);

// Função para converter link do YouTube para embed
function converterLinkYouTube(link: string): string {
  if (!link) return link;
  if (link.includes('/embed/')) return link;
  if (link.includes('watch?v=')) {
    const videoId = link.split('watch?v=')[1]?.split('&')[0];
    if (videoId) return `https://www.youtube.com/embed/${videoId}`;
  }
  if (link.includes('youtu.be/')) {
    const videoId = link.split('youtu.be/')[1]?.split('?')[0];
    if (videoId) return `https://www.youtube.com/embed/${videoId}`;
  }
  return link;
}

// GET - Buscar transmissões
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const ativo = searchParams.get('ativo') === 'true';
    const todas = searchParams.get('todas') === 'true';
    
    let query;
    if (todas) {
      query = await sql`
        SELECT * FROM transmissoes 
        ORDER BY criado_em DESC
      `;
    } else if (ativo) {
      query = await sql`
        SELECT * FROM transmissoes 
        WHERE ativo = true
        ORDER BY criado_em DESC
      `;
    } else {
      query = await sql`
        SELECT * FROM transmissoes 
        WHERE ativo = true
        ORDER BY criado_em DESC
      `;
    }
    
    const resultado = query.map((trans: any) => ({
      ...trans,
      link: converterLinkYouTube(trans.link)
    }));
    
    return NextResponse.json(resultado);
  } catch (error) {
    console.error('Erro ao buscar transmissões:', error);
    return NextResponse.json([], { status: 200 });
  }
}

// POST - Criar transmissão
export async function POST(request: Request) {
  try {
    const { titulo, descricao, plataforma, link, data_transmissao, duracao, imagem_url, criado_por } = await request.json();
    const linkConvertido = converterLinkYouTube(link);
    
    const nova = await sql`
      INSERT INTO transmissoes (titulo, descricao, plataforma, link, data_transmissao, duracao, imagem_url, criado_por, ativo)
      VALUES (${titulo}, ${descricao}, ${plataforma}, ${linkConvertido}, ${data_transmissao || null}, ${duracao || null}, ${imagem_url || null}, ${criado_por}, true)
      RETURNING *
    `;
    
    return NextResponse.json(nova[0]);
  } catch (error) {
    console.error('Erro ao criar transmissão:', error);
    return NextResponse.json({ error: 'Erro ao criar transmissão' }, { status: 500 });
  }
}

// PUT - Atualizar transmissão
export async function PUT(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const { titulo, descricao, plataforma, link, data_transmissao, duracao, imagem_url, ativo } = await request.json();
    const linkConvertido = converterLinkYouTube(link);
    
    const atualizada = await sql`
      UPDATE transmissoes 
      SET titulo = ${titulo}, 
          descricao = ${descricao}, 
          plataforma = ${plataforma}, 
          link = ${linkConvertido}, 
          data_transmissao = ${data_transmissao || null}, 
          duracao = ${duracao || null}, 
          imagem_url = ${imagem_url || null}, 
          ativo = ${ativo !== undefined ? ativo : true}
      WHERE id = ${id}
      RETURNING *
    `;
    
    return NextResponse.json(atualizada[0]);
  } catch (error) {
    console.error('Erro ao atualizar transmissão:', error);
    return NextResponse.json({ error: 'Erro ao atualizar transmissão' }, { status: 500 });
  }
}

// DELETE - Remover transmissão
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    await sql`DELETE FROM transmissoes WHERE id = ${id}`;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao remover transmissão:', error);
    return NextResponse.json({ error: 'Erro ao remover transmissão' }, { status: 500 });
  }
}