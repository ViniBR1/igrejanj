import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const areaId = searchParams.get('areaId');
    const id = searchParams.get('id');
    const email = searchParams.get('email');
    
    console.log('API Colaboradores - Parâmetros:', { areaId, id, email });
    
    // Buscar por email
    if (email) {
      const colaborador = await sql`
        SELECT 
          c.*, 
          u.nome, 
          u.email, 
          u.telefone, 
          a.nome as area_nome,
          a.tipo as area_tipo,
          COALESCE(c.funcao, 'Músico') as instrumento
        FROM colaboradores c
        JOIN usuarios u ON c.usuario_id = u.id
        JOIN areas a ON c.area_id = a.id
        WHERE u.email = ${email} AND c.ativo = true
      `;
      
      if (colaborador.length === 0) {
        return NextResponse.json({ error: 'Colaborador não encontrado' }, { status: 404 });
      }
      
      return NextResponse.json(colaborador[0]);
    }
    
    // Buscar por ID
    if (id) {
      const colaborador = await sql`
        SELECT 
          c.*, 
          u.nome, 
          u.email, 
          u.telefone, 
          a.nome as area_nome,
          a.tipo as area_tipo,
          COALESCE(c.funcao, 'Músico') as instrumento
        FROM colaboradores c
        JOIN usuarios u ON c.usuario_id = u.id
        JOIN areas a ON c.area_id = a.id
        WHERE c.id = ${id} AND c.ativo = true
      `;
      
      if (colaborador.length === 0) {
        return NextResponse.json({ error: 'Colaborador não encontrado' }, { status: 404 });
      }
      
      return NextResponse.json(colaborador[0]);
    }
    
    // Buscar por área
    if (areaId) {
      const colaboradores = await sql`
        SELECT 
          c.id,
          c.usuario_id,
          c.funcao, 
          c.nivel,
          c.ativo,
          c.data_entrada,
          u.nome, 
          u.email, 
          u.telefone, 
          a.nome as area_nome,
          a.tipo as area_tipo,
          COALESCE(c.funcao, 'Músico') as instrumento
        FROM colaboradores c
        JOIN usuarios u ON c.usuario_id = u.id
        JOIN areas a ON c.area_id = a.id
        WHERE c.area_id = ${areaId} AND c.ativo = true
        ORDER BY u.nome
      `;
      console.log('Colaboradores encontrados na área:', colaboradores.length);
      return NextResponse.json(colaboradores);
    }
    
    // Buscar todos
    const colaboradores = await sql`
      SELECT 
        c.id,
        c.usuario_id,
        c.funcao, 
        c.nivel,
        c.ativo,
        c.data_entrada,
        u.nome, 
        u.email, 
        u.telefone, 
        a.nome as area_nome,
        a.tipo as area_tipo,
        COALESCE(c.funcao, 'Músico') as instrumento
      FROM colaboradores c
      JOIN usuarios u ON c.usuario_id = u.id
      JOIN areas a ON c.area_id = a.id
      WHERE c.ativo = true
      ORDER BY u.nome
    `;
    
    console.log('Total de colaboradores:', colaboradores.length);
    return NextResponse.json(colaboradores);
  } catch (error) {
    console.error('Erro ao buscar colaboradores:', error);
    return NextResponse.json([], { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { usuario_id, area_id, funcao, nivel } = await request.json();
    
    // Verificar se já existe
    const existe = await sql`
      SELECT id FROM colaboradores WHERE usuario_id = ${usuario_id} AND area_id = ${area_id}
    `;
    
    if (existe.length > 0) {
      // Atualizar
      const atualizado = await sql`
        UPDATE colaboradores 
        SET funcao = ${funcao || ''}, nivel = ${nivel || 'membro'}, ativo = true
        WHERE usuario_id = ${usuario_id} AND area_id = ${area_id}
        RETURNING *
      `;
      return NextResponse.json(atualizado[0]);
    }
    
    const novo = await sql`
      INSERT INTO colaboradores (usuario_id, area_id, funcao, nivel)
      VALUES (${usuario_id}, ${area_id}, ${funcao || ''}, ${nivel || 'membro'})
      RETURNING *
    `;
    
    return NextResponse.json(novo[0]);
  } catch (error) {
    console.error('Erro ao criar colaborador:', error);
    return NextResponse.json({ error: 'Erro ao criar colaborador' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const { funcao, nivel, area_id } = await request.json();
    
    const atualizado = await sql`
      UPDATE colaboradores 
      SET funcao = ${funcao || ''}, nivel = ${nivel || 'membro'}, area_id = ${area_id}
      WHERE id = ${id}
      RETURNING *
    `;
    
    return NextResponse.json(atualizado[0]);
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao atualizar' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    await sql`
      UPDATE colaboradores SET ativo = false WHERE id = ${id}
    `;
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao remover' }, { status: 500 });
  }
}