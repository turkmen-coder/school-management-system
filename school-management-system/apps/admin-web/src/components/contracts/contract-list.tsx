import { useState } from 'react'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Input } from '../ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table'
import { formatCurrency, formatDate, getStatusVariant } from '@/lib/utils'

interface Contract {
  id: string
  contractNumber: string
  studentName: string
  semester: string
  status: string
  totalAmount: number
  remainingAmount: number
  lastPaymentDate?: string
  createdAt: string
}

interface ContractListProps {
  contracts?: Contract[]
  loading?: boolean
}

export function ContractList({ contracts = [], loading = false }: ContractListProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('tümü')

  const filteredContracts = contracts.filter(contract => {
    const matchesSearch = contract.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contract.contractNumber.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'tümü' || contract.status.toLowerCase() === statusFilter.toLowerCase()
    
    return matchesSearch && matchesStatus
  })

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
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Öğrenci Sözleşmeleri</CardTitle>
          <Button>Yeni Sözleşme</Button>
        </div>
        <div className="flex gap-4 mt-4">
          <Input
            placeholder="Öğrenci adı veya sözleşme no..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-input bg-background rounded-md text-sm"
          >
            <option value="tümü">Tüm Durumlar</option>
            <option value="taslak">Taslak</option>
            <option value="aktif">Aktif</option>
            <option value="gecikmiş">Gecikmiş</option>
            <option value="ödendi">Ödendi</option>
            <option value="iptal">İptal</option>
          </select>
        </div>
      </CardHeader>
      <CardContent>
        {filteredContracts.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">
              {searchTerm || statusFilter !== 'tümü' 
                ? 'Bu filtre ile sonuç bulunamadı' 
                : 'Henüz sözleşme yok'
              }
            </p>
            <Button variant="outline">Sözleşme Talep Et</Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Sözleşme No</TableHead>
                <TableHead>Öğrenci</TableHead>
                <TableHead>Dönem</TableHead>
                <TableHead>Durum</TableHead>
                <TableHead>Toplam</TableHead>
                <TableHead>Kalan</TableHead>
                <TableHead>Son İşlem</TableHead>
                <TableHead>Aksiyonlar</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredContracts.map((contract) => (
                <TableRow key={contract.id}>
                  <TableCell className="font-medium">{contract.contractNumber}</TableCell>
                  <TableCell>{contract.studentName}</TableCell>
                  <TableCell>{contract.semester}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(contract.status)}>
                      {contract.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatCurrency(contract.totalAmount)}</TableCell>
                  <TableCell>{formatCurrency(contract.remainingAmount)}</TableCell>
                  <TableCell>
                    {contract.lastPaymentDate ? formatDate(contract.lastPaymentDate) : '-'}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">Görüntüle</Button>
                      <Button variant="outline" size="sm">PDF İndir</Button>
                      {contract.status === 'aktif' && contract.remainingAmount > 0 && (
                        <Button size="sm">Öde</Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}