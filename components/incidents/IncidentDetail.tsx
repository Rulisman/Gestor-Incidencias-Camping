import React, { useState } from 'react';
import { Incident, Priority, Status, Category, Comment } from '../../types';
import { Icons } from '../ui/Icons';
import { suggestSolution } from '../../services/gemini';

interface IncidentDetailProps {
  incident: Incident;
  onBack: () => void;
  onUpdateStatus: (id: string, status: Status) => void;
  onAddComment: (id: string, text: string) => void;
}

export const IncidentDetail: React.FC<IncidentDetailProps> = ({ 
  incident, 
  onBack, 
  onUpdateStatus, 
  onAddComment 
}) => {
  const [newComment, setNewComment] = useState('');
  const [isGeneratingSolution, setIsGeneratingSolution] = useState(false);
  const [aiSolution, setAiSolution] = useState<string | null>(null);

  const handleGenerateSolution = async () => {
    setIsGeneratingSolution(true);
    const solution = await suggestSolution(incident.title, incident.description, incident.category);
    setAiSolution(solution);
    setIsGeneratingSolution(false);
  };

  const submitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    onAddComment(incident.id, newComment);
    setNewComment('');
  };

  const getCategoryIcon = (category: Category) => {
    switch (category) {
        case Category.PARCELAS: return <Icons.Parcelas size={16} />;
        case Category.BUNGALOWS: return <Icons.Bungalows size={16} />;
        case Category.GLAMPING: return <Icons.Glamping size={16} />;
        case Category.RESTAURANT: return <Icons.Restaurant size={16} />;
        case Category.COCINA: return <Icons.Cocina size={16} />;
        case Category.TTOO: return <Icons.TTOO size={16} />;
        case Category.SANITARIOS: return <Icons.Sanitarios size={16} />;
        default: return <Icons.Other size={16} />;
    }
  }

  return (
    <div className="max-w-5xl mx-auto animate-fade-in">
      {/* Header Navigation */}
      <button 
        onClick={onBack}
        className="mb-6 flex items-center text-slate-500 hover:text-emerald-700 transition-colors font-medium text-sm"
      >
        <Icons.Back size={16} className="mr-1" /> Volver al Tablero
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content (Left 2 cols) */}
        <div className="lg:col-span-2 space-y-6">
            {/* Incident Header Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
                <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-bold uppercase tracking-wide flex items-center gap-2">
                                {getCategoryIcon(incident.category)}
                                {incident.category}
                            </span>
                            <span className="text-slate-400 text-sm">#{incident.id.slice(0,8)}</span>
                        </div>
                        <h1 className="text-3xl font-bold text-slate-900 mb-2">{incident.title}</h1>
                        <div className="flex items-center text-slate-500 text-sm gap-4">
                            <span className="flex items-center gap-1 font-medium bg-slate-50 px-2 py-1 rounded">
                                <Icons.Location size={14} className="text-emerald-600" /> 
                                {incident.location}
                            </span>
                            <span className="flex items-center gap-1"><Icons.Clock size={14} /> {new Date(incident.createdAt).toLocaleDateString()}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <select 
                            value={incident.status}
                            onChange={(e) => onUpdateStatus(incident.id, e.target.value as Status)}
                            className="px-4 py-2 rounded-lg border border-slate-300 bg-white text-slate-700 text-sm font-medium focus:ring-2 focus:ring-emerald-500 cursor-pointer hover:border-emerald-500 transition-colors"
                        >
                            {Object.values(Status).map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                </div>

                <div className="prose prose-slate max-w-none text-slate-700 border-t border-slate-100 pt-6">
                    <h3 className="text-sm font-bold uppercase text-slate-400 mb-2">Descripción</h3>
                    <p className="whitespace-pre-wrap leading-relaxed text-lg">{incident.description}</p>
                </div>
            </div>

            {/* AI Assistant Section */}
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-6 border border-emerald-100 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5">
                    <Icons.Magic size={120} />
                </div>
                <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-emerald-900 flex items-center gap-2">
                            <Icons.Magic className="text-emerald-600" size={20} />
                            Asistente Mantenimiento AI
                        </h3>
                        {!aiSolution && (
                             <button 
                                onClick={handleGenerateSolution}
                                disabled={isGeneratingSolution}
                                className="px-4 py-2 bg-white text-emerald-700 rounded-lg text-sm font-medium shadow-sm hover:shadow-md transition-all flex items-center gap-2"
                             >
                                {isGeneratingSolution ? 'Pensando...' : 'Generar Plan de Acción'}
                             </button>
                        )}
                    </div>
                    
                    {isGeneratingSolution && (
                        <div className="flex flex-col items-center justify-center py-8 text-emerald-600">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mb-3"></div>
                            <p className="text-sm">Analizando datos del camping...</p>
                        </div>
                    )}

                    {aiSolution && (
                        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-5 text-slate-800 text-sm shadow-inner border border-emerald-100/50">
                            <div className="prose prose-sm prose-emerald max-w-none">
                                <pre className="whitespace-pre-wrap font-sans">{aiSolution}</pre>
                            </div>
                            <div className="mt-4 flex gap-2">
                                <button 
                                    onClick={() => onAddComment(incident.id, `**Plan Sugerido por IA:**\n\n${aiSolution}`)}
                                    className="text-xs bg-emerald-600 text-white px-3 py-1.5 rounded-md hover:bg-emerald-700 transition-colors"
                                >
                                    Añadir como Nota
                                </button>
                                <button 
                                    onClick={() => setAiSolution(null)}
                                    className="text-xs text-slate-500 hover:text-slate-700 px-3 py-1.5"
                                >
                                    Cerrar
                                </button>
                            </div>
                        </div>
                    )}

                    {!aiSolution && !isGeneratingSolution && (
                        <p className="text-emerald-800/70 text-sm">
                            ¿Necesitas ayuda técnica? Puedo sugerir un procedimiento de reparación basado en el tipo de incidencia ({incident.category}).
                        </p>
                    )}
                </div>
            </div>

            {/* Comments Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
                <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                    <Icons.Comment className="text-slate-400" />
                    Historial de Seguimiento
                </h3>

                <div className="space-y-6 mb-8">
                    {incident.comments.length === 0 ? (
                        <p className="text-slate-400 text-center italic py-4">No hay notas todavía.</p>
                    ) : (
                        incident.comments.map((comment) => (
                            <div key={comment.id} className="flex gap-4 group">
                                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 flex-shrink-0 font-bold text-xs border border-slate-200">
                                    {comment.author.substring(0,2).toUpperCase()}
                                </div>
                                <div className="flex-1">
                                    <div className="bg-slate-50 rounded-lg rounded-tl-none p-4 group-hover:bg-slate-100 transition-colors">
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="font-semibold text-slate-700 text-sm">{comment.author}</span>
                                            <span className="text-xs text-slate-400">{new Date(comment.timestamp).toLocaleTimeString()} · {new Date(comment.timestamp).toLocaleDateString()}</span>
                                        </div>
                                        <p className="text-slate-600 text-sm whitespace-pre-wrap">{comment.text}</p>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <form onSubmit={submitComment} className="relative">
                    <textarea 
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Escribe una nota interna, actualización o seguimiento..."
                        className="w-full pl-4 pr-12 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all min-h-[80px]"
                    />
                    <button 
                        type="submit"
                        disabled={!newComment.trim()}
                        className="absolute bottom-3 right-3 text-emerald-600 hover:text-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Icons.Send size={20} />
                    </button>
                </form>
            </div>
        </div>

        {/* Sidebar Info (Right col) */}
        <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
                <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Datos Técnicos</h4>
                
                <div className="space-y-4">
                    <div>
                        <span className="text-xs text-slate-500 block mb-1">Prioridad</span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                            ${incident.priority === Priority.CRITICA ? 'bg-red-100 text-red-800' : 
                              incident.priority === Priority.ALTA ? 'bg-orange-100 text-orange-800' :
                              incident.priority === Priority.MEDIA ? 'bg-yellow-100 text-yellow-800' : 
                              'bg-blue-100 text-blue-800'}`}>
                            {incident.priority}
                        </span>
                    </div>
                    <div>
                        <span className="text-xs text-slate-500 block mb-1">Estado</span>
                        <span className="text-sm font-medium text-slate-700">{incident.status}</span>
                    </div>
                     <div>
                        <span className="text-xs text-slate-500 block mb-1">Categoría</span>
                        <span className="flex items-center gap-2 text-sm font-medium text-slate-700">
                             {getCategoryIcon(incident.category)} {incident.category}
                        </span>
                    </div>
                    <div>
                        <span className="text-xs text-slate-500 block mb-1">Reportado por</span>
                        <span className="flex items-center gap-1 text-sm font-medium text-slate-700">
                             <Icons.User size={14} /> {incident.reporter}
                        </span>
                    </div>
                </div>
            </div>

            <div className="bg-slate-800 rounded-xl p-5 text-white shadow-lg relative overflow-hidden">
                <div className="absolute -right-6 -bottom-6 opacity-20 text-emerald-400">
                    <Icons.Parcelas size={100} />
                </div>
                <h4 className="text-sm font-bold opacity-80 uppercase tracking-wider mb-2">Ubicación</h4>
                <div className="flex items-start gap-3 mt-4">
                    <div className="bg-white/10 p-2 rounded-lg text-emerald-400">
                         <Icons.Location size={24} />
                    </div>
                    <div>
                        <p className="font-bold text-lg leading-tight">{incident.location}</p>
                        <p className="text-xs opacity-60 mt-1">Ver en mapa del camping</p>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};