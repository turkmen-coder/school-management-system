import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { formatCurrency } from '@/lib/utils'

interface MetricCard {
  title: string
  value: string | number
  description: string
  trend?: {
    value: number
    label: string
    positive: boolean
  }
  icon?: string
}

interface ChartData {
  name: string
  value: number
  date?: string
}

interface MetricsDashboardProps {
  dateRange?: { from: Date; to: Date }
}

export function MetricsDashboard({ dateRange }: MetricsDashboardProps) {
  const [metrics, setMetrics] = useState<MetricCard[]>([])
  const [revenueData, setRevenueData] = useState<ChartData[]>([])
  const [enrollmentData, setEnrollmentData] = useState<ChartData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMetrics()
  }, [dateRange])

  const fetchMetrics = async () => {
    setLoading(true)
    
    // Mock data - Production'da API'den gelecek
    const mockMetrics: MetricCard[] = [
      {
        title: 'Günlük Tahsilat',
        value: formatCurrency(45000),
        description: 'Bugünkü toplam ödeme',
        trend: { value: 12, label: 'önceki güne göre', positive: true }
      },
      {
        title: 'Yeni Sözleşmeler',
        value: 23,
        description: 'Bu ay yeni kayıtlar',
        trend: { value: 8, label: 'geçen aya göre', positive: true }
      },
      {
        title: 'Bekleyen İmzalar',
        value: 12,
        description: 'İmza bekleyen sözleşme',
        trend: { value: 3, label: 'azalma', positive: true }
      },
      {
        title: 'Geciken Taksitler',
        value: 8,
        description: 'Vadesi geçen ödemeler',
        trend: { value: 15, label: 'artış', positive: false }
      },
      {
        title: 'Toplam Öğrenci',
        value: 1247,
        description: 'Aktif öğrenci sayısı',
        trend: { value: 5, label: 'büyüme', positive: true }
      },
      {
        title: 'Aylık Gelir',
        value: formatCurrency(890000),
        description: 'Bu ay toplam tahsilat',
        trend: { value: 18, label: 'artış', positive: true }
      }
    ]

    const mockRevenueData: ChartData[] = [
      { name: 'Ocak', value: 650000 },
      { name: 'Şubat', value: 720000 },
      { name: 'Mart', value: 580000 },
      { name: 'Nisan', value: 920000 },
      { name: 'Mayıs', value: 870000 },
      { name: 'Haziran', value: 890000 }
    ]

    const mockEnrollmentData: ChartData[] = [
      { name: 'Pazartesi', value: 5 },
      { name: 'Salı', value: 8 },
      { name: 'Çarşamba', value: 12 },
      { name: 'Perşembe', value: 7 },
      { name: 'Cuma', value: 15 },
      { name: 'Cumartesi', value: 20 },
      { name: 'Pazar', value: 3 }
    ]

    setTimeout(() => {
      setMetrics(mockMetrics)
      setRevenueData(mockRevenueData)
      setEnrollmentData(mockEnrollmentData)
      setLoading(false)
    }, 1000)
  }

  const getTrendColor = (positive: boolean) => positive ? 'text-green-600' : 'text-red-600'
  const getTrendIcon = (positive: boolean) => positive ? '↗️' : '↘️'

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-full"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {metrics.map((metric, index) => (
          <Card key={index}>
            <CardHeader className="pb-2">
              <CardDescription>{metric.title}</CardDescription>
              <CardTitle className="text-2xl">{metric.value}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground mb-1">
                {metric.description}
              </div>
              {metric.trend && (
                <div className="flex items-center text-sm">
                  <span className={getTrendColor(metric.trend.positive)}>
                    {getTrendIcon(metric.trend.positive)} %{metric.trend.value} {metric.trend.label}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Aylık Tahsilat</CardTitle>
            <CardDescription>Son 6 ayın tahsilat grafiği</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-end justify-between space-x-2">
              {revenueData.map((data, index) => (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div
                    className="w-full bg-blue-500 rounded-t"
                    style={{
                      height: `${(data.value / Math.max(...revenueData.map(d => d.value))) * 200}px`,
                      minHeight: '20px'
                    }}
                  ></div>
                  <div className="text-xs text-muted-foreground mt-2 transform -rotate-45 origin-top-left">
                    {data.name}
                  </div>
                  <div className="text-xs font-medium">
                    {formatCurrency(data.value)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Enrollment Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Haftalık Kayıtlar</CardTitle>
            <CardDescription>Bu haftanın kayıt trendi</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-end justify-between space-x-2">
              {enrollmentData.map((data, index) => (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div
                    className="w-full bg-green-500 rounded-t"
                    style={{
                      height: `${(data.value / Math.max(...enrollmentData.map(d => d.value))) * 200}px`,
                      minHeight: '10px'
                    }}
                  ></div>
                  <div className="text-xs text-muted-foreground mt-2 transform -rotate-45 origin-top-left">
                    {data.name}
                  </div>
                  <div className="text-xs font-medium">
                    {data.value}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activities */}
      <Card>
        <CardHeader>
          <CardTitle>Son Aktiviteler</CardTitle>
          <CardDescription>Sistemdeki son işlemler</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <div>
                <p className="font-medium">Yeni sözleşme oluşturuldu</p>
                <p className="text-sm text-muted-foreground">Ahmet Yılmaz - 9. Sınıf</p>
              </div>
              <div className="text-right">
                <Badge variant="success">Tamamlandı</Badge>
                <p className="text-xs text-muted-foreground mt-1">2 saat önce</p>
              </div>
            </div>
            
            <div className="flex items-center justify-between border-b pb-2">
              <div>
                <p className="font-medium">Ödeme alındı</p>
                <p className="text-sm text-muted-foreground">{formatCurrency(5000)} - Taksit #2</p>
              </div>
              <div className="text-right">
                <Badge variant="success">Tamamlandı</Badge>
                <p className="text-xs text-muted-foreground mt-1">4 saat önce</p>
              </div>
            </div>
            
            <div className="flex items-center justify-between border-b pb-2">
              <div>
                <p className="font-medium">Sözleşme imzalandı</p>
                <p className="text-sm text-muted-foreground">Fatma Demir - 10. Sınıf</p>
              </div>
              <div className="text-right">
                <Badge variant="success">Tamamlandı</Badge>
                <p className="text-xs text-muted-foreground mt-1">6 saat önce</p>
              </div>
            </div>
            
            <div className="flex items-center justify-between pb-2">
              <div>
                <p className="font-medium">Ödeme hatırlatması gönderildi</p>
                <p className="text-sm text-muted-foreground">15 veliye SMS gönderildi</p>
              </div>
              <div className="text-right">
                <Badge variant="warning">Beklemede</Badge>
                <p className="text-xs text-muted-foreground mt-1">8 saat önce</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}