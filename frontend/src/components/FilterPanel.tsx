import { useQuery } from "@tanstack/react-query";
import { X } from "lucide-react";
import { Button } from "./ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import type { FilterOptions, Site, Team, Group, Experience, Context } from "../components/shared/schema";

interface FilterPanelProps {
  filters: FilterOptions;
  onUpdateFilter: (key: keyof FilterOptions, value: any) => void;
  onClearFilters: () => void;
}

export default function FilterPanel({ filters, onUpdateFilter, onClearFilters }: FilterPanelProps) {
  const { data: sites } = useQuery<Site[]>({
    queryKey: ["sites"],
    queryFn: async () => {
      const res = await fetch('api/sites');
      if (!res.ok) throw new Error("Failed to fetch sites");
      return res.json();
    }
  });

  const { data: teams } = useQuery<Team[]>({
    queryKey: ["teams"],
    queryFn: async () => {
      const res = await fetch('api/teams');
      if (!res.ok) throw new Error("Failed to fetch teams");
      return res.json();
    }
  });

  const { data: groups } = useQuery<Group[]>({
    queryKey: ["groups"],
    queryFn: async () => {
      const res = await fetch('api/groups');
      if (!res.ok) throw new Error("Failed to fetch groups");
      return res.json();
    }
  });

  const { data: experiences } = useQuery<Experience[]>({
    queryKey: ["experiences"],
    queryFn: async () => {
      const res = await fetch('api/experiences');
      if (!res.ok) throw new Error("Failed to fetch experiences");
      return res.json();
    }
  });

  const { data: contexts } = useQuery<Context[]>({
    queryKey: ["contexts"],
    queryFn: async () => {
      const res = await fetch('api/contexts');
      if (!res.ok) throw new Error("Failed to fetch contexts");
      return res.json();
    }
  });

  const hasActiveFilters = Object.entries(filters).some(([key, value]) => 
    key !== 'startDate' && key !== 'endDate' && value !== undefined && value !== null && value !== ''
  );

  return (
    <div className="bg-white border-b border-gray-200 p-6">
      <div className="flex items-center space-x-4 flex-wrap gap-y-2">
        <h3 className="text-sm font-semibold text-gray-700">Filtres:</h3>
        
        {/* Site Filter */}
        <Select 
          value={filters.siteId?.toString() || "all"} 
          onValueChange={(value) => onUpdateFilter('siteId', value === "all" ? undefined : parseInt(value))}
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Tous les sites" />
          </SelectTrigger>
          <SelectContent className="bg-white opacity-100">
            <SelectItem value="all">Tous les sites</SelectItem>
            {sites?.map((site) => (
              <SelectItem key={site.id} value={site.id.toString()}>
                {site.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Contract Type Filter */}
        <Select 
          value={filters.contractType || "all"} 
          onValueChange={(value) => onUpdateFilter('contractType', value === "all" ? undefined : value)}
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Type de contrat" />
          </SelectTrigger>
          <SelectContent className="bg-white opacity-100">
            <SelectItem value="all">Tous les contrats</SelectItem>
            <SelectItem value="CDI">CDI</SelectItem>
            <SelectItem value="CDD">CDD</SelectItem>
            <SelectItem value="Intérim">Intérim</SelectItem>
            <SelectItem value="Alternance">Alternance</SelectItem>
            <SelectItem value="Stage">Stage</SelectItem>
            <SelectItem value="Autre">Autre</SelectItem>
          </SelectContent>
        </Select>
        
        {/* Team Filter */}
        <Select 
          value={filters.teamId?.toString() || "all"} 
          onValueChange={(value) => onUpdateFilter('teamId', value === "all" ? undefined : parseInt(value))}
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Toutes les équipes" />
          </SelectTrigger>
          <SelectContent className="bg-white opacity-100">
            <SelectItem value="all">Toutes les équipes</SelectItem>
            {teams?.map((team) => (
              <SelectItem key={team.id} value={team.id.toString()}>
                {team.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        {/* Group Filter */}
        <Select 
          value={filters.groupId?.toString() || "all"} 
          onValueChange={(value) => onUpdateFilter('groupId', value === "all" ? undefined : parseInt(value))}
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Tous les groupes" />
          </SelectTrigger>
          <SelectContent className="bg-white opacity-100">
            <SelectItem value="all">Tous les groupes</SelectItem>
            {groups?.map((group) => (
              <SelectItem key={group.id} value={group.id.toString()}>
                {group.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Experience Filter */}
        <Select 
          value={filters.experienceId?.toString() || "all"} 
          onValueChange={(value) => onUpdateFilter('experienceId', value === "all" ? undefined : parseInt(value))}
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Toutes les expériences" />
          </SelectTrigger>
          <SelectContent className="bg-white opacity-100">
            <SelectItem value="all">Toutes les expériences</SelectItem>
            {experiences?.map((experience) => (
              <SelectItem key={experience.id} value={experience.id.toString()}>
                {experience.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Context Filter */}
        <Select 
          value={filters.contextId?.toString() || "all"} 
          onValueChange={(value) => onUpdateFilter('contextId', value === "all" ? undefined : parseInt(value))}
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Tous les contextes" />
          </SelectTrigger>
          <SelectContent className="bg-white opacity-100">
            <SelectItem value="all">Tous les contextes</SelectItem>
            {contexts?.map((context) => (
              <SelectItem key={context.id} value={context.id.toString()}>
                {context.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        {hasActiveFilters && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onClearFilters}
            className="gap-1"
          >
            <X className="h-4 w-4" />
            Effacer
          </Button>
        )}
      </div>
    </div>
  );
}
