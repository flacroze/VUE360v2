import React, { useState, useEffect } from 'react';
import { ChevronDown, X } from 'lucide-react';
import { FilterOptions, Activity } from "../components/shared/schema";

interface ActivityFilterProps {
  filters?: FilterOptions;
  selectedActivityId?: number | null;
  onActivityChange: (activityId: number | null) => void;
}

// Composant de filtre d'activité
const ActivityFilter: React.FC<ActivityFilterProps> = ({
  filters,
  onActivityChange // Utilisez cette prop pour notifier le parent
}) => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Chargement des activités
  useEffect(() => {
    const fetchActivities = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/activities`); 
        
        const contentType = response.headers.get("Content-Type") || "";

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Erreur HTTP ${response.status} - ${errorText}`);
        }

        if (!contentType.includes("application/json")) {
          const rawText = await response.text();
          throw new Error(`Réponse non JSON reçue : ${rawText.slice(0, 100)}...`);
        }
        const activities: Activity[] = await response.json();

        if (activities.length === 0) {
          console.warn("Aucune activité trouvée pour cette période.");
          setActivities([]);
          setLoading(false);
          return;
        }
        setActivities(activities);
        setLoading(false);
      } catch (err: any) {
        console.error("Fetch error:", err.message);
        setLoading(false);
      }
    };

    fetchActivities();
  }, []);

  // Activité sélectionnée
  const selectedActivity = activities.find(a => a.id === filters?.activityId);
  const selectedActivityId = selectedActivity ? selectedActivity.id : null;
  const placeholder = "Sélectionner une activité";
  const disabled = loading || activities.length === 0;

  // Gestion de la sélection - CORRIGÉ
  const handleSelect = (activityId: number | null) => {
    // Notifier le composant parent du changement
    onActivityChange(activityId);
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <div className={`relative`}>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Activité
      </label>
      
      {/* Bouton de sélection */}
      <div className="relative">
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled || loading}
          className={`
            relative w-full bg-white border border-gray-300 rounded-md pl-3 pr-10 py-2 text-left cursor-default focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm
            ${disabled || loading ? 'bg-gray-50 cursor-not-allowed' : 'hover:border-gray-400'}
          `}
        >
          <span className="block truncate">
            {loading ? (
              "Chargement..."
            ) : selectedActivity ? (
              <span>
                <span className="font-medium">{selectedActivity.name}</span>
                {selectedActivity.code && (
                  <span className="text-gray-500 ml-1">({selectedActivity.code})</span>
                )}
              </span>
            ) : (
              <span className="text-gray-500">{placeholder}</span>
            )}
          </span>
          
          {/* Icône de dropdown */}
          <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
            ) : (
              <ChevronDown className={`h-5 w-5 text-gray-400 transform transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            )}
          </span>
        </button>

        {/* Bouton de réinitialisation */}
        {selectedActivity && !disabled && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleSelect(null);
            }}
            className="absolute inset-y-0 right-8 flex items-center pr-1 hover:bg-gray-100 rounded"
          >
            <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
          </button>
        )}
      </div>

      {/* Dropdown menu */}
      {isOpen && !loading && (
        <div className="absolute z-50 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
          {/* Barre de recherche */}
          <div className="p-2 border-b border-gray-200">
            <input
              type="text"
              placeholder="Rechercher une activité..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
          </div>

          {/* Option "Toutes les activités" */}
          <button
            type="button"
            onClick={() => handleSelect(null)}
            className={`
              w-full text-left px-3 py-2 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none
              ${!selectedActivityId ? 'bg-blue-50 text-blue-900' : 'text-gray-900'}
            `}
          >
            <span className="font-medium">Toutes les activités</span>
            <span className="text-gray-500 block text-xs">Afficher toutes les activités</span>
          </button>

          {/* Liste des activités */}
          {activities
            .filter(a => a.name.toLowerCase().includes(searchTerm.toLowerCase()) || (a.code && a.code.toLowerCase().includes(searchTerm.toLowerCase())))
            .map(activity => (
              <button
                key={activity.id}
                type="button"
                onClick={() => handleSelect(activity.id)}
                className={`
                  w-full text-left px-3 py-2 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none
                  ${selectedActivityId === activity.id ? 'bg-blue-50 text-blue-900' : 'text-gray-900'}
                `}
              >
                <span className="font-medium">{activity.name}</span>
                {activity.code && (
                  <span className="text-gray-500 ml-1">({activity.code})</span>
                )}
              </button>
            ))}     
        </div>
      )}

      {/* Overlay pour fermer le dropdown */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default ActivityFilter;