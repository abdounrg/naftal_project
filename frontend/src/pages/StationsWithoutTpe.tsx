import { useState, useEffect } from 'react';
import { MapPinOff } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import DataTable from '../components/DataTable';
import { useLanguage } from '../context/LanguageContext';
import { dashboardApi } from '../lib/api';

interface StationRow {
  id: number;
  code: string;
  name: string;
  wilaya: string | null;
  address: string | null;
  structure: {
    id: number;
    name: string;
    code: string;
    district: { id: number; name: string; code: string };
  };
}

const StationsWithoutTpe = () => {
  const { language } = useLanguage();
  const [stations, setStations] = useState<StationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setError(null);
        const res = await dashboardApi.getStationsWithoutTpe();
        setStations(res.data.data);
      } catch (err: any) {
        console.error('Failed to fetch stations without TPE:', err);
        const msg = err?.response?.data?.message
          || err?.message
          || (language === 'fr' ? 'Impossible de charger les stations sans TPE.' : 'Failed to load stations without TPE.');
        setError(msg);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [language]);

  const columns = [
    { key: 'code', label: language === 'fr' ? 'Code Station' : 'Station Code' },
    { key: 'name', label: language === 'fr' ? 'Nom Station' : 'Station Name' },
    {
      key: 'structure_name',
      label: language === 'fr' ? 'Structure' : 'Structure',
      render: (_: any, row: any) => row.structure?.name || '-',
    },
    {
      key: 'district_name',
      label: language === 'fr' ? 'District' : 'District',
      render: (_: any, row: any) => row.structure?.district?.name || '-',
    },
    { key: 'wilaya', label: language === 'fr' ? 'Wilaya' : 'Wilaya' },
  ];

  const filters = [
    {
      key: 'district_name',
      label: language === 'fr' ? 'District' : 'District',
      type: 'select' as const,
      options: [...new Set(stations.map((s) => s.structure?.district?.name).filter(Boolean))] as string[],
    },
    {
      key: 'structure_name',
      label: language === 'fr' ? 'Structure' : 'Structure',
      type: 'select' as const,
      options: [...new Set(stations.map((s) => s.structure?.name).filter(Boolean))] as string[],
    },
    {
      key: 'wilaya',
      label: language === 'fr' ? 'Wilaya' : 'Wilaya',
      type: 'select' as const,
      options: [...new Set(stations.map((s) => s.wilaya).filter(Boolean))] as string[],
    },
  ];

  const tableData = stations.map((s) => ({
    ...s,
    structure_name: s.structure?.name || '-',
    district_name: s.structure?.district?.name || '-',
    wilaya: s.wilaya || '-',
  }));

  if (loading) {
    return (
      <DashboardLayout
        title={language === 'fr' ? 'Stations sans TPE' : 'Stations without TPE'}
        subtitle={language === 'fr' ? 'Liste des stations ne disposant pas de terminaux' : 'List of stations with no TPE devices'}
      >
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500 dark:text-gray-400">
            {language === 'fr' ? 'Chargement...' : 'Loading...'}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title={language === 'fr' ? 'Stations sans TPE' : 'Stations without TPE'}
      subtitle={language === 'fr' ? `${stations.length} station(s) sans terminaux de paiement` : `${stations.length} station(s) without payment terminals`}
    >
      {error && (
        <div className="mb-4 p-3 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 text-sm text-red-700 dark:text-red-300">
          {error}
        </div>
      )}
      <div className="flex items-center gap-2 mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
        <MapPinOff className="w-5 h-5 text-red-500" />
        <span className="text-sm text-red-700 dark:text-red-300">
          {language === 'fr'
            ? `${stations.length} station(s) n'ont aucun TPE attribué.`
            : `${stations.length} station(s) have no TPE assigned.`}
        </span>
      </div>
      <DataTable
        columns={columns}
        data={tableData}
        title={language === 'fr' ? 'Stations sans TPE' : 'Stations without TPE'}
        section="dashboard"
        filters={filters}
      />
    </DashboardLayout>
  );
};

export default StationsWithoutTpe;
