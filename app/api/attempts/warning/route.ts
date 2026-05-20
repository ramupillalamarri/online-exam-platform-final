import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const { attemptId } = await req.json();
    if (!attemptId) {
      return NextResponse.json({ error: 'Attempt ID is required' }, { status: 400 });
    }

    const res = await query(`
      UPDATE attempts 
      SET warnings = warnings + 1 
      WHERE id = $1 
      RETURNING 
        id, 
        exam_id as "examId", 
        user_id as "userId", 
        status, 
        started_at as "startedAt", 
        score::numeric::double precision as "score", 
        total_marks as "totalMarks", 
        rank, 
        warnings
    `, [attemptId]);

    if (res.rowCount === 0) {
      return NextResponse.json({ error: 'Attempt not found' }, { status: 404 });
    }

    return NextResponse.json(res.rows[0]);
  } catch (error: any) {
    console.error('Warning Route Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
