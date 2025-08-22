import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import type { FilterOptions } from "../../components/shared/schema";

const FILTERS_STORAGE_KEY = "vue360-filters";

// Mapping des routes vers les sections
const routeToSection: Record<string, string> = {
  "/": "PRINCIPAL",
  "/accueil": "ANALYSES", 
  "/agents": "ANALYSES",
  "/skills": "ANALYSES",
  "/planning": "ANALYSES",
  "/equity": "ANALYSES",
  "/dimensionnements": "ANALYSES",
  // Ajouter d'autres routes si nécessaire
};

function getCurrentSection(pathname: string): string {
  return routeToSection[pathname] || "PRINCIPAL";
}

function loadFiltersFromStorage(section: string): FilterOptions {
  try {
    const allFilters = localStorage.getItem(FILTERS_STORAGE_KEY);
    const filtersData = allFilters ? JSON.parse(allFilters) : {};
    return filtersData[section] || {};
  } catch (error) {
    console.warn("Erreur lors du chargement des filtres depuis localStorage:", error);
    return {};
  }
}

function saveFiltersToStorage(section: string, filters: FilterOptions) {
  try {
    const allFilters = localStorage.getItem(FILTERS_STORAGE_KEY);
    const filtersData = allFilters ? JSON.parse(allFilters) : {};
    filtersData[section] = filters;
    localStorage.setItem(FILTERS_STORAGE_KEY, JSON.stringify(filtersData));
  } catch (error) {
    console.warn("Erreur lors de la sauvegarde des filtres dans localStorage:", error);
  }
}

export function useFilters() {
  const [location] = useLocation();
  const section = getCurrentSection(location);
  
  const [filters, setFilters] = useState<FilterOptions>(() => loadFiltersFromStorage(section));

  // Charger les filtres de la section courante quand on change de page
  useEffect(() => {
    const sectionFilters = loadFiltersFromStorage(section);
    setFilters(sectionFilters);
  }, [section]);

  // Sauvegarder les filtres de la section courante quand ils changent
  useEffect(() => {
    saveFiltersToStorage(section, filters);
  }, [section, filters]);

  const updateFilter = (key: keyof FilterOptions, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearFilters = () => {
    // Préserver les dates de période d'analyse lors de l'effacement des filtres
    const { startDate, endDate } = filters;
    setFilters({
      startDate,
      endDate
    });
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== undefined);

  return {
    filters,
    updateFilter,
    clearFilters,
    hasActiveFilters,
    section
  };
}
