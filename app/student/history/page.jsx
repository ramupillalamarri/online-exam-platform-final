"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { useExamStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  History,
  CheckCircle2,
  XCircle,
  Clock,
  Trophy,
  AlertTriangle,
  Eye,
  Filter,
  TrendingUp,
  Target,
} from "lucide-react"
import { format } from "date-fns"

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
}

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1 },
}

export default function StudentHistoryPage() {
  const router = useRouter()
  const { user, attempts, exams } = useExamStore()
  const [statusFilter, setStatusFilter] = useState("all")

  const userAttempts = attempts
    .filter((a) => a.userId === user?.id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  const filteredAttempts = userAttempts.filter((attempt) => {
    if (statusFilter === "all") return true
    if (statusFilter === "completed") return attempt.status === "graded"
    if (statusFilter === "in_progress") return attempt.status === "in_progress"
    return true
  })

  const completedCount = userAttempts.filter((a) => a.status === "graded").length
  const inProgressCount = userAttempts.filter((a) => a.status === "in_progress").length
  
  const completedAttempts = userAttempts.filter((a) => a.status === "graded")
  const averageScore = completedAttempts.length > 0
    ? completedAttempts.reduce((sum, a) => sum + ((a.score || 0) / (a.totalMarks || 1)) * 100, 0) / completedAttempts.length
    : 0

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6 min-h-screen">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-2 mb-1">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">My Attempts</h1>
          <History className="h-5 w-5 text-primary" />
        </div>
        <p className="text-muted-foreground">
          View your exam history and results
        </p>
      </motion.div>

      {/* Summary Cards */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        {[
          {
            title: "Total Attempts",
            value: userAttempts.length,
            icon: History,
            color: "text-primary",
            bgColor: "bg-primary/10",
            borderColor: "border-primary/20",
          },
          {
            title: "Completed",
            value: completedCount,
            icon: CheckCircle2,
            color: "text-success",
            bgColor: "bg-success/10",
            borderColor: "border-success/20",
          },
          {
            title: "In Progress",
            value: inProgressCount,
            icon: Clock,
            color: "text-warning",
            bgColor: "bg-warning/10",
            borderColor: "border-warning/20",
          },
          {
            title: "Avg. Score",
            value: `${averageScore.toFixed(0)}%`,
            icon: Target,
            color: "text-accent",
            bgColor: "bg-accent/10",
            borderColor: "border-accent/20",
          },
        ].map((stat, index) => (
          <motion.div
            key={stat.title}
            variants={scaleIn}
            whileHover={{ y: -4, scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Card className={`border-2 ${stat.borderColor} bg-card/80 backdrop-blur-sm hover:shadow-lg transition-shadow`}>
              <CardContent className="p-5">
                <div className="flex items-center gap-4">
                  <motion.div
                    whileHover={{ rotate: 5, scale: 1.1 }}
                    className={`h-12 w-12 rounded-xl ${stat.bgColor} flex items-center justify-center`}
                  >
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </motion.div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">
                      {stat.value}
                    </p>
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Filter */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="flex justify-end"
      >
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px] bg-background/50 border-border/50">
            <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
          </SelectContent>
        </Select>
      </motion.div>

      {/* Attempts Table */}
      {filteredAttempts.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <motion.div
                animate={{ y: [0, -10, 0], rotate: [0, 5, -5, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="h-20 w-20 rounded-2xl bg-muted flex items-center justify-center mb-6"
              >
                <History className="h-10 w-10 text-muted-foreground" />
              </motion.div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                No attempts yet
              </h3>
              <p className="text-muted-foreground text-center max-w-sm mb-6">
                Start taking exams to see your history here.
              </p>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button onClick={() => router.push("/student/exams")} className="shadow-lg shadow-primary/20">Browse Exams</Button>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
            <CardHeader className="pb-0">
              <CardTitle className="text-lg flex items-center gap-2">
                Attempt History
                <TrendingUp className="h-4 w-4 text-primary" />
              </CardTitle>
              <CardDescription>
                {filteredAttempts.length} attempt{filteredAttempts.length > 1 ? "s" : ""} found
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent border-border/50">
                      <TableHead>Exam</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-center">Score</TableHead>
                      <TableHead className="text-center">Rank</TableHead>
                      <TableHead className="text-center">Warnings</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAttempts.map((attempt, index) => {
                      const exam = exams.find((e) => e.id === attempt.examId)
                      const percentage =
                        attempt.status === "graded"
                          ? ((attempt.score || 0) / (attempt.totalMarks || 1)) * 100
                          : null
                      const isPassing = percentage !== null && percentage >= 60

                      return (
                        <motion.tr
                          key={attempt.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="border-border/50 hover:bg-primary/5 transition-colors"
                        >
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                <History className="h-4 w-4 text-primary" />
                              </div>
                              <div>
                                <div className="font-medium text-foreground">
                                  {attempt.examTitle || exam?.title || "Unknown Exam"}
                                </div>
                                {exam?.folderName && (
                                  <div className="text-xs text-muted-foreground">
                                    {exam.folderName}
                                  </div>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            <div>{format(new Date(attempt.startedAt), "MMM d, yyyy")}</div>
                            <div className="text-xs">
                              {format(new Date(attempt.startedAt), "h:mm a")}
                            </div>
                          </TableCell>
                          <TableCell>
                            {attempt.status === "graded" ? (
                              <Badge
                                variant="outline"
                                className={
                                  isPassing
                                    ? "bg-success/10 text-success border-success/20"
                                    : "bg-destructive/10 text-destructive border-destructive/20"
                                }
                              >
                                {isPassing ? (
                                  <CheckCircle2 className="h-3 w-3 mr-1" />
                                ) : (
                                  <XCircle className="h-3 w-3 mr-1" />
                                )}
                                {isPassing ? "Passed" : "Failed"}
                              </Badge>
                            ) : (
                              <Badge
                                variant="outline"
                                className="bg-warning/10 text-warning border-warning/20 animate-pulse"
                              >
                                <Clock className="h-3 w-3 mr-1" />
                                In Progress
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-center">
                            {attempt.status === "graded" ? (
                              <div>
                                <span className={`font-semibold ${isPassing ? "text-success" : "text-destructive"}`}>
                                  {attempt.score}/{attempt.totalMarks}
                                </span>
                                <div className="text-xs text-muted-foreground">
                                  {percentage?.toFixed(0)}%
                                </div>
                              </div>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell className="text-center">
                            {attempt.status === "graded" && attempt.rank ? (
                              <div className="flex items-center justify-center gap-1">
                                <Trophy className="h-4 w-4 text-warning" />
                                <span className="font-semibold">#{attempt.rank}</span>
                              </div>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell className="text-center">
                            {attempt.warnings > 0 ? (
                              <div className="flex items-center justify-center gap-1 text-warning">
                                <AlertTriangle className="h-4 w-4" />
                                <span className="font-medium">{attempt.warnings}</span>
                              </div>
                            ) : (
                              <span className="text-success">0</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            {attempt.status === "graded" ? (
                              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                <Button onClick={() => router.push(`/exam/${attempt.examId}/result?attempt=${attempt.id}`)} variant="ghost" size="sm" className="text-primary hover:bg-primary/10">
                                  <Eye className="h-4 w-4 mr-1" />
                                  View
                                </Button>
                              </motion.div>
                            ) : (
                              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                <Button onClick={() => router.push(`/exam/${attempt.examId}`)} variant="ghost" size="sm" className="text-warning hover:bg-warning/10">
                                  Resume
                                </Button>
                              </motion.div>
                            )}
                          </TableCell>
                        </motion.tr>
                      )
                      }) }
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  )
}



