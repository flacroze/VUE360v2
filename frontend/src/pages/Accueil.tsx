import KPICards from "../components/accueil/kpi-cards";
import { useKPIData } from "../components/hooks/useKPIAccueil";

export default function Accueil() {
  const { data, isLoading } = useKPIData();
  //console.log("KPI Data:", data, "Loading:", isLoading);

  // Vérification pour éviter les erreurs si data est null
  if (!data) {
    return <div>Chargement des données...</div>; // Ou un composant de chargement
  }

  return (
    <div>
      <KPICards data={data} isLoading={isLoading} />
      <div className="mt-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Bienvenue sur l'écran d'accueil   
        </h2>
        <p className="text-gray-600 mb-6">
          Cet écran permet de visualiser les principales métriques et indicateurs du jour.

          ajouter : heures planifiées, heures affectées, activités pour la journée, etc.
        </p>
      </div> 
    </div>
  );
}
