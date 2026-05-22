"use client"

import { useState, useMemo } from "react"
import { motion } from "framer-motion"
import { useExamStore } from "@/lib/store"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Users,
  Search,
  TrendingUp,
  Brain,
  AlertCircle,
  FileText,
  Clock,
  ChevronRight,
  Filter
} from "lucide-react"

export default function StudentsPage() {
  const { exams, attempts, aiFeedback } = useExamStore()
  const [searchQuery, setSearchQuery] = useState("")

  // Calculate student aggregations
  const studentStats = useMemo(() => {
    const statsMap = {}

    attempts.filter(a => a.status === "graded").forEach(attempt => {
      // Mock student email since we don't have a strict global users list, we derive from attempts.
      // In a real app we'd fetch users list. Here we'll just mock it based on attempt.userId
      const sId = attempt.userId
      const email = sId === "demo-student-123" ? "demo.student@exampro.com" : `student_${sId.substring(0,4)}@school.edu`
      
      if (!statsMap[sId]) {
        statsMap[sId] = { email, attemptsCount: 0, totalScore: 0, totalMax: 0, lastActive: attempt.submittedAt || "" }
      }

      statsMap[sId].attemptsCount++
      statsMap[sId].totalScore += (attempt.score || 0)
      statsMap[sId].totalMax += (attempt.totalMarks || 1)
      
      if (attempt.submittedAt && new Date(attempt.submittedAt) > new Date(statsMap[sId].lastActive)) {
        statsMap[sId].lastActive = attempt.submittedAt
      }
    })

    return Object.entries(statsMap).map(([id, data]) => ({
      id,
      email: data.email,
      attempts: data.attemptsCount,
      avgScore: ((data.totalScore / data.totalMax) * 100),
      lastActive: new Date(data.lastActive).toLocaleDateString()
    }))
  }, [attempts])

  const filteredStudents = studentStats.filter(s => s.email.toLowerCase().includes(searchQuery.toLowerCase()))

  // Compute Class AI Insights
  const classInsights = useMemo(() => {
    const weakTopics = {}
    aiFeedback.forEach(fb => {
      if (Array.isArray(fb.weakTopics)) {
        fb.weakTopics.forEach((wt) => {
          weakTopics[wt.topic] = (weakTopics[wt.topic] || 0) + (wt.questionCount || 1)
        })
      }
    })
    return Object.entries(weakTopics)
      .map(([topic, count]) => ({ topic, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3)
  }, [aiFeedback])

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6 min-h-screen">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-2">
            <Users className="h-7 w-7 text-primary" />
            Students & Performance
          </h1>
          <p className="text-muted-foreground mt-1">
            Monitor class performance and AI-driven insights
          </p>
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column: Stats & Insights */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="border-border/50 bg-card/80 backdrop-blur-xl">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-accent" />
                Class Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50 border border-border">
                <span className="text-sm font-medium text-muted-foreground">Total Students</span>
                <span className="font-bold text-foreground text-lg">{studentStats.length}</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-primary/5 border border-primary/10">
                <span className="text-sm font-medium text-muted-foreground">Total Submissions</span>
                <span className="font-bold text-primary text-lg">{attempts.filter(a => a.status === 'graded').length}</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-success/5 border border-success/10">
                <span className="text-sm font-medium text-muted-foreground">Class Average</span>
                <span className="font-bold text-success text-lg">
                  {studentStats.length > 0 
                    ? (studentStats.reduce((sum, s) => sum + s.avgScore, 0) / studentStats.length).toFixed(1) 
                    : 0}%
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/80 backdrop-blur-xl">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <Brain className="h-5 w-5 text-warning" />
                AI Class Insights
              </CardTitle>
              <CardDescription>Common weak areas across all students</CardDescription>
            </CardHeader>
            <CardContent>
              {classInsights.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No AI data available yet.</p>
              ) : (
                <div className="space-y-3">
                  {classInsights.map((insight, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-3 rounded-xl bg-warning/5 border border-warning/10">
                      <AlertCircle className="h-4 w-4 text-warning mt-0.5 shrink-0" />
                      <div>
                        <p className="text-sm font-semibold text-foreground">{insight.topic}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {insight.count} incorrect attempts tracked class-wide. Consider reviewing this topic.
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Student Table */}
        <div className="lg:col-span-2">
          <Card className="border-border/50 bg-card/80 backdrop-blur-xl h-full">
            <CardHeader className="pb-4 border-b border-border/50">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <CardTitle className="text-lg">Student Roster</CardTitle>
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 h-9"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {filteredStudents.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <Users className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
                  <p className="text-foreground font-medium">No students found</p>
                  <p className="text-sm text-muted-foreground mt-1">Try adjusting your search query.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent">
                        <TableHead>Student Email</TableHead>
                        <TableHead className="text-center">Attempts</TableHead>
                        <TableHead className="text-center">Average Score</TableHead>
                        <TableHead className="text-right">Last Active</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredStudents.map((student) => (
                        <TableRow key={student.id} className="group hover:bg-muted/30">
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs uppercase">
                                {student.email.charAt(0)}
                              </div>
                              {student.email}
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant="secondary" className="bg-muted">
                              <FileText className="h-3 w-3 mr-1" />
                              {student.attempts}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <span className={`font-bold ${student.avgScore >= 70 ? 'text-success' : student.avgScore >= 50 ? 'text-warning' : 'text-destructive'}`}>
                              {student.avgScore.toFixed(1)}%
                            </span>
                          </TableCell>
                          <TableCell className="text-right text-sm text-muted-foreground">
                            {student.lastActive}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
