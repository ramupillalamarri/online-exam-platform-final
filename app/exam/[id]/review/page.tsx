"use client"

import { useEffect, useState, use } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { useExamStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  GraduationCap,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  MessageCircle,
  Sparkles,
  Send,
  ChevronLeft,
  ChevronRight,
  Minus,
  Brain
} from "lucide-react"
import { Input } from "@/components/ui/input"
import type { Question, ChatMessage } from "@/lib/types"
import { toast } from "sonner"

export default function ReviewPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const searchParams = useSearchParams()
  const router = useRouter()
  const attemptId = searchParams.get("attempt")

  const {
    isAuthenticated,
    exams,
    attempts,
    getExamQuestions,
    getAttemptAnswers,
    aiFeedback,
  } = useExamStore()

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [chatInput, setChatInput] = useState("")
  const [isAiTyping, setIsAiTyping] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login")
    }
  }, [isAuthenticated, router])

  const exam = exams.find((e) => e.id === id)
  const attempt = attempts.find((a) => a.id === attemptId)
  const questions = getExamQuestions(id)
  const answers = attempt ? getAttemptAnswers(attempt.id) : []
  const feedback = aiFeedback.find((f) => f.attemptId === attemptId)

  const currentQuestion = questions[currentQuestionIndex]
  const currentAnswer = answers.find((a) => a.questionId === currentQuestion?.id)
  const mistakeAnalysis = feedback?.mistakeAnalysis.find(
    (m) => m.questionId === currentQuestion?.id
  )

  const handleSendMessage = async () => {
    if (!chatInput.trim() || !currentQuestion) return

    const userMessage: ChatMessage = { role: "user", content: chatInput }
    const updatedMessages = [...chatMessages, userMessage]
    
    setChatMessages(updatedMessages)
    setChatInput("")
    setIsAiTyping(true)

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionText: currentQuestion.questionText,
          options: currentQuestion.options,
          correctOptionId: currentQuestion.correctOptionId,
          topic: currentQuestion.topic,
          userDoubt: chatInput,
          chatHistory: chatMessages // send previous history so AI remembers context
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to get AI response")
      }

      setChatMessages([...updatedMessages, {
        role: "assistant",
        content: data.explanation
      }])
    } catch (error: any) {
      console.error("AI Chat Error:", error)
      toast.error("Failed to connect to AI Tutor. Please try again.")
      // Remove the user's message if it failed or keep it so they can read it, typically keeping it is fine but let's add a generic fail message
      setChatMessages([...updatedMessages, {
        role: "assistant",
        content: "Sorry, I am having trouble connecting right now. Please try asking again later."
      }])
    } finally {
      setIsAiTyping(false)
    }
  }

  // Reset chat when changing questions
  useEffect(() => {
    setChatMessages([])
  }, [currentQuestionIndex])

  if (!exam || !attempt || !currentQuestion) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-border/50 shadow-2xl relative overflow-hidden bg-card/90 backdrop-blur-xl">
           <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-primary via-accent to-primary" />
          <CardContent className="pt-8 text-center space-y-4">
            <div className="mx-auto h-12 w-12 rounded-xl bg-muted flex items-center justify-center">
              <Brain className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-bold text-foreground">
              Review not available
            </h3>
            <p className="text-sm text-muted-foreground">
              The exam review you're looking for doesn't exist or is loading.
            </p>
            <Link href="/student" className="block mt-4">
              <Button className="w-full">Back to Dashboard</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  const isCorrect = currentAnswer?.isCorrect
  const wasAnswered = !!currentAnswer?.selectedOptionId

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/85 backdrop-blur border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 truncate">
            <Link href={`/exam/${id}/result?attempt=${attemptId}`}>
              <Button variant="ghost" size="icon" className="shrink-0 hover:bg-muted/50">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-2.5 truncate">
              <div className="hidden sm:flex h-9 w-9 rounded-lg bg-primary/10 items-center justify-center shrink-0">
                <GraduationCap className="h-5 w-5 text-primary" />
              </div>
              <div className="truncate">
                <h1 className="font-semibold text-foreground truncate max-w-[150px] sm:max-w-md">{exam.title}</h1>
                <p className="text-[10px] sm:text-xs text-muted-foreground font-medium">
                  Reviewing Q{currentQuestionIndex + 1} of {questions.length}
                </p>
              </div>
            </div>
          </div>

          {/* AI Tutor Button */}
          <Sheet>
            <SheetTrigger asChild>
              <Button className="shrink-0 shadow-lg shadow-primary/20 bg-gradient-to-r from-primary to-accent border-0">
                <MessageCircle className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">AI Tutor</span>
                <span className="sm:hidden">Tutor</span>
              </Button>
            </SheetTrigger>
            <SheetContent className="w-full sm:max-w-md border-l border-border/50 bg-card/95 backdrop-blur-xl p-0 flex flex-col">
              <SheetHeader className="p-4 border-b border-border/50 bg-muted/30">
                <SheetTitle className="flex items-center gap-2 text-primary">
                  <Sparkles className="h-5 w-5" />
                  ExamPro AI Tutor
                </SheetTitle>
                <SheetDescription>
                  Ask me to explain any doubts about Question {currentQuestionIndex + 1}.
                </SheetDescription>
              </SheetHeader>

              <div className="flex flex-col flex-1 overflow-hidden p-4">
                {/* Chat Messages */}
                <ScrollArea className="flex-1 pr-4 -mr-4">
                  <div className="space-y-4 pr-4">
                    {/* Initial AI message */}
                    <div className="flex gap-3">
                      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shrink-0 shadow-md">
                        <Sparkles className="h-4 w-4 text-white" />
                      </div>
                      <div className="bg-muted/80 border border-border/50 rounded-2xl rounded-tl-sm p-3.5 text-sm shadow-sm">
                        <p className="leading-relaxed">
                          Hi! I'm your AI tutor. I can see you are reviewing a question on <strong>{currentQuestion.topic || 'this topic'}</strong>.
                          What doubts do you have about this problem?
                        </p>
                      </div>
                    </div>

                    {chatMessages.map((message, index) => (
                      <div
                        key={index}
                        className={`flex gap-3 ${
                          message.role === "user" ? "flex-row-reverse" : ""
                        }`}
                      >
                        <div
                          className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 shadow-md ${
                            message.role === "user"
                              ? "bg-foreground text-background"
                              : "bg-gradient-to-br from-primary to-accent"
                          }`}
                        >
                          {message.role === "user" ? (
                            <span className="text-xs font-bold uppercase">You</span>
                          ) : (
                            <Sparkles className="h-4 w-4 text-white" />
                          )}
                        </div>
                        <div
                          className={`rounded-2xl p-3.5 text-sm max-w-[85%] shadow-sm ${
                            message.role === "user"
                              ? "bg-foreground text-background rounded-tr-sm"
                              : "bg-muted/80 border border-border/50 rounded-tl-sm"
                          }`}
                        >
                          {/* Rendering newlines correctly if AI returns multiline */}
                          <div className="whitespace-pre-wrap leading-relaxed">{message.content}</div>
                        </div>
                      </div>
                    ))}

                    {isAiTyping && (
                      <div className="flex gap-3">
                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shrink-0 shadow-md">
                          <Sparkles className="h-4 w-4 text-white" />
                        </div>
                        <div className="bg-muted/80 border border-border/50 rounded-2xl rounded-tl-sm p-3.5 shadow-sm">
                          <div className="flex gap-1.5 py-1">
                            <span className="h-2 w-2 bg-primary/60 rounded-full animate-bounce" />
                            <span className="h-2 w-2 bg-primary/60 rounded-full animate-bounce [animation-delay:0.15s]" />
                            <span className="h-2 w-2 bg-primary/60 rounded-full animate-bounce [animation-delay:0.3s]" />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </ScrollArea>

                {/* Chat Input */}
                <div className="mt-4 pt-4 border-t border-border/50 flex gap-2">
                  <Input
                    placeholder="Type your doubt here..."
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSendMessage()
                    }}
                    disabled={isAiTyping}
                    className="bg-muted/50 border-border focus-visible:ring-primary/50 rounded-full px-4"
                  />
                  <Button size="icon" onClick={handleSendMessage} disabled={isAiTyping} className="rounded-full shrink-0 shadow-md">
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-6">
        <div className="max-w-4xl mx-auto">
          <div className="grid lg:grid-cols-[1fr_260px] gap-6 items-start">
            {/* Question Review */}
            <div className="space-y-6">
              <Card
                className={`border-2 shadow-sm ${
                  isCorrect
                    ? "border-success/40 bg-success/5"
                    : wasAnswered
                    ? "border-destructive/40 bg-destructive/5"
                    : "border-border/50"
                }`}
              >
                <CardContent className="p-4 sm:p-6">
                  {/* Question Header */}
                  <div className="flex flex-wrap items-center gap-2 mb-4">
                    <Badge variant="outline" className="bg-background">Q{currentQuestionIndex + 1}</Badge>
                    <Badge variant="secondary" className="bg-background">{currentQuestion.marks} marks</Badge>
                    {currentQuestion.topic && (
                      <Badge variant="outline" className="text-xs bg-background">
                        {currentQuestion.topic}
                      </Badge>
                    )}
                    {isCorrect ? (
                      <Badge className="bg-success text-white border-success ml-auto shadow-sm">
                        <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                        Correct
                      </Badge>
                    ) : wasAnswered ? (
                      <Badge className="bg-destructive text-white border-destructive ml-auto shadow-sm">
                        <XCircle className="h-3.5 w-3.5 mr-1" />
                        Incorrect
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="ml-auto bg-muted">
                        <Minus className="h-3.5 w-3.5 mr-1" />
                        Skipped
                      </Badge>
                    )}
                  </div>

                  {/* Question Text */}
                  <p className="text-base sm:text-lg font-medium text-foreground mb-6">
                    {currentQuestion.questionText}
                  </p>

                  {/* Options */}
                  <div className="space-y-3">
                    {currentQuestion.options.map((option) => {
                      const isSelected = currentAnswer?.selectedOptionId === option.id
                      const isCorrectOption =
                        option.id === currentQuestion.correctOptionId

                      return (
                        <div
                          key={option.id}
                          className={`flex items-center gap-3 p-3.5 rounded-xl border transition-all ${
                            isCorrectOption
                              ? "border-success bg-success/10 shadow-sm"
                              : isSelected
                              ? "border-destructive bg-destructive/10 shadow-sm"
                              : "border-border/50 bg-background/50"
                          }`}
                        >
                          <span
                            className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold uppercase shrink-0 ${
                              isCorrectOption
                                ? "bg-success text-white shadow-md shadow-success/20"
                                : isSelected
                                ? "bg-destructive text-white shadow-md shadow-destructive/20"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {option.id}
                          </span>
                          <span className={`flex-1 text-sm sm:text-base leading-snug ${isCorrectOption ? 'font-medium text-foreground' : 'text-muted-foreground'}`}>
                            {option.text}
                          </span>
                          {isCorrectOption && (
                            <CheckCircle2 className="h-5 w-5 text-success shrink-0" />
                          )}
                          {isSelected && !isCorrectOption && (
                            <XCircle className="h-5 w-5 text-destructive shrink-0" />
                          )}
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Explanation */}
              {mistakeAnalysis && (
                <Card className="border-accent/20 bg-accent/5 shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2 text-accent">
                      <Sparkles className="h-4 w-4" />
                      AI Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                      {mistakeAnalysis.explanation}
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Navigation */}
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
                <span className="text-xs sm:text-sm font-medium text-muted-foreground">
                  {currentQuestionIndex + 1} / {questions.length}
                </span>
                <Button
                  variant="outline"
                  onClick={() => setCurrentQuestionIndex((prev) => prev + 1)}
                  disabled={currentQuestionIndex === questions.length - 1}
                  className="px-3 sm:px-4"
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>

            {/* Question Navigator */}
            <div className="lg:sticky lg:top-24 h-fit w-full">
              <Card className="border-border/50 shadow-sm">
                <CardContent className="p-4">
                  <h3 className="font-semibold text-sm text-foreground mb-4">Questions</h3>
                  <div className="grid grid-cols-5 gap-2 max-h-[220px] overflow-y-auto pr-1">
                    {questions.map((question, index) => {
                      const answer = answers.find(
                        (a) => a.questionId === question.id
                      )
                      const correct = answer?.isCorrect
                      const answered = !!answer?.selectedOptionId
                      const isCurrent = index === currentQuestionIndex

                      return (
                        <button
                          key={question.id}
                          onClick={() => setCurrentQuestionIndex(index)}
                          className={`h-9 w-9 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center ${
                            isCurrent
                              ? "ring-2 ring-primary ring-offset-1 ring-offset-background"
                              : ""
                          } ${
                            correct
                              ? "bg-success/15 text-success border border-success/30 hover:bg-success/25"
                              : answered
                              ? "bg-destructive/15 text-destructive border border-destructive/30 hover:bg-destructive/25"
                              : "bg-muted text-muted-foreground hover:bg-muted/80"
                          }`}
                        >
                          {index + 1}
                        </button>
                      )
                    })}
                  </div>

                  <div className="flex flex-wrap gap-2.5 mt-4 pt-4 border-t border-border/50 text-[11px] font-medium">
                    <div className="flex items-center gap-1.5">
                      <div className="h-2.5 w-2.5 rounded bg-success/20 border border-success/30" />
                      <span className="text-muted-foreground">Correct</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="h-2.5 w-2.5 rounded bg-destructive/20 border border-destructive/30" />
                      <span className="text-muted-foreground">Incorrect</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="h-2.5 w-2.5 rounded bg-muted border border-border" />
                      <span className="text-muted-foreground">Skipped</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="mt-4">
                <Link href={`/exam/${id}/result?attempt=${attemptId}`}>
                  <Button variant="outline" className="w-full border-dashed hover:border-primary/50 text-xs h-9">
                    <ArrowLeft className="h-3.5 w-3.5 mr-1.5" />
                    Back to Results Summary
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
