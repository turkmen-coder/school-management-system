import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ContractList } from './contract-list'
import { formatCurrency, formatDate } from '@/lib/utils'

// Mock data
const mockContracts = [
  {
    id: '1',
    contractNumber: 'CT-2024-001',
    studentName: 'Ahmet Yılmaz',
    semester: '2024-2025 Güz',
    status: 'aktif',
    totalAmount: 25000,
    remainingAmount: 15000,
    lastPaymentDate: '2024-01-15',
    createdAt: '2024-01-01'
  },
  {
    id: '2',
    contractNumber: 'CT-2024-002',
    studentName: 'Ayşe Demir',
    semester: '2024-2025 Güz',
    status: 'bekleyen',
    totalAmount: 30000,
    remainingAmount: 30000,
    createdAt: '2024-01-02'
  }
]

describe('ContractList', () => {
  it('renders contract list correctly', () => {
    render(<ContractList contracts={mockContracts} />)
    
    expect(screen.getByText('Öğrenci Sözleşmeleri')).toBeInTheDocument()
    expect(screen.getByText('Ahmet Yılmaz')).toBeInTheDocument()
    expect(screen.getByText('Ayşe Demir')).toBeInTheDocument()
  })

  it('displays formatted currency amounts', () => {
    render(<ContractList contracts={mockContracts} />)
    
    expect(screen.getByText(formatCurrency(25000))).toBeInTheDocument()
    expect(screen.getByText(formatCurrency(15000))).toBeInTheDocument()
  })

  it('shows loading state', () => {
    render(<ContractList loading={true} />)
    
    expect(screen.getByRole('progressbar', { hidden: true })).toBeInTheDocument()
  })

  it('filters contracts by search term', async () => {
    render(<ContractList contracts={mockContracts} />)
    
    const searchInput = screen.getByPlaceholderText('Öğrenci adı veya sözleşme no...')
    fireEvent.change(searchInput, { target: { value: 'Ahmet' } })
    
    await waitFor(() => {
      expect(screen.getByText('Ahmet Yılmaz')).toBeInTheDocument()
      expect(screen.queryByText('Ayşe Demir')).not.toBeInTheDocument()
    })
  })

  it('filters contracts by status', async () => {
    render(<ContractList contracts={mockContracts} />)
    
    const statusSelect = screen.getByDisplayValue('Tüm Durumlar')
    fireEvent.change(statusSelect, { target: { value: 'aktif' } })
    
    await waitFor(() => {
      expect(screen.getByText('Ahmet Yılmaz')).toBeInTheDocument()
      expect(screen.queryByText('Ayşe Demir')).not.toBeInTheDocument()
    })
  })

  it('shows empty state when no contracts', () => {
    render(<ContractList contracts={[]} />)
    
    expect(screen.getByText('Henüz sözleşme yok')).toBeInTheDocument()
    expect(screen.getByText('Sözleşme Talep Et')).toBeInTheDocument()
  })

  it('shows empty state for filtered results', () => {
    render(<ContractList contracts={mockContracts} />)
    
    const searchInput = screen.getByPlaceholderText('Öğrenci adı veya sözleşme no...')
    fireEvent.change(searchInput, { target: { value: 'Nonexistent' } })
    
    expect(screen.getByText('Bu filtre ile sonuç bulunamadı')).toBeInTheDocument()
  })

  it('displays action buttons for active contracts', () => {
    render(<ContractList contracts={mockContracts} />)
    
    const payButtons = screen.getAllByText('Öde')
    expect(payButtons).toHaveLength(1) // Only active contracts with remaining amount should have pay button
    
    const viewButtons = screen.getAllByText('Görüntüle')
    expect(viewButtons).toHaveLength(2) // All contracts should have view button
  })

  it('formats dates correctly', () => {
    render(<ContractList contracts={mockContracts} />)
    
    expect(screen.getByText(formatDate('2024-01-15'))).toBeInTheDocument()
  })

  it('shows contract status badges', () => {
    render(<ContractList contracts={mockContracts} />)
    
    expect(screen.getByText('aktif')).toBeInTheDocument()
    expect(screen.getByText('bekleyen')).toBeInTheDocument()
  })
})