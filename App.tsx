import React, { useState } from 'react';
import { Icons } from './components/ui/Icons';
import { IncidentCard } from './components/incidents/IncidentCard';
import { IncidentForm } from './components/incidents/IncidentForm';
import { IncidentDetail } from './components/incidents/IncidentDetail';
import { StatsView } from './components/stats/StatsView';
import { Incident, Priority, Status, Category, Comment } from './types';

// Mock initial data - Camping Context
const INITIAL_INCIDENTS: Incident[] = [
  {
    id: 'INC-2024-001',
    title: 'Fallo eléctrico en Bungalow',
    description: 'El cliente reporta que saltan los plomos al encender el aire acondicionado. Huele a quemado levemente.',
    location: 'Bungalow Deluxe 42',
    priority: Priority.ALTA,
    status: Status.PENDIENTE,
    category: Category.BUNGALOWS,
    createdAt: new Date(Date.now() - 3600000 * 2), // 2 hours ago
    creationDate: new Date(Date.now() - 3600000 * 2),
    updatedAt: new Date(),
    reporter: 'Recepción',
    comments: [
        { id: 'c1', author: 'Jefe Mtto', text: 'Enviando a electricista de guardia.', timestamp: new Date(Date.now() - 3600000) }
    ]
  },
  {
    id: 'INC-2024-002',
    title: 'Grifo goteando zona común',
    description: 'En los baños de la piscina infantil, el tercer grifo no cierra del todo y pierde mucha agua.',
    location: 'Baños Piscina Infantil',
    priority: Priority.MEDIA,
    status: Status.EN_PROCESO,
    category: Category.SANITARIOS,
    createdAt: new Date(Date.now() - 86400000), // 1 day ago
    creationDate: new Date(Date.now() - 86400000),
    updatedAt: new Date(),
    reporter: 'Limpieza',
    comments: []
  },
  {
    id: 'INC-2024-003',
    title: 'Rama caída obstaculizando paso',
    description: 'Ha caído una rama grande de pino en el camino principal hacia la zona de Glamping.',
    location: 'Camino Glamping sector B',
    priority: Priority.BAJA,
    status: Status.PENDIENTE,
    category: Category.PARCELAS,
    createdAt: new Date(Date.now() - 1800000), // 30 mins ago
    creationDate: new Date(Date.now() - 1800000),
    updatedAt: new Date(),
    reporter: 'Jardinería',
    comments: []
  }
];

type ViewState = 'dashboard' | 'create' | 'detail' | 'stats';

