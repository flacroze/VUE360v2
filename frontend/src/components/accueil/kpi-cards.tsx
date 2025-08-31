import { Users, CalendarCheck, TrendingUp, ListChecks } from "lucide-react";
import { Card, CardContent } from "../ui/card";
import { Skeleton } from "../ui/skeleton";
import type { DashboardKPIs } from "../shared/schema";

interface KPICardsProps {
  data?: DashboardKPIs[];
  isLoading: boolean;
}

export default function KPICards({ data, isLoading }: KPICardsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="vue360-kpi-card">
            <CardContent className="p-6">
              <div className="flex items-center">
                <Skeleton className="h-12 w-12 rounded-lg" />
                <div className="ml-4 space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-8 w-16" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Extraire le premier objet du tableau, ou utiliser un objet par défaut
  const kpiData = data?.[0] || {
    totalAgents: 0,
    totalSites: 0,
    totalTeams: 0,
    totalActivities: 0, // Mettez à jour selon le nom correct
  };

  const kpis = [
    {
      title: "Agents",
      value: kpiData.totalAgents || 0,
      icon: Users,
      bgColor: "bg-blue-100",
      iconColor: "text-primary",
    },
    {
      title: "Sites",
      value: kpiData.totalSites || 0,
      icon: CalendarCheck,
      bgColor: "bg-green-100",
      iconColor: "text-green-600",
    },
    {
      title: "Équipes",
      value: kpiData.totalTeams || 0,
      icon: TrendingUp,
      bgColor: "bg-purple-100",
      iconColor: "text-purple-600",
    },
    {
      title: "Activités",
      value: kpiData.totalActivities || 0, // Mettez à jour selon le nom correct
      icon: ListChecks,
      bgColor: "bg-yellow-100",
      iconColor: "text-yellow-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {kpis.map((kpi, index) => {
        const Icon = kpi.icon;
        return (
          <Card key={index} className="vue360-kpi-card">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className={`${kpi.bgColor} p-3 rounded-lg`}>
                  <Icon className={`${kpi.iconColor} h-6 w-6`} />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">{kpi.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{kpi.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
