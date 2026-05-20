"use client"

import { useEffect, useState, useCallback, use } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useExamStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Progress } from "@/components/ui/progress"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  GraduationCap,
  Clock,
  ChevronLeft,
  ChevronRight,
  Flag,
  AlertTriangle,
  Save,
  Play,
  Info,
  BookOpen
} from "lucide-react"
import { toast } from "sonner"

export default function ExamPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const router = useRouter()
  const {
    user,
    isAuthenticated,
    exams,
    getExamQuestions,
    startAttempt,
    getCurrentAttempt,
    saveAnswer,
    getAttemptAnswers,
    submitAttempt,
    updateAttemptWarnings,
  } = useExamStore()

  const [isStarted, setIsStarted] = useState(false)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null)
  const [showSubmitDialog, setShowSubmitDialog] = useState(false)
  const [showWarningDialog, setShowWarningDialog] = useState(false)
  const [showTerminationDialog, setShowTerminationDialog] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const exam = exams.find((e) => e.id === id)
  const questions = getExamQuestions(id)
  const attempt = getCurrentAttempt(id)
  const answers = attempt ? getAttemptAnswers(attempt.id) : []

  // Check auth and exam publication status
  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login")
      return
    }

    if (!exam || !exam.isPublished) {
      router.push("/student")
      return
    }
  }, [exam, isAuthenticated, router])

  // Timer logic
  useEffect(() => {
    if (!isStarted || timeRemaining === null || timeRemaining <= 0) return

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev === null || prev <= 1) {
          handleSubmit()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [isStarted, timeRemaining])

  // Anti-cheat visibility change listener
  useEffect(() => {
    if (!isStarted || !attempt) return

    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Increment warning
        updateAttemptWarnings(attempt.id)
        
        // Use a slight timeout to let state flush or check warning count directly
        const nextWarnings = attempt.warnings + 1
        
        if (nextWarnings >= 4) {
          exitFullscreen()
          setIsSubmitting(true)
          toast.error("Exam terminated: Tab switched more than 3 times!")
          // Automatically submit exam
          submitAttempt(attempt.id).then(() => {
            setShowTerminationDialog(true)
          })
        } else {
          setShowWarningDialog(true)
        }
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange)
    }
  }, [isStarted, attempt, updateAttemptWarnings, submitAttempt])

  // Fullscreen Helpers
  const enterFullscreen = async () => {
    try {
      const element = document.documentElement
      if (element.requestFullscreen) {
        await element.requestFullscreen()
      } else if ((element as any).webkitRequestFullscreen) {
        await (element as any).webkitRequestFullscreen()
      } else if ((element as any).msRequestFullscreen) {
        await (element as any).msRequestFullscreen()
      }
    } catch (err) {
      console.warn("Fullscreen request rejected:", err)
    }
  }

  const exitFullscreen = async () => {
    try {
      if (document.fullscreenElement) {
        if (document.exitFullscreen) {
          await document.exitFullscreen()
        } else if ((document as any).webkitExitFullscreen) {
          await (document as any).webkitExitFullscreen()
        } else if ((document as any).msExitFullscreen) {
          await (document as any).msExitFullscreen()
        }
      }
    } catch (err) {
      console.warn("Failed to exit fullscreen:", err)
    }
  }

  const handleStartExam = async () => {
    await enterFullscreen()
    const currentAttempt = startAttempt(id)
    if (currentAttempt.timeRemainingSeconds) {
      setTimeRemaining(currentAttempt.timeRemainingSeconds)
    } else {
      setTimeRemaining(exam ? exam.durationMinutes * 60 : 3600)
    }
    setIsStarted(true)
    toast.success("Exam started! Fullscreen mode enabled.")
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const currentQuestion = questions[currentQuestionIndex]
  const currentAnswer = answers.find((a) => a.questionId === currentQuestion?.id)

  const handleSelectOption = useCallback(
    async (optionId: string) => {
      if (!attempt || !currentQuestion) return

      setIsSaving(true)
      // Save answer to store and PostgreSQL
      await saveAnswer(attempt.id, currentQuestion.id, optionId)
      setIsSaving(false)
    },
    [attempt, currentQuestion, saveAnswer]
  )

  const handleSubmit = async () => {
    if (!attempt) return

    setIsSubmitting(true)
    await exitFullscreen()
    await submitAttempt(attempt.id)
    toast.success("Exam submitted successfully!")
    router.push(`/exam/${id}/result?attempt=${attempt.id}`)
  }

  const getQuestionStatus = (questionId: string) => {
    const answer = answers.find((a) => a.questionId === questionId)
    return answer?.selectedOptionId ? "answered" : "unanswered"
  }

  const answeredCount = questions.filter(
    (q) => getQuestionStatus(q.id) === "answered"
  ).length

  if (!exam || !currentQuestion) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-muted-foreground">Loading exam...</p>
        </div>
      </div>
    )
  }

  // Pre-start dashboard overlay
  if (!isStarted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-border/50 shadow-2xl relative overflow-hidden bg-card/90 backdrop-blur-xl">
          <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-primary via-accent to-primary" />
          <CardHeader className="text-center pb-2">
            <div className="mx-auto h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-2">
              <GraduationCap className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-xl">{exam.title}</CardTitle>
            <CardDescription>{exam.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-4">
            <div className="p-4 rounded-lg bg-muted space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground flex items-center gap-1.5"><Clock className="h-4 w-4 text-primary" /> Duration:</span>
                <span className="font-semibold text-foreground">{exam.durationMinutes} Minutes</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground flex items-center gap-1.5"><BookOpen className="h-4 w-4 text-success" /> Questions:</span>
                <span className="font-semibold text-foreground">{questions.length} Items</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground flex items-center gap-1.5"><Info className="h-4 w-4 text-warning" /> Penalty:</span>
                <span className="font-semibold text-foreground">
                  {exam.negativeMarking ? `${exam.negativeMarking} Marks per wrong answer` : 'No negative marking'}
                </span>
              </div>
            </div>

            <div className="border-l-4 border-warning bg-warning/10 p-3.5 rounded text-xs space-y-1.5">
              <p className="font-semibold text-warning flex items-center gap-1.5">
                <AlertTriangle className="h-3.5 w-3.5" /> Important Anti-Cheat Policies:
              </p>
              <ul className="list-disc pl-4 text-muted-foreground space-y-1">
                <li>Starting the exam will toggle <strong>Fullscreen mode</strong>.</li>
                <li>Exiting fullscreen or switching windows is strictly monitored.</li>
                <li><strong>Maximum 3 warnings</strong> are allowed. On the 4th tab-switch, your exam is terminated and auto-submitted.</li>
              </ul>
            </div>

            <Button onClick={handleStartExam} className="w-full h-12 text-base font-semibold bg-gradient-to-r from-primary to-accent shadow-lg shadow-primary/20">
              <Play className="h-4 w-4 mr-2" /> Start Exam & Fullscreen
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const timePercentage = timeRemaining !== null 
    ? (timeRemaining / (exam.durationMinutes * 60)) * 100 
    : 100
  const isLowTime = timeRemaining !== null && timeRemaining < 300 // 5 minutes

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/85 backdrop-blur border-b border-border">
        <div className="container mx-auto px-4">
          <div className="h-16 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2.5 truncate">
              <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <GraduationCap className="h-5 w-5 text-primary" />
              </div>
              <div className="truncate">
                <h1 className="font-semibold text-foreground truncate max-w-[150px] sm:max-w-md">
                  {exam.title}
                </h1>
                <p className="text-[10px] sm:text-xs text-muted-foreground">
                  Question {currentQuestionIndex + 1} of {questions.length}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-4 shrink-0">
              {/* Timer */}
              <div
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium ${
                  isLowTime
                    ? "bg-destructive/10 text-destructive animate-pulse"
                    : "bg-muted text-foreground"
                }`}
              >
                <Clock className="h-3.5 w-3.5" />
                <span className="font-mono">
                  {timeRemaining !== null ? formatTime(timeRemaining) : "--:--"}
                </span>
              </div>

              {/* Warnings */}
              {attempt && attempt.warnings > 0 && (
                <Badge variant="outline" className="text-warning border-warning/20 bg-warning/5 text-xs">
                  <AlertTriangle className="h-3.5 w-3.5 mr-1" />
                  {attempt.warnings} {attempt.warnings === 1 ? 'warning' : 'warnings'}
                </Badge>
              )}

              {/* Save indicator */}
              {isSaving && (
                <div className="hidden sm:flex items-center gap-1 text-[11px] text-muted-foreground">
                  <Save className="h-3.5 w-3.5 animate-pulse" />
                  Saving...
                </div>
              )}
            </div>
          </div>

          {/* Progress bar */}
          <div className="pb-1">
            <Progress value={timePercentage} className="h-1" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-4 sm:py-6">
        <div className="max-w-4xl mx-auto">
          <div className="grid lg:grid-cols-[1fr_260px] gap-6 items-start">
            {/* Question Area */}
            <div className="space-y-6">
              <Card className="border-border/50 shadow-md">
                <CardContent className="p-4 sm:p-6">
                  {/* Question Header */}
                  <div className="flex flex-wrap items-center gap-2 mb-4">
                    <Badge variant="outline" className="bg-primary/5 border-primary/20 text-primary">Q{currentQuestionIndex + 1}</Badge>
                    <Badge variant="secondary">{currentQuestion.marks} marks</Badge>
                    {currentQuestion.topic && (
                      <Badge variant="outline" className="text-xs">
                        {currentQuestion.topic}
                      </Badge>
                    )}
                  </div>

                  {/* Question Text */}
                  <p className="text-base sm:text-lg font-medium text-foreground mb-6">
                    {currentQuestion.questionText}
                  </p>

                  {/* Options */}
                  <RadioGroup
                    value={currentAnswer?.selectedOptionId || ""}
                    onValueChange={handleSelectOption}
                    className="space-y-3"
                  >
                    {currentQuestion.options.map((option) => (
                      <label
                        key={option.id}
                        htmlFor={option.id}
                        className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                          currentAnswer?.selectedOptionId === option.id
                            ? "border-primary bg-primary/5 shadow-sm"
                            : "border-border hover:border-primary/40 hover:bg-muted/50"
                        }`}
                      >
                        <RadioGroupItem value={option.id} id={option.id} className="shrink-0" />
                        <span className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs font-semibold uppercase shrink-0">
                          {option.id}
                        </span>
                        <span className="flex-1 text-sm sm:text-base text-foreground leading-snug">
                          {option.text}
                        </span>
                      </label>
                    ))}
                  </RadioGroup>
                </CardContent>
              </Card>

              {/* Navigation Buttons */}
              <div className="flex items-center justify-between gap-4">
                <Button
                  variant="outline"
                  onClick={() => setCurrentQuestionIndex((prev) => prev - 1)}
                  disabled={currentQuestionIndex === 0}
                  className="px-3 sm:px-4"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>

                {currentQuestionIndex === questions.length - 1 ? (
                  <Button onClick={() => setShowSubmitDialog(true)} className="bg-gradient-to-r from-success to-emerald-600 text-white">
                    <Flag className="h-4 w-4 mr-2" />
                    Submit Exam
                  </Button>
                ) : (
                  <Button
                    onClick={() => setCurrentQuestionIndex((prev) => prev + 1)}
                    className="px-3 sm:px-4"
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                )}
              </div>
            </div>

            {/* Question Navigator */}
            <div className="lg:sticky lg:top-24 h-fit w-full">
              <Card className="border-border/50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-sm text-foreground">Questions</h3>
                    <span className="text-xs text-muted-foreground font-medium">
                      {answeredCount}/{questions.length} answered
                    </span>
                  </div>

                  <div className="grid grid-cols-5 gap-2 max-h-[220px] overflow-y-auto pr-1">
                    {questions.map((question, index) => {
                      const status = getQuestionStatus(question.id)
                      const isCurrent = index === currentQuestionIndex

                      return (
                        <button
                          key={question.id}
                          onClick={() => setCurrentQuestionIndex(index)}
                          className={`h-9 w-9 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center ${
                            isCurrent
                              ? "bg-primary text-primary-foreground shadow"
                              : status === "answered"
                              ? "bg-success/10 text-success border border-success/20"
                              : "bg-muted text-muted-foreground hover:bg-muted/80"
                          }`}
                        >
                          {index + 1}
                        </button>
                      )
                    })}
                  </div>

                  <div className="flex items-center gap-3 mt-4 pt-4 border-t border-border text-[11px]">
                    <div className="flex items-center gap-1.5">
                      <div className="h-3 w-3 rounded bg-success/10 border border-success/20" />
                      <span className="text-muted-foreground">Answered</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="h-3 w-3 rounded bg-muted" />
                      <span className="text-muted-foreground">Unanswered</span>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    className="w-full mt-4 border-dashed hover:bg-destructive/5 hover:text-destructive hover:border-destructive/30 text-xs h-9"
                    onClick={() => setShowSubmitDialog(true)}
                  >
                    <Flag className="h-3.5 w-3.5 mr-1.5" />
                    Submit Exam
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      {/* Submit Confirmation Dialog */}
      <AlertDialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Submit Exam?</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-4">
                <p>Are you sure you want to submit your exam?</p>
                <div className="p-4 rounded-lg bg-muted space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Answered</span>
                    <span className="font-semibold text-foreground">
                      {answeredCount} / {questions.length}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Unanswered</span>
                    <span className="font-semibold text-foreground">
                      {questions.length - answeredCount}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Time Remaining</span>
                    <span className="font-semibold text-foreground">
                      {timeRemaining !== null ? formatTime(timeRemaining) : "--:--"}
                    </span>
                  </div>
                </div>
                {questions.length - answeredCount > 0 && (
                  <div className="flex items-center gap-2 text-sm text-warning font-medium">
                    <AlertTriangle className="h-4 w-4" />
                    You have unanswered questions
                  </div>
                )}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Continue Exam</AlertDialogCancel>
            <AlertDialogAction onClick={handleSubmit} disabled={isSubmitting} className="bg-primary text-white">
              {isSubmitting ? "Submitting..." : "Submit Exam"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Warning Dialog */}
      <AlertDialog open={showWarningDialog} onOpenChange={setShowWarningDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-warning">
              <AlertTriangle className="h-5 w-5 animate-bounce" />
              Warning: Tab Switch Detected
            </AlertDialogTitle>
            <AlertDialogDescription>
              You switched away from the exam tab. This has been recorded as a
              warning. If you switch tabs more than 3 times, your exam will be terminated immediately.
              <div className="mt-4 p-3.5 rounded-lg bg-warning/10 text-warning font-semibold text-sm">
                Warnings given: {attempt?.warnings || 0} / 3
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => {
              setShowWarningDialog(false)
              enterFullscreen()
            }} className="bg-warning text-warning-foreground hover:bg-warning/90">
              Return to Exam (Enter Fullscreen)
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Terminated Dialog */}
      <AlertDialog open={showTerminationDialog} onOpenChange={setShowTerminationDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-6 w-6" />
              Exam Terminated
            </AlertDialogTitle>
            <AlertDialogDescription>
              Your exam has been automatically terminated and submitted because you exceeded the tab switching limit (maximum of 3 warnings allowed).
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => router.push(`/exam/${id}/result?attempt=${attempt.id}`)} className="bg-destructive text-white">
              View Results
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
