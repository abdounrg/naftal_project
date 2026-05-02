import { createContext, useContext } from 'react';

interface DashboardSearchContextValue {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
}

export const DashboardSearchContext = createContext<DashboardSearchContextValue>({
  searchTerm: '',
  setSearchTerm: () => undefined,
});

export const useDashboardSearch = () => useContext(DashboardSearchContext);