import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { ChartPie, Users, Calendar, BarChart3, Database, FileText, MapPin} from "lucide-react";
//import { ChartPie, Users, Calendar, BarChart3, FileText, MapPin, Download, Database} from "lucide-react";
import { cn } from "../../lib/utils";

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  section: string;
}

const navigation: NavigationItem[] = [
  { name: "Accueil", href: "/", icon: Calendar, section: "PRINCIPAL" },
  { name: "Agents", href: "/agents", icon: Users, section: "ANALYSES" },
  { name: "Compétences", href: "/skills", icon: BarChart3, section: "ANALYSES" },
  { name: "Dimensionnements", href: "/dimensionnements", icon: ChartPie, section: "ANALYSES" },
  { name: "Plannings", href: "/plannings", icon: FileText, section: "ANALYSES" },
  { name: "Equité", href: "/equity", icon: MapPin, section: "ANALYSES" },
];

const sections = ["PRINCIPAL", "ANALYSES"];

export default function Sidebar() {
  const [location] = useLocation();
  
const { data: healthStatus, error } = useQuery<{ status: string; timestamp: string }>({
  queryKey: ['/api/health'],
  queryFn: () => fetch('http://localhost:3001/api/health').then(res => res.json()),
  refetchInterval: 30000,
});
if (error) console.error('Health check error:', error);

  const isActive = (href: string) => {
    if (href === "/" && location === "/") return true;
    if (href !== "/" && location.startsWith(href)) return true;
    return false;
  };

  return (
    <div className="w-64 bg-white shadow-lg flex-shrink-0 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-primary">VUE 360°</h1>
        <p className="text-sm text-gray-600 mt-1">PLANNINGS+</p>
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-2 flex-1">
        {sections.map((section) => (
          <div key={section} className="mb-6">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              {section}
            </h3>
            {navigation
              .filter((item) => item.section === section)
              .map((item) => {
                const Icon = item.icon;
                return (
                  <Link key={item.name} href={item.href}>
                    <div
                      className={cn(
                        "flex items-center p-3 rounded-lg font-medium transition-colors cursor-pointer",
                        isActive(item.href)
                          ? "text-primary bg-blue-50"
                          : "text-gray-700 hover:bg-gray-100"
                      )}
                    >
                      <Icon className="mr-3 h-5 w-5" />
                      {item.name}
                    </div>
                  </Link>
                );
              })}
          </div>
        ))}
      </nav>

      {/* Database Status */}
      <div className="p-4">
        <div className={cn(
          "border rounded-lg p-3",
          healthStatus?.status === 'connected' 
            ? "bg-green-50 border-green-200" 
            : "bg-red-50 border-red-200"
        )}>
          <div className="flex items-center">
            <div className={cn(
              "w-2 h-2 rounded-full mr-2",
              healthStatus?.status === 'connected' ? "bg-green-500" : "bg-red-500"
            )} />
            <Database className="w-4 h-4 mr-2" />
            <span className={cn(
              "text-sm font-medium",
              healthStatus?.status === 'connected' ? "text-green-700" : "text-red-700"
            )}>
              {healthStatus?.status === 'connected' ? 'Connecté' : 'Non connecté'}
            </span>
          </div>
          {healthStatus?.timestamp && (
            <p className={cn(
              "text-xs mt-1",
              healthStatus?.status === 'connected' ? "text-green-600" : "text-red-600"
            )}>
              Dernière vérif: {new Date(healthStatus.timestamp).toLocaleTimeString('fr-FR', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

