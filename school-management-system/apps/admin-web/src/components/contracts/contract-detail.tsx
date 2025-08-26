import { useState } from 'react'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table'
import { formatCurrency, formatDate, getStatusVariant } from '@/lib/utils'

interface ContractDetail {
  id: string
  contractNumber: string
  studentName: string
  parentName: string
  semester: string
  program: string
  status: string
  totalAmount: number
  remainingAmount: number
  paidAmount: number
  createdAt: string
  signedAt?: string
  installments: Installment[]
  documents: Document[]
}

interface Installment {
  id: string
  dueDate: string
  amount: number
  status: 'bekleyen' | 'ödendi' | 'gecikmiş'
  paidDate?: string
  paymentMethod?: string
}

interface Document {
  id: string
  name: string
  type: string
  url: string
  createdAt: string
}

interface ContractDetailProps {
  contract: ContractDetail
  onPayInstallment?: (installmentId: string) => void
  onDownloadDocument?: (documentId: string) => void
}

export function ContractDetail({ contract, onPayInstallment, onDownloadDocument }: ContractDetailProps) {
  const [activeTab, setActiveTab] = useState<'özet' | 'taksit' | 'belgeler' | 'geçmiş'>('özet')

  const tabs = [
    { id: 'özet', label: 'Özet' },
    { id: 'taksit', label: 'Taksit Planı' },
    { id: 'belgeler', label: 'Belgeler' },
    { id: 'geçmiş', label: 'Geçmiş' }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold">Sözleşme Detayı</h1>
          <p className="text-muted-foreground">#{contract.contractNumber}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">PDF İndir</Button>
          {contract.status === 'aktif' && (
            <>
              <Button variant="outline">İmzala</Button>
              <Button>Ödeme Yap</Button>
            </>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Toplam Tutar</CardDescription>
            <CardTitle className="text-2xl">{formatCurrency(contract.totalAmount)}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Kalan Tutar</CardDescription>
            <CardTitle className="text-2xl text-orange-600">{formatCurrency(contract.remainingAmount)}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Ödenen Tutar</CardDescription>
            <CardTitle className="text-2xl text-green-600">{formatCurrency(contract.paidAmount)}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Durum</CardDescription>
            <CardTitle>
              <Badge variant={getStatusVariant(contract.status)} className="text-sm">
                {contract.status}
              </Badge>
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Tabs */}
      <div className="border-b">
        <nav className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'özet' && (
          <Card>
            <CardHeader>
              <CardTitle>Sözleşme Bilgileri</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-2">Öğrenci Bilgileri</h4>
                  <p><strong>Ad Soyad:</strong> {contract.studentName}</p>
                  <p><strong>Veli:</strong> {contract.parentName}</p>
                  <p><strong>Program:</strong> {contract.program}</p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Sözleşme Bilgileri</h4>
                  <p><strong>Dönem:</strong> {contract.semester}</p>
                  <p><strong>Oluşturulma:</strong> {formatDate(contract.createdAt)}</p>
                  {contract.signedAt && (
                    <p><strong>İmzalanma:</strong> {formatDate(contract.signedAt)}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'taksit' && (
          <Card>
            <CardHeader>
              <CardTitle>Taksit Planı</CardTitle>
              <CardDescription>
                {contract.installments.filter(i => i.status === 'ödendi').length} / {contract.installments.length} taksit ödendi
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Vade Tarihi</TableHead>
                    <TableHead>Tutar</TableHead>
                    <TableHead>Durum</TableHead>
                    <TableHead>Ödeme Tarihi</TableHead>
                    <TableHead>İşlemler</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contract.installments.map((installment) => (
                    <TableRow key={installment.id}>
                      <TableCell>{formatDate(installment.dueDate)}</TableCell>
                      <TableCell>{formatCurrency(installment.amount)}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusVariant(installment.status)}>
                          {installment.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {installment.paidDate ? formatDate(installment.paidDate) : '-'}
                      </TableCell>
                      <TableCell>
                        {installment.status === 'bekleyen' && (
                          <Button 
                            size="sm"
                            onClick={() => onPayInstallment?.(installment.id)}
                          >
                            Öde
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {activeTab === 'belgeler' && (
          <Card>
            <CardHeader>
              <CardTitle>Sözleşme Belgeleri</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Belge Adı</TableHead>
                    <TableHead>Tür</TableHead>
                    <TableHead>Oluşturulma</TableHead>
                    <TableHead>İşlemler</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contract.documents.map((document) => (
                    <TableRow key={document.id}>
                      <TableCell className="font-medium">{document.name}</TableCell>
                      <TableCell>{document.type}</TableCell>
                      <TableCell>{formatDate(document.createdAt)}</TableCell>
                      <TableCell>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => onDownloadDocument?.(document.id)}
                        >
                          İndir
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {activeTab === 'geçmiş' && (
          <Card>
            <CardHeader>
              <CardTitle>İşlem Geçmişi</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between border-l-4 border-blue-500 pl-4">
                  <div>
                    <p className="font-medium">Sözleşme oluşturuldu</p>
                    <p className="text-sm text-muted-foreground">{formatDate(contract.createdAt)}</p>
                  </div>
                </div>
                {contract.signedAt && (
                  <div className="flex items-center justify-between border-l-4 border-green-500 pl-4">
                    <div>
                      <p className="font-medium">Sözleşme imzalandı</p>
                      <p className="text-sm text-muted-foreground">{formatDate(contract.signedAt)}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}