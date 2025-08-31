import { useState } from "react";
import { useFilters } from "../components/hooks/useFilters";

import FilterPanel from "../components/FilterPanel";
import AgentTable from "../components/AgentTable";
import AgentsContractsPieChart from "../components/AgentsContractsPieChart";
import AgentsTeamsPieChart from "../components/AgentsTeamPieChart";

import { Agent } from "../components/shared/schema";

export default function Agents() {
  const { filters, updateFilter, clearFilters } = useFilters();
  const [agents, setAgents] = useState<Agent[]>([]);

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Agents</h1>

      <FilterPanel
        filters={filters}
        onUpdateFilter={updateFilter}
        onClearFilters={clearFilters}
      />

      {/* Piechart contrats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="mt-6">
          <AgentsContractsPieChart agents={agents} />
        </div>
        <div className="mt-6">
          <AgentsTeamsPieChart agents={agents} />
        </div>
      </div>

      {/* Tableau des agents */}
      <div className="mt-6">
        <AgentTable filters={filters} onAgentsChange={setAgents} />
      </div>
    </div>
  );
}

