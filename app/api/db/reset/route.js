import { NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function DELETE() {
  try {
    // Delete in order to respect foreign key constraints
    // 1. Delete AI Feedback (references attempts)
    await query('DELETE FROM ai_feedback')
    
    // 2. Delete Answers (references attempts)
    await query('DELETE FROM answers')
    
    // 3. Delete Attempts (references exams and users)
    await query('DELETE FROM attempts')
    
    // Database now contains ONLY:
    // - users (students and teachers)
    // - exams (available exams)
    // - questions (exam questions)
    // - folders (exam folders)
    
    return NextResponse.json({ 
      success: true, 
      message: 'Database completely reset!\n\nPreserved: Students, Teachers, Exams, Questions, Folders\nCleared: All attempt history, rankings, answers, and AI feedback'
    })
  } catch (error) {
    console.error('Database Reset Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
