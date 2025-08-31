import React, { useEffect, useState } from 'react';
import './ActivityTable.css';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { Chart as ChartJS, BarElement, LineElement, PointElement, LinearScale, CategoryScale, Title, Tooltip, Legend } from 'chart.js';
import { Chart } from 'react-chartjs-2';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { ChartData, ChartOptions } from 'chart.js'; // Importe les types de chart.js
import { registerLocale, setDefaultLocale } from 'react-datepicker';
import fr from 'date-fns/locale/fr'; // Importer la locale française de date-fns

ChartJS.register(BarElement, LineElement, PointElement, LinearScale, CategoryScale, Title, Tooltip, Legend);

// Enregistrer la locale française
registerLocale('fr', fr as any);
// Définir la locale par défaut (optionnel si locale="fr" est spécifié dans DatePicker)
setDefaultLocale('fr');

interface Activity {
  id: number;
  name: string;
  date_: string;
  jour: string;
  heure: string;
  cible: number;
  min: number;
  max: number;
  count: number;
  delta: number;
}

const ActivityTable: React.FC = () => {
const [activities, setActivities] = useState<Activity[]>([]);
const [loading, setLoading] = useState<boolean>(true);
const [error, setError] = useState<string | null>(null);
//const [selectedStartDate, setSelectedStartDate] = useState<Date>(new Date());
const [selectedStartDate, setSelectedStartDate] = useState<Date>(new Date('2025-06-30')); // Date de début par défaut
const [selectedActivity, setSelectedActivity] = useState<string>('');

useEffect(() => {
  const fetchActivities = async () => {
    setLoading(true);
    try {
      const endDate = new Date(selectedStartDate);
      endDate.setDate(endDate.getDate() + 1);

      // console.log("Fetching with startDate:", selectedStartDate.toISOString().split("T")[0]);
      // console.log("End date:", endDate.toISOString().split("T")[0]);

      const response = await fetch(`/api/staffing/activity?startDate=${selectedStartDate.toISOString().split("T")[0]}&endDate=${endDate.toISOString().split("T")[0]}`); 
      
      const contentType = response.headers.get("Content-Type") || "";

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erreur HTTP ${response.status} - ${errorText}`);
      }

      if (!contentType.includes("application/json")) {
        const rawText = await response.text();
        throw new Error(`Réponse non JSON reçue : ${rawText.slice(0, 100)}...`);
      }
      const data: Activity[] = await response.json();

      if (data.length === 0) {
        console.warn("Aucune activité trouvée pour cette période.");
        setActivities([]);
        setSelectedActivity("");
        setLoading(false);
        return;
      }

      setActivities(data);
      const uniqueActivities = [...new Set(data.map((a) => a.name))].sort();
      setSelectedActivity(uniqueActivities[0] ?? "");
      setLoading(false);
    } catch (err: any) {
      console.error("Fetch error:", err.message);
      setError(err.message);
      setLoading(false);
    }
  };

  fetchActivities();
}, [selectedStartDate]);


  if (loading) return <div>Chargement...</div>;
  if (error) return <div>Erreur : {error}</div>;

  const uniqueActivities = [...new Set(activities.map((activity: Activity) => activity.name))].sort(); // Typage explicite

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 60 },
    { field: 'name', headerName: 'Activité', width: 150 },
    { field: 'date_', headerName: 'Date', width: 150 },
    { field: 'jour', headerName: 'Jour', width: 120 },
    { field: 'heure', headerName: 'Heure', width: 150 },
    { field: 'cible', headerName: 'Dim cible', width: 120 },
    { field: 'min', headerName: 'Dim min', width: 120 },
    { field: 'max', headerName: 'Dim max', width: 120 },
    { field: 'count', headerName: 'Affecté', width: 120 },
    { field: 'delta', headerName: 'Delta', width: 120 },
  ];

  const filteredActivities = activities.filter((activity: Activity) => {
    const activityMatch = !selectedActivity || activity.name === selectedActivity;
    return activityMatch;
  });

  const sortedActivities = [...filteredActivities].sort((a: Activity, b: Activity) => {
    const dateA = new Date(`${a.date_}T${a.heure.split('-')[0]}`);
    const dateB = new Date(`${b.date_}T${b.heure.split('-')[0]}`);
    return dateA.getTime() - dateB.getTime();
  });

  const chartData: ChartData<'bar' | 'line', number[], string> = {
    labels: sortedActivities.map((activity: Activity) => `${activity.heure}`),
    datasets: [
      {
        label: 'Affecté',
        type: 'bar' as const,
        data: sortedActivities.map((activity: Activity) => activity.count || 0),
        backgroundColor: 'rgba(54, 162, 235, 1)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
        order: 1,
      },
      {
        label: 'Dim cible',
        type: 'line' as const,
        data: sortedActivities.map((activity: Activity) => activity.cible || 0),
        borderColor: 'rgba(0, 0, 0, 1)',
        backgroundColor: 'rgba(0, 0, 0, 1)',
        fill: false,
        borderWidth: 2,
        order: 0,
      },
      {
        label: 'Dim min',
        type: 'line' as const,
        data: sortedActivities.map((activity: Activity) => activity.min || 0),
        borderColor: 'rgba(255, 0, 0, 1)',
        backgroundColor: 'rgba(255, 0, 0, 1)',
        fill: false,
        borderWidth: 2,
        order: 0,
      },
      {
        label: 'Dim max',
        type: 'line' as const,
        data: sortedActivities.map((activity: Activity) => activity.max || 0),
        borderColor: 'rgba(40, 150, 40, 1)',
        backgroundColor: 'rgba(40, 150, 40, 1)',
        fill: false,
        borderWidth: 2,
        order: 0,
      },
    ],
  };

  const chartOptions: ChartOptions<'bar' | 'line'> = {
    scales: {
      x: {
        title: {
          display: true,
          text: 'Heures',
        },
        ticks: {
          maxRotation: 45,
          minRotation: 45,
        },
      },
      y: {
        title: {
          display: true,
          text: 'Valeur',
        },
        beginAtZero: true,
      },
    },
    plugins: {
      legend: {
        position: 'top' as const, // Typage explicite pour position
      },
    },
  };

  return (
    <>

      <div style={{ marginTop: '20px', marginBottom: '20px'}}>
        <label htmlFor="datePicker">Sélectionner une date de début: </label>
        <DatePicker
          id="datePicker"
          selected={selectedStartDate}
          onChange={(date: Date | null) => date && setSelectedStartDate(date)}
          //dateFormat="yyyy-MM-dd"
          dateFormat="dd/MM/yyyy"
          placeholderText="Choisir une date"
          className="custom-selector" // Remplace style par className
          locale="fr" // Appliquer la locale française
          calendarStartDay={1} // Lundi comme premier jour de la semaine
        />
        <label htmlFor="activitySelect">Sélectionner une activité: </label>
        <select
          id="activitySelect"
          value={selectedActivity}
          onChange={(e) => setSelectedActivity(e.target.value)}
          className="custom-selector" // Classe personnalisée
        >
          <option value="">Toutes les activités</option>
          {uniqueActivities.map((activity) => (
            <option key={activity} value={activity}>
              {activity}
            </option>
          ))}
        </select>
      </div>

      <div style={{ marginTop: '40px', height: 600, width: '80%', marginLeft: 'auto', marginRight: 'auto' }}>
        <h2>Graphique des dimensionnements des activités</h2>
        <Chart type='bar' data={chartData} options={chartOptions} />
      </div>

      <div style={{ marginTop: '20px', height: 800, width: '100%' }}>
        <DataGrid rows={sortedActivities} columns={columns} checkboxSelection rowHeight={30} />
      </div>
    </>
  );
};

export default ActivityTable;