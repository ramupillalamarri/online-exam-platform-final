"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useExamStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
  FileText,
  Plus,
  Search,
  MoreVertical,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  Clock,
  HelpCircle,
  Users,
} from "lucide-react"
import { toast } from "sonner"

export default function ExamsPage() {
  const router = useRouter()
  const { exams, folders, publishExam, deleteExam } = useExamStore()
  const [searchQuery, setSearchQuery] = useState("")
  const [folderFilter, setFolderFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [deleteTarget, setDeleteTarget] = useState(null)

  const filteredExams = exams.filter((exam) => {
    const matchesSearch = exam.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
    const matchesFolder =
      folderFilter === "all" || exam.folderId === folderFilter
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "published" && exam.isPublished) ||
      (statusFilter === "draft" && !exam.isPublished)
    return matchesSearch && matchesFolder && matchesStatus
  })

  const handleTogglePublish = ( exam) => {
    publishExam(exam.id, !exam.isPublished)
    toast.success(
      exam.isPublished
        ? "Exam unpublished successfully"
        : "Exam published successfully"
    )
  }

  const handleDeleteExam = () => {
    if (!deleteTarget) return
    deleteExam(deleteTarget.id)
    setDeleteTarget(null)
    toast.success("Exam deleted successfully")
  }

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Exams</h1>
          <p className="text-muted-foreground">
            Create and manage your examinations
          </p>
        </div>
        <Button onClick={() => router.push("/admin/exams/new")}>
          <Plus className="mr-2 h-4 w-4" />
          New Exam
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search exams..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={folderFilter} onValueChange={setFolderFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="All Folders" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Folders</SelectItem>
            {folders.map((folder) => (
              <SelectItem key={folder.id} value={folder.id}>
                {folder.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[150px]">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Exams List */}
      {filteredExams.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">
              {exams.length === 0 ? "No exams yet" : "No exams found"}
            </h3>
            <p className="text-muted-foreground text-center max-w-sm mb-4">
              {exams.length === 0
                ? "Create your first exam to start testing your students."
                : "Try adjusting your search or filters."}
            </p>
            {exams.length === 0 && (
              <Button onClick={() => router.push("/admin/exams/new")}>
                <Plus className="mr-2 h-4 w-4" />
                Create First Exam
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredExams.map((exam) => (
            <Card key={exam.id} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 gap-4">
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <FileText className="h-6 w-6 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-foreground truncate">
                          {exam.title}
                        </h3>
                        <Badge
                          variant={exam.isPublished ? "default" : "secondary"}
                          className={
                            exam.isPublished
                              ? "bg-success/10 text-success border-success/20"
                              : ""
                          }
                        >
                          {exam.isPublished ? "Published" : "Draft"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-1 mt-0.5">
                        {exam.description || "No description"}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        {exam.folderName && (
                          <span className="flex items-center gap-1">
                            <FileText className="h-3.5 w-3.5" />
                            {exam.folderName}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {exam.durationMinutes} min
                        </span>
                        <span className="flex items-center gap-1">
                          <HelpCircle className="h-3.5 w-3.5" />
                          {exam.questionCount || 0} questions
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-3.5 w-3.5" />
                          {exam.attemptCount || 0} attempts
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 sm:ml-4">
                    <Button onClick={() => router.push(`/admin/exams/${exam.id}/questions`)} variant="outline" size="sm">
                      Manage Questions
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => router.push(`/admin/exams/${exam.id}`)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit Details
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleTogglePublish(exam)}
                        >
                          {exam.isPublished ? (
                            <>
                              <EyeOff className="mr-2 h-4 w-4" />
                              Unpublish
                            </>
                          ) : (
                            <>
                              <Eye className="mr-2 h-4 w-4" />
                              Publish
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => setDeleteTarget(exam)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={() => setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Exam</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{deleteTarget?.title}&quot;? This
              action cannot be undone. All questions associated with this exam
              will also be deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteExam}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}


