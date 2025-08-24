import { useQuery } from "@tanstack/react-query";
import FilterPanel from "../components/FilterPanel";
import { useFilters } from "../components/hooks/useFilters";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "../components/ui/table";
import { Badge } from "../components/ui/badge";
import SkillsRepartChart from "../components/skills/SkillsRepartHistogram";
import AgentSkills from "../components/skills/SkillsAgent";

/**
 * Type for chart repartition items
 */
type RepartItem = {
  name: string;
  level: number;
  count: number;
};

/**
 * Types locaux (assurent cohérence avec la response backend)
 * backend retourne: { activities: [...], levels: string[], data: [{ activityId, activityName, levels: Record<string, number> }, ...] }
 */
type RawLevels = Record<string, number>;

interface SkillsMatrixRowBackend {
  activityId: number;
  activityName: string;
  levels: RawLevels | null | undefined;
}

interface SkillsMatrix {
  activities?: { id: number; name: string }[];
  levels: string[];
  data: SkillsMatrixRowBackend[];
}

export default function Skills() {
  const { filters, updateFilter, clearFilters } = useFilters();

  const queryKey = ["/api/skills/matrix", filters] as const;

  const { data: skillsMatrix, isLoading, error } = useQuery<SkillsMatrix, Error>({
    queryKey,
    queryFn: async (): Promise<SkillsMatrix> => {
      const params = new URLSearchParams();
      if (filters.siteId) params.append("siteId", String(filters.siteId));
      if (filters.contractType) params.append("contractType", String(filters.contractType));
      if (filters.teamId) params.append("teamId", String(filters.teamId));
      if (filters.groupId) params.append("groupId", String(filters.groupId));
      if (filters.experienceId) params.append("experienceId", String(filters.experienceId));
      if (filters.contextId) params.append("contextId", String(filters.contextId));
      const qs = params.toString();

      const response = await fetch(`/api/skills/matrix${qs ? `?${qs}` : ""}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch skills matrix: ${response.status}`);
      }
      const matrix = (await response.json()) as SkillsMatrix;
      return matrix;
    },
    enabled: true,
  });

  const getLevelBadgeVariant = (level: string, count: number) => {
    if (!Number.isFinite(count) || count === 0) return "outline";
    switch (level) {
      case "Aucun":
        return "destructive";
      case "En cours":
        return "secondary";
      case "Acquis":
        return "default";
      case "Expert":
        return "default";
      default:
        return "outline";
    }
  };

  const getLevelBadgeClassName = (level: string) => {
    switch (level) {
      case "Aucun":
        return "bg-gray-200 text-gray-700";
      case "En cours":
        return "bg-yellow-200 text-yellow-700";
      case "Acquis":
        return "bg-blue-200 text-blue-700";
      case "Expert":
        return "bg-green-200 text-green-700";
      default:
        return "";
    }
  };

  // Transform skillsMatrix.data into RepartItem[] for chart
  const chartData: RepartItem[] = (skillsMatrix?.data ?? []).flatMap((row) =>
    skillsMatrix?.levels.map((level, idx) => ({
      name: row.activityName,
      level: idx,
      count: Number(row.levels?.[level] ?? 0),
    })) ?? []
  );

  return (
    <>
      <header className="bg-white shadow-sm border-b border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <span>🪪</span>
            Matrice des compétences
          </h1>
        </div>
      </header>

      <FilterPanel filters={filters} onUpdateFilter={updateFilter} onClearFilters={clearFilters} />

      <div className="p-6 space-y-6">
        {isLoading ? (
          <div className="flex items-center justify-center h-40">
            <span className="ml-2 text-gray-600">Chargement de la matrice des compétences...</span>
          </div>
        ) : error ? (
          <div className="text-red-600">Erreur: {error.message}</div>
        ) : skillsMatrix && Array.isArray(skillsMatrix.data) && skillsMatrix.data.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-semibold">Activité</TableHead>
                  {skillsMatrix.levels.map((level: string) => (
                    <TableHead key={level} className="text-center font-semibold">
                      {level}
                    </TableHead>
                  ))}
                  <TableHead className="text-center font-semibold">Total</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {skillsMatrix.data.map((row: SkillsMatrixRowBackend) => {
                  const levelsObj: RawLevels = row.levels ?? {};
                  const total = Object.values(levelsObj).reduce<number>((sum, val) => sum + Number(val ?? 0), 0);

                  return (
                    <TableRow key={row.activityId}>
                      <TableCell className="font-medium">{row.activityName}</TableCell>

                      {skillsMatrix.levels.map((level: string) => {
                        const raw = levelsObj[level];
                        const count = Number.isFinite(Number(raw)) ? Number(raw) : 0;
                        return (
                          <TableCell key={level} className="text-center">
                            <Badge variant={getLevelBadgeVariant(level, count)} className={getLevelBadgeClassName(level)}>
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
          <div className="flex flex-col items-center justify-center h-64 text-gray-400">
            <span className="text-4xl mb-2">🏅</span>
            <span>Aucune compétence pour les filtres sélectionnés</span>
          </div>
        )}
      </div>

      <div className="p-6 space-y-6">
        {/* render chart when chart data present */}
        {chartData && Array.isArray(chartData) && chartData.length > 0 && (
          <SkillsRepartChart data={chartData} levels={skillsMatrix?.levels} />
        )}
      </div>
      <AgentSkills 
        filters={filters} 
      />

    </>
  );
}