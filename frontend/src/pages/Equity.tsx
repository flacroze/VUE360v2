import { useFilters } from "../components/hooks/useFilters";

import FilterPanel from "../components/FilterPanel";
import DateRangeFilter from "../components/plannings/FilterDate";
import ActivityFilter from "../components/FilterActivity";

import { useKPIData } from "../components/hooks/useKPIPlanning";
import AgentOccupancyChart from "../components/plannings/agent-occupancy-chart";

export default function Equity() {
  const { filters, updateFilter, clearFilters } = useFilters();

  const clearDateFilters = () => {
    updateFilter('startDate', undefined);
    updateFilter('endDate', undefined);
  };

  // Fonction pour gérer le changement d'activité - CORRIGÉE
  const handleActivityChange = (activityId: number | null) => {
    updateFilter('activityId', activityId || undefined);
  };
  
  const { data } = useKPIData({ filters });
  
  // Vérification pour éviter les erreurs si data est null
  if (!data) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
          <p className="text-gray-600">Chargement des données...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Equity - Taux d'occupation</h2>
            <p className="text-gray-600 mt-1">Analyse des taux d'occupation des agents par activité</p>
          </div>
        </div>
      </header>

      {/* Contenu principal */}
      <div className="p-6 space-y-6">
        
        {/* Section des filtres */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800">Filtres</h3>
          </div>
          
          <div className="p-4 space-y-4">
            {/* Filtres principaux (équipes, départements, etc.) */}
            <FilterPanel
              filters={filters}
              onUpdateFilter={updateFilter}
              onClearFilters={clearFilters}
            />
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="mt-6">
                {/* Filtre de dates */}
                <DateRangeFilter
                  filters={filters}
                  onUpdateFilter={updateFilter}
                  onClearDates={clearDateFilters}
                />
              </div>
              <div className="mt-6">            
                {/* Filtre d'activité */}
                  <ActivityFilter
                    filters={filters}
                    selectedActivityId={filters.activityId || null}
                    onActivityChange={handleActivityChange}
                  />
              </div>
          </div>
        </div>


        {/* Graphique principal */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <AgentOccupancyChart
            filters={filters}
            className="w-full"
            height="h-[800px]"
          />
        </div>

      </div>
    </div>
  </div>
  );
}