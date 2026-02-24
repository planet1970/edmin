import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../services/api';

const DbTableViewer: React.FC = () => {
    const { tableName } = useParams<{ tableName: string }>();
    const [tableData, setTableData] = useState<any[]>([]);
    const [isLoadingData, setIsLoadingData] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

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
                    <h1 className="text-2xl font-bold text-gray-800">DB Tablo Görüntüleyici</h1>
                    <p className="text-sm text-gray-500">
                        Şu anda <span className="font-semibold text-primary">{tableName}</span> tablosunu görüntülüyorsunuz.
                    </p>
                </div>
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
                                        {headers.map(header => (
                                            <td key={`${rowIndex}-${header}`} className="px-4 py-3 whitespace-nowrap">
                                                {String(row[header])}
                                            </td>
                                        ))}
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
