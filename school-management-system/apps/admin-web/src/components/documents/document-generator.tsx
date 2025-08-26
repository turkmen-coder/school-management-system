import { useState } from 'react'
import { Button } from '../ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Input } from '../ui/input'
import { Badge } from '../ui/badge'

interface DocumentTemplate {
  id: string
  name: string
  type: 'contract' | 'admission' | 'report' | 'certificate'
  description: string
  status: 'active' | 'draft' | 'archived'
}

interface DocumentGeneratorProps {
  templates?: DocumentTemplate[]
  onGenerate?: (templateId: string, data: any) => Promise<void>
}

const mockTemplates: DocumentTemplate[] = [
  {
    id: '1',
    name: 'Öğrenci Sözleşmesi',
    type: 'contract',
    description: 'Standart öğrenci kayıt sözleşmesi',
    status: 'active'
  },
  {
    id: '2',
    name: 'Taksit Planı',
    type: 'contract',
    description: 'Ödeme taksit planı dökümanı',
    status: 'active'
  },
  {
    id: '3',
    name: 'Sınav Giriş Belgesi',
    type: 'admission',
    description: 'Öğrenci sınav giriş belgesi',
    status: 'active'
  },
  {
    id: '4',
    name: 'Sınav Sonuç Raporu',
    type: 'report',
    description: 'Sınav sonuçları özet raporu',
    status: 'active'
  }
]

export function DocumentGenerator({ templates = mockTemplates, onGenerate }: DocumentGeneratorProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<DocumentTemplate | null>(null)
  const [formData, setFormData] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState(false)

  const getTypeVariant = (type: string) => {
    const variants: Record<string, any> = {
      contract: 'default',
      admission: 'success',
      report: 'warning',
      certificate: 'secondary'
    }
    return variants[type] || 'default'
  }

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      contract: 'Sözleşme',
      admission: 'Kayıt',
      report: 'Rapor',
      certificate: 'Sertifika'
    }
    return labels[type] || type
  }

  const handleGenerate = async () => {
    if (!selectedTemplate) return
    
    setLoading(true)
    try {
      await onGenerate?.(selectedTemplate.id, formData)
    } catch (error) {
      console.error('Document generation failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const renderFormFields = () => {
    if (!selectedTemplate) return null

    switch (selectedTemplate.type) {
      case 'contract':
        return (
          <div className="space-y-4">
            <Input
              label="Öğrenci ID"
              value={formData.studentId || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, studentId: e.target.value }))}
            />
            <Input
              label="Dönem"
              value={formData.semester || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, semester: e.target.value }))}
            />
            <Input
              label="Program"
              value={formData.program || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, program: e.target.value }))}
            />
          </div>
        )
      
      case 'admission':
        return (
          <div className="space-y-4">
            <Input
              label="Başvuru ID"
              value={formData.applicationId || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, applicationId: e.target.value }))}
            />
            <Input
              label="Sınav Tarihi"
              type="date"
              value={formData.examDate || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, examDate: e.target.value }))}
            />
          </div>
        )
      
      case 'report':
        return (
          <div className="space-y-4">
            <Input
              label="Sınav ID"
              value={formData.examId || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, examId: e.target.value }))}
            />
            <Input
              label="Rapor Başlığı"
              value={formData.title || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            />
          </div>
        )
      
      default:
        return (
          <div className="space-y-4">
            <Input
              label="Veri"
              value={formData.data || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, data: e.target.value }))}
            />
          </div>
        )
    }
  }

  return (
    <div className="space-y-6">
      {/* Template Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Belge Şablonları</CardTitle>
          <CardDescription>
            Oluşturmak istediğiniz belge türünü seçin
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {templates.map((template) => (
              <div
                key={template.id}
                className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                  selectedTemplate?.id === template.id
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:bg-accent/50'
                }`}
                onClick={() => {
                  setSelectedTemplate(template)
                  setFormData({})
                }}
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium">{template.name}</h4>
                  <Badge variant={getTypeVariant(template.type)}>
                    {getTypeLabel(template.type)}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  {template.description}
                </p>
                <Badge variant={template.status === 'active' ? 'success' : 'secondary'}>
                  {template.status === 'active' ? 'Aktif' : 'Taslak'}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Document Configuration */}
      {selectedTemplate && (
        <Card>
          <CardHeader>
            <CardTitle>{selectedTemplate.name} - Yapılandırma</CardTitle>
            <CardDescription>
              Belge oluşturmak için gerekli bilgileri girin
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {renderFormFields()}
              
              <div className="flex justify-end gap-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedTemplate(null)
                    setFormData({})
                  }}
                >
                  İptal
                </Button>
                <Button
                  onClick={handleGenerate}
                  loading={loading}
                  disabled={!selectedTemplate}
                >
                  Belge Oluştur
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Documents */}
      <Card>
        <CardHeader>
          <CardTitle>Son Oluşturulan Belgeler</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground">Henüz belge oluşturulmadı</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}