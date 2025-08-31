import React, { useState, useEffect } from 'react';
import { User, Award, AlertCircle, Search } from 'lucide-react';

// Types pour les données
type AgentSkillData = {
  lastName: string;
  firstName: string;
  activityName: string;
  level: number;
};

type AgentSkillsProps = {
  filters: any;
  onDataChange?: (data: AgentSkillData[]) => void;
};
// onDataChange: Une fonction de rappel optionnelle (grâce à ?) qui prend un tableau de AgentSkillData en argument
// et ne retourne rien (void). Elle permet au composant parent d’être notifié lorsque les données changent.

// Configuration des niveaux
const SKILL_LEVELS = {
  0: { label: 'Aucun', color: 'bg-gray-400 text-white border-gray-300' },
  1: { label: 'En cours', color: 'bg-yellow-400 text-yellow border-yellow-300' },
  2: { label: 'Acquis', color: 'bg-blue-400 text-white border-green-300' },
  3: { label: 'Expert', color: 'bg-green-400 text-green border-blue-300' }
} as const;

const AgentSkills: React.FC<AgentSkillsProps> = ({ filters, onDataChange }) => {
  const [data, setData] = useState<AgentSkillData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== "") {
            params.append(key, String(value));
          }
        });

        //console.log('Fetching skills with URL:', `/api/skills/agent?${params.toString()}`);

        const response = await fetch(`/api/skills/agent?${params.toString()}`);

        if (!response.ok) {
          const errorText = await response.text();
          console.error('Server error:', response.status, errorText);
          throw new Error(`HTTP error! ${response.status}: ${errorText}`);
        }

        const responseData: AgentSkillData[] = await response.json();
        //console.log('Received skills data:', responseData);
        setData(responseData);
        onDataChange?.(responseData);
      } catch (err: any) {
        console.error('Fetch error:', err);
        setError(err.message);
        setData([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [filters, onDataChange]);

  // Traitement des données : grouper par agent et éliminer les doublons
  const processedData = React.useMemo(() => {
    if (!data || data.length === 0) return [];

    // Grouper par agent
    const groupedByAgent = data.reduce((acc, item) => {
      const agentKey = `${item.lastName}_${item.firstName}`;
      if (!acc[agentKey]) {
        acc[agentKey] = {
          lastName: item.lastName,
          firstName: item.firstName,
          skills: new Map() // Utiliser une Map pour éviter les doublons
        };
      }
      
      // Utiliser activityName comme clé pour éviter les doublons
      // Si l'activité existe déjà, on garde le niveau le plus élevé
      const existingLevel = acc[agentKey].skills.get(item.activityName);
      if (existingLevel === undefined || item.level > existingLevel) {
        acc[agentKey].skills.set(item.activityName, item.level);
      }
      
      return acc;
    }, {} as Record<string, { 
      lastName: string; 
      firstName: string; 
      skills: Map<string, number>
    }>);

    // Convertir en tableau et trier
    return Object.values(groupedByAgent)
      .map(agent => ({
        ...agent,
        fullName: `${agent.firstName} ${agent.lastName}`,
        skills: Array.from(agent.skills.entries())
          .map(([activityName, level]) => ({ activityName, level }))
          .sort((a, b) => a.activityName.localeCompare(b.activityName))
      }))
      .sort((a, b) => a.lastName.localeCompare(b.lastName));
  }, [data]);

  // Filtrage des données
  const filteredData = React.useMemo(() => {
    return processedData.filter(agent => {
      // Filtre par nom
      const matchesSearch = searchTerm === '' || 
        agent.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        agent.skills.some(skill => skill.activityName.toLowerCase().includes(searchTerm.toLowerCase()));
      
      // Filtre par niveau
      const matchesLevel = selectedLevel === null || 
        agent.skills.some(skill => skill.level === selectedLevel);
      
      return matchesSearch && matchesLevel;
    });
  }, [processedData, searchTerm, selectedLevel]);

  // Badge de compétence
  const SkillBadge: React.FC<{ skill: string; level: number }> = ({ skill, level }) => {
    const levelConfig = SKILL_LEVELS[level as keyof typeof SKILL_LEVELS];
    return (
      <div className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${levelConfig.color}`}>
        <span className="truncate max-w-32" title={skill}>{skill}</span>
        <span className="ml-1.5 font-semibold">({levelConfig.label})</span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="text-center text-gray-500">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p>Chargement des compétences...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* En-tête */}
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="h-5 w-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">
              Détail des compétences par agent
            </h2>
          </div>
          <div className="text-sm text-gray-600">
            {filteredData.length} agent{filteredData.length > 1 ? 's' : ''}
          </div>
        </div>
      </div>

      {/* Filtres */}
      <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Recherche */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un agent ou une activité..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          {/* Filtre par niveau */}
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedLevel(null)}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                selectedLevel === null 
                  ? 'bg-blue-100 text-blue-700 border border-blue-300' 
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              Tous
            </button>
            {Object.entries(SKILL_LEVELS).map(([level, config]) => (
              <button
                key={level}
                onClick={() => setSelectedLevel(parseInt(level))}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors border ${
                  selectedLevel === parseInt(level) 
                    ? config.color.replace('bg-', 'bg-').replace('text-', 'text-').replace('border-', 'border-')
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                {config.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Affichage des erreurs */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 m-4">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
            <span className="text-red-800 font-medium">Erreur: {error}</span>
          </div>
        </div>
      )}

      {/* Résumé */}
      {data.length > 0 && (
        <div className="px-6 py-2 border-t border-gray-200">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
            {Object.entries(SKILL_LEVELS).map(([level, config]) => {
              const count = data.filter(item => item.level === parseInt(level)).length;
              return (
                <div key={level} className="text-center">
                  <td className="text-gray-600">{config.label}</td>
                  <td className="px-4 font-medium text-gray-900">{count}</td>
                  <td className={`w-5 h-3 rounded-full mx-auto mb-1 ${config.color.split(' ')[0]}`}></td>                                    
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Liste des agents */}
      <div className="p-6">
        {filteredData.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <User className="h-8 w-8 mx-auto mb-2" />
            <p>Aucun agent trouvé avec ces critères</p>
          </div>
        ) : (
          <div className="space-y-1">
            {filteredData.map((agent, index) => (
              <div key={`${agent.lastName}_${agent.firstName}_${index}`} 
                   className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                {/* Agent et compétences sur la même ligne */}
                <div className="flex items-center gap-4">
                  {/* Informations agent */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-s gap-2 font-semibold text-gray-900">
                        {agent.firstName} {agent.lastName}
                      </h3>
                      {/* <p className="text-sm text-gray-600">
                        {agent.skills.length} compétence{agent.skills.length > 1 ? 's' : ''}
                      </p> */}
                    </div>
                  </div>

                  {/* Badges des compétences */}
                  <div className="flex flex-wrap gap-2 flex-1 min-w-0">
                    {agent.skills.map((skill, skillIndex) => (
                      <SkillBadge 
                        key={`${skill.activityName}_${skillIndex}`}
                        skill={skill.activityName} 
                        level={skill.level} 
                      />
                    ))}
                  </div>

                  {/* Statistiques rapides */}
                  <div className="flex gap-2 text-xs flex-shrink-0">
                    {Object.entries(SKILL_LEVELS).map(([level, config]) => {
                      const count = agent.skills.filter(s => s.level === parseInt(level)).length;
                      return count > 0 ? (
                        <span key={level} className={`px-2 py-1 rounded-full border ${config.color}`}>
                          {count}
                        </span>
                      ) : null;
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      
    </div>
  );
};

export default AgentSkills;