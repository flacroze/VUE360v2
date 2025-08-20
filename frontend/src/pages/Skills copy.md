import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Badge } from "../components/ui/badge";
import { Award, Loader2, BarChart3 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import FilterPanel from "../components/FilterPanel";
import { useFilters } from "../components/hooks/useFilters";
import type { SkillsMatrix } from "../components/shared/schema";

export default function Skills() {
  const { filters, updateFilter, clearFilters } = useFilters();

  const { data: skillsMatrix, isLoading } = useQuery<SkillsMatrix>({
    queryKey: ['/api/skills/matrix', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.siteId) params.append('siteId', filters.siteId.toString());
      if (filters.contractType) params.append('contractType', filters.contractType);
      if (filters.teamId) params.append('teamId', filters.teamId.toString());
      if (filters.groupId) params.append('groupId', filters.groupId.toString());
      if (filters.activityId) params.append('activityId', filters.activityId.toString());
      if (filters.skillLevel) params.append('skillLevel', filters.skillLevel.toString());
      
      const response = await fetch(`/api/skills/matrix?${params}`);
      if (!response.ok) throw new Error('Failed to fetch skills matrix');
      return response.json();
    },
    enabled: true,
  });

  // const { data: skillsDistribution, isLoading: isLoadingDistribution } = useQuery<{ skillsCount: number, agentsCount: number }[]>({
  //   queryKey: ['/api/skills/distribution', filters],
  //   queryFn: async () => {
  //     const params = new URLSearchParams();
  //     if (filters.siteId) params.append('siteId', filters.siteId.toString());
  //     if (filters.contractType) params.append('contractType', filters.contractType);
  //     if (filters.teamId) params.append('teamId', filters.teamId.toString());
  //     if (filters.groupId) params.append('groupId', filters.groupId.toString());
  //     if (filters.activityId) params.append('activityId', filters.activityId.toString());
  //     if (filters.skillLevel) params.append('skillLevel', filters.skillLevel.toString());
      
  //     const response = await fetch(`/api/skills/distribution?${params}`);
  //     if (!response.ok) throw new Error('Failed to fetch skills distribution');
  //     return response.json();
  //   },
  //   enabled: true,
  // });

  const getLevelBadgeVariant = (level: string, count: number) => {
    if (count === 0) return "outline";
    switch (level) {
      case 'Aucun': return "destructive";
      case 'En cours': return "secondary";
      case 'Acquis': return "default";
      case 'Expert': return "default";
      default: return "outline";
    }
  };

  const getLevelBadgeClassName = (level: string) => {
    switch (level) {
      case 'Aucun': return "bg-red-100 text-red-800 hover:bg-red-100";
      case 'En cours': return "bg-orange-100 text-orange-800 hover:bg-orange-100";
      case 'Acquis': return "bg-blue-100 text-blue-800 hover:bg-blue-100";
      case 'Expert': return "bg-green-100 text-green-800 hover:bg-green-100";
      default: return "";
    }
  };

  return (
    <>
      <header className="bg-white shadow-sm border-b border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Analyse des Compétences</h2>
            <p className="text-gray-600 mt-1">Matrice des compétences par niveau et activité</p>
          </div>
        </div>
      </header>

      {/* Filters */}
      <FilterPanel 
        filters={filters} 
        onUpdateFilter={updateFilter}
        onClearFilters={clearFilters}
      />

      <div className="p-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Matrice des compétences
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                <span className="ml-2 text-gray-600">Chargement de la matrice des compétences...</span>
              </div>
            ) : skillsMatrix && skillsMatrix.data.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="font-semibold">Activité</TableHead>
                      {skillsMatrix.levels.map((level) => (
                        <TableHead key={level} className="text-center font-semibold">
                          {level}
                        </TableHead>
                      ))}
                      <TableHead className="text-center font-semibold">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {skillsMatrix.data.map((row) => {
                      const total = Object.values(row.level).reduce((sum, count) => sum + count, 0);
                      return (
                        <TableRow key={row.activityId}>
                          <TableCell className="font-medium">
                            {row.activityName}
                          </TableCell>
                          {skillsMatrix.levels.map((level) => {
                            const count = row.level[level] || 0;
                            return (
                              <TableCell key={level} className="text-center">
                                <Badge 
                                  variant={getLevelBadgeVariant(level, count)}
                                  className={getLevelBadgeClassName(level)}
                                >
                                  {count}
                                </Badge>
                              </TableCell>
                            );
                          })}
                          <TableCell className="text-center">
                            <Badge variant="outline" className="font-semibold">
                              {total}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                <Award className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Aucune donnée de compétence disponible pour les filtres sélectionnés</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Distribution des agents par nombre de compétences
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingDistribution ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                <span className="ml-2 text-gray-600">Chargement de la distribution...</span>
              </div>
            ) : skillsDistribution && skillsDistribution.length > 0 ? (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={skillsDistribution} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="skillsCount" 
                      label={{ value: 'Nombre de compétences actives', position: 'insideBottom', offset: -5 }}
                    />
                    <YAxis 
                      label={{ value: 'Nombre d\'agents', angle: -90, position: 'insideLeft' }}
                    />
                    <Tooltip 
                      formatter={(value, name) => [value, 'Nombre d\'agents']}
                      labelFormatter={(label) => `${label} compétence${label !== 1 ? 's' : ''}`}
                    />
                    <Bar 
                      dataKey="agentsCount" 
                      fill="#3b82f6" 
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Aucune donnée de distribution disponible pour les filtres sélectionnés</p>
              </div>
            )}
          </CardContent>
        </Card> */}
      </div>
    </>
  );
}