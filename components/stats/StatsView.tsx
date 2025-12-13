import React from 'react';
import { Incident, Category, Priority, Status } from '../../types';
import { Icons } from '../ui/icons';

interface StatsViewProps {
  incidents: Incident[];
}

export const StatsView: React.FC<StatsViewProps> = ({ incidents }) => {
  const total = incidents.length;
  
  // Stats by Category
  const byCategory = Object.values(Category).map(cat => ({
    name: cat,
    count: incidents.filter(i => i.category === cat).length,
    percentage: total > 0 ? (incidents.filter(i => i.category === cat).length / total) * 100 : 0
  })).sort((a, b) => b.count - a.count);

  // Stats by Priority
  const byPriority = Object.values(Priority).map(p => ({
    name: p,
    count: incidents.filter(i => i.priority === p).length
  }));

  // Stats by Status
  const byStatus = Object.values(Status).map(s => ({
    name: s,
    count: incidents.filter(i => i.status === s).length
  }));

  const handleExportCSV = () => {
    // Definir cabeceras
    const headers = [
      'ID', 
      'Título', 
      'Descripción', 
      'Ubicación', 
      'Categoría', 
      'Prioridad', 
      'Estado', 
      'Reportado Por', 
      'Fecha Creación',
      'Fecha Actualización'
    ];

    // Mapear datos y escapar comillas para CSV válido
    const rows = incidents.map(i => [
      i.id,
      `"${i.title.replace(/"/g, '""')}"`,
      `"${i.description.replace(/"/g, '""')}"`,
      `"${i.location.replace(/"/g, '""')}"`,
      i.category,
      i.priority,
      i.status,
      i.reporter,
      new Date(i.createdAt).toLocaleDateString() + ' ' + new Date(i.createdAt).toLocaleTimeString(),
      new Date(i.updatedAt).toLocaleDateString() + ' ' + new Date(i.updatedAt).toLocaleTimeString()
    ]);

    // Construir contenido CSV
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    // Crear Blob y descargar
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `reporte_camping_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Icons.Chart className="text-[#0054a6]" />
            Estadísticas del Camping
        </h2>
        <button 
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2 bg-[#0054a6] text-white rounded-lg text-sm font-medium hover:bg-[#004080] transition-colors shadow-sm active:scale-95"
        >
            <Icons.Download size={16} />
            Exportar Reporte Excel (CSV)
        </button>
      </div>
      
      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         {byStatus.map((stat) => (
            <div key={stat.name} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col justify-between h-32 relative overflow-hidden group hover:shadow-md transition-shadow">
                <div className="relative z-10">
                    <p className="text-slate-500 text-sm font-bold uppercase tracking-wider mb-2">{stat.name}</p>
                    <p className="text-4xl font-extrabold text-slate-800">{stat.count}</p>
                </div>
                {/* Decorative background icon */}
                <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
                    <Icons.Chart size={100} />
                </div>
            </div>
         ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Distribution */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2 pb-4 border-b border-slate-100">
                <Icons.Dashboard size={20} className="text-[#0054a6]" />
                Incidencias por Categoría
            </h3>
            <div className="space-y-5">
                {byCategory.map((item) => (
                    <div key={item.name}>
                        <div className="flex justify-between text-sm mb-1.5">
                            <span className="font-medium text-slate-700 flex items-center gap-2">
                                {item.name}
                            </span>
                            <span className="text-slate-500 font-medium">{item.count} <span className="text-xs text-slate-400">({Math.round(item.percentage)}%)</span></span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                            <div 
                                className="bg-[#0054a6] h-2.5 rounded-full transition-all duration-700 ease-out shadow-sm" 
                                style={{ width: `${item.percentage}%` }}
                            ></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>

        {/* Priority Distribution Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col">
            <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2 pb-4 border-b border-slate-100">
                <Icons.Alert size={20} className="text-orange-600" />
                Distribución por Prioridad
            </h3>
            <div className="flex-1 flex items-end justify-between px-4 min-h-[250px] pb-2">
                {byPriority.map((item) => {
                    // Calculate bar height relative to total (min 5% for visibility)
                    const heightPercentage = total > 0 ? (item.count / total) * 100 : 0;
                    const displayHeight = Math.max(heightPercentage, 5); 
                    
                    let colorClass = 'bg-slate-300';
                    let textClass = 'text-slate-500';
                    
                    if (item.name === Priority.CRITICA) { colorClass = 'bg-red-500'; textClass = 'text-red-700'; }
                    else if (item.name === Priority.ALTA) { colorClass = 'bg-orange-500'; textClass = 'text-orange-700'; }
                    else if (item.name === Priority.MEDIA) { colorClass = 'bg-yellow-400'; textClass = 'text-yellow-700'; }
                    else if (item.name === Priority.BAJA) { colorClass = 'bg-blue-400'; textClass = 'text-blue-700'; }

                    return (
                        <div key={item.name} className="flex flex-col items-center gap-3 w-1/4 group h-full justify-end">
                             <div className={`text-lg font-bold ${textClass} transition-transform group-hover:-translate-y-1`}>
                                {item.count}
                             </div>
                             <div 
                                className={`w-full max-w-[40px] md:max-w-[60px] rounded-t-lg transition-all duration-700 shadow-sm opacity-90 group-hover:opacity-100 ${colorClass}`}
                                style={{ height: `${displayHeight}%` }} 
                             ></div>
                             <div className="text-xs font-semibold text-slate-500 uppercase tracking-tight text-center">
                                {item.name}
                             </div>
                        </div>
                    )
                })}
            </div>
        </div>
      </div>
    </div>
  );
};
