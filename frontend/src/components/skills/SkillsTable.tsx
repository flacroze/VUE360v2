import React, { useEffect, useState } from "react";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import type { SkillsMatrixProps, RawSkillsMatrixRow, SkillsMatrixRowDG } from "../../components/shared/schema";


const SkillsMatrixTable: React.FC<SkillsMatrixProps> = ({ filters }) => {
  const [skills, setSkills] = useState<SkillsMatrixRowDG[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSkills = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== "") {
            params.append(key, String(value));
          }
        });
        const response = await fetch(`/api/skills/matrix?${params.toString()}`);
        if (!response.ok) throw new Error(`HTTP error! ${response.status}`);

        const result = await response.json();
        // Transforme le format pour le DataGrid
        const transformed: SkillsMatrixRowDG[] = [];
        if (result.data && Array.isArray(result.data)) {
          result.data.forEach((row: RawSkillsMatrixRow) => {
            Object.entries(row.levels).forEach(([level, count]) => {
              transformed.push({
                activityId: row.activityId,
                activityName: row.activityName,
                level: level, // <-- string
                count: Number(count),
              });
            });
          });


        }
        setSkills(transformed);
        console.log("Data for SkillsTable:", transformed);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSkills();
  }, [filters]);

  const columns: GridColDef[] = [
    { field: "activityId", headerName: "ID", width: 90 },
    { field: "activityName", headerName: "Activité", width: 150 },
    { field: "level", headerName: "Niveau", width: 150 },
    { field: "count", headerName: "Nombre", width: 150 },
  ];

  if (loading) return <p>Chargement...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (!skills.length) return <p>Aucune compétence trouvée.</p>;

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">
          Compétences ({skills.length})
        </h2>
      </div>
      <div style={{ height: 400, width: "100%" }}>
        <DataGrid
          rows={skills.map((row, idx) => ({ id: idx, ...row }))}
          columns={columns}
          pagination
          paginationModel={{ pageSize: 10, page: 0 }}

/>
      </div>
    </div>
  );
};

export default SkillsMatrixTable;
