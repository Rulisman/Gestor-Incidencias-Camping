import React, { useState, useEffect } from 'react';
import { Icons } from './components/ui/icons';
import { IncidentCard } from './components/incidents/IncidentCard';
import { IncidentForm } from './components/incidents/IncidentForm';
import { IncidentDetail } from './components/incidents/IncidentDetail';
import { StatsView } from './components/stats/StatsView';
import { UserList } from './components/admin/UserList';
import { Login } from './components/auth/Login';
import { Incident, Priority, Status, Category, Comment, User, Department, UserRole, StatusHistory } from './types';

// Mock initial data - Fallback si no hay localStorage
const INITIAL_INCIDENTS_MOCK: Incident[] = [
  {
    id: 'INC-2024-001',
    title: 'Fallo eléctrico en Bungalow',
    description: 'El cliente reporta que saltan los plomos al encender el aire acondicionado. Huele a quemado levemente.',
    location: 'Bungalow Deluxe 42',
    priority: Priority.ALTA,
    status: Status.PENDIENTE,
    statusHistory: [], // Inicializar vacío
    category: Category.BUNGALOWS,
    createdAt: new Date(Date.now() - 3600000 * 2), 
    creationDate: new Date(Date.now() - 3600000 * 2),
    updatedAt: new Date(),
    reporter: 'Recepción',
    reporterDepartment: Department.RECEPCION,
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
    statusHistory: [
        {
            id: 'h1',
            previousStatus: Status.PENDIENTE,
            newStatus: Status.EN_PROCESO,
            changedBy: 'Raul',
            timestamp: new Date(Date.now() - 43200000)
        }
    ],
    category: Category.SANITARIOS,
    createdAt: new Date(Date.now() - 86400000),
    creationDate: new Date(Date.now() - 86400000),
    updatedAt: new Date(),
    reporter: 'Limpieza',
    reporterDepartment: Department.LIMPIEZA,
    comments: []
  }
];

// Helper para recuperar fechas correctamente del JSON
const loadIncidentsFromStorage = (): Incident[] => {
  const saved = localStorage.getItem('camping_incidents');
  if (!saved) return INITIAL_INCIDENTS_MOCK;

  try {
    const parsed = JSON.parse(saved);
    return parsed.map((item: any) => ({
      ...item,
      createdAt: new Date(item.createdAt),
      creationDate: new Date(item.creationDate),
      updatedAt: new Date(item.updatedAt),
      comments: item.comments.map((c: any) => ({
        ...c,
        timestamp: new Date(c.timestamp)
      })),
      // Mapear historial de estados recuperando fechas
      statusHistory: item.statusHistory ? item.statusHistory.map((h: any) => ({
          ...h,
          timestamp: new Date(h.timestamp)
      })) : []
    }));
  } catch (e) {
    console.error("Error loading incidents", e);
    return INITIAL_INCIDENTS_MOCK;
  }
};

const loadUserFromStorage = (): User | null => {
  const saved = localStorage.getItem('camping_current_user');
  return saved ? JSON.parse(saved) : null;
};

const loadUserRegistryFromStorage = (): User[] => {
    const saved = localStorage.getItem('camping_users_db');
    if (saved) return JSON.parse(saved);
    
    // Usuario por defecto (Raul - Admin)
    return [{
        name: 'Raul',
        email: 'info@playabrava.com',
        password: 'admin123', // Contraseña por defecto
        department: Department.RECEPCION,
        role: 'ADMIN'
    }];
};

type ViewState = 'dashboard' | 'create' | 'detail' | 'stats' | 'users';

