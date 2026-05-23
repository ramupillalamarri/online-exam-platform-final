import { query } from '@/lib/db'

export async function DELETE(request) {
  try {
    // Delete all exams (questions will be cascade deleted if FK constraint is set)
    await query('DELETE FROM questions')
    await query('DELETE FROM exams')

    return Response.json({
      success: true,
      message: 'All exams and their questions have been deleted successfully.',
    })
  } catch (error) {
    console.error('Clear exams error:', error)
    return Response.json(
      { error: error.message || 'Failed to clear exams.' },
      { status: 500 }
    )
  }
}
