import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

export const dynamic = 'force-dynamic';

const sql = neon(process.env.DATABASE_URL!);

// GET - Buscar escalas
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const data = searchParams.get('data');
    const colaboradorId = searchParams.get('colaboradorId');
    const todas = searchParams.get('todas') === 'true';
    const id = searchParams.get('id');
    
    console.log('GET /api/escala-musica - Parâmetros:', { data, colaboradorId, todas, id });
    
    // BUSCAR ESCALA POR ID
    if (id) {
      const escala = await sql`
        SELECT 
          em.*,
          u.nome as lider_nome,
          u.id as lider_usuario_id,
          COALESCE(em.ministro_nome, u.nome) as ministro_nome,
          em.ministro_id
        FROM escala_musica em
        LEFT JOIN colaboradores c ON em.lider_id = c.id
        LEFT JOIN usuarios u ON c.usuario_id = u.id
        WHERE em.id = ${id}
      `;
      
      if (escala.length === 0) {
        return NextResponse.json({ error: 'Escala não encontrada' }, { status: 404 });
      }
      
      const membros = await sql`
        SELECT 
          emm.id,
          emm.colaborador_id,
          emm.instrumento,
          emm.confirmado,
          emm.back_vocal,
          emm.cor_paleta,
          u.nome,
          u.email
        FROM escala_musica_membros emm
        JOIN colaboradores c ON emm.colaborador_id = c.id
        JOIN usuarios u ON c.usuario_id = u.id
        WHERE emm.escala_id = ${id}
      `;
      
      const musicas = await sql`
        SELECT 
          emus.id,
          emus.musica_id,
          emus.ordem,
          m.titulo,
          m.artista,
          m.tom,
          m.cor_paleta,
          m.link,
          m.letra,
          m.cifra
        FROM escala_musica_musicas emus
        JOIN musicas m ON emus.musica_id = m.id
        WHERE emus.escala_id = ${id}
        ORDER BY emus.ordem
      `;
      
      return NextResponse.json({ ...escala[0], membros, musicas });
    }
    
    // BUSCAR ESCALAS DO COLABORADOR
    if (colaboradorId) {
      const escalas = await sql`
        SELECT DISTINCT
          em.*,
          u.nome as lider_nome,
          em.ministro_id,
          em.ministro_nome
        FROM escala_musica em
        LEFT JOIN colaboradores c ON em.lider_id = c.id
        LEFT JOIN usuarios u ON c.usuario_id = u.id
        INNER JOIN escala_musica_membros emm ON em.id = emm.escala_id
        WHERE emm.colaborador_id = ${colaboradorId}
        ORDER BY em.data_culto DESC
      `;
      
      const resultado = await Promise.all(escalas.map(async (escala) => {
        const membros = await sql`
          SELECT 
            emm.id,
            emm.colaborador_id,
            emm.instrumento,
            emm.confirmado,
            emm.back_vocal,
            emm.cor_paleta,
            u.nome,
            u.email
          FROM escala_musica_membros emm
          JOIN colaboradores c ON emm.colaborador_id = c.id
          JOIN usuarios u ON c.usuario_id = u.id
          WHERE emm.escala_id = ${escala.id}
        `;
        
        const musicas = await sql`
          SELECT 
            emus.id,
            emus.musica_id,
            emus.ordem,
            m.titulo,
            m.artista,
            m.tom,
            m.cor_paleta
          FROM escala_musica_musicas emus
          JOIN musicas m ON emus.musica_id = m.id
          WHERE emus.escala_id = ${escala.id}
          ORDER BY emus.ordem
        `;
        
        return { ...escala, membros, musicas };
      }));
      
      return NextResponse.json(resultado);
    }
    
    // BUSCAR ESCALAS POR DATA
    if (data) {
      const escalas = await sql`
        SELECT 
          em.*,
          u.nome as lider_nome,
          em.ministro_id,
          em.ministro_nome
        FROM escala_musica em
        LEFT JOIN colaboradores c ON em.lider_id = c.id
        LEFT JOIN usuarios u ON c.usuario_id = u.id
        WHERE em.data_culto = ${data}
        ORDER BY em.data_culto DESC
      `;
      
      const resultado = await Promise.all(escalas.map(async (escala) => {
        const membros = await sql`
          SELECT 
            emm.id,
            emm.colaborador_id,
            emm.instrumento,
            emm.confirmado,
            emm.back_vocal,
            emm.cor_paleta,
            u.nome,
            u.email
          FROM escala_musica_membros emm
          JOIN colaboradores c ON emm.colaborador_id = c.id
          JOIN usuarios u ON c.usuario_id = u.id
          WHERE emm.escala_id = ${escala.id}
        `;
        
        const musicas = await sql`
          SELECT 
            emus.id,
            emus.musica_id,
            emus.ordem,
            m.titulo,
            m.artista,
            m.tom,
            m.cor_paleta
          FROM escala_musica_musicas emus
          JOIN musicas m ON emus.musica_id = m.id
          WHERE emus.escala_id = ${escala.id}
          ORDER BY emus.ordem
        `;
        
        return { ...escala, membros, musicas };
      }));
      
      return NextResponse.json(resultado);
    }
    
    // BUSCAR TODAS AS ESCALAS
    if (todas) {
      const escalas = await sql`
        SELECT 
          em.*,
          u.nome as lider_nome,
          em.ministro_id,
          em.ministro_nome
        FROM escala_musica em
        LEFT JOIN colaboradores c ON em.lider_id = c.id
        LEFT JOIN usuarios u ON c.usuario_id = u.id
        ORDER BY em.data_culto DESC
      `;
      
      const resultado = await Promise.all(escalas.map(async (escala) => {
        const membros = await sql`
          SELECT 
            emm.id,
            emm.colaborador_id,
            emm.instrumento,
            emm.confirmado,
            emm.back_vocal,
            emm.cor_paleta,
            u.nome,
            u.email
          FROM escala_musica_membros emm
          JOIN colaboradores c ON emm.colaborador_id = c.id
          JOIN usuarios u ON c.usuario_id = u.id
          WHERE emm.escala_id = ${escala.id}
        `;
        
        const musicas = await sql`
          SELECT 
            emus.id,
            emus.musica_id,
            emus.ordem,
            m.titulo,
            m.artista,
            m.tom,
            m.cor_paleta
          FROM escala_musica_musicas emus
          JOIN musicas m ON emus.musica_id = m.id
          WHERE emus.escala_id = ${escala.id}
          ORDER BY emus.ordem
        `;
        
        return { ...escala, membros, musicas };
      }));
      
      return NextResponse.json(resultado);
    }
    
    // BUSCAR ÚLTIMAS 10 ESCALAS
    const escalas = await sql`
      SELECT 
        em.*,
        u.nome as lider_nome,
        em.ministro_id,
        em.ministro_nome
      FROM escala_musica em
      LEFT JOIN colaboradores c ON em.lider_id = c.id
      LEFT JOIN usuarios u ON c.usuario_id = u.id
      ORDER BY em.data_culto DESC
      LIMIT 10
    `;
    
    const resultado = await Promise.all(escalas.map(async (escala) => {
      const membros = await sql`
        SELECT 
          emm.id,
          emm.colaborador_id,
          emm.instrumento,
          emm.confirmado,
          emm.back_vocal,
          emm.cor_paleta,
          u.nome,
          u.email
        FROM escala_musica_membros emm
        JOIN colaboradores c ON emm.colaborador_id = c.id
        JOIN usuarios u ON c.usuario_id = u.id
        WHERE emm.escala_id = ${escala.id}
      `;
      
      const musicas = await sql`
        SELECT 
          emus.id,
          emus.musica_id,
          emus.ordem,
          m.titulo,
          m.artista,
          m.tom,
          m.cor_paleta
        FROM escala_musica_musicas emus
        JOIN musicas m ON emus.musica_id = m.id
        WHERE emus.escala_id = ${escala.id}
        ORDER BY emus.ordem
      `;
      
      return { ...escala, membros, musicas };
    }));
    
    return NextResponse.json(resultado);
  } catch (error) {
    console.error('Erro ao buscar escalas:', error);
    return NextResponse.json([], { status: 500 });
  }
}

