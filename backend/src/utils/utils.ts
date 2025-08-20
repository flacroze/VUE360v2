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