import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import fs from 'fs';
import path from 'path';

const sql = neon(process.env.DATABASE_URL!);

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    
    // Buscar estudo no banco
    const estudos = await sql`
      SELECT * FROM estudos WHERE id = ${id}
    `;
    
    if (estudos.length === 0) {
      return NextResponse.json({ error: 'Estudo não encontrado' }, { status: 404 });
    }
    
    const estudo = estudos[0];
    
    // Incrementar contador de downloads
    await sql`
      UPDATE estudos SET downloads = downloads + 1 WHERE id = ${id}
    `;
    
    // Caminho do arquivo
    const filePath = path.join(process.cwd(), 'public', estudo.arquivo_url);
    
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: 'Arquivo não encontrado' }, { status: 404 });
    }
    
    const fileBuffer = fs.readFileSync(filePath);
    
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${estudo.titulo}.pdf"`,
      },
    });
  } catch (error) {
    console.error('Erro no download:', error);
    return NextResponse.json({ error: 'Erro ao baixar arquivo' }, { status: 500 });
  }
}