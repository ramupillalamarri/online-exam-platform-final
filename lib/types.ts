export type UserRole = 'admin' | 'student'

export interface User {
  id: string
  email: string
  fullName: string
  avatarUrl?: string
  role: UserRole
  createdAt: Date
}

export interface Folder {
  id: string
  name: string
  createdBy: string
  createdAt: Date
  examCount?: number
}

export interface Exam {
  id: string
  title: string
  description?: string
  durationMinutes: number
  folderId?: string
  folderName?: string
  isPublished: boolean
  negativeMarking: number
  createdBy: string
  createdAt: Date
  updatedAt: Date
  questionCount?: number
  attemptCount?: number
}

export interface QuestionOption {
  id: string
  text: string
}

export interface Question {
  id: string
  examId: string
  questionText: string
  options: QuestionOption[]
  correctOptionId: string
  subject?: string
  topic?: string
  marks: number
  orderIndex: number
  createdAt: Date
}

export type AttemptStatus = 'in_progress' | 'submitted' | 'graded'

export interface Attempt {
  id: string
  examId: string
  examTitle?: string
  userId: string
  status: AttemptStatus
  startedAt: Date
  submittedAt?: Date
  timeRemainingSeconds?: number
  score?: number
  totalMarks?: number
  rank?: number
  warnings: number
  createdAt: Date
}

export interface Answer {
  id: string
  attemptId: string
  questionId: string
  selectedOptionId?: string
  isCorrect?: boolean
  updatedAt: Date
}

export interface MistakeAnalysis {
  questionId: string
  explanation: string
}

export interface WeakTopic {
  topic: string
  subject: string
  questionCount: number
  recommendation?: string
}

export interface AIFeedback {
  id: string
  attemptId: string
  mistakeAnalysis: MistakeAnalysis[]
  weakTopics: WeakTopic[]
  createdAt: Date
}

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface AIChatHistory {
  id: string
  userId: string
  questionId: string
  messages: ChatMessage[]
  createdAt: Date
  updatedAt: Date
}

export interface ExamWithQuestions extends Exam {
  questions: Question[]
}

export interface AttemptWithDetails extends Attempt {
  exam?: Exam
  answers: Answer[]
  aiFeedback?: AIFeedback
}

export interface AnalyticsData {
  totalStudents: number
  totalExams: number
  totalAttempts: number
  averageScore: number
  recentAttempts: {
    date: string
    count: number
  }[]
  topExams: {
    title: string
    attempts: number
  }[]
  scoreDistribution: {
    range: string
    count: number
  }[]
}
