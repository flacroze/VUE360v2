import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Clock, TrendingUp, Loader2, Activity } from "lucide-react";
import type { FilterOptions } from "../shared/schema";

interface PlanningSummaryCardsProps {
  filters: FilterOptions;
  onDataChange?: () => void;
}

interface DayData {
  date: string;
  dayOfWeek: string;
  plannedHours: number;
  assignedHours: number;
  utilizationRate: number;
}

interface DailyHoursData {
  data: DayData[];
  totalPlannedHours: number;
  totalAssignedHours: number;
  averageUtilizationRate: number;
}

export default function PlanningSummaryCards({ filters }: PlanningSummaryCardsProps) {
  // Fetch schedule summary
  const { data: scheduleSummary, isLoading: isLoadingSchedule } = useQuery<DailyHoursData>({
    queryKey: ['/api/planning/daily-breakdown', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.siteId) params.append('siteId', filters.siteId.toString());
      if (filters.contractType) params.append('contractType', filters.contractType);
      if (filters.teamId) params.append('teamId', filters.teamId.toString());
      if (filters.groupId) params.append('groupId', filters.groupId.toString());
      if (filters.activityId) params.append('activityId', filters.activityId.toString());
      if (filters.skillLevel) params.append('skillLevel', filters.skillLevel.toString());
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      
      //console.log("Params : ", params);
      

      const response = await fetch(`/api/planning/daily-breakdown?${params}`);
      
      if (!response.ok) throw new Error('Failed to fetch schedule summary');
      return response.json();
    },
  });

  const hasDateFilters = filters.startDate || filters.endDate;
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
      {/* Schedule Summary Cards */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Heures planifiées</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {isLoadingSchedule ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <div className="text-2xl font-bold">{scheduleSummary?.totalPlannedHours.toLocaleString() || 0}h</div>
              <p className="text-xs text-muted-foreground">
                {hasDateFilters ? 'Période sélectionnée' : 'Total général'}
              </p>
            </>
          )}
        </CardContent>
      </Card>

      {/* <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Nombre d'horaires</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {isLoadingSchedule ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <div className="text-2xl font-bold">{scheduleSummary?.totalShifts || 0}</div>
              <p className="text-xs text-muted-foreground">
                Moy. {scheduleSummary?.averageHoursPerAgent || 0}h/agent
              </p>
            </>
          )}
        </CardContent>
      </Card> */}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Heures affectées</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {isLoadingSchedule ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <div className="text-2xl font-bold">{scheduleSummary?.totalAssignedHours?.toLocaleString() || 0}h</div>
              <p className="text-xs text-muted-foreground">
                Activités assignées
              </p>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Taux d'affectation</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {isLoadingSchedule ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <div className="text-2xl font-bold">{scheduleSummary?.averageUtilizationRate || 0}%</div>
              <p className="text-xs text-muted-foreground">
                Affectées / Planifiées
              </p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