function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(loadUserFromStorage);
  const [userRegistry, setUserRegistry] = useState<User[]>(loadUserRegistryFromStorage);
  
  const [view, setView] = useState<ViewState>('dashboard');
  const [incidents, setIncidents] = useState<Incident[]>(loadIncidentsFromStorage);
  const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<Status | 'Todos'>('Todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [logoError, setLogoError] = useState(false);
  
  // Persistencia de incidencias
  useEffect(() => {
    localStorage.setItem('camping_incidents', JSON.stringify(incidents));
  }, [incidents]);

  // Persistencia de sesión actual
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('camping_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('camping_current_user');
    }
  }, [currentUser]);

  // Persistencia del registro de usuarios
  useEffect(() => {
    localStorage.setItem('camping_users_db', JSON.stringify(userRegistry));
  }, [userRegistry]);

  // Manejo de Login Seguro
  const validateCredentials = (email: string, passwordAttempt: string): User | null => {
    const emailLower = email.toLowerCase();
    
    // Buscar usuario
    const user = userRegistry.find(u => u.email.toLowerCase() === emailLower);
    
    if (user && user.password === passwordAttempt) {
        return user;
    }
    
    return null;
  };

  const handleLogin = (user: User) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setView('dashboard');
  };

  const handleUpdateUserRole = (email: string, newRole: UserRole) => {
    if (currentUser?.role !== 'ADMIN') return;
    
    // No permitir quitar admin a info@playabrava.com
    if (email === 'info@playabrava.com') return;

    setUserRegistry(prev => prev.map(u => 
        u.email === email ? { ...u, role: newRole } : u
    ));
  };

  const handleCreateUser = (newUser: User) => {
    if (currentUser?.role !== 'ADMIN') return;

    // Verificar si ya existe
    if (userRegistry.some(u => u.email.toLowerCase() === newUser.email.toLowerCase())) {
        alert('Este email ya está registrado.');
        return;
    }

    setUserRegistry(prev => [...prev, newUser]);
  };

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
      statusHistory: [],
      createdAt: new Date(),
      creationDate: new Date(),
      updatedAt: new Date(),
      reporter: currentUser ? currentUser.name : 'Desconocido',
      reporterDepartment: currentUser?.department,
      comments: []
    };
    setIncidents([newIncident, ...incidents]);
    setView('dashboard');
  };

  const handleIncidentClick = (id: string) => {
    setSelectedIncidentId(id);
    setView('detail');
  };

  const handleUpdateStatus = (id: string, newStatus: Status) => {
    // Doble verificación de seguridad
    if (currentUser?.role !== 'ADMIN') return;

    setIncidents(prevIncidents => prevIncidents.map(inc => {
      if (inc.id === id) {
        // Si el estado es el mismo, no hacemos nada
        if (inc.status === newStatus) return inc;

        // Crear registro histórico
        const historyEntry: StatusHistory = {
            id: Date.now().toString(),
            previousStatus: inc.status,
            newStatus: newStatus,
            changedBy: currentUser.name,
            timestamp: new Date()
        };

        return { 
            ...inc, 
            status: newStatus, 
            updatedAt: new Date(),
            statusHistory: [...(inc.statusHistory || []), historyEntry] // Añadir al historial
        };
      }
      return inc;
    }));
  };

  const handleAddComment = (id: string, text: string) => {
    setIncidents(incidents.map(inc => {
      if (inc.id === id) {
        const newComment: Comment = {
          id: Date.now().toString(),
          author: currentUser ? currentUser.name : 'Usuario',
          text,
          timestamp: new Date()
        };
        return { ...inc, comments: [...inc.comments, newComment], updatedAt: new Date() };
      }
      return inc;
    }));
  };

  // Si no hay usuario logueado, mostrar login
  if (!currentUser) {
    return <Login onLogin={handleLogin} validateCredentials={validateCredentials} />;
  }

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
                userRole={currentUser.role}
                onBack={() => setView('dashboard')}
                onUpdateStatus={handleUpdateStatus}
                onAddComment={handleAddComment}
            />
        );
    }

    if (view === 'stats') {
        return <StatsView incidents={incidents} />;
    }

    if (view === 'users' && currentUser.role === 'ADMIN') {
        return (
            <UserList 
                users={userRegistry} 
                currentUserEmail={currentUser.email}
                onUpdateRole={handleUpdateUserRole}
                onCreateUser={handleCreateUser}
            />
        );
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
                        <p className="text-sm font-medium text-slate-500 mb-1">Resueltas (Total)</p>
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
                            className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-lg leading-5 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0054a6] focus:border-[#0054a6] sm:text-sm transition duration-150 ease-in-out shadow-sm"
                            placeholder="Buscar por título, lugar o descripción..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <button 
                        onClick={() => setView('create')}
                        className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-[#0054a6] text-white rounded-lg font-bold hover:bg-[#004080] shadow-lg shadow-blue-200 transition-all active:scale-95 whitespace-nowrap"
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
                                ? 'bg-[#0054a6] text-white' 
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
        <aside className="w-64 bg-[#0054a6] text-white hidden md:flex flex-col fixed h-full z-10 border-r border-[#004080]">
            <div className="p-6">
                <div className="flex items-center gap-3 text-white font-bold text-lg mb-8 leading-tight">
                    <div className="w-10 h-10 bg-white rounded-lg flex-shrink-0 flex items-center justify-center overflow-hidden p-1">
                         {/* Logo con sistema de Fallback */}
                         {!logoError ? (
                            <img 
                                src="https://www.playabrava.com/wp-content/themes/playabrava/img/logo.png" 
                                alt="Logo" 
                                className="w-full h-auto object-contain"
                                onError={() => setLogoError(true)}
                            />
                         ) : (
                            <Icons.Glamping size={24} className="text-[#0054a6]" />
                         )}
                    </div>
                    <span className="text-sm">Gestor Incidencias</span>
                </div>
                <nav className="space-y-2">
                    <button 
                        onClick={() => {
                            setView('dashboard');
                            setFilterStatus('Todos');
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${view === 'dashboard' ? 'bg-[#004080] text-white shadow-inner' : 'hover:bg-[#004080]'}`}
                    >
                        <Icons.Dashboard size={18} />
                        Tablero
                    </button>
                    <button 
                        onClick={() => setView('stats')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${view === 'stats' ? 'bg-[#004080] text-white shadow-inner' : 'hover:bg-[#004080]'}`}
                    >
                        <Icons.Chart size={18} />
                        Estadísticas
                    </button>
                    {/* Botón solo para Admins */}
                    {currentUser.role === 'ADMIN' && (
                        <button 
                            onClick={() => setView('users')}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${view === 'users' ? 'bg-[#004080] text-white shadow-inner' : 'hover:bg-[#004080]'}`}
                        >
                            <Icons.Users size={18} />
                            Usuarios
                        </button>
                    )}
                </nav>
            </div>
            <div className="mt-auto p-6 border-t border-[#004080]">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#004080] flex items-center justify-center text-white font-bold text-sm border border-white/20">
                            {currentUser.name.substring(0,2).toUpperCase()}
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-white text-sm font-medium truncate w-32 flex items-center gap-2">
                                {currentUser.name} 
                                {currentUser.role === 'ADMIN' && <Icons.Glamping size={12} className="text-yellow-400" />}
                            </p>
                            <p className="text-xs text-blue-200 truncate w-32">{currentUser.department}</p>
                        </div>
                    </div>
                </div>
                <button 
                    onClick={handleLogout}
                    className="w-full text-xs text-blue-200 hover:text-white transition-colors text-left flex items-center gap-2 px-1"
                >
                    <Icons.Close size={12} /> Cerrar Sesión
                </button>
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