function App() {
  const [view, setView] = useState<ViewState>('dashboard');
  const [incidents, setIncidents] = useState<Incident[]>(INITIAL_INCIDENTS);
  const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<Status | 'Todos'>('Todos');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Dashboard Metrics
  const openCount = incidents.filter(i => i.status === Status.PENDIENTE).length;
  const criticalCount = incidents.filter(i => i.priority === Priority.CRITICA || i.priority === Priority.ALTA).length;
  const resolvedCount = incidents.filter(i => i.status === Status.FINALIZADA).length;

  const filteredIncidents = incidents.filter(i => {
    const matchesStatus = filterStatus === 'Todos' || i.status === filterStatus;
    const query = searchQuery.toLowerCase();
    const matchesSearch = 
        i.title.toLowerCase().includes(query) || 
        i.description.toLowerCase().includes(query) ||
        i.location.toLowerCase().includes(query);
    
    return matchesStatus && matchesSearch;
  });

  const handleCreateIncident = (data: { title: string; description: string; location: string; priority: Priority; category: Category }) => {
    const newIncident: Incident = {
      id: `INC-2024-${String(incidents.length + 1).padStart(3, '0')}`,
      ...data,
      status: Status.PENDIENTE,
      createdAt: new Date(),
      creationDate: new Date(),
      updatedAt: new Date(),
      reporter: 'Usuario Actual',
      comments: []
    };
    setIncidents([newIncident, ...incidents]);
    setView('dashboard');
  };

  const handleIncidentClick = (id: string) => {
    setSelectedIncidentId(id);
    setView('detail');
  };

  const handleUpdateStatus = (id: string, status: Status) => {
    setIncidents(incidents.map(inc => 
      inc.id === id ? { ...inc, status, updatedAt: new Date() } : inc
    ));
  };

  const handleAddComment = (id: string, text: string) => {
    setIncidents(incidents.map(inc => {
      if (inc.id === id) {
        const newComment: Comment = {
          id: Date.now().toString(),
          author: 'Usuario Actual',
          text,
          timestamp: new Date()
        };
        return { ...inc, comments: [...inc.comments, newComment], updatedAt: new Date() };
      }
      return inc;
    }));
  };

  const renderContent = () => {
    if (view === 'create') {
        return (
            <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <IncidentForm 
                    onSubmit={handleCreateIncident}
                    onCancel={() => setView('dashboard')}
                />
            </div>
        );
    }

    if (view === 'detail' && selectedIncidentId) {
        const incident = incidents.find(i => i.id === selectedIncidentId);
        if (!incident) return <div>Incidencia no encontrada</div>;
        return (
            <IncidentDetail 
                incident={incident}
                onBack={() => setView('dashboard')}
                onUpdateStatus={handleUpdateStatus}
                onAddComment={handleAddComment}
            />
        );
    }

    if (view === 'stats') {
        return <StatsView incidents={incidents} />;
    }

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Dashboard Header Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-slate-500 mb-1">Pendientes</p>
                        <h3 className="text-3xl font-bold text-slate-800">{openCount}</h3>
                    </div>
                    <div className="p-3 bg-red-50 text-red-600 rounded-lg">
                        <Icons.Alert size={24} />
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-slate-500 mb-1">Alta Prioridad</p>
                        <h3 className="text-3xl font-bold text-slate-800">{criticalCount}</h3>
                    </div>
                    <div className="p-3 bg-orange-50 text-orange-600 rounded-lg">
                        <Icons.Chart size={24} />
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-slate-500 mb-1">Resueltas (Semana)</p>
                        <h3 className="text-3xl font-bold text-slate-800">{resolvedCount}</h3>
                    </div>
                    <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
                        <Icons.Check size={24} />
                    </div>
                </div>
            </div>

            {/* Filter and Action Bar */}
            <div className="flex flex-col gap-4">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="relative w-full md:max-w-md">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Icons.Search className="h-5 w-5 text-slate-400" />
                        </div>
                        <input
                            type="text"
                            className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-lg leading-5 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm transition duration-150 ease-in-out shadow-sm"
                            placeholder="Buscar por título, lugar o descripción..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <button 
                        onClick={() => setView('create')}
                        className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-emerald-600 text-white rounded-lg font-bold hover:bg-emerald-700 shadow-lg shadow-emerald-200 transition-all active:scale-95 whitespace-nowrap"
                    >
                        <Icons.Add size={18} />
                        Reportar Incidencia
                    </button>
                </div>

                <div className="flex gap-2 p-1 bg-white rounded-lg border border-slate-200 shadow-sm overflow-x-auto max-w-full self-start">
                    {['Todos', Status.PENDIENTE, Status.EN_PROCESO, Status.FINALIZADA].map((status) => (
                        <button
                            key={status}
                            onClick={() => setFilterStatus(status as Status | 'Todos')}
                            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
                                filterStatus === status 
                                ? 'bg-slate-800 text-white' 
                                : 'text-slate-600 hover:bg-slate-50'
                            }`}
                        >
                            {status}
                        </button>
                    ))}
                </div>
            </div>

            {/* Incident List */}
            <div className="grid grid-cols-1 gap-4">
                {filteredIncidents.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-300">
                        <Icons.Search className="mx-auto h-12 w-12 text-slate-300 mb-3" />
                        <h3 className="text-lg font-medium text-slate-900">No hay incidencias</h3>
                        <p className="text-slate-500">No se encontraron incidencias con los criterios actuales.</p>
                    </div>
                ) : (
                    filteredIncidents.map(incident => (
                        <IncidentCard 
                            key={incident.id} 
                            incident={incident} 
                            onClick={handleIncidentClick} 
                        />
                    ))
                )}
            </div>
        </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
        {/* Sidebar */}
        <aside className="w-64 bg-slate-900 text-slate-300 hidden md:flex flex-col fixed h-full z-10 border-r border-slate-800">
            <div className="p-6">
                <div className="flex items-center gap-3 text-white font-bold text-xl mb-8">
                    <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center text-slate-900">
                        <Icons.Parcelas size={18} />
                    </div>
                    Gestor Camping
                </div>
                <nav className="space-y-2">
                    <button 
                        onClick={() => {
                            setView('dashboard');
                            setFilterStatus('Todos');
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${view === 'dashboard' ? 'bg-emerald-600 text-white' : 'hover:bg-slate-800'}`}
                    >
                        <Icons.Dashboard size={18} />
                        Tablero
                    </button>
                    <button 
                        onClick={() => setView('stats')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${view === 'stats' ? 'bg-emerald-600 text-white' : 'hover:bg-slate-800'}`}
                    >
                        <Icons.Chart size={18} />
                        Estadísticas
                    </button>
                    <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-800 transition-colors">
                        <Icons.Parcelas size={18} />
                        Mapa Camping
                    </button>
                </nav>
            </div>
            <div className="mt-auto p-6 border-t border-slate-800">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center text-white font-bold">
                        MA
                    </div>
                    <div>
                        <p className="text-white text-sm font-medium">Mantenimiento</p>
                        <p className="text-xs text-slate-500">Admin</p>
                    </div>
                </div>
            </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 md:ml-64 p-6 md:p-10">
             {view === 'create' && renderContent()} 
             {view !== 'create' && renderContent()}
        </main>
    </div>
  );
}

export default App;