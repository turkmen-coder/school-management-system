'use client';

import { Grid, Paper, Typography, Box, Card, CardContent } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  Area,
  AreaChart,
} from 'recharts';
import { dashboardApi } from '@/services/api';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { StatsCard } from '@/components/dashboard/stats-card';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ErrorAlert } from '@/components/ui/error-alert';
import {
  People,
  School,
  MonetizationOn,
  Assessment,
  TrendingUp,
  Warning,
} from '@mui/icons-material';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function DashboardPage() {
  const { data: dashboardData, isLoading, error } = useQuery({
    queryKey: ['dashboard'],
    queryFn: dashboardApi.getDashboard,
  });

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorAlert error={error} />;

  const crm = dashboardData?.crm || { totalProspects: 0, convertedProspects: 0, conversionRate: 0 };
  const exams = dashboardData?.exams || { totalExams: 0, averageScore: 0, completionRate: 0 };
  const billing = dashboardData?.billing || { totalStudents: 0, activeContracts: 0, monthlyRevenue: 0, overdueAmount: 0 };
  const payments = dashboardData?.payments || { monthlyRevenue: 0, totalCollected: 0, pendingAmount: 0 };

  // Mock chart data - replace with real data
  const prospectStages = [
    { name: 'Yeni Başvurular', value: crm.totalProspects || 0 },
    { name: 'Değerlendiriliyor', value: Math.round((crm.totalProspects || 0) * 0.4) },
    { name: 'İlgileniyor', value: Math.round((crm.totalProspects || 0) * 0.3) },
    { name: 'Kayıt Oldu', value: crm.convertedProspects || 0 },
  ];

  const monthlyPayments = [
    { month: 'Oca', amount: 45000, count: 120 },
    { month: 'Şub', amount: 52000, count: 135 },
    { month: 'Mar', amount: 48000, count: 128 },
    { month: 'Nis', amount: 61000, count: 142 },
    { month: 'May', amount: 55000, count: 138 },
    { month: 'Haz', amount: 58000, count: 145 },
  ];

  const examResults = [
    { name: 'Mükemmel (85+)', value: 25, color: '#4caf50' },
    { name: 'İyi (70-84)', value: 45, color: '#2196f3' },
    { name: 'Orta (50-69)', value: 25, color: '#ff9800' },
    { name: 'Zayıf (<50)', value: 5, color: '#f44336' },
  ];

  return (
    <DashboardLayout>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>

      {/* Key Metrics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Toplam Öğrenci"
            value={billing.totalStudents || 0}
            icon={<People />}
            color="primary"
            trend={{
              value: 12,
              isPositive: true,
              period: 'Bu ay',
            }}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Aktif Sözleşme"
            value={billing.activeContracts || 0}
            icon={<School />}
            color="success"
            trend={{
              value: 8,
              isPositive: true,
              period: 'Bu ay',
            }}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Bu Ay Tahsilat"
            value={payments.monthlyRevenue || 0}
            format="currency"
            icon={<MonetizationOn />}
            color="info"
            trend={{
              value: 15,
              isPositive: true,
              period: 'Geçen aya göre',
            }}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Vadesi Geçen"
            value={billing.overdueAmount || 0}
            format="currency"
            icon={<Warning />}
            color="error"
            trend={{
              value: 5,
              isPositive: false,
              period: 'Bu hafta',
            }}
          />
        </Grid>
      </Grid>

      {/* Charts Row 1 */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* CRM Pipeline */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" gutterBottom>
              Aday Öğrenci Süreci
            </Typography>
            <ResponsiveContainer width="100%" height="90%">
              <PieChart>
                <Pie
                  data={prospectStages}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: %${(percent * 100).toFixed(0)}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {prospectStages.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Monthly Revenue */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" gutterBottom>
              Aylık Tahsilat Trendi
            </Typography>
            <ResponsiveContainer width="100%" height="90%">
              <AreaChart data={monthlyPayments}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => [
                    name === 'amount' ? `₺${value.toLocaleString()}` : value,
                    name === 'amount' ? 'Tutar' : 'Adet'
                  ]}
                />
                <Area type="monotone" dataKey="amount" stackId="1" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
              </AreaChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* Charts Row 2 */}
      <Grid container spacing={3}>
        {/* Exam Results */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: 350 }}>
            <Typography variant="h6" gutterBottom>
              Sınav Sonuçları Dağılımı
            </Typography>
            <ResponsiveContainer width="100%" height="90%">
              <BarChart data={examResults} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={100} />
                <Tooltip />
                <Bar dataKey="value" fill="#8884d8">
                  {examResults.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Recent Activity */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: 350 }}>
            <Typography variant="h6" gutterBottom>
              Son Aktiviteler
            </Typography>
            <Box sx={{ maxHeight: 280, overflow: 'auto' }}>
              {[
                {
                  type: 'payment',
                  message: 'Ahmet Yılmaz - ₺2,500 ödeme alındı',
                  time: '5 dakika önce',
                  icon: <MonetizationOn color="success" />,
                },
                {
                  type: 'student',
                  message: 'Yeni öğrenci kaydı: Elif Demir',
                  time: '1 saat önce',
                  icon: <People color="primary" />,
                },
                {
                  type: 'exam',
                  message: 'Bursluluk sınavı sonuçları açıklandı',
                  time: '2 saat önce',
                  icon: <Assessment color="info" />,
                },
                {
                  type: 'overdue',
                  message: '3 taksit vadesi geçti - Toplam ₺7,500',
                  time: '3 saat önce',
                  icon: <Warning color="error" />,
                },
              ].map((activity, index) => (
                <Box
                  key={index}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    mb: 2,
                    p: 1,
                    borderLeft: '3px solid',
                    borderLeftColor: 'primary.main',
                    bgcolor: 'grey.50',
                    borderRadius: 1,
                  }}
                >
                  <Box sx={{ mr: 2 }}>{activity.icon}</Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" fontWeight="medium">
                      {activity.message}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {activity.time}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </DashboardLayout>
  );
}