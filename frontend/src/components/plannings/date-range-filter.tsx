import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Calendar, X } from "lucide-react";
import type { FilterOptions } from "../shared/schema";

interface DateRangeFilterProps {
  filters: FilterOptions;
  onUpdateFilter: (key: keyof FilterOptions, value: any) => void;
  onClearDates: () => void;
}

export default function DateRangeFilter({ filters, onUpdateFilter, onClearDates }: DateRangeFilterProps) {
  const formatDateForInput = (dateString?: string): string => {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "";
    return date.toISOString().split('T')[0];
  };

  const handleDateChange = (key: 'startDate' | 'endDate', value: string) => {
    onUpdateFilter(key, value || undefined);
  };

  const hasDateFilters = filters.startDate || filters.endDate;

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          Période d'analyse
        </h3>
        {hasDateFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearDates}
            className="text-gray-600 hover:text-gray-800"
          >
            <X className="h-4 w-4 mr-1" />
            Effacer
          </Button>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="startDate" className="text-sm font-medium text-gray-700">
            Date de début
          </Label>
          <Input
            id="startDate"
            type="date"
            value={formatDateForInput(filters.startDate)}
            onChange={(e) => handleDateChange('startDate', e.target.value)}
            className="mt-1"
          />
        </div>
        
        <div>
          <Label htmlFor="endDate" className="text-sm font-medium text-gray-700">
            Date de fin
          </Label>
          <Input
            id="endDate"
            type="date"
            value={formatDateForInput(filters.endDate)}
            onChange={(e) => handleDateChange('endDate', e.target.value)}
            className="mt-1"
            min={filters.startDate}
          />
        </div>
      </div>
      
      {hasDateFilters && (
        <div className="mt-3 text-sm text-blue-700">
          {filters.startDate && filters.endDate && (
            <p>
              Période sélectionnée : du {new Date(filters.startDate).toLocaleDateString('fr-FR')} au {new Date(filters.endDate).toLocaleDateString('fr-FR')}
            </p>
          )}
          {filters.startDate && !filters.endDate && (
            <p>À partir du {new Date(filters.startDate).toLocaleDateString('fr-FR')}</p>
          )}
          {!filters.startDate && filters.endDate && (
            <p>Jusqu'au {new Date(filters.endDate).toLocaleDateString('fr-FR')}</p>
          )}
        </div>
      )}
    </div>
  );
}