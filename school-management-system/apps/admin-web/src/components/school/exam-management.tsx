import { useState, useEffect } from 'react'
import { Button } from '../ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Input } from '../ui/input'
import { Badge } from '../ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table'
import { formatDate, formatCurrency, getStatusVariant } from '@/lib/utils'

interface Exam {
  id: string
  name: string
  type: 'entrance' | 'placement' | 'scholarship'
  date: string
  time: string
  venue: string
  capacity: number
  applications: number
  fee: number
  status: 'draft' | 'published' | 'ongoing' | 'completed' | 'cancelled'
  registrationDeadline: string
  description?: string
}

interface ExamApplication {
  id: string
  examId: string
  studentName: string
  parentName: string
  parentPhone: string
  applicationDate: string
  status: 'pending' | 'approved' | 'rejected' | 'paid'
  score?: number
  notes?: string
}

interface ExamManagementProps {
  exams?: Exam[]
  applications?: ExamApplication[]
  loading?: boolean
  onExamSelect?: (exam: Exam) => void
  onCreateExam?: () => void
  onViewApplications?: (examId: string) => void
}

const mockExams: Exam[] = [
  {
    id: '1',
    name: '2024-2025 Giriş Sınavı',
    type: 'entrance',
    date: '2024-06-15',
    time: '10:00',
    venue: 'Ana Kampüs - A Blok',
    capacity: 200,
    applications: 156,
    fee: 150,
    status: 'published',
    registrationDeadline: '2024-06-01',
    description: '9. sınıf giriş sınavı'
  },
  {
    id: '2',
    name: 'Burs Sınavı - Güz Dönemi',
    type: 'scholarship',
    date: '2024-05-20',
    time: '14:00',
    venue: 'Ana Kampüs - B Blok',
    capacity: 100,
    applications: 87,
    fee: 0,
    status: 'completed',
    registrationDeadline: '2024-05-10',
    description: 'Başarı bursu belirleme sınavı'
  }
]

export function ExamManagement({ 
  exams = mockExams,
  loading = false,
  onExamSelect,
  onCreateExam,
  onViewApplications
}: ExamManagementProps) {
  const [filteredExams, setFilteredExams] = useState<Exam[]>(exams)
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    let filtered = exams

    if (searchTerm) {
      filtered = filtered.filter(exam =>
        exam.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exam.venue.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(exam => exam.type === typeFilter)
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(exam => exam.status === statusFilter)
    }

    setFilteredExams(filtered)
  }, [exams, searchTerm, typeFilter, statusFilter])

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      entrance: 'Giriş',
      placement: 'Seviye Tespit',
      scholarship: 'Burs'
    }
    return labels[type] || type
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      draft: 'Taslak',
      published: 'Yayınlandı',
      ongoing: 'Devam Ediyor',
      completed: 'Tamamlandı',
      cancelled: 'İptal'
    }
    return labels[status] || status
  }

  const getStatusVariantForExam = (status: string) => {
    const variants: Record<string, any> = {
      draft: 'secondary',
      published: 'success',
      ongoing: 'warning',
      completed: 'default',
      cancelled: 'destructive'
    }
    return variants[status] || 'default'
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Sınav Yönetimi</CardTitle>
              <CardDescription>
                Sınavları yönet, başvuruları takip et
              </CardDescription>
            </div>
            <Button onClick={onCreateExam}>Yeni Sınav</Button>
          </div>
        </CardHeader>
      </Card>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <Input
              placeholder="Sınav adı veya mekan ile ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="md:max-w-sm"
            />
            
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 border border-input bg-background rounded-md text-sm"
            >
              <option value="all">Tüm Türler</option>
              <option value="entrance">Giriş Sınavı</option>
              <option value="placement">Seviye Tespit</option>
              <option value="scholarship">Burs Sınavı</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-input bg-background rounded-md text-sm"
            >
              <option value="all">Tüm Durumlar</option>
              <option value="draft">Taslak</option>
              <option value="published">Yayınlandı</option>
              <option value="ongoing">Devam Ediyor</option>
              <option value="completed">Tamamlandı</option>
              <option value="cancelled">İptal</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Exams Table */}
      <Card>
        <CardContent className="pt-6">
          {filteredExams.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">
                {searchTerm || typeFilter !== 'all' || statusFilter !== 'all'
                  ? 'Bu filtre ile sınav bulunamadı'
                  : 'Henüz sınav oluşturulmadı'
                }
              </p>
              <Button variant="outline" onClick={onCreateExam}>
                İlk Sınavı Oluştur
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Sınav Adı</TableHead>
                  <TableHead>Tür</TableHead>
                  <TableHead>Tarih & Saat</TableHead>
                  <TableHead>Mekan</TableHead>
                  <TableHead>Başvuru</TableHead>
                  <TableHead>Ücret</TableHead>
                  <TableHead>Durum</TableHead>
                  <TableHead>İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredExams.map((exam) => (
                  <TableRow 
                    key={exam.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => onExamSelect?.(exam)}
                  >
                    <TableCell className="font-medium">
                      {exam.name}
                      {exam.description && (
                        <div className="text-xs text-muted-foreground">
                          {exam.description}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {getTypeLabel(exam.type)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{formatDate(exam.date)}</div>
                        <div className="text-sm text-muted-foreground">{exam.time}</div>
                      </div>
                    </TableCell>
                    <TableCell>{exam.venue}</TableCell>
                    <TableCell>
                      <div className="text-center">
                        <div className="font-medium">{exam.applications}/{exam.capacity}</div>
                        <div className="text-xs text-muted-foreground">
                          {Math.round((exam.applications / exam.capacity) * 100)}% dolu
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {exam.fee > 0 ? formatCurrency(exam.fee) : 'Ücretsiz'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariantForExam(exam.status)}>
                        {getStatusLabel(exam.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onViewApplications?.(exam.id)}
                        >
                          Başvurular ({exam.applications})
                        </Button>
                        <Button variant="outline" size="sm">
                          Düzenle
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Toplam Sınav</CardDescription>
            <CardTitle className="text-2xl">{exams.length}</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Aktif Sınavlar</CardDescription>
            <CardTitle className="text-2xl text-green-600">
              {exams.filter(e => e.status === 'published' || e.status === 'ongoing').length}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Toplam Başvuru</CardDescription>
            <CardTitle className="text-2xl text-blue-600">
              {exams.reduce((sum, exam) => sum + exam.applications, 0)}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Ortalama Doluluk</CardDescription>
            <CardTitle className="text-2xl text-purple-600">
              {exams.length > 0 
                ? Math.round(exams.reduce((sum, exam) => sum + (exam.applications / exam.capacity), 0) / exams.length * 100)
                : 0
              }%
            </CardTitle>
          </CardHeader>
        </Card>
      </div>
    </div>
  )
}