import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Fonction pour obtenir le lundi de la semaine courante
export function getMonday(date = new Date()) {
  const d = new Date(date);
  const day = d.getDay(); // 0 = dimanche, 1 = lundi, ..., 6 = samedi
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Ajustement pour dimanche
  return new Date(d.setDate(diff));
}

// Fonction pour obtenir le dimanche de la semaine courante
export function getSunday(date = new Date()) {
  const monday = getMonday(date);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  return sunday;
}

// Fonction pour formater en YYYY-MM-DD (format ISO)
export function formatDate(date: Date ): string {
  return date.toISOString().split('T')[0];
}

const CONTRACT_MAPPING = {
  // Code -> Libellé
  codeToNature: {
    0: "CDI",
    1: "CDD",
    2: "Intérim",
    3: "Alternance",
    4: "Stage",
    5: "Autre"
  } as Record<number, string>,
  
  // Libellé -> Code
  natureToCode: {
    "CDI": 0,
    "CDD": 1,
    "Intérim": 2,
    "Alternance": 3,
    "Stage": 4,
    "Autre": 5
  } as Record<string, number>
};

export function getContractNature(code: number): string {
  return CONTRACT_MAPPING.codeToNature[code] ?? "Inconnu";
}

export function getContractCode(nature: string): number {
  return CONTRACT_MAPPING.natureToCode[nature] ?? -1;
}