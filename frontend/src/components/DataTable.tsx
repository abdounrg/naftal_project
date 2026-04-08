import { useState, useRef } from 'react';
import { Search, Filter, Plus, Download, Upload, ChevronLeft, ChevronRight, Edit, Trash2, Eye, X } from 'lucide-react';
import * as XLSX from 'xlsx';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';

interface Column {
  key: string;
  label: string;
  render?: (value: any, row: any) => React.ReactNode;
  filterable?: boolean;
}

interface FilterConfig {
  key: string;
  label: string;
  type: 'select' | 'date' | 'text';
  options?: string[];
}

interface DataTableProps {
  columns: Column[];
  data: any[];
  title: string;
  onAdd?: () => void;
  onEdit?: (row: any) => void;
  onDelete?: (row: any) => void;
  onView?: (row: any) => void;
  filters?: FilterConfig[];
  onImport?: (data: any[]) => void;
}

const DataTable = ({ columns, data, title, onAdd, onEdit, onDelete, onView, filters, onImport }: DataTableProps) => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const role = user?.role || '';
  const canAdd = ['administrator', 'dpe_member', 'district_member', 'agency_member'].includes(role);
  const canEdit = ['administrator', 'dpe_member', 'district_member'].includes(role);
  const canDelete = ['administrator', 'dpe_member'].includes(role);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [deleteError, setDeleteError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const itemsPerPage = 10;

  const filteredData = data.filter(row => {
    const matchesSearch = Object.values(row).some(value =>
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    );
    const matchesFilters = Object.entries(activeFilters).every(([key, val]) => {
      if (!val) return true;
      const rowVal = String(row[key] ?? '').toLowerCase();
      if (key.endsWith('_from')) {
        const realKey = key.replace('_from', '');
        return !row[realKey] || row[realKey] >= val;
      }
      if (key.endsWith('_to')) {
        const realKey = key.replace('_to', '');
        return !row[realKey] || row[realKey] <= val;
      }
      return rowVal.includes(val.toLowerCase());
    });
    return matchesSearch && matchesFilters;
  });

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const activeFilterCount = Object.values(activeFilters).filter(v => v).length;

  const handleExport = () => {
    const wsData = [
      columns.map(c => c.label),
      ...filteredData.map(row => columns.map(col => row[col.key] ?? ''))
    ];
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, title.slice(0, 31));
    XLSX.writeFile(wb, `${title.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onImport) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const data = new Uint8Array(evt.target?.result as ArrayBuffer);
      const wb = XLSX.read(data, { type: 'array' });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const rows: Record<string, string>[] = XLSX.utils.sheet_to_json(ws, { defval: '' });
      if (rows.length > 0) onImport(rows);
    };
    reader.readAsArrayBuffer(file);
    e.target.value = '';
  };

  const clearFilters = () => {
    setActiveFilters({});
    setShowFilters(false);
  };

  const getStatusClass = (status: string) => {
    const statusMap: Record<string, string> = {
      'en_service': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      'en_maintenance': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      'en_panne': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      'volé': 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
      'en_traitement': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      'a_retourner': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      'en_circulation': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      'defectueux': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      'expire': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      'perdu': 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
    };
    return statusMap[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 table-enter">
      {/* Header */}
      <div className="p-4 sm:p-6 border-b border-gray-100 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
          
          <div className="flex flex-wrap items-center gap-2">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder={language === 'fr' ? 'Rechercher...' : 'Search...'}
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                className="pl-9 pr-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--naftal-blue)] w-48"
              />
            </div>

            {/* Filter Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-3 py-2 border rounded-lg text-sm transition-colors ${
                activeFilterCount > 0
                  ? 'border-[var(--naftal-blue)] bg-blue-50 dark:bg-blue-900/20 text-[var(--naftal-blue)]'
                  : 'border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <Filter className="w-4 h-4" />
              <span className="hidden sm:inline">{language === 'fr' ? 'Filtrer' : 'Filter'}</span>
              {activeFilterCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-[var(--naftal-blue)] text-white text-xs flex items-center justify-center">{activeFilterCount}</span>
              )}
            </button>

            {/* Export Button */}
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">{language === 'fr' ? 'Exporter' : 'Export'}</span>
            </button>

            {/* Import Button */}
            {onImport && canAdd && (
              <>
                <input type="file" ref={fileInputRef} accept=".xlsx,.xls" onChange={handleImport} className="hidden" />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <Upload className="w-4 h-4" />
                  <span className="hidden sm:inline">{language === 'fr' ? 'Importer' : 'Import'}</span>
                </button>
              </>
            )}

            {/* Add Button */}
            {onAdd && canAdd && (
              <button
                onClick={onAdd}
                className="flex items-center gap-2 px-4 py-2 bg-[var(--naftal-blue)] text-white rounded-lg text-sm font-medium hover:bg-[var(--naftal-dark-blue)] transition-colors"
              >
                <Plus className="w-4 h-4" />
                {language === 'fr' ? 'Ajouter' : 'Add'}
              </button>
            )}
          </div>
        </div>

        {/* Filter Panel */}
        {showFilters && filters && filters.length > 0 && (
          <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{language === 'fr' ? 'Filtres avances' : 'Advanced Filters'}</span>
              {activeFilterCount > 0 && (
                <button onClick={clearFilters} className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1">
                  <X className="w-3 h-3" />
                  {language === 'fr' ? 'Effacer tout' : 'Clear all'}
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {filters.map(filter => (
                <div key={filter.key}>
                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">{filter.label}</label>
                  {filter.type === 'select' ? (
                    <select
                      value={activeFilters[filter.key] || ''}
                      onChange={e => { setActiveFilters(prev => ({ ...prev, [filter.key]: e.target.value })); setCurrentPage(1); }}
                      className="w-full px-3 py-1.5 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--naftal-blue)]"
                    >
                      <option value="">{language === 'fr' ? 'Tous' : 'All'}</option>
                      {filter.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  ) : filter.type === 'date' ? (
                    <div className="flex gap-2">
                      <input
                        type="date"
                        value={activeFilters[filter.key + '_from'] || ''}
                        onChange={e => { setActiveFilters(prev => ({ ...prev, [filter.key + '_from']: e.target.value })); setCurrentPage(1); }}
                        className="flex-1 px-2 py-1.5 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--naftal-blue)]"
                      />
                      <input
                        type="date"
                        value={activeFilters[filter.key + '_to'] || ''}
                        onChange={e => { setActiveFilters(prev => ({ ...prev, [filter.key + '_to']: e.target.value })); setCurrentPage(1); }}
                        className="flex-1 px-2 py-1.5 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--naftal-blue)]"
                      />
                    </div>
                  ) : (
                    <input
                      type="text"
                      value={activeFilters[filter.key] || ''}
                      onChange={e => { setActiveFilters(prev => ({ ...prev, [filter.key]: e.target.value })); setCurrentPage(1); }}
                      placeholder={filter.label}
                      className="w-full px-3 py-1.5 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--naftal-blue)]"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto table-row-stagger">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700/50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                >
                  {column.label}
                </th>
              ))}
              {(onEdit || onDelete || onView) && (
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {language === 'fr' ? 'Actions' : 'Actions'}
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {paginatedData.length > 0 ? (
              paginatedData.map((row, index) => (
                <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  {columns.map((column) => (
                    <td key={column.key} className="px-4 py-3 text-sm">
                      {column.render ? (
                        column.render(row[column.key], row)
                      ) : column.key === 'status' || column.key === 'etat' ? (
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusClass(row[column.key])}`}>
                          {typeof row[column.key] === 'object' && row[column.key] ? JSON.stringify(row[column.key]) : row[column.key]}
                        </span>
                      ) : (
                        <span className="text-gray-900 dark:text-white">{typeof row[column.key] === 'object' && row[column.key] ? ((row[column.key] as any).name || JSON.stringify(row[column.key])) : row[column.key]}</span>
                      )}
                    </td>
                  ))}
                  {(onEdit || onDelete || onView) && (
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {onView && (
                          <button
                            onClick={() => onView(row)}
                            className="p-1.5 text-gray-500 hover:text-[var(--naftal-blue)] hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        )}
                        {onEdit && canEdit && (
                          <button
                            onClick={() => onEdit(row)}
                            className="p-1.5 text-gray-500 hover:text-[var(--naftal-yellow)] hover:bg-yellow-50 dark:hover:bg-yellow-900/20 rounded transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        )}
                        {onDelete && canDelete && (
                          <button
                            onClick={() => { setDeleteTarget(row); setDeleteError(''); }}
                            className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length + (onEdit || onDelete || onView ? 1 : 0)}
                  className="px-4 py-8 text-center text-gray-500 dark:text-gray-400"
                >
                  {language === 'fr' ? 'Aucune donnee disponible' : 'No data available'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="p-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {language === 'fr' 
              ? `Affichage de ${(currentPage - 1) * itemsPerPage + 1} a ${Math.min(currentPage * itemsPerPage, filteredData.length)} sur ${filteredData.length}`
              : `Showing ${(currentPage - 1) * itemsPerPage + 1} to ${Math.min(currentPage * itemsPerPage, filteredData.length)} of ${filteredData.length}`
            }
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg border border-gray-200 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm text-gray-700 dark:text-gray-300">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg border border-gray-200 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 modal-overlay-enter">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full modal-content-enter">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                  <Trash2 className="w-5 h-5 text-red-600 dark:text-red-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {language === 'fr' ? 'Confirmer la suppression' : 'Confirm Delete'}
                </h3>
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                {language === 'fr'
                  ? `Êtes-vous sûr de vouloir supprimer "${deleteTarget.name || deleteTarget.serial || deleteTarget.code || deleteTarget.card_serial || deleteTarget.discharge || deleteTarget.card_number || ''}" ? Cette action est irréversible.`
                  : `Are you sure you want to delete "${deleteTarget.name || deleteTarget.serial || deleteTarget.code || deleteTarget.card_serial || deleteTarget.discharge || deleteTarget.card_number || ''}"? This action cannot be undone.`}
              </p>
              {deleteError && (
                <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-sm text-red-600 dark:text-red-400">{deleteError}</p>
                </div>
              )}
            </div>
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
              <button
                onClick={() => { setDeleteTarget(null); setDeleteError(''); }}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm font-medium"
              >
                {language === 'fr' ? 'Annuler' : 'Cancel'}
              </button>
              <button
                onClick={async () => {
                  try {
                    await onDelete?.(deleteTarget);
                    setDeleteTarget(null);
                    setDeleteError('');
                  } catch (err: any) {
                    setDeleteError(err?.response?.data?.message || err?.message || (language === 'fr' ? 'Erreur lors de la suppression' : 'Delete failed'));
                  }
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
              >
                {language === 'fr' ? 'Supprimer' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;
