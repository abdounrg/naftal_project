import { useEffect, useState, useRef } from 'react';
import { Search, Filter, Plus, Download, Upload, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Edit, Trash2, Eye, X, SlidersHorizontal } from 'lucide-react';
import * as XLSX from 'xlsx';
import { useLanguage } from '../context/LanguageContext';
import { usePermissions } from '../hooks/usePermissions';
import { useDashboardSearch } from '../context/DashboardSearchContext';
import { DatePicker } from './ui/date-picker';

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
  section?: string;
  onAdd?: () => void;
  onEdit?: (row: any) => void;
  onDelete?: (row: any) => void;
  onView?: (row: any) => void;
  filters?: FilterConfig[];
  onImport?: (data: any[]) => void;
}

const DataTable = ({ columns, data, title, section, onAdd, onEdit, onDelete, onView, filters, onImport }: DataTableProps) => {
  const { language } = useLanguage();
  const { searchTerm: dashboardSearchTerm } = useDashboardSearch();
  const { can } = usePermissions();
  const canAdd = section ? can(section, 'create') : true;
  const canEdit = section ? can(section, 'edit') : true;
  const canDelete = section ? can(section, 'delete') : true;
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [deleteError, setDeleteError] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const itemsPerPage = 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [dashboardSearchTerm]);

  const filteredData = data.filter(row => {
    const searchTerms = [dashboardSearchTerm, searchTerm]
      .map(term => term.trim().toLowerCase())
      .filter(Boolean);
    const matchesSearch = searchTerms.every(term =>
      Object.values(row).some(value => String(value ?? '').toLowerCase().includes(term))
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
      'volé': 'bg-gray-100 text-gray-800 dark:bg-slate-900 dark:text-gray-200',
      'en_traitement': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      'a_retourner': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      'en_circulation': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      'defectueux': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      'expire': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      'perdu': 'bg-gray-100 text-gray-800 dark:bg-slate-900 dark:text-gray-200',
    };
    return statusMap[status] || 'bg-gray-100 text-gray-800';
  };

  const getDeleteTargetLabel = (row: any) => {
    const firstTruthy = [
      row?.name,
      row?.serial,
      row?.card_serial,
      row?.code,
      row?.source && row?.destination ? `${row.source} -> ${row.destination}` : '',
      row?.discharge,
      row?.card_number,
      row?.id ? `#${row.id}` : '',
    ].find((v) => typeof v === 'string' ? v.trim().length > 0 : Boolean(v));

    return String(firstTruthy ?? (language === 'fr' ? 'cet element' : 'this item'));
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-card border border-slate-200/60 dark:border-slate-800/60 overflow-hidden table-enter">
      {/* Header */}
      <div className="p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{title}</h3>
            <span className="px-2.5 py-0.5 text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-gray-300 rounded-full">
              {filteredData.length}
            </span>
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            {/* Search */}
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
              <input
                type="text"
                placeholder={language === 'fr' ? 'Rechercher...' : 'Search...'}
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                className="pl-9 pr-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-[13px] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400/50 focus:bg-white dark:focus:bg-slate-800 w-52 transition-all"
              />
            </div>

            {/* Filter Button */}
            {filters && filters.length > 0 && (
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${
                  activeFilterCount > 0
                    ? 'bg-blue-500 text-white shadow-sm'
                    : showFilters
                    ? 'bg-gray-100 dark:bg-slate-800 text-slate-700 dark:text-gray-300'
                    : 'border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-gray-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span className="hidden sm:inline">{language === 'fr' ? 'Filtres' : 'Filters'}</span>
                {activeFilterCount > 0 && (
                  <span className="w-5 h-5 rounded-full bg-white/20 text-xs flex items-center justify-center font-bold">{activeFilterCount}</span>
                )}
              </button>
            )}

            <div className="w-px h-6 bg-slate-200 dark:bg-gray-600 hidden sm:block" />

            {/* Export Button */}
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-3.5 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-[13px] text-slate-500 dark:text-gray-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-gray-300 transition-all"
              title={language === 'fr' ? 'Exporter en Excel' : 'Export to Excel'}
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">{language === 'fr' ? 'Exporter' : 'Export'}</span>
            </button>

            {/* Import Button */}
            {onImport && canAdd && (
              <>
                <input type="file" ref={fileInputRef} accept=".xlsx,.xls" onChange={handleImport} className="hidden" aria-label="Import file" />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 px-3.5 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-[13px] text-slate-500 dark:text-gray-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-gray-300 transition-all"
                  title={language === 'fr' ? 'Importer un fichier' : 'Import file'}
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
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-xl text-[13px] font-medium hover:bg-blue-600 shadow-sm hover:shadow-md active:scale-[0.98] transition-all"
              >
                <Plus className="w-4 h-4" />
                {language === 'fr' ? 'Ajouter' : 'Add'}
              </button>
            )}
          </div>
        </div>

        {/* Filter Panel */}
        {showFilters && filters && filters.length > 0 && (
          <div className="mt-4 p-4 bg-slate-50/80 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-700/50">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Filter className="w-3.5 h-3.5 text-slate-500" />
                <span className="text-sm font-medium text-slate-700 dark:text-gray-300">{language === 'fr' ? 'Filtres avances' : 'Advanced Filters'}</span>
              </div>
              {activeFilterCount > 0 && (
                <button onClick={clearFilters} className="text-xs text-red-500 hover:text-red-600 flex items-center gap-1 font-medium transition-colors">
                  <X className="w-3 h-3" />
                  {language === 'fr' ? 'Effacer' : 'Clear'}
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {filters.map(filter => (
                <div key={filter.key}>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">{filter.label}</label>
                  {filter.type === 'select' ? (
                    <select
                      aria-label={filter.label}
                      value={activeFilters[filter.key] || ''}
                      onChange={e => { setActiveFilters(prev => ({ ...prev, [filter.key]: e.target.value })); setCurrentPage(1); }}
                      className="w-full px-3 py-2 border border-gray-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    >
                      <option value="">{language === 'fr' ? 'Tous' : 'All'}</option>
                      {filter.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  ) : filter.type === 'date' ? (
                    <div className="flex gap-2">
                      <DatePicker
                        value={activeFilters[filter.key + '_from'] || ''}
                        onChange={v => { setActiveFilters(prev => ({ ...prev, [filter.key + '_from']: v })); setCurrentPage(1); }}
                        placeholder={language === 'fr' ? 'Du' : 'From'}
                      />
                      <DatePicker
                        value={activeFilters[filter.key + '_to'] || ''}
                        onChange={v => { setActiveFilters(prev => ({ ...prev, [filter.key + '_to']: v })); setCurrentPage(1); }}
                        placeholder={language === 'fr' ? 'Au' : 'To'}
                      />
                    </div>
                  ) : (
                    <input
                      type="text"
                      value={activeFilters[filter.key] || ''}
                      onChange={e => { setActiveFilters(prev => ({ ...prev, [filter.key]: e.target.value })); setCurrentPage(1); }}
                      placeholder={filter.label}
                      className="w-full px-3 py-2 border border-gray-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50/80 dark:bg-slate-800/40 border-y border-slate-100 dark:border-slate-700/50">
              {columns.map((column) => (
                <th
                  key={column.key}
                  className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wider"
                >
                  {column.label}
                </th>
              ))}
              {(onEdit || onDelete || onView) && (
                <th className="px-5 py-3.5 text-right text-xs font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wider">
                  {language === 'fr' ? 'Actions' : 'Actions'}
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100/80 dark:divide-slate-800/50">
            {paginatedData.length > 0 ? (
              paginatedData.map((row, index) => (
                <tr key={index} className="group hover:bg-blue-50/40 dark:hover:bg-blue-500/5 transition-colors duration-150">
                  {columns.map((column) => (
                    <td key={column.key} className="px-5 py-3.5 text-sm">
                      {column.render ? (
                        column.render(row[column.key], row)
                      ) : column.key === 'status' || column.key === 'etat' ? (
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium ${getStatusClass(row[column.key])}`}>
                          {typeof row[column.key] === 'object' && row[column.key] ? JSON.stringify(row[column.key]) : row[column.key]}
                        </span>
                      ) : (
                        <span className="text-slate-700 dark:text-gray-200">{typeof row[column.key] === 'object' && row[column.key] ? ((row[column.key] as any).name || JSON.stringify(row[column.key])) : row[column.key]}</span>
                      )}
                    </td>
                  ))}
                  {(onEdit || onDelete || onView) && (
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                        {onView && (
                          <button
                            onClick={() => onView(row)}
                            className="p-2 text-gray-500 hover:text-[var(--naftal-blue)] hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all"
                            title={language === 'fr' ? 'Voir' : 'View'}
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        )}
                        {onEdit && canEdit && (
                          <button
                            onClick={() => onEdit(row)}
                            className="p-2 text-gray-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg transition-all"
                            title={language === 'fr' ? 'Modifier' : 'Edit'}
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        )}
                        {onDelete && canDelete && (
                          <button
                            onClick={() => { setDeleteTarget(row); setDeleteError(''); }}
                            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                            title={language === 'fr' ? 'Supprimer' : 'Delete'}
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
                  className="px-5 py-16 text-center"
                >
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                      <Search className="w-5 h-5 text-slate-400" />
                    </div>
                    <p className="text-sm text-slate-500 dark:text-gray-400 font-medium">
                      {language === 'fr' ? 'Aucune donnee disponible' : 'No data available'}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      {searchTerm || activeFilterCount > 0
                        ? (language === 'fr' ? 'Essayez de modifier vos filtres' : 'Try adjusting your filters')
                        : (language === 'fr' ? 'Les donnees apparaitront ici' : 'Data will appear here')}
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-5 py-4 border-t border-slate-100 dark:border-gray-700/60 flex items-center justify-between">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            <span className="font-medium text-gray-700 dark:text-gray-300">{(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, filteredData.length)}</span>
            {' '}{language === 'fr' ? 'sur' : 'of'}{' '}
            <span className="font-medium text-gray-700 dark:text-gray-300">{filteredData.length}</span>
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title={language === 'fr' ? 'Premiere page' : 'First page'}
            >
              <ChevronsLeft className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </button>
            <button
              aria-label="Previous page"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <ChevronLeft className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </button>
            {/* Page Numbers */}
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let page: number;
              if (totalPages <= 5) {
                page = i + 1;
              } else if (currentPage <= 3) {
                page = i + 1;
              } else if (currentPage >= totalPages - 2) {
                page = totalPages - 4 + i;
              } else {
                page = currentPage - 2 + i;
              }
              return (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-8 h-8 rounded-lg text-[13px] font-medium transition-all ${
                    currentPage === page
                      ? 'bg-blue-500 text-white shadow-sm'
                      : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {page}
                </button>
              );
            })}
            <button
              aria-label="Next page"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <ChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </button>
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title={language === 'fr' ? 'Derniere page' : 'Last page'}
            >
              <ChevronsRight className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-elevated max-w-md w-full border border-slate-200/60 dark:border-slate-800/60">
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0">
                  <Trash2 className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {language === 'fr' ? 'Confirmer la suppression' : 'Confirm Delete'}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                    {language === 'fr' ? 'Cette action est irreversible' : 'This action cannot be undone'}
                  </p>
                </div>
              </div>
              <div className="p-3.5 bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-100 dark:border-red-800/30">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {language === 'fr'
                    ? `Supprimer "${getDeleteTargetLabel(deleteTarget)}" ?`
                    : `Delete "${getDeleteTargetLabel(deleteTarget)}"?`}
                </p>
              </div>
              {deleteError && (
                <div className="mt-3 p-3.5 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl">
                  <p className="text-sm text-red-600 dark:text-red-400">{deleteError}</p>
                </div>
              )}
            </div>
            <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-700/60 flex justify-end gap-3">
              <button
                onClick={() => { setDeleteTarget(null); setDeleteError(''); }}
                 disabled={isDeleting}
                  className="px-4 py-2.5 border border-gray-200 dark:border-slate-700 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all text-sm font-medium disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {language === 'fr' ? 'Annuler' : 'Cancel'}
              </button>
              <button
                onClick={async () => {
                  try {
                      setIsDeleting(true);
                      await onDelete?.(deleteTarget);
                      setDeleteTarget(null);
                      setDeleteError('');
                  } catch (err: any) {
                    setDeleteError(err?.response?.data?.message || err?.message || (language === 'fr' ? 'Erreur lors de la suppression' : 'Delete failed'));
                    } finally {
                      setIsDeleting(false);
                  }
                }}
                  disabled={isDeleting}
                  className="px-4 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 shadow-md shadow-red-500/20 active:scale-[0.98] transition-all text-sm font-medium disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
              >
                  {isDeleting && <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />}
                  {language === 'fr' ? (isDeleting ? 'Suppression...' : 'Supprimer') : (isDeleting ? 'Deleting...' : 'Delete')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;
