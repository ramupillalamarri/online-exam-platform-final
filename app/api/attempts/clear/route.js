import { NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function DELETE() {
  try {
    // Delete AI Feedback first (references attempts)
    await query('DELETE FROM ai_feedback')
    
    // Delete Answers (references attempts)
    await query('DELETE FROM answers')
    
    // Delete Attempts (references exams and users)
    await query('DELETE FROM attempts')
    
    return NextResponse.json({ 
      success: true, 
      message: 'All attempt history, rankings, and AI feedback cleared. Database reset to initial state with only users, exams, questions, and folders.'
    })
  } catch (error) {
    console.error('Clear Attempts Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
