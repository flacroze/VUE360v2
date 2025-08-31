import { ReactNode } from "react";
import Sidebar from "./Sidebar";

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="flex h-screen">
      {/* Sidebar avec largeur fixe */}
      <div className="w-64 flex-shrink-0">
        <Sidebar />
      </div>

      {/* Contenu principal qui prend tout l’espace restant */}
      <main className="flex-1 overflow-auto p-6 bg-gray-50">
        {children}
      </main>
    </div>
  );
}
