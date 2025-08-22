'use client';

import { useState } from 'react';
import {
  Box,
  Button,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Avatar,
  Fab,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Visibility,
  PersonAdd,
  School,
  Phone,
  Email,
  LocationOn,
} from '@mui/icons-material';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';

const studentSchema = z.object({
  firstName: z.string().min(2, 'Ad en az 2 karakter olmalıdır'),
  lastName: z.string().min(2, 'Soyad en az 2 karakter olmalıdır'),
  tcNo: z.string().length(11, 'TC Kimlik No 11 haneli olmalıdır'),
  birthDate: z.string().min(1, 'Doğum tarihi gereklidir'),
  gender: z.enum(['Erkek', 'Kız'], { required_error: 'Cinsiyet seçimi gereklidir' }),
  class: z.string().min(1, 'Sınıf seçimi gereklidir'),
  parentName: z.string().min(2, 'Veli adı en az 2 karakter olmalıdır'),
  parentPhone: z.string().min(10, 'Geçerli telefon numarası giriniz'),
  parentEmail: z.string().email('Geçerli email adresi giriniz'),
  address: z.string().min(10, 'Adres en az 10 karakter olmalıdır'),
  emergencyContact: z.string().min(10, 'Acil durum telefonu gereklidir'),
});

type StudentFormData = z.infer<typeof studentSchema>;

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  tcNo: string;
  class: string;
  status: 'active' | 'inactive' | 'graduated';
  parentName: string;
  parentPhone: string;
  enrollmentDate: string;
}

