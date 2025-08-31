import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Calendar } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import type { DailyScheduleBreakdown, FilterOptions } from "../shared/schema";
import { getContractCode } from "../../lib/utils";

interface DailyScheduleTableProps {
  filters: FilterOptions;
}

export default function DailyScheduleTable({ filters }: DailyScheduleTableProps) {
  const { data: breakdown, isLoading, error } = useQuery<DailyScheduleBreakdown>({
    queryKey: ['/api/planning/daily-breakdown', JSON.stringify(filters)],
    queryFn: async () => {
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
      console.log('Original filters:', filters);

      const url = `/api/planning/daily-breakdown?${params.toString()}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch daily breakdown: ${response.statusText}`);
      }
      console.log('Data:', response.json());

      return response.json();

    },
    //refetchInterval: 30000, // Refresh every 30 seconds
    staleTime: 0, // Data is immediately stale
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Détail quotidien
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            {Array.from({ length: 7 }).map((_, i) => (
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
          <CardTitle className="flex items-center gap-2 text-red-600">
            <Calendar className="h-5 w-5" />
            Erreur - Détail quotidien
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-600">Erreur lors du chargement des données quotidiennes</p>
        </CardContent>
      </Card>
    );
  }

  if (!breakdown) {
    return null;
  }
  console.log('Daily breakdown data:', breakdown);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', { 
      day: '2-digit', 
      month: '2-digit' 
    });
  };

  const getUtilizationColor = (rate: number) => {
    if (rate >= 70) return "text-green-600 bg-green-50";
    if (rate >= 50) return "text-yellow-600 bg-yellow-50";
    return "text-red-600 bg-red-50";
  };

  return (
    <div className="space-y-4">

      {/* Daily Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Détail quotidien - Heures planifiées et affectées
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Jour</TableHead>
                <TableHead className="text-right">Heures planifiées</TableHead>
                <TableHead className="text-right">Heures affectées</TableHead>
                <TableHead className="text-right">Taux d'affectation</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {breakdown.data.map((day) => (
                <TableRow key={day.date}>
                  <TableCell className="font-medium">
                    {formatDate(day.date)}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-normal">
                      {day.dayOfWeek}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    <span className="text-blue-600 font-semibold">
                      {day.plannedHours.toFixed(1)}h
                    </span>
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    <span className="text-green-600 font-semibold">
                      {day.assignedHours.toFixed(1)}h
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge
                      className={`${getUtilizationColor(day.utilizationRate)} font-mono border-0`}
                    >
                      {day.utilizationRate.toFixed(1)}%
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}