import { supabase } from './supabaseClient';
import React, { useState, useEffect } from 'react';
import { Icons } from './components/ui/icons';
import { IncidentCard } from './components/incidents/IncidentCard';
import { IncidentForm } from './components/incidents/IncidentForm';
import { IncidentDetail } from './components/incidents/IncidentDetail';
import { StatsView } from './components/stats/StatsView';
import { UserList } from './components/admin/UserList';
import { Login } from './components/auth/Login';
import { Incident, Priority, Status, Category, Comment, User, Department, UserRole, StatusHistory } from './types';

// --- MOCK INITIAL DATA (Solo por si falla todo) ---
const INITIAL_INCIDENTS_MOCK: Incident[] = []; // Lo dejamos vacío para priorizar Supabase

const loadUserFromStorage = (): User | null => {
  const saved = localStorage.getItem('camping_current_user');
  return saved ? JSON.parse(saved) : null;
};

const loadUserRegistryFromStorage = (): User[] => {
    const saved = localStorage.getItem('camping_users_db');
    if (saved) return JSON.parse(saved);
    
    return [{
        name: 'Raul',
        email: 'info@playabrava.com',
        password: 'admin123',
        department: Department.RECEPCION,
        role: 'ADMIN'
    }];
};

type ViewState = 'dashboard' | 'create' | 'detail' | 'stats' | 'users';

