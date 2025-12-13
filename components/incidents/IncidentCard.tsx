import React from 'react';
import { Incident, Priority, Status, Category } from '../../types';
import { Icons } from '../ui/icons';

interface IncidentCardProps {
  incident: Incident;
  onClick: (id: string) => void;
}

const getPriorityColor = (priority: Priority) => {
  switch (priority) {
    case Priority.CRITICA: return 'text-red-700 bg-red-50 border-red-200';
    case Priority.ALTA: return 'text-orange-700 bg-orange-50 border-orange-200';
    case Priority.MEDIA: return 'text-yellow-700 bg-yellow-50 border-yellow-200';
    case Priority.BAJA: return 'text-blue-700 bg-blue-50 border-blue-200';
    default: return 'text-gray-700 bg-gray-50 border-gray-200';
  }
};

const getStatusColor = (status: Status) => {
  switch (status) {
    case Status.PENDIENTE: return 'bg-red-100 text-red-700 border-red-200';
    case Status.EN_PROCESO: return 'bg-amber-100 text-amber-800 border-amber-200';
    case Status.FINALIZADA: return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    default: return 'bg-gray-100 text-gray-700';
  }
};

const getCategoryIcon = (category: Category) => {
    switch (category) {
        case Category.PARCELAS: return <Icons.Parcelas size={18} />;
        case Category.BUNGALOWS: return <Icons.Bungalows size={18} />;
        case Category.GLAMPING: return <Icons.Glamping size={18} />;
        case Category.RESTAURANT: return <Icons.Restaurant size={18} />;
        case Category.COCINA: return <Icons.Cocina size={18} />;
        case Category.TTOO: return <Icons.TTOO size={18} />;
        case Category.SANITARIOS: return <Icons.Sanitarios size={18} />;
        default: return <Icons.Other size={18} />;
    }
}

export const IncidentCard: React.FC<IncidentCardProps> = ({ incident, onClick }) => {
  return (
    <div 
      onClick={() => onClick(incident.id)}
      className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 hover:shadow-md transition-shadow cursor-pointer group"
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${getPriorityColor(incident.priority)} bg-opacity-40`}>
                {getCategoryIcon(incident.category)}
            </div>
            <div>
                <h3 className="font-semibold text-slate-800 group-hover:text-emerald-700 transition-colors">
                    {incident.title}
                </h3>
                <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                    <span className="flex items-center gap-1"><Icons.Location size={10} /> {incident.location}</span>
                    <span>•</span>
                    <span>#{incident.id.slice(0, 8)}</span>
                </div>
            </div>
        </div>
        <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${getStatusColor(incident.status)}`}>
          {incident.status}
        </span>
      </div>
      
      <p className="text-slate-600 text-sm mb-4 line-clamp-2 pl-1">
        {incident.description}
      </p>

      <div className="flex items-center justify-between text-xs text-slate-500 border-t border-slate-100 pt-3">
        <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
                <Icons.Clock size={14} />
                {new Date(incident.createdAt).toLocaleDateString()}
            </span>
            <span className="flex items-center gap-1">
                <Icons.User size={14} />
                {incident.reporter}
            </span>
        </div>
        <div className={`flex items-center gap-1 font-bold ${getPriorityColor(incident.priority).split(' ')[0]}`}>
           Prioridad {incident.priority}
        </div>
      </div>
    </div>
  );
};
