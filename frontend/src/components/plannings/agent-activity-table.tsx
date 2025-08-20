import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import type { AgentActivityBreakdown, FilterOptions } from "../shared/schema";

interface AgentActivityTableProps {
  filters: FilterOptions;
}

export function AgentActivityTable({ filters }: AgentActivityTableProps) {
  const { data: breakdown, isLoading, error } = useQuery<AgentActivityBreakdown[]>({
    queryKey: ['/api/planning/agent-activity-breakdown', JSON.stringify(filters)],
    queryFn: async () => {
      const params = new URLSearchParams();

      // Contract type mapping: text to number
      const contractTypeMapping: Record<string, number> = {
        'CDI': 0,
        'CDD': 1,
        'Intérim': 2,
        'Alternance': 3,
        'Stage': 4,
        'Autre': 5
      };

      if (filters.siteId) params.append('siteId', filters.siteId.toString());
      if (filters.contractType !== undefined) {
        if (typeof filters.contractType === 'string') {
          const numericContractType = contractTypeMapping[filters.contractType];
          if (numericContractType !== undefined) {
            params.append('contractType', numericContractType.toString());
          }
        } else {
          params.append('contractType', String(filters.contractType));
        }
      }
      if (filters.teamId !== undefined && filters.teamId !== null) params.append('teamId', filters.teamId.toString());
      if (filters.groupId !== undefined && filters.groupId !== null) params.append('groupId', filters.groupId.toString());
      if (filters.activityId) params.append('activityId', filters.activityId.toString());
      if (filters.skillLevel !== undefined) params.append('skillLevel', filters.skillLevel.toString());
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);

      const url = `/api/planning/agent-activity-breakdown?${params.toString()}`;
      console.log('Fetching agent activity breakdown:', url);
      console.log('Original filters:', filters);
      console.log('Contract type conversion:', filters.contractType, '->', contractTypeMapping[filters.contractType as string]);

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Failed to fetch agent activity breakdown: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Agent activity breakdown data:', data);
      return data;
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Répartition d'activités par agent</CardTitle>
          <p className="text-sm text-muted-foreground">
            Détail des heures planifiées et affectées par activité avec pourcentages
          </p>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-12 bg-gray-200 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-red-600">Erreur - Répartition d'activités par agent</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-600">Erreur lors du chargement des données d'activité des agents</p>
        </CardContent>
      </Card>
    );
  }

  if (!breakdown || breakdown.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Répartition d'activités par agent</CardTitle>
          <p className="text-sm text-muted-foreground">
            Détail des heures planifiées et affectées par activité avec pourcentages
          </p>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground">Aucun agent trouvé pour les filtres sélectionnés</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Répartition d'activités par agent ({breakdown.length} agents)</CardTitle>
        <p className="text-sm text-muted-foreground">
          Détail des heures planifiées et affectées par activité avec pourcentages
        </p>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 px-4 font-medium">Agent</th>
                <th className="text-left py-2 px-4 font-medium">Heures planifiées</th>
                <th className="text-left py-2 px-4 font-medium">Heures affectées</th>
                <th className="text-left py-2 px-4 font-medium">Répartition par activité</th>
              </tr>
            </thead>
            <tbody>
              {breakdown.map((agent, index) => (
                <tr key={agent.agentId} className={index % 2 === 0 ? 'bg-gray-50 dark:bg-gray-800' : ''}>
                  <td className="py-3 px-4 font-medium">{agent.agentName}</td>
                  <td className="py-3 px-4">{(agent.plannedHours || 0).toFixed(1)}h</td>
                  <td className="py-3 px-4">{(agent.totalAssignedHours || 0).toFixed(1)}h</td>
                  <td className="py-3 px-4">
                    <div className="flex flex-wrap gap-1">
                      {agent.activities && agent.activities.map((activity, actIndex) => (
                        <Badge
                          key={actIndex}
                          variant="secondary"
                          className="text-xs"
                        >
                          {typeof activity === 'string' 
                            ? activity 
                            : `${activity.activityName}: ${activity.assignedHours}h (${activity.percentage}%)`
                          }
                        </Badge>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
