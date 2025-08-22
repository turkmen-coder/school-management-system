'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';

const examSchema = z.object({
  name: z.string().min(2, 'Sınav adı en az 2 karakter olmalıdır'),
  campusId: z.string().min(1, 'Kampüs seçiniz'),
  date: z.string().min(1, 'Sınav tarihi gereklidir'),
  duration: z.number().min(30, 'Sınav süresi en az 30 dakika olmalıdır').max(480, 'Sınav süresi en fazla 8 saat olabilir'),
});

type ExamFormData = z.infer<typeof examSchema>;

interface ExamFormProps {
  initialData?: Partial<ExamFormData>;
  onSubmit: (data: ExamFormData) => Promise<void>;
  isLoading?: boolean;
  campuses?: Array<{ id: string; name: string }>;
}

export function ExamForm({ initialData, onSubmit, isLoading, campuses = [] }: ExamFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<ExamFormData>({
    name: initialData?.name || '',
    campusId: initialData?.campusId || '',
    date: initialData?.date || '',
    duration: initialData?.duration || 120,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const validatedData = examSchema.parse({
        ...formData,
        duration: Number(formData.duration),
      });
      
      setErrors({});
      await onSubmit(validatedData);
      
      router.push('/exams');
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path.length > 0) {
            fieldErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(fieldErrors);
      } else {
        console.error('Form submission error:', error);
      }
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">
        {initialData ? 'Sınav Düzenle' : 'Yeni Sınav Oluştur'}
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Sınav Adı *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="örn: 2024 Giriş Sınavı"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
        </div>

        <div>
          <label htmlFor="campusId" className="block text-sm font-medium text-gray-700 mb-1">
            Kampüs *
          </label>
          <select
            id="campusId"
            name="campusId"
            value={formData.campusId}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Kampüs seçiniz</option>
            {campuses.map(campus => (
              <option key={campus.id} value={campus.id}>
                {campus.name}
              </option>
            ))}
          </select>
          {errors.campusId && <p className="text-red-500 text-sm mt-1">{errors.campusId}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
              Sınav Tarihi *
            </label>
            <input
              type="datetime-local"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            {errors.date && <p className="text-red-500 text-sm mt-1">{errors.date}</p>}
          </div>

          <div>
            <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-1">
              Süre (Dakika) *
            </label>
            <input
              type="number"
              id="duration"
              name="duration"
              value={formData.duration}
              onChange={handleChange}
              min={30}
              max={480}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            {errors.duration && <p className="text-red-500 text-sm mt-1">{errors.duration}</p>}
          </div>
        </div>

        <div className="bg-blue-50 p-4 rounded-md">
          <h3 className="font-medium text-blue-900 mb-2">Sınav Oluşturulduktan Sonra:</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Sınav oturumları oluşturabilirsiniz</li>
            <li>• Başvuru kabul etmeye başlayabilirsiniz</li>
            <li>• Sınav salonlarını düzenleyebilirsiniz</li>
            <li>• Otomatik koltuk ataması yapabilirsiniz</li>
          </ul>
        </div>

        <div className="flex justify-end space-x-4 pt-4">
          <button
            type="button"
            onClick={() => router.push('/exams')}
            className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            İptal
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Kaydediliyor...' : (initialData ? 'Güncelle' : 'Sınavı Oluştur')}
          </button>
        </div>
      </form>
    </div>
  );
}