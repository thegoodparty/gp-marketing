'use client';

import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

type ElectionsLandingSearchContextValue = {
	searchQuery: string;
	setSearchQuery(value: string): void;
};

const ElectionsLandingSearchContext = createContext<ElectionsLandingSearchContextValue | null>(null);

export function ElectionsLandingSearchProvider({ children }: { children: ReactNode }) {
	const [searchQuery, setSearchQuery] = useState('');
	const value = useMemo(() => ({ searchQuery, setSearchQuery }), [searchQuery]);
	return <ElectionsLandingSearchContext.Provider value={value}>{children}</ElectionsLandingSearchContext.Provider>;
}

export function useElectionsLandingSearch() {
	return useContext(ElectionsLandingSearchContext);
}