function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(loadUserFromStorage);
  const [userRegistry, setUserRegistry] = useState<User[]>(loadUserRegistryFromStorage);
  
  const [view, setView] = useState<ViewState>('dashboard');
  
  // CAMBIO 1: Quitamos la carga inicial de localStorage para las incidencias
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(false);

  const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<Status | 'Todos'>('Todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [logoError, setLogoError] = useState(false);

  // CAMBIO 2: Función para descargar de Supabase y "Traducir" a tu formato
  const fetchIncidencias = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('incidencias')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        // TRADUCTOR: Base de Datos -> Tu App
        const adaptados: Incident[] = data.map((item: any) => ({
          id: item.id.toString(),
          title: `Incidencia en ${item.lugar}`, // Título generado
          description: item.descripcion,
          location: item.lugar,
          status: item.estado === 'pendiente' ? Status.PENDIENTE : Status.FINALIZADA, // Mapeo simple
          priority: Priority.MEDIA, // Valor por defecto
          category: Category.BUNGALOWS, // Valor por defecto
          reporter: item.usuario,
          reporterDepartment: Department.RECEPCION,
          createdAt: new Date(item.created_at),
          creationDate: new Date(item.created_at),
          updatedAt: new Date(item.created_at),
          comments: [],
          statusHistory: []
        }));
        setIncidents(adaptados);
      }
    } catch (error) {
      console.error("Error descargando incidencias:", error);
    } finally {
      setLoading(false);
    }
  };

  // CAMBIO 3: Cargar datos al iniciar
  useEffect(() => {
    fetchIncidencias();
  }, []);

  // Persistencia de sesión (Usuarios)
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('camping_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('camping_current_user');
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('camping_users_db', JSON.stringify(userRegistry));
  }, [userRegistry]);

  // --- LOGICA DE AUTH ---
  const validateCredentials = (email: string, passwordAttempt: string): User | null => {
    const emailLower = email.toLowerCase();
    const user = userRegistry.find(u => u.email.toLowerCase() === emailLower);
    if (user && user.password === passwordAttempt) return user;
    return null;
  };

  const handleLogin = (user: User) => { setCurrentUser(user); };
  const handleLogout = () => { setCurrentUser(null); setView('dashboard'); };

  const handleUpdateUserRole = (email: string, newRole: UserRole) => {
    if (currentUser?.role !== 'ADMIN') return;
    if (email === 'info@playabrava.com') return;
    setUserRegistry(prev => prev.map(u => u.email === email ? { ...u, role: newRole } : u));
  };

  const handleCreateUser = (newUser: User) => {
    if (currentUser?.role !== 'ADMIN') return;
    if (userRegistry.some(u => u.email.toLowerCase() === newUser.email.toLowerCase())) {
        alert('Este email ya está registrado.');
        return;
    }
    setUserRegistry(prev => [...prev, newUser]);
  };

  // --- METRICAS ---
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

  // --- CREAR INCIDENCIA (CORREGIDO) ---
  const handleCreateIncident = async (datosFormulario: any) => {
    // 🔍 DEBUG: Ver qué datos llegan realmente
    console.log("Datos del formulario recibidos:", datosFormulario);

    try {
      const { error } = await supabase
        .from('incidencias')
        .insert([
          { 
            // AQUÍ ESTABA EL ERROR:
            // La izquierda es SUPABASE (Español), la derecha es el FORMULARIO (Inglés)
            
            usuario: currentUser?.name || 'Anonimo', 
            
            // Antes ponías datosFormulario.lugar (y estaba vacío)
            lugar: datosFormulario.location || datosFormulario.lugar, 
            
            // Aseguramos que descripción se coja bien
            descripcion: datosFormulario.description || datosFormulario.descripcion,
            
            estado: 'pendiente'
          },
        ]);

      if (error) throw error;

      alert('✅ ¡Incidencia guardada correctamente!');
      await fetchIncidencias(); 
      setView('dashboard');

    } catch (error: any) {
      console.error('Error:', error);
      alert('❌ Error al guardar: ' + error.message);
    }
  };

  // --- CLICK EN INCIDENCIA ---
  const handleIncidentClick = (id: string) => {
      setSelectedIncidentId(id);
      setView('detail');
  };

  const handleUpdateStatus = (id: string, newStatus: Status) => {
    // NOTA: Aquí deberías añadir también lógica de Supabase UPDATE en el futuro
    if (currentUser?.role !== 'ADMIN') return;
    setIncidents(prevIncidents => prevIncidents.map(inc => {
      if (inc.id === id) {
        if (inc.status === newStatus) return inc;
        return { ...inc, status: newStatus, updatedAt: new Date() };
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

  if (!currentUser) {
    return <Login onLogin={handleLogin} validateCredentials={validateCredentials} />;
  }

  // --- RENDERIZADO DEL CONTENIDO PRINCIPAL ---
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

    if (view === 'stats') return <StatsView incidents={incidents} />;
    
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

    // VISTA DASHBOARD (Por defecto)
    return (
        <div className="space-y-6 animate-fade-in">
            {/* Dashboard Header Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-slate-500 mb-1">Pendientes</p>
                        <h3 className="text-3xl font-bold text-slate-800">{openCount}</h3>
                    </div>
                    <div className="p-3 bg-red-50 text-red-600 rounded-lg"><Icons.Alert size={24} /></div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-slate-500 mb-1">Alta Prioridad</p>
                        <h3 className="text-3xl font-bold text-slate-800">{criticalCount}</h3>
                    </div>
                    <div className="p-3 bg-orange-50 text-orange-600 rounded-lg"><Icons.Chart size={24} /></div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-slate-500 mb-1">Resueltas</p>
                        <h3 className="text-3xl font-bold text-slate-800">{resolvedCount}</h3>
                    </div>
                    <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg"><Icons.Check size={24} /></div>
                </div>
            </div>

            {/* Actions & Filters */}
            <div className="flex flex-col gap-4">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="relative w-full md:max-w-md">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Icons.Search className="h-5 w-5 text-slate-400" />
                        </div>
                        <input
                            type="text"
                            className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-[#0054a6]"
                            placeholder="Buscar..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <button 
                        onClick={() => setView('create')}
                        className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-[#0054a6] text-white rounded-lg font-bold hover:bg-[#004080] shadow-lg transition-all"
                    >
                        <Icons.Add size={18} /> Reportar Incidencia
                    </button>
                </div>
            </div>

            {/* Lista de Incidencias */}
            <div className="grid grid-cols-1 gap-4">
                {loading ? (
                   <p className="text-center text-slate-500 py-10">Cargando datos de la nube...</p>
                ) : filteredIncidents.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-300">
                        <Icons.Search className="mx-auto h-12 w-12 text-slate-300 mb-3" />
                        <h3 className="text-lg font-medium text-slate-900">No hay incidencias</h3>
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
        {/* Sidebar (Sin cambios visuales) */}
        <aside className="w-64 bg-[#0054a6] text-white hidden md:flex flex-col fixed h-full z-10 border-r border-[#004080]">
            <div className="p-6">
                <div className="flex items-center gap-3 text-white font-bold text-lg mb-8">
                     <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center p-1">
                        {!logoError ? (
                           <img src="https://www.playabrava.com/wp-content/themes/playabrava/img/logo.png" alt="Logo" onError={() => setLogoError(true)} />
                        ) : (<Icons.Glamping size={24} className="text-[#0054a6]" />)}
                     </div>
                     <span className="text-sm">Gestor Incidencias</span>
                </div>
                <nav className="space-y-2">
                    <button onClick={() => setView('dashboard')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg ${view === 'dashboard' ? 'bg-[#004080]' : 'hover:bg-[#004080]'}`}>
                        <Icons.Dashboard size={18} /> Tablero
                    </button>
                    <button onClick={() => setView('stats')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg ${view === 'stats' ? 'bg-[#004080]' : 'hover:bg-[#004080]'}`}>
                        <Icons.Chart size={18} /> Estadísticas
                    </button>
                    {currentUser.role === 'ADMIN' && (
                        <button onClick={() => setView('users')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg ${view === 'users' ? 'bg-[#004080]' : 'hover:bg-[#004080]'}`}>
                            <Icons.Users size={18} /> Usuarios
                        </button>
                    )}
                </nav>
            </div>
            <div className="mt-auto p-6 border-t border-[#004080]">
                <button onClick={handleLogout} className="w-full text-xs text-blue-200 hover:text-white flex items-center gap-2">
                    <Icons.Close size={12} /> Cerrar Sesión
                </button>
            </div>
        </aside>

        <main className="flex-1 md:ml-64 p-6 md:p-10">
             {renderContent()}
        </main>
    </div>
  );
}

export default App;