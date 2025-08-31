import KPICards from "../components/accueil/kpi-cards";
import PlanningSummaryCards from "../components/plannings/planning-summary-cards";
import { useKPIData } from "../components/hooks/useKPIAccueil";
import { FilterOptions } from "../components/shared/schema";


export default function Accueil() {
  const { data, isLoading } = useKPIData();
  
// Définir filters avec startDate et endDate à aujourd'hui
  const today = new Date(); // Date actuelle : 28 août 2025 15:30 CEST
  const filters: FilterOptions = {
    startDate: today.toISOString().split('T')[0], // Format "2025-08-28"
    endDate: today.toISOString().split('T')[0],   // Format "2025-08-28"
  };

  // Vérification pour éviter les erreurs si data est null
  if (!data) {
    return <div>Chargement des données...</div>; // Ou un composant de chargement
  }

  return (
    <div>      
      <div className="mt-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Bienvenue sur l'écran d'accueil   
        </h2>
        <p className="text-gray-600 mb-6">
          Cet écran permet de visualiser les principales métriques et indicateurs du jour.

          ajouter : heures planifiées, heures affectées, activités pour la journée, etc.
        </p>
      </div>
      <KPICards data={data} isLoading={isLoading} />
            <div className="mt-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Statistiques de la journée   
        </h2>
        <p className="text-gray-600 mb-6">
          commentaire
        </p>
      </div>
      <PlanningSummaryCards filters={filters} /> 
    </div>
  );
}