// POST - Criar escala
export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('POST /api/escala-musica - Dados recebidos:', body);
    
    const { 
      data_culto, 
      tipo_culto, 
      lider_id, 
      ministro_id,
      observacoes, 
      criado_por, 
      membros, 
      musicas,
      ensaio_marcado,
      ensaio_horario,
      cor_paleta
    } = body;
    
    if (!data_culto) {
      return NextResponse.json({ error: 'Data do culto é obrigatória' }, { status: 400 });
    }
    
    if (!membros || membros.length === 0) {
      return NextResponse.json({ error: 'Selecione pelo menos um músico' }, { status: 400 });
    }
    
    let ministroNome = '';
    if (ministro_id) {
      const ministro = await sql`
        SELECT u.nome FROM colaboradores c
        JOIN usuarios u ON c.usuario_id = u.id
        WHERE c.id = ${ministro_id}
      `;
      if (ministro.length > 0) {
        ministroNome = ministro[0].nome;
      }
    }
    
    const novaEscala = await sql`
      INSERT INTO escala_musica (
        data_culto, 
        tipo_culto, 
        lider_id, 
        ministro_id,
        ministro_nome,
        observacoes, 
        criado_por,
        ensaio_marcado,
        ensaio_horario,
        cor_paleta
      )
      VALUES (
        ${data_culto}, 
        ${tipo_culto || 'domingo_manha'}, 
        ${lider_id || null}, 
        ${ministro_id || null},
        ${ministroNome},
        ${observacoes || ''}, 
        ${criado_por},
        ${ensaio_marcado || false},
        ${ensaio_horario || null},
        ${cor_paleta || '#6B1D96'}
      )
      RETURNING *
    `;
    
    const escalaId = novaEscala[0].id;
    console.log('Escala criada com ID:', escalaId);
    
    for (const membro of membros) {
      await sql`
        INSERT INTO escala_musica_membros (
          escala_id, 
          colaborador_id, 
          instrumento, 
          cor_paleta, 
          back_vocal
        )
        VALUES (
          ${escalaId}, 
          ${membro.id}, 
          ${membro.instrumento || 'Músico'}, 
          ${membro.cor_paleta || '#6B1D96'}, 
          ${membro.back_vocal || false}
        )
      `;
    }
    console.log(`${membros.length} membros adicionados`);
    
    if (musicas && musicas.length > 0) {
      for (let i = 0; i < musicas.length; i++) {
        await sql`
          INSERT INTO escala_musica_musicas (escala_id, musica_id, ordem)
          VALUES (${escalaId}, ${musicas[i]}, ${i})
        `;
      }
      console.log(`${musicas.length} músicas adicionadas`);
    }
    
    return NextResponse.json({ 
      success: true, 
      id: escalaId,
      message: 'Escala criada com sucesso!' 
    });
  } catch (error) {
    console.error('Erro ao criar escala:', error);
    return NextResponse.json({ error: 'Erro ao criar escala' }, { status: 500 });
  }
}

