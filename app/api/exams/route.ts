import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    const res = await query(`
      SELECT 
        e.id, 
        e.title, 
        e.description, 
        e.duration_minutes as "durationMinutes", 
        e.folder_id as "folderId", 
        e.is_published as "isPublished", 
        e.negative_marking::numeric::double precision as "negativeMarking", 
        e.created_by as "createdBy", 
        e.created_at as "createdAt", 
        e.updated_at as "updatedAt",
        f.name as "folderName",
        COALESCE(q.q_count, 0)::integer as "questionCount",
        COALESCE(a.a_count, 0)::integer as "attemptCount"
      FROM exams e
      LEFT JOIN folders f ON e.folder_id = f.id
      LEFT JOIN (
        SELECT exam_id, COUNT(*) as q_count 
        FROM questions 
        GROUP BY exam_id
      ) q ON e.id = q.exam_id
      LEFT JOIN (
        SELECT exam_id, COUNT(*) as a_count 
        FROM attempts 
        GROUP BY exam_id
      ) a ON e.id = a.exam_id
      ORDER BY e.created_at DESC
    `);
    
    return NextResponse.json(res.rows);
  } catch (error: any) {
    console.error('GET Exams Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const { id, title, description, durationMinutes, folderId, isPublished, negativeMarking, createdBy } = data;
    
    if (!title) {
      return NextResponse.json({ error: 'Exam title is required' }, { status: 400 });
    }

    // Get folder name if folderId exists
    let folderName = null;
    if (folderId) {
      const folderRes = await query('SELECT name FROM folders WHERE id = $1', [folderId]);
      if (folderRes.rowCount > 0) {
        folderName = folderRes.rows[0].name;
      }
    }

    const res = await query(`
      INSERT INTO exams (id, title, description, duration_minutes, folder_id, is_published, negative_marking, created_by)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *, duration_minutes as "durationMinutes", folder_id as "folderId", is_published as "isPublished", negative_marking as "negativeMarking", created_by as "createdBy", created_at as "createdAt", updated_at as "updatedAt"
    `, [
      id,
      title,
      description || '',
      durationMinutes || 60,
      folderId || null,
      isPublished ?? false,
      negativeMarking || 0,
      createdBy || 'admin-1'
    ]);

    const exam = res.rows[0];
    return NextResponse.json({
      ...exam,
      folderName,
      questionCount: 0,
      attemptCount: 0
    });
  } catch (error: any) {
    console.error('POST Exam Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const data = await req.json();
    const { id, ...updates } = data;
    if (!id) {
      return NextResponse.json({ error: 'Exam ID is required' }, { status: 400 });
    }

    // Prepare dynamic update query
    const setFields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    // Map JS properties to database columns
    const mappings: Record<string, string> = {
      title: 'title',
      description: 'description',
      durationMinutes: 'duration_minutes',
      folderId: 'folder_id',
      isPublished: 'is_published',
      negativeMarking: 'negative_marking',
      createdBy: 'created_by',
    };

    Object.keys(updates).forEach((key) => {
      const dbCol = mappings[key];
      if (dbCol !== undefined) {
        setFields.push(`${dbCol} = $${paramIndex}`);
        values.push(updates[key]);
        paramIndex++;
      }
    });

    if (setFields.length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    // Add updated_at
    setFields.push(`updated_at = NOW()`);

    values.push(id);
    const idParamIndex = paramIndex;

    const queryText = `
      UPDATE exams 
      SET ${setFields.join(', ')} 
      WHERE id = $${idParamIndex} 
      RETURNING *, duration_minutes as "durationMinutes", folder_id as "folderId", is_published as "isPublished", negative_marking as "negativeMarking", created_by as "createdBy", created_at as "createdAt", updated_at as "updatedAt"
    `;

    const res = await query(queryText, values);

    if (res.rowCount === 0) {
      return NextResponse.json({ error: 'Exam not found' }, { status: 404 });
    }

    const exam = res.rows[0];

    // Fetch folder name
    let folderName = null;
    if (exam.folderId) {
      const folderRes = await query('SELECT name FROM folders WHERE id = $1', [exam.folderId]);
      if (folderRes.rowCount > 0) {
        folderName = folderRes.rows[0].name;
      }
    }

    // Get question and attempt counts
    const qCountRes = await query('SELECT COUNT(*)::integer as count FROM questions WHERE exam_id = $1', [id]);
    const aCountRes = await query('SELECT COUNT(*)::integer as count FROM attempts WHERE exam_id = $1', [id]);

    return NextResponse.json({
      ...exam,
      folderName,
      questionCount: qCountRes.rows[0].count,
      attemptCount: aCountRes.rows[0].count
    });
  } catch (error: any) {
    console.error('PUT Exam Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Exam ID is required' }, { status: 400 });
    }

    await query('DELETE FROM exams WHERE id = $1', [id]);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('DELETE Exam Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
