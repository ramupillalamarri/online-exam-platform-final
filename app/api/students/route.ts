import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    // 1. Get all students with their total attempts and average score
    const studentsRes = await query(`
      SELECT 
        u.id, 
        u.email, 
        u.full_name as "fullName", 
        u.avatar_url as "avatarUrl", 
        u.created_at as "createdAt",
        COALESCE(att.attempt_count, 0)::integer as "attemptCount",
        COALESCE(att.avg_score, 0)::numeric::double precision as "avgScore"
      FROM users u
      LEFT JOIN (
        SELECT 
          user_id, 
          COUNT(*) as attempt_count,
          AVG(COALESCE(score, 0) * 100 / CASE WHEN total_marks = 0 THEN 1 ELSE total_marks END) as avg_score
        FROM attempts 
        WHERE status = 'graded'
        GROUP BY user_id
      ) att ON u.id = att.user_id
      WHERE u.role = 'student'
      ORDER BY u.created_at DESC
    `);

    // 2. Get all attempts with student emails and exam titles for teacher overview
    const attemptsRes = await query(`
      SELECT 
        a.id, 
        a.exam_id as "examId", 
        a.user_id as "userId", 
        a.status, 
        a.started_at as "startedAt", 
        a.submitted_at as "submittedAt", 
        a.score::numeric::double precision as "score", 
        a.total_marks as "totalMarks", 
        a.rank, 
        a.warnings, 
        e.title as "examTitle",
        u.email as "studentEmail",
        u.full_name as "studentName"
      FROM attempts a
      JOIN exams e ON a.exam_id = e.id
      JOIN users u ON a.user_id = u.id
      ORDER BY a.started_at DESC
    `);

    // 3. Get AI insights (aggregate of weak topics across the class)
    const weakTopicsRes = await query(`
      SELECT weak_topics FROM ai_feedback
    `);
    
    const topicsMap: Record<string, { subject: string; count: number; recommendation: string }> = {};
    weakTopicsRes.rows.forEach((row) => {
      const topics = row.weak_topics;
      if (Array.isArray(topics)) {
        topics.forEach((t: any) => {
          if (!topicsMap[t.topic]) {
            topicsMap[t.topic] = {
              subject: t.subject,
              count: 0,
              recommendation: t.recommendation || ''
            };
          }
          topicsMap[t.topic].count += t.questionCount || 1;
        });
      }
    });

    const aiInsights = Object.entries(topicsMap).map(([topic, data]) => ({
      topic,
      subject: data.subject,
      mistakesCount: data.count,
      recommendation: `Multiple students have questions wrong on this topic. Consider organizing a remedial session on ${topic} (${data.subject}).`
    })).sort((a, b) => b.mistakesCount - a.mistakesCount);

    return NextResponse.json({
      students: studentsRes.rows,
      attempts: attemptsRes.rows,
      aiInsights
    });
  } catch (error: any) {
    console.error('GET Students Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
