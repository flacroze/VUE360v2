import React, { useState, useEffect } from "react";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { Agent, AgentTableProps } from "../components/shared/schema";

// étend les props existantes pour accepter le callback de remontée
type Props = AgentTableProps & {
  onAgentsChange?: (agents: Agent[]) => void;
};

const AgentTable: React.FC<Props> = ({ filters, onAgentsChange }) => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAgents = async () => {
      setLoading(true);
      try {
        // Construire les query params à partir des filtres
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== "") {
            params.append(key, String(value));
          }
        });

        const response = await fetch(`http://localhost:3001/api/agents?${params.toString()}`);

        if (!response.ok) throw new Error(`HTTP error! ${response.status}`);

        const data: Agent[] = await response.json();
        setAgents(data);
        onAgentsChange?.(data); // remonter les données au parent
      } catch (err: any) {
        setError(err.message);
        setAgents([]);
        onAgentsChange?.([]); // informer le parent en cas d'erreur
      } finally {
        setLoading(false);
      }
    };

    fetchAgents();
  }, [filters, onAgentsChange]);

  const columns: GridColDef[] = [
    { field: "id", headerName: "ID", width: 60 },
    { field: "firstName", headerName: "Prénom", width: 150 },
    { field: "lastName", headerName: "Nom", width: 150 },
    { field: "siteName", headerName: "Site", width: 120 },
    { field: "teamName", headerName: "Équipe", width: 120 },
    { field: "groupName", headerName: "Groupe", width: 120 },
    { field: "experienceName", headerName: "Expérience", width: 120 },
    { field: "contextName", headerName: "Contexte", width: 120 },
    {
      field: "contractType",
      headerName: "Type de contrat",
      width: 120,
      renderCell: (params) => (
        <span
          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
            params.value === "CDI"
            ? "bg-green-100 text-green-800"
            : params.value === "CDD"
            ? "bg-blue-100 text-blue-800"
            : params.value === "Intérim"
            ? "bg-yellow-100 text-yellow-800"
            : params.value === "Alternance"
            ? "bg-purple-100 text-purple-800"
            : params.value === "Stage"
            ? "bg-red-100 text-red-800"
            : "bg-gray-100 text-gray-800"
          }`}
        >
          {params.value || "Non défini"}
        </span>
      ),
    },
    { field: "contract", headerName: "Contrat", width: 120 },
    { field: "departureDate", headerName: "Date de départ", width: 120 },
  ];

  if (loading) return <p>Chargement...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (!agents.length) return <p>Aucun agent trouvé.</p>;

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">
          Agents ({agents.length})
        </h2>
      </div>
      <div style={{ marginTop: "20px", height: 800, width: "100%" }}>
        <DataGrid rows={agents} columns={columns} checkboxSelection rowHeight={30} />
      </div>
    </div>
  );
};

export default AgentTable;