const mockStudents: Student[] = [
  {
    id: '1',
    firstName: 'Ahmet',
    lastName: 'Yılmaz',
    tcNo: '12345678901',
    class: '9-A',
    status: 'active',
    parentName: 'Mehmet Yılmaz',
    parentPhone: '0532 123 45 67',
    enrollmentDate: '2024-09-01',
  },
  {
    id: '2',
    firstName: 'Ayşe',
    lastName: 'Kaya',
    tcNo: '12345678902',
    class: '10-B',
    status: 'active',
    parentName: 'Fatma Kaya',
    parentPhone: '0533 123 45 68',
    enrollmentDate: '2023-09-01',
  },
  {
    id: '3',
    firstName: 'Ali',
    lastName: 'Demir',
    tcNo: '12345678903',
    class: '11-A',
    status: 'inactive',
    parentName: 'Hasan Demir',
    parentPhone: '0534 123 45 69',
    enrollmentDate: '2022-09-01',
  },
];

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>(mockStudents);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [viewingStudent, setViewingStudent] = useState<Student | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingStudent, setDeletingStudent] = useState<Student | null>(null);

  const { control, handleSubmit, reset, formState: { errors } } = useForm<StudentFormData>({
    resolver: zodResolver(studentSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      tcNo: '',
      birthDate: '',
      gender: 'Erkek',
      class: '',
      parentName: '',
      parentPhone: '',
      parentEmail: '',
      address: '',
      emergencyContact: '',
    },
  });

  const handleAddStudent = () => {
    reset();
    setEditingStudent(null);
    setDialogOpen(true);
  };

  const handleEditStudent = (student: Student) => {
    setEditingStudent(student);
    // Reset form with student data
    reset({
      firstName: student.firstName,
      lastName: student.lastName,
      tcNo: student.tcNo,
      // Add other fields as needed
    });
    setDialogOpen(true);
  };

  const handleViewStudent = (student: Student) => {
    setViewingStudent(student);
    setViewDialogOpen(true);
  };

  const handleDeleteStudent = (student: Student) => {
    setDeletingStudent(student);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (deletingStudent) {
      const updatedStudents = students.filter(s => s.id !== deletingStudent.id);
      setStudents(updatedStudents);
      toast.success('Öğrenci kaydı silindi!');
      setDeleteDialogOpen(false);
      setDeletingStudent(null);
    }
  };

  const onSubmit = async (data: StudentFormData) => {
    try {
      if (editingStudent) {
        // Update existing student
        const updatedStudents = students.map(s => 
          s.id === editingStudent.id 
            ? { ...s, ...data, class: data.class }
            : s
        );
        setStudents(updatedStudents);
        toast.success('Öğrenci bilgileri güncellendi!');
      } else {
        // Add new student
        const newStudent: Student = {
          id: Date.now().toString(),
          firstName: data.firstName,
          lastName: data.lastName,
          tcNo: data.tcNo,
          class: data.class,
          status: 'active',
          parentName: data.parentName,
          parentPhone: data.parentPhone,
          enrollmentDate: new Date().toISOString().split('T')[0],
        };
        setStudents([...students, newStudent]);
        toast.success('Yeni öğrenci kaydedildi!');
      }
      setDialogOpen(false);
      reset();
    } catch (error) {
      toast.error('Öğrenci kaydı sırasında hata oluştu');
    }
  };

  const getStatusChip = (status: Student['status']) => {
    const statusConfig = {
      active: { label: 'Aktif', color: 'success' as const },
      inactive: { label: 'Pasif', color: 'warning' as const },
      graduated: { label: 'Mezun', color: 'info' as const },
    };
    
    const config = statusConfig[status];
    return <Chip label={config.label} color={config.color} size="small" />;
  };

  return (
    <DashboardLayout>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Öğrenci Yönetimi
        </Typography>
        <Button
          variant="contained"
          startIcon={<PersonAdd />}
          onClick={handleAddStudent}
          sx={{ mb: 2 }}
        >
          Yeni Öğrenci Ekle
        </Button>
      </Box>

      {/* Student Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 3, textAlign: 'center', bgcolor: 'primary.light', color: 'white' }}>
            <School sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="h4">{students.filter(s => s.status === 'active').length}</Typography>
            <Typography variant="body2">Aktif Öğrenci</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 3, textAlign: 'center', bgcolor: 'success.light', color: 'white' }}>
            <PersonAdd sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="h4">{students.length}</Typography>
            <Typography variant="body2">Toplam Kayıt</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 3, textAlign: 'center', bgcolor: 'warning.light', color: 'white' }}>
            <Typography variant="h4">{students.filter(s => s.status === 'inactive').length}</Typography>
            <Typography variant="body2">Pasif Öğrenci</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 3, textAlign: 'center', bgcolor: 'info.light', color: 'white' }}>
            <Typography variant="h4">{students.filter(s => s.status === 'graduated').length}</Typography>
            <Typography variant="body2">Mezun</Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Students Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Öğrenci</TableCell>
              <TableCell>TC Kimlik No</TableCell>
              <TableCell>Sınıf</TableCell>
              <TableCell>Veli</TableCell>
              <TableCell>Telefon</TableCell>
              <TableCell>Durum</TableCell>
              <TableCell>Kayıt Tarihi</TableCell>
              <TableCell>İşlemler</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {students.map((student) => (
              <TableRow key={student.id} hover>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                      {student.firstName[0]}{student.lastName[0]}
                    </Avatar>
                    <Box>
                      <Typography variant="body2" fontWeight="medium">
                        {student.firstName} {student.lastName}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>{student.tcNo}</TableCell>
                <TableCell>
                  <Chip label={student.class} variant="outlined" size="small" />
                </TableCell>
                <TableCell>{student.parentName}</TableCell>
                <TableCell>{student.parentPhone}</TableCell>
                <TableCell>{getStatusChip(student.status)}</TableCell>
                <TableCell>{new Date(student.enrollmentDate).toLocaleDateString('tr-TR')}</TableCell>
                <TableCell>
                  <IconButton size="small" onClick={() => handleEditStudent(student)}>
                    <Edit fontSize="small" />
                  </IconButton>
                  <IconButton size="small" color="primary" onClick={() => handleViewStudent(student)}>
                    <Visibility fontSize="small" />
                  </IconButton>
                  <IconButton size="small" color="error" onClick={() => handleDeleteStudent(student)}>
                    <Delete fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add/Edit Student Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingStudent ? 'Öğrenci Bilgilerini Düzenle' : 'Yeni Öğrenci Kaydı'}
        </DialogTitle>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogContent>
            <Grid container spacing={3}>
              {/* Personal Information */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Kişisel Bilgiler
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Controller
                  name="firstName"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Ad"
                      error={!!errors.firstName}
                      helperText={errors.firstName?.message}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Controller
                  name="lastName"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Soyad"
                      error={!!errors.lastName}
                      helperText={errors.lastName?.message}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Controller
                  name="tcNo"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="TC Kimlik No"
                      error={!!errors.tcNo}
                      helperText={errors.tcNo?.message}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Controller
                  name="birthDate"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Doğum Tarihi"
                      type="date"
                      InputLabelProps={{ shrink: true }}
                      error={!!errors.birthDate}
                      helperText={errors.birthDate?.message}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Controller
                  name="gender"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth error={!!errors.gender}>
                      <InputLabel>Cinsiyet</InputLabel>
                      <Select {...field} label="Cinsiyet">
                        <MenuItem value="Erkek">Erkek</MenuItem>
                        <MenuItem value="Kız">Kız</MenuItem>
                      </Select>
                    </FormControl>
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Controller
                  name="class"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth error={!!errors.class}>
                      <InputLabel>Sınıf</InputLabel>
                      <Select {...field} label="Sınıf">
                        <MenuItem value="9-A">9-A</MenuItem>
                        <MenuItem value="9-B">9-B</MenuItem>
                        <MenuItem value="10-A">10-A</MenuItem>
                        <MenuItem value="10-B">10-B</MenuItem>
                        <MenuItem value="11-A">11-A</MenuItem>
                        <MenuItem value="11-B">11-B</MenuItem>
                        <MenuItem value="12-A">12-A</MenuItem>
                        <MenuItem value="12-B">12-B</MenuItem>
                      </Select>
                    </FormControl>
                  )}
                />
              </Grid>

              {/* Parent Information */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                  Veli Bilgileri
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Controller
                  name="parentName"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Veli Adı Soyadı"
                      error={!!errors.parentName}
                      helperText={errors.parentName?.message}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Controller
                  name="parentPhone"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Veli Telefon"
                      error={!!errors.parentPhone}
                      helperText={errors.parentPhone?.message}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Controller
                  name="parentEmail"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Veli Email"
                      type="email"
                      error={!!errors.parentEmail}
                      helperText={errors.parentEmail?.message}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Controller
                  name="emergencyContact"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Acil Durum Telefonu"
                      error={!!errors.emergencyContact}
                      helperText={errors.emergencyContact?.message}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12}>
                <Controller
                  name="address"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Adres"
                      multiline
                      rows={3}
                      error={!!errors.address}
                      helperText={errors.address?.message}
                    />
                  )}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)}>
              İptal
            </Button>
            <Button type="submit" variant="contained">
              {editingStudent ? 'Güncelle' : 'Kaydet'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* View Student Dialog */}
      <Dialog open={viewDialogOpen} onClose={() => setViewDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Öğrenci Detayları</DialogTitle>
        <DialogContent>
          {viewingStudent && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">Ad Soyad</Typography>
                <Typography variant="body1">{viewingStudent.firstName} {viewingStudent.lastName}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">TC Kimlik No</Typography>
                <Typography variant="body1">{viewingStudent.tcNo}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">Sınıf</Typography>
                <Typography variant="body1">{viewingStudent.class}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">Durum</Typography>
                {getStatusChip(viewingStudent.status)}
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">Veli Adı</Typography>
                <Typography variant="body1">{viewingStudent.parentName}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">Veli Telefon</Typography>
                <Typography variant="body1">{viewingStudent.parentPhone}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary">Kayıt Tarihi</Typography>
                <Typography variant="body1">
                  {new Date(viewingStudent.enrollmentDate).toLocaleDateString('tr-TR')}
                </Typography>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)}>Kapat</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Öğrenci Kaydını Sil</DialogTitle>
        <DialogContent>
          <Typography>
            {deletingStudent && (
              <>
                <strong>{deletingStudent.firstName} {deletingStudent.lastName}</strong> adlı öğrencinin kaydını silmek istediğinizden emin misiniz?
                Bu işlem geri alınamaz.
              </>
            )}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>İptal</Button>
          <Button variant="contained" color="error" onClick={confirmDelete}>
            Sil
          </Button>
        </DialogActions>
      </Dialog>
    </DashboardLayout>
  );
}