import { useState, useEffect } from 'react'
import { Button } from '../ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Input } from '../ui/input'
import { Badge } from '../ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table'
import { formatDate, getStatusVariant } from '@/lib/utils'

interface Student {
  id: string
  firstName: string
  lastName: string
  identityNumber: string
  birthDate: string
  grade: string
  classroom?: string
  parentName: string
  parentPhone: string
  status: 'active' | 'inactive' | 'graduated' | 'transferred'
  enrollmentDate: string
  notes?: string
}

interface StudentManagementProps {
  students?: Student[]
  loading?: boolean
  onStudentSelect?: (student: Student) => void
  onAddStudent?: () => void
  onEditStudent?: (studentId: string) => void
}

const mockStudents: Student[] = [
  {
    id: '1',
    firstName: 'Ahmet',
    lastName: 'Yılmaz',
    identityNumber: '12345678901',
    birthDate: '2010-05-15',
    grade: '9A',
    classroom: 'A101',
    parentName: 'Mehmet Yılmaz',
    parentPhone: '0555 123 45 67',
    status: 'active',
    enrollmentDate: '2024-09-01'
  },
  {
    id: '2',
    firstName: 'Ayşe',
    lastName: 'Demir',
    identityNumber: '98765432109',
    birthDate: '2009-03-22',
    grade: '10B',
    classroom: 'B203',
    parentName: 'Fatma Demir',
    parentPhone: '0533 987 65 43',
    status: 'active',
    enrollmentDate: '2023-09-01'
  },
  {
    id: '3',
    firstName: 'Can',
    lastName: 'Özkan',
    identityNumber: '11223344556',
    birthDate: '2008-12-10',
    grade: '11C',
    classroom: 'C301',
    parentName: 'Ali Özkan',
    parentPhone: '0544 555 66 77',
    status: 'active',
    enrollmentDate: '2022-09-01'
  }
]

export function StudentManagement({ 
  students = mockStudents, 
  loading = false,
  onStudentSelect,
  onAddStudent,
  onEditStudent 
}: StudentManagementProps) {
  const [filteredStudents, setFilteredStudents] = useState<Student[]>(students)
  const [searchTerm, setSearchTerm] = useState('')
  const [gradeFilter, setGradeFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    let filtered = students

    // Arama filtresi
    if (searchTerm) {
      filtered = filtered.filter(student =>
        student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.identityNumber.includes(searchTerm) ||
        student.parentName.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Sınıf filtresi
    if (gradeFilter !== 'all') {
      filtered = filtered.filter(student => student.grade.startsWith(gradeFilter))
    }

    // Durum filtresi
    if (statusFilter !== 'all') {
      filtered = filtered.filter(student => student.status === statusFilter)
    }

    setFilteredStudents(filtered)
  }, [students, searchTerm, gradeFilter, statusFilter])

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      active: 'Aktif',
      inactive: 'Pasif',
      graduated: 'Mezun',
      transferred: 'Nakil'
    }
    return labels[status] || status
  }

  const getGradeOptions = () => {
    const grades = Array.from(new Set(students.map(s => s.grade.charAt(0)))).sort()
    return grades.map(grade => ({ value: grade, label: `${grade}. Sınıf` }))
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
              <CardTitle>Öğrenci Yönetimi</CardTitle>
              <CardDescription>
                Toplam {students.length} öğrenci kayıtlı
              </CardDescription>
            </div>
            <Button onClick={onAddStudent}>Yeni Öğrenci</Button>
          </div>
        </CardHeader>
      </Card>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <Input
              placeholder="Ad, soyad, TC No veya veli adı ile ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="md:max-w-sm"
            />
            
            <select
              value={gradeFilter}
              onChange={(e) => setGradeFilter(e.target.value)}
              className="px-3 py-2 border border-input bg-background rounded-md text-sm"
            >
              <option value="all">Tüm Sınıflar</option>
              {getGradeOptions().map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-input bg-background rounded-md text-sm"
            >
              <option value="all">Tüm Durumlar</option>
              <option value="active">Aktif</option>
              <option value="inactive">Pasif</option>
              <option value="graduated">Mezun</option>
              <option value="transferred">Nakil</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Students Table */}
      <Card>
        <CardContent className="pt-6">
          {filteredStudents.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">
                {searchTerm || gradeFilter !== 'all' || statusFilter !== 'all'
                  ? 'Bu filtre ile öğrenci bulunamadı'
                  : 'Henüz öğrenci kaydı yok'
                }
              </p>
              <Button variant="outline" onClick={onAddStudent}>
                İlk Öğrenciyi Ekle
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ad Soyad</TableHead>
                  <TableHead>TC Kimlik No</TableHead>
                  <TableHead>Sınıf</TableHead>
                  <TableHead>Veli</TableHead>
                  <TableHead>Telefon</TableHead>
                  <TableHead>Durum</TableHead>
                  <TableHead>Kayıt Tarihi</TableHead>
                  <TableHead>İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.map((student) => (
                  <TableRow 
                    key={student.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => onStudentSelect?.(student)}
                  >
                    <TableCell className="font-medium">
                      {student.firstName} {student.lastName}
                      {student.classroom && (
                        <div className="text-xs text-muted-foreground">
                          {student.classroom}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {student.identityNumber}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{student.grade}</Badge>
                    </TableCell>
                    <TableCell>{student.parentName}</TableCell>
                    <TableCell>{student.parentPhone}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(student.status)}>
                        {getStatusLabel(student.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(student.enrollmentDate)}</TableCell>
                    <TableCell>
                      <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onEditStudent?.(student.id)}
                        >
                          Düzenle
                        </Button>
                        <Button variant="outline" size="sm">
                          Detay
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
            <CardDescription>Toplam Öğrenci</CardDescription>
            <CardTitle className="text-2xl">{students.length}</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Aktif Öğrenci</CardDescription>
            <CardTitle className="text-2xl text-green-600">
              {students.filter(s => s.status === 'active').length}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Bu Yıl Kayıt</CardDescription>
            <CardTitle className="text-2xl text-blue-600">
              {students.filter(s => new Date(s.enrollmentDate).getFullYear() === new Date().getFullYear()).length}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Sınıf Sayısı</CardDescription>
            <CardTitle className="text-2xl text-purple-600">
              {Array.from(new Set(students.map(s => s.grade))).length}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>
    </div>
  )
}