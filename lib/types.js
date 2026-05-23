/**
 * @typedef {'admin' | 'student'} UserRole
 */

/**
 * @typedef {Object} User
 * @property {string} id
 * @property {string} email
 * @property {string} fullName
 * @property {string} [avatarUrl]
 * @property {UserRole} role
 * @property {Date} createdAt
 */

/**
 * @typedef {Object} Folder
 * @property {string} id
 * @property {string} name
 * @property {string} createdBy
 * @property {Date} createdAt
 * @property {number} [examCount]
 */

/**
 * @typedef {Object} Exam
 * @property {string} id
 * @property {string} title
 * @property {string} [description]
 * @property {number} durationMinutes
 * @property {string} [folderId]
 * @property {string} [folderName]
 * @property {boolean} isPublished
 * @property {number} negativeMarking
 * @property {string} createdBy
 * @property {Date} createdAt
 * @property {Date} updatedAt
 * @property {number} [questionCount]
 * @property {number} [attemptCount]
 */

/**
 * @typedef {Object} QuestionOption
 * @property {string} id
 * @property {string} text
 */

/**
 * @typedef {Object} Question
 * @property {string} id
 * @property {string} examId
 * @property {string} questionText
 * @property {QuestionOption[]} options
 * @property {string} correctOptionId
 * @property {string} [subject]
 * @property {string} [topic]
 * @property {number} marks
 * @property {number} orderIndex
 * @property {Date} createdAt
 */

/**
 * @typedef {'in_progress' | 'submitted' | 'graded'} AttemptStatus
 */

/**
 * @typedef {Object} Attempt
 * @property {string} id
 * @property {string} examId
 * @property {string} [examTitle]
 * @property {string} userId
 * @property {AttemptStatus} status
 * @property {Date} startedAt
 * @property {Date} [submittedAt]
 * @property {number} [timeRemainingSeconds]
 * @property {number} [score]
 * @property {number} [totalMarks]
 * @property {number} [rank]
 * @property {number} warnings
 * @property {Date} createdAt
 */

/**
 * @typedef {Object} Answer
 * @property {string} id
 * @property {string} attemptId
 * @property {string} questionId
 * @property {string} [selectedOptionId]
 * @property {boolean} [isCorrect]
 * @property {Date} updatedAt
 */

/**
 * @typedef {Object} MistakeAnalysis
 * @property {string} questionId
 * @property {string} explanation
 */

/**
 * @typedef {Object} WeakTopic
 * @property {string} topic
 * @property {string} subject
 * @property {number} questionCount
 * @property {string} [recommendation]
 */

/**
 * @typedef {Object} AIFeedback
 * @property {string} id
 * @property {string} attemptId
 * @property {MistakeAnalysis[]} mistakeAnalysis
 * @property {WeakTopic[]} weakTopics
 * @property {Date} createdAt
 */

// For runtime type checking if needed
export const TypeGuards = {
  isUserRole: (val) => val === 'admin' || val === 'student',
  isAttemptStatus: (val) => ['in_progress', 'submitted', 'graded'].includes(val),
}










