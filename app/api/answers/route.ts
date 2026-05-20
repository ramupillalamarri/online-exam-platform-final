import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const { id, attemptId, questionId, selectedOptionId } = await req.json();
    if (!attemptId || !questionId || !selectedOptionId) {
      return NextResponse.json({ error: 'Missing required answer fields' }, { status: 400 });
    }

    const res = await query(`
      INSERT INTO answers (id, attempt_id, question_id, selected_option_id)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (attempt_id, question_id) 
      DO UPDATE SET selected_option_id = EXCLUDED.selected_option_id, updated_at = NOW()
      RETURNING 
        id, 
        attempt_id as "attemptId", 
        question_id as "questionId", 
        selected_option_id as "selectedOptionId", 
        is_correct as "isCorrect", 
        updated_at as "updatedAt"
    `, [id || Math.random().toString(36).substring(2, 15), attemptId, questionId, selectedOptionId]);

    return NextResponse.json(res.rows[0]);
  } catch (error: any) {
    console.error('POST Answer Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
