import { useState, useEffect } from 'react';
import { DashboardKPIs } from '../shared/schema';

export function useKPIData() {
  //Chaque appel à setData ou setIsLoading provoque un re-rendu du composant
  // ce qui est essentiel pour refléter les changements dans l’interface utilisateur.
  const [data, setData] = useState<DashboardKPIs[] | null>(null); // Initialisé à null
  const [isLoading, setIsLoading] = useState(true); // Initialisé à true : données sont en cours de chargement.

  // exécute la fonction fetchKPIData une seule fois lorsque le composant qui utilise ce hook est monté
  //  grâce au tableau de dépendances vide ([]).
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
        const activitiesResult = await activitiesResponse.json(); // [{ totalActivities: 3 }]

        // Combiner les résultats en un seul objet DashboardKPIs
        const combinedData: DashboardKPIs = {
          "totalAgents": agentsResult[0]?.totalAgents || 0,
          "totalSites": sitesResult[0]?.totalSites || 0,
          "totalTeams": teamsResult[0]?.totalTeams || 0,
          "totalActivities": activitiesResult[0]?.totalActivities || 0,
        };

        // Met à jour l’état data avec un tableau contenant l’objet combinedData
        setData([combinedData]);
        //console.log("KPI Data fetched successfully:", combinedData);
      } catch (error) {
        console.error('Error fetching KPI data:', error);
        // En cas d'erreur, retourner un tableau avec un objet par défaut
        setData([{ "totalAgents": 0, "totalSites": 0, "totalTeams": 0, "totalActivities": 0 }]);
      } finally { // s’exécute qu’il y ait une erreur ou non.
        setIsLoading(false); //Passe à false une fois les appels API terminés (succès ou échec).
      }
    };

    fetchKPIData();
  }, []);

  return { data, isLoading };
}