import React from 'react';
import { Edit2, Trash2, ToggleLeft, ToggleRight, GripVertical, Loader } from 'lucide-react';

export interface Column<T> {
  header: string;
  accessor: keyof T | ((item: T) => React.ReactNode);
  className?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  onEdit?: (item: T) => void;
  onDelete?: (id: string | number) => void;
  onToggle?: (id: string | number, current: boolean) => void;
  loading?: boolean;
  rowKey?: keyof T;
  draggable?: boolean;
  onDragEnd?: (items: T[]) => void;
  actions?: (item: T) => React.ReactNode;
}

export function DataTable<T extends { id?: string | number; isActive?: boolean }>({
  data,
  columns,
  onEdit,
  onDelete,
  onToggle,
  loading,
  rowKey = 'id' as keyof T,
  actions
}: DataTableProps<T>) {
  if (loading && data.length === 0) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader className="animate-spin text-orange-500" size={32} />
      </div>
    );
  }

  return (
    <div className="overflow-x-auto bg-white rounded-xl shadow-sm border border-gray-100">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-100">
            {columns.map((col, idx) => (
              <th key={idx} className={`px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider ${col.className || ''}`}>
                {col.header}
              </th>
            ))}
            {(onEdit || onDelete || onToggle || actions) && (
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">
                İşlemler
              </th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length + 1} className="px-6 py-12 text-center text-gray-400">
                Kayıt bulunamadı.
              </td>
            </tr>
          ) : (
            data.map((item, rowIdx) => (
              <tr key={String(item[rowKey]) || rowIdx} className="hover:bg-gray-50 transition-colors group">
                {columns.map((col, colIdx) => (
                  <td key={colIdx} className={`px-6 py-4 text-sm text-gray-600 ${col.className || ''}`}>
                    {typeof col.accessor === 'function' 
                      ? col.accessor(item) 
                      : (item[col.accessor] as any)}
                  </td>
                ))}
                {(onEdit || onDelete || onToggle || actions) && (
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end items-center gap-2">
                      {actions?.(item)}
                      {onToggle && (
                        <button
                          onClick={() => onToggle(item.id!, item.isActive!)}
                          className={`p-1.5 rounded-lg transition-colors ${
                            item.isActive 
                              ? 'text-green-500 hover:bg-green-50' 
                              : 'text-gray-400 hover:bg-gray-100'
                          }`}
                          title={item.isActive ? 'Pasifleştir' : 'Aktifleştir'}
                        >
                          {item.isActive ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                        </button>
                      )}
                      {onEdit && (
                        <button
                          onClick={() => onEdit(item)}
                          className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Düzenle"
                        >
                          <Edit2 size={18} />
                        </button>
                      )}
                      {onDelete && (
                        <button
                          onClick={() => onDelete(item.id!)}
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Sil"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
