import { useState, useEffect } from 'react';
import { PlanningsKPIs } from '../shared/schema';
import { FilterOptions } from '../shared/schema';
import { getContractCode } from '../../lib/utils';

interface useKPIDataProps {
  filters: FilterOptions;
}
export function useKPIData({ filters }: useKPIDataProps){
  const [data, setData] = useState<PlanningsKPIs[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchKPIData = async () => {
      try {

        const params = new URLSearchParams();
        if (filters.siteId) params.append('siteId', filters.siteId.toString());
        if (filters.contractType !== undefined) {
          if (typeof filters.contractType === 'string') {
            const numericContractType = getContractCode(filters.contractType);
            if (numericContractType !== undefined) {
              params.append('contractType', numericContractType.toString());
            }
          } else {
            params.append('contractType', String(filters.contractType));
          }
        }
        if (filters.teamId !== undefined && filters.teamId !== null) params.append('teamId', filters.teamId.toString());
        if (filters.groupId !== undefined && filters.groupId !== null) params.append('groupId', filters.groupId.toString());
        if (filters.experienceId) params.append('experienceId', filters.experienceId.toString());
        if (filters.contextId) params.append('contextId', filters.contextId.toString());
        if (filters.startDate) params.append('startDate', filters.startDate);
        if (filters.endDate) params.append('endDate', filters.endDate);
        //console.log('Original filters for KPI :', filters);

        // Effectuer les quatre appels API en parallèle
        const url = `/api/planning/kpi/agents/max?${params.toString()}`;
        const [agentsResponse, teamsResponse, activitiesResponse] = await Promise.all([
          fetch(url),
          fetch('/api/kpis/teams'),
          fetch('/api/kpis/activities'),
        ]);

        // Vérifier que toutes les réponses sont OK
        if (!agentsResponse.ok || !teamsResponse.ok || !activitiesResponse.ok) {
          throw new Error('Failed to fetch KPI data');
        }

        // Extraire les données JSON
        const agentsResult = await agentsResponse.json(); // [{ totalAgents: 40 }]
        const teamsResult = await teamsResponse.json(); // [{ totalTeams: 4 }]
        const activitiesResult = await activitiesResponse.json(); // [{ activeActivities: 3 }]

        // Combiner les résultats en un seul objet DashboardKPIs
        const combinedData: PlanningsKPIs = {
          "totalAgents": agentsResult[0]?.totalAgents || 0,
          "totalTeams": teamsResult[0]?.totalTeams || 0,
          "totalActivities": activitiesResult[0]?.totalActivities || 0,
        };
        //console.log("KPI Data fetched successfully:", combinedData);

        // Envelopper dans un tableau comme demandé
        setData([combinedData]);
        //console.log("KPI Data fetched successfully:", combinedData);
      } catch (error) {
        console.error('Error fetching KPI data:', error);
        // En cas d'erreur, retourner un tableau avec un objet par défaut
        setData([{ "totalAgents": 0, "totalTeams": 0, "totalActivities": 0 }]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchKPIData();
  }, [filters]);
  // les données KPI dépendent des filtres. Si l’utilisateur change un filtre (par exemple, sélectionne un autre siteId
  //  dans l’interface), le hook doit relancer les appels API pour refléter les nouvelles données filtrées.

  return { data, isLoading };
}