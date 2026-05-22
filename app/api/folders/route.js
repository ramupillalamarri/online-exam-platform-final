import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    const res = await query(`
      SELECT f.*, COALESCE(e.exam_count, 0)::integer as "examCount" 
      FROM folders f 
      LEFT JOIN (
        SELECT folder_id, COUNT(*) 
        FROM exams 
        GROUP BY folder_id
      ) e ON f.id = e.folder_id
      ORDER BY f.created_at DESC
    `);
    
    return NextResponse.json(res.rows);
  } catch (error) {
    console.error('GET Folders Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST( req) {
  try {
    const { id, name, createdBy } = await req.json();
    if (!name) {
      return NextResponse.json({ error: 'Folder name is required' }, { status: 400 });
    }

    const res = await query(
      `INSERT INTO folders (id, name, created_by) VALUES ($1, $2, $3) RETURNING *`,
      [id, name, createdBy || 'admin-1']
    );

    const folder = res.rows[0];
    return NextResponse.json({
      ...folder,
      examCount: 0
    });
  } catch (error) {
    console.error('POST Folder Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT( req) {
  try {
    const { id, name } = await req.json();
    if (!id || !name) {
      return NextResponse.json({ error: 'Folder ID and name are required' }, { status: 400 });
    }

    const res = await query(
      `UPDATE folders SET name = $1 WHERE id = $2 RETURNING *`,
      [name, id]
    );

    if (res.rowCount === 0) {
      return NextResponse.json({ error: 'Folder not found' }, { status: 404 });
    }

    return NextResponse.json(res.rows[0]);
  } catch (error) {
    console.error('PUT Folder Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE( req) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Folder ID is required' }, { status: 400 });
    }

    // Set matching exams' folder_id to null (handled by ON DELETE SET NULL on PostgreSQL foreign key)
    await query(`DELETE FROM folders WHERE id = $1`, [id]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE Folder Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
