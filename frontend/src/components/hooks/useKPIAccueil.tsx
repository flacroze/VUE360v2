import { useState, useEffect } from 'react';
import { DashboardKPIs } from '../shared/schema';

export function useKPIData() {
  const [data, setData] = useState<DashboardKPIs[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchKPIData = async () => {
      try {
        // Effectuer les quatre appels API en parallèle
        const [agentsResponse, sitesResponse, teamsResponse, activitiesResponse] = await Promise.all([
          fetch('/api/kpis/agents'),
          fetch('/api/kpis/sites'),
          fetch('/api/kpis/teams'),
          fetch('/api/kpis/activities'),
        ]);

        // Vérifier que toutes les réponses sont OK
        if (!agentsResponse.ok || !sitesResponse.ok || !teamsResponse.ok || !activitiesResponse.ok) {
          throw new Error('Failed to fetch KPI data');
        }

        // Extraire les données JSON
        const agentsResult = await agentsResponse.json(); // [{ totalAgents: 40 }]
        const sitesResult = await sitesResponse.json(); // [{ totalSites: 2 }]
        const teamsResult = await teamsResponse.json(); // [{ totalTeams: 4 }]
        const activitiesResult = await activitiesResponse.json(); // [{ activeActivities: 3 }]

        // Combiner les résultats en un seul objet DashboardKPIs
        const combinedData: DashboardKPIs = {
          "totalAgents": agentsResult[0]?.totalAgents || 0,
          "totalSites": sitesResult[0]?.totalSites || 0,
          "totalTeams": teamsResult[0]?.totalTeams || 0,
          "totalActivities": activitiesResult[0]?.totalActivities || 0,
        };

        // Envelopper dans un tableau comme demandé
        setData([combinedData]);
        //console.log("KPI Data fetched successfully:", combinedData);
      } catch (error) {
        console.error('Error fetching KPI data:', error);
        // En cas d'erreur, retourner un tableau avec un objet par défaut
        setData([{ "totalAgents": 0, "totalSites": 0, "totalTeams": 0, "totalActivities": 0 }]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchKPIData();
  }, []);

  return { data, isLoading };
}