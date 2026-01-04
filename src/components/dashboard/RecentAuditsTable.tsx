import React from 'react';
import { Eye, MoreHorizontal } from 'lucide-react';

// 1. Tip Tanımları
interface Audit {
  id: string;
  store: string;
  location: string;
  compliance: number;
  status: 'Compliant' | 'Warning' | 'Non-Compliant';
  auditor: string;
  time: string;
}

// 2. Mock Data (İzmir ve Yerel Marketler ile Güncellendi)
const RECENT_AUDITS: Audit[] = [
  {
    id: 'AUD-2025-4821',
    store: 'Migros MM - Konak',
    location: 'Konak, İzmir',
    compliance: 92,
    status: 'Compliant',
    auditor: 'Ahmet Yılmaz',
    time: '15 minutes ago',
  },
  {
    id: 'AUD-2025-4820',
    store: 'BİM - Karşıyaka Çarşı',
    location: 'Karşıyaka, İzmir',
    compliance: 68,
    status: 'Warning',
    auditor: 'Ayşe Demir',
    time: '32 minutes ago',
  },
  {
    id: 'AUD-2025-4819',
    store: 'A101 - Bornova Merkez',
    location: 'Bornova, İzmir',
    compliance: 45,
    status: 'Non-Compliant',
    auditor: 'Mehmet Kaya',
    time: '1 hour ago',
  },
  {
    id: 'AUD-2025-4818',
    store: 'Şok - Alsancak',
    location: 'Konak, İzmir',
    compliance: 95,
    status: 'Compliant',
    auditor: 'Zeynep Çelik',
    time: '2 hours ago',
  },
];

// 3. Yardımcı Bileşen: Durum Badge'i
const StatusBadge = ({ status }: { status: Audit['status'] }) => {
  const styles = {
    Compliant: 'bg-green-50 text-green-700 border-green-100',
    Warning: 'bg-yellow-50 text-yellow-700 border-yellow-100',
    'Non-Compliant': 'bg-red-50 text-red-700 border-red-100',
  };

  // Status metinlerini Türkçeleştirmek istersen burayı da değiştirebiliriz
  // Şimdilik kod yapısını bozmamak için İngilizce key kullanıp ekranda Türkçe gösterebiliriz veya olduğu gibi bırakabiliriz.
  // Aşağıda olduğu gibi bırakıyorum, eğer Türkçe yazsın istersen {status} yerine map kullanabiliriz.
  
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status]}`}>
      {status}
    </span>
  );
};

// 4. Ana Tablo Bileşeni
const RecentAuditsTable = () => {
  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
      {/* Tablo Başlığı */}
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">Recent Audits</h3>
        <button className="text-gray-400 hover:text-gray-600">
          <MoreHorizontal size={20} />
        </button>
      </div>

      {/* Tablo Alanı */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-100">
            <tr>
              <th className="px-6 py-3">AUDIT ID</th>
              <th className="px-6 py-3">STORE</th>
              <th className="px-6 py-3">LOCATION</th>
              <th className="px-6 py-3">COMPLIANCE</th>
              <th className="px-6 py-3">STATUS</th>
              <th className="px-6 py-3">AUDITOR</th>
              <th className="px-6 py-3">TIME</th>
              <th className="px-6 py-3 text-right">ACTION</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {RECENT_AUDITS.map((audit) => (
              <tr key={audit.id} className="hover:bg-gray-50 transition-colors group">
                <td className="px-6 py-4 font-medium text-gray-900">{audit.id}</td>
                <td className="px-6 py-4 text-gray-600">{audit.store}</td>
                <td className="px-6 py-4 text-gray-500">{audit.location}</td>
                
                {/* Compliance Progress Bar */}
                <td className="px-6 py-4">
                  <div className="flex flex-col gap-1 w-24">
                    <span className={`text-xs font-semibold ${
                        audit.compliance >= 80 ? 'text-green-600' :
                        audit.compliance >= 60 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                        {audit.compliance}%
                    </span>
                    <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${
                            audit.compliance >= 80 ? 'bg-green-500' :
                            audit.compliance >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${audit.compliance}%` }}
                      ></div>
                    </div>
                  </div>
                </td>

                <td className="px-6 py-4">
                  <StatusBadge status={audit.status} />
                </td>
                <td className="px-6 py-4 text-gray-600">{audit.auditor}</td>
                <td className="px-6 py-4 text-gray-400 text-xs">{audit.time}</td>
                
                {/* Action Button */}
                <td className="px-6 py-4 text-right">
                  <button className="text-blue-600 hover:text-blue-800 font-medium text-xs flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Eye size={16} />
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RecentAuditsTable;