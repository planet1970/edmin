import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { api, getImageUrl } from '../services/api';
import { Download, Table as TableIcon } from 'lucide-react';

const DbTableViewer: React.FC = () => {
    const { tableName } = useParams<{ tableName: string }>();
    const [tableData, setTableData] = useState<any[]>([]);
    const [isLoadingData, setIsLoadingData] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const handleExportExcel = () => {
        if (tableData.length === 0) return;

        const headers = Object.keys(tableData[0]);
        // CSV with BOM for Turkish characters
        const csvContent = [
            headers.join(';'),
            ...tableData.map(row => 
                headers.map(header => {
                    let cell = row[header] === null || row[header] === undefined ? '' : String(row[header]);
                    cell = cell.replace(/"/g, '""');
                    if (cell.includes(';') || cell.includes('"') || cell.includes('\n')) {
                        cell = `"${cell}"`;
                    }
                    return cell;
                }).join(';')
            )
        ].join('\n');

        const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `${tableName}_${new Date().toLocaleDateString('tr-TR')}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    useEffect(() => {
        const fetchTableData = async () => {
            if (!tableName) return;
            setIsLoadingData(true);
            setError(null);
            setTableData([]);
            try {
                const data = await api.get<any[]>(`/tables/${tableName}`);
                setTableData(data);
            } catch (err) {
                setError(`'${tableName}' tablosu için veri yüklenemedi.`);
                console.error(err);
            } finally {
                setIsLoadingData(false);
            }
        };

        fetchTableData();
    }, [tableName]);

    const headers = tableData.length > 0 ? Object.keys(tableData[0]) : [];

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <TableIcon className="text-primary" /> DB Tablo Görüntüleyici
                    </h1>
                    <p className="text-sm text-gray-500">
                        Şu anda <span className="font-semibold text-primary">{tableName}</span> tablosunu görüntülüyorsunuz.
                    </p>
                </div>

                {tableData.length > 0 && (
                    <button
                        onClick={handleExportExcel}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-xl font-bold text-sm hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-100"
                    >
                        <Download size={18} /> Excel'e Aktar (CSV)
                    </button>
                )}
            </div>

            {error && <p className="text-red-500 my-4 p-4 bg-red-100 rounded-lg">{error}</p>}

            {isLoadingData ? (
                <p>Veriler yükleniyor...</p>
            ) : tableData.length > 0 ? (
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                    <h2 className="text-lg font-bold p-4 border-b">{tableName}</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-gray-50 text-gray-500 font-medium text-xs uppercase">
                                <tr>
                                    {headers.map(header => (
                                        <th key={header} className="px-4 py-3">{header}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 text-sm">
                                {tableData.map((row, rowIndex) => (
                                     <tr key={rowIndex} className="hover:bg-gray-50">
                                         {headers.map(header => {
                                             const value = row[header];
                                             const isDateColumn = header.toLowerCase().includes('at') || 
                                                                 header.toLowerCase().includes('date');
                                             const isImageColumn = header.toLowerCase().includes('pic') ||
                                                 header.toLowerCase().includes('image') ||
                                                 header.toLowerCase().includes('logo');

                                             return (
                                                 <td key={`${rowIndex}-${header}`} className="px-4 py-3 whitespace-nowrap">
                                                     {isImageColumn && value ? (
                                                         <div className="flex items-center gap-2">
                                                             <div className="w-10 h-10 rounded border overflow-hidden bg-gray-50 flex-shrink-0">
                                                                 <img
                                                                     src={getImageUrl(String(value))}
                                                                     alt=""
                                                                     className="w-full h-full object-cover"
                                                                     onError={(e) => {
                                                                         (e.target as HTMLImageElement).src = 'https://via.placeholder.com/40/f1f5f9/94a3b8?text=?';
                                                                     }}
                                                                 />
                                                             </div>
                                                             <span className="text-xs text-gray-400 truncate max-w-[100px]">{String(value)}</span>
                                                         </div>
                                                     ) : isDateColumn && value ? (
                                                         <span className="text-gray-600 font-medium">
                                                             {new Date(String(value)).toLocaleString('tr-TR', { timeZone: 'Europe/Istanbul' })}
                                                         </span>
                                                     ) : (
                                                         String(value ?? '-')
                                                     )}
                                                 </td>
                                             );
                                         })}
                                     </tr>
                                 ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : !error && (
                <p>Bu tabloda gösterilecek veri yok.</p>
            )}
        </div>
    );
};

export default DbTableViewer;
