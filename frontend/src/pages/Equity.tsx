import { useFilters } from "../components/hooks/useFilters";

import FilterPanel from "../components/FilterPanel";
import DateRangeFilter from "../components/plannings/date-range-filter";
import PlanningsKPICards   from "../components/plannings/kpi-cards";
import DailyHours from "../components/DailyTime";
import DailyActivities from "../components/DailyActivities";
import { useKPIData } from "../components/hooks/useKPIPlanning";
import AgentOccupancyChart from "../components/plannings/agent-occupancy-chart";

export default function Planning() {
  const { filters, updateFilter, clearFilters } = useFilters();

  const clearDateFilters = () => {
    updateFilter('startDate', undefined);
    updateFilter('endDate', undefined);
  };
  
  const { data } = useKPIData( { filters });
    //console.log("KPI Data:", data, "Loading:", isLoading);
  
    // Vérification pour éviter les erreurs si data est null
    if (!data) {
      return <div>Chargement des données...</div>; // Ou un composant de chargement
    }

  return (
    <>
    <header className="bg-white shadow-sm border-b border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Horaires et Activités</h2>
            <p className="text-gray-600 mt-1">Analyse des horaires et activités des agents</p>
          </div>
        </div>
    </header>

    <div>     
        <FilterPanel
            filters={filters}
            onUpdateFilter={updateFilter}
            onClearFilters={clearFilters}
        />   
    </div>
    <div>
        <DateRangeFilter
            filters={filters}
            onUpdateFilter={updateFilter}
            onClearDates={clearDateFilters}
        />
    </div>

    <div>
      <AgentOccupancyChart
        filters={filters}
        className="my-4"
        height="600px" // Optionnel pour définir la hauteur du graphique
      />
    </div>

    </>
  );
}