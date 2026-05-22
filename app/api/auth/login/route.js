import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST( req) {
  try {
    const { email, role, fullName, avatarUrl } = await req.json();
    if (!email || !role) {
      return NextResponse.json({ error: 'Email and role are required' }, { status: 400 });
    }

    // Determine a student/admin ID
    const userId = role === 'admin' ? 'admin-1' : `student-${email.split('@')[0]}`;
    const name = fullName || email.split('@')[0];

    const res = await query(`
      INSERT INTO users (id, email, full_name, avatar_url, role)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (email) 
      DO UPDATE SET full_name = EXCLUDED.full_name, avatar_url = EXCLUDED.avatar_url, role = EXCLUDED.role
      RETURNING id, email, full_name as "fullName", avatar_url as "avatarUrl", role, created_at as "createdAt"
    `, [userId, email, name, avatarUrl || '', role]);

    return NextResponse.json(res.rows[0]);
  } catch (error) {
    console.error('Auth Login Route Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