// PUT - Editar escala
export async function PUT(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const body = await request.json();
    
    if (!id) {
      return NextResponse.json({ error: 'ID da escala é obrigatório' }, { status: 400 });
    }
    
    const { 
      data_culto, 
      tipo_culto, 
      observacoes, 
      ensaio_marcado,
      ensaio_horario,
      cor_paleta,
      membros,
      musicas
    } = body;
    
    const escalaExistente = await sql`
      SELECT id FROM escala_musica WHERE id = ${id}
    `;
    
    if (escalaExistente.length === 0) {
      return NextResponse.json({ error: 'Escala não encontrada' }, { status: 404 });
    }
    
    await sql`
      UPDATE escala_musica 
      SET 
        data_culto = ${data_culto},
        tipo_culto = ${tipo_culto || 'domingo_manha'},
        observacoes = ${observacoes || ''},
        ensaio_marcado = ${ensaio_marcado || false},
        ensaio_horario = ${ensaio_horario || null},
        cor_paleta = ${cor_paleta || '#6B1D96'}
      WHERE id = ${id}
    `;
    
    await sql`DELETE FROM escala_musica_membros WHERE escala_id = ${id}`;
    
    if (membros && membros.length > 0) {
      for (const membro of membros) {
        await sql`
          INSERT INTO escala_musica_membros (
            escala_id, 
            colaborador_id, 
            instrumento, 
            cor_paleta, 
            back_vocal
          )
          VALUES (
            ${id}, 
            ${membro.id}, 
            ${membro.instrumento || 'Músico'}, 
            ${membro.cor_paleta || '#6B1D96'}, 
            ${membro.back_vocal || false}
          )
        `;
      }
    }
    
    await sql`DELETE FROM escala_musica_musicas WHERE escala_id = ${id}`;
    
    if (musicas && musicas.length > 0) {
      for (let i = 0; i < musicas.length; i++) {
        await sql`
          INSERT INTO escala_musica_musicas (escala_id, musica_id, ordem)
          VALUES (${id}, ${musicas[i]}, ${i})
        `;
      }
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Escala atualizada com sucesso!' 
    });
  } catch (error) {
    console.error('Erro ao atualizar escala:', error);
    return NextResponse.json({ error: 'Erro ao atualizar escala' }, { status: 500 });
  }
}

// PATCH - Confirmar presença
export async function PATCH(request: Request) {
  try {
    const { escalaId, colaboradorId, confirmado } = await request.json();
    
    if (!escalaId || !colaboradorId) {
      return NextResponse.json({ error: 'escalaId e colaboradorId são obrigatórios' }, { status: 400 });
    }
    
    const membro = await sql`
      SELECT id FROM escala_musica_membros 
      WHERE escala_id = ${escalaId} AND colaborador_id = ${colaboradorId}
    `;
    
    if (membro.length === 0) {
      return NextResponse.json({ error: 'Colaborador não está nesta escala' }, { status: 404 });
    }
    
    await sql`
      UPDATE escala_musica_membros 
      SET confirmado = ${confirmado}
      WHERE escala_id = ${escalaId} AND colaborador_id = ${colaboradorId}
    `;
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao confirmar presença:', error);
    return NextResponse.json({ error: 'Erro ao confirmar presença' }, { status: 500 });
  }
}

// DELETE - Excluir escala
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'ID da escala é obrigatório' }, { status: 400 });
    }
    
    const escalaExistente = await sql`
      SELECT id FROM escala_musica WHERE id = ${id}
    `;
    
    if (escalaExistente.length === 0) {
      return NextResponse.json({ error: 'Escala não encontrada' }, { status: 404 });
    }
    
    await sql`DELETE FROM escala_musica_membros WHERE escala_id = ${id}`;
    await sql`DELETE FROM escala_musica_musicas WHERE escala_id = ${id}`;
    await sql`DELETE FROM escala_musica WHERE id = ${id}`;
    
    return NextResponse.json({ 
      success: true, 
      message: 'Escala excluída com sucesso!' 
    });
  } catch (error) {
    console.error('Erro ao excluir escala:', error);
    return NextResponse.json({ error: 'Erro ao excluir escala' }, { status: 500 });
  }
}