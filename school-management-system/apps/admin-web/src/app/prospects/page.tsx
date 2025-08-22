'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Prospect {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  source: string;
  stage: string;
  status: string;
  score?: number;
  createdAt: string;
}

const sourceLabels: Record<string, string> = {
  'WEBSITE': 'Web Sitesi',
  'REFERRAL': 'Referans',
  'SOCIAL_MEDIA': 'Sosyal Medya',
  'ADVERTISEMENT': 'Reklam',
  'WALK_IN': 'Doğrudan',
  'PHONE_CALL': 'Telefon',
  'EMAIL': 'E-posta',
  'EVENT': 'Etkinlik',
  'PARTNER': 'Ortak',
  'OTHER': 'Diğer',
};

const stageLabels: Record<string, string> = {
  'INITIAL_CONTACT': 'İlk Temas',
  'QUALIFIED': 'Kalifiye',
  'INTERESTED': 'İlgili',
  'CONSIDERING': 'Değerlendiriyor',
  'NEGOTIATING': 'Müzakere',
  'ENROLLED': 'Kayıt',
};

export default function ProspectsPage() {
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterSource, setFilterSource] = useState('');

  useEffect(() => {
    // TODO: Replace with actual API call
    // fetchProspects();
    
    // Mock data for now
    setTimeout(() => {
      setProspects([
        {
          id: '1',
          firstName: 'Ahmet',
          lastName: 'Yılmaz',
          phone: '05551234567',
          email: 'ahmet@example.com',
          source: 'WEBSITE',
          stage: 'INTERESTED',
          status: 'ACTIVE',
          score: 75,
          createdAt: '2024-01-15T10:00:00Z',
        },
        {
          id: '2',
          firstName: 'Ayşe',
          lastName: 'Kaya',
          phone: '05559876543',
          email: 'ayse@example.com',
          source: 'REFERRAL',
          stage: 'QUALIFIED',
          status: 'ACTIVE',
          score: 85,
          createdAt: '2024-01-14T14:30:00Z',
        },
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement search
    console.log('Searching for:', searchTerm);
  };

  const getScoreColor = (score?: number) => {
    if (!score) return 'bg-gray-100 text-gray-800';
    if (score >= 80) return 'bg-green-100 text-green-800';
    if (score >= 60) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800';
      case 'INACTIVE': return 'bg-gray-100 text-gray-800';
      case 'CONVERTED': return 'bg-blue-100 text-blue-800';
      case 'LOST': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Adaylar</h1>
        <p className="text-gray-600">Potansiyel öğrenci adaylarını yönetin</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md mb-6">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <form onSubmit={handleSearch} className="flex gap-2 flex-1 max-w-md">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Ad, soyad, telefon veya e-posta ile ara..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
              >
                Ara
              </button>
            </form>
            
            <div className="flex gap-2">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Tüm Durumlar</option>
                <option value="ACTIVE">Aktif</option>
                <option value="INACTIVE">Pasif</option>
                <option value="CONVERTED">Dönüştürüldü</option>
                <option value="LOST">Kayıp</option>
              </select>
              
              <select
                value={filterSource}
                onChange={(e) => setFilterSource(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Tüm Kaynaklar</option>
                {Object.entries(sourceLabels).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
              
              <Link
                href="/prospects/new"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Yeni Aday
              </Link>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-6 bg-gray-50">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{prospects.length}</div>
            <div className="text-sm text-gray-600">Toplam Aday</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {prospects.filter(p => p.status === 'ACTIVE').length}
            </div>
            <div className="text-sm text-gray-600">Aktif</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {prospects.filter(p => p.stage === 'INTERESTED').length}
            </div>
            <div className="text-sm text-gray-600">İlgili</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {prospects.filter(p => p.status === 'CONVERTED').length}
            </div>
            <div className="text-sm text-gray-600">Dönüştürüldü</div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aday
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  İletişim
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kaynak
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aşama
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Puan
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Durum
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  İşlemler
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {prospects.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    Henüz aday kaydı bulunmamaktadır
                  </td>
                </tr>
              ) : (
                prospects.map((prospect) => (
                  <tr key={prospect.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="font-medium text-gray-900">
                          {prospect.firstName} {prospect.lastName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {new Date(prospect.createdAt).toLocaleDateString('tr-TR')}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{prospect.phone}</div>
                      <div className="text-sm text-gray-500">{prospect.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {sourceLabels[prospect.source] || prospect.source}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {stageLabels[prospect.stage] || prospect.stage}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getScoreColor(prospect.score)}`}>
                        {prospect.score || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(prospect.status)}`}>
                        {prospect.status === 'ACTIVE' ? 'Aktif' : 
                         prospect.status === 'CONVERTED' ? 'Dönüştürüldü' :
                         prospect.status === 'LOST' ? 'Kayıp' : 'Pasif'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                      <Link
                        href={`/prospects/${prospect.id}`}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Görüntüle
                      </Link>
                      <Link
                        href={`/prospects/${prospect.id}/edit`}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        Düzenle
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}