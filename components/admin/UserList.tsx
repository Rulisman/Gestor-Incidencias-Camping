import React, { useState } from 'react';
import { User, UserRole, Department } from '../../types';
import { Icons } from '../ui/icons';

interface UserListProps {
  users: User[];
  currentUserEmail: string;
  onUpdateRole: (email: string, newRole: UserRole) => void;
  onCreateUser: (user: User) => void;
}

export const UserList: React.FC<UserListProps> = ({ users, currentUserEmail, onUpdateRole, onCreateUser }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<User>({
    name: '',
    email: '',
    password: '',
    department: Department.RECEPCION,
    role: 'USER'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password) return;
    
    onCreateUser(formData);
    setIsModalOpen(false);
    // Reset form
    setFormData({
        name: '',
        email: '',
        password: '',
        department: Department.RECEPCION,
        role: 'USER'
    });
  };

  return (
    <div className="space-y-6 animate-fade-in relative">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Icons.Users className="text-[#0054a6]" />
            Gestión de Usuarios y Permisos
        </h2>
        <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#0054a6] text-white rounded-lg text-sm font-bold hover:bg-[#004080] transition-colors shadow-sm active:scale-95"
        >
            <Icons.Add size={18} />
            Nuevo Usuario
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-xs uppercase font-bold text-slate-500 border-b border-slate-200">
                    <tr>
                        <th className="px-6 py-4">Usuario</th>
                        <th className="px-6 py-4">Departamento</th>
                        <th className="px-6 py-4">Email</th>
                        <th className="px-6 py-4">Rol / Permisos</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {users.map((user) => (
                        <tr key={user.email} className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4 font-medium text-slate-900 flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-blue-50 text-[#0054a6] flex items-center justify-center font-bold border border-blue-100">
                                    {user.name.substring(0,2).toUpperCase()}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        {user.name}
                                        {user.email === currentUserEmail && <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">(Tú)</span>}
                                    </div>
                                    <div className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                                        <Icons.Lock size={10} /> Password establecido
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-700">
                                    {user.department}
                                </span>
                            </td>
                            <td className="px-6 py-4 text-slate-500">{user.email}</td>
                            <td className="px-6 py-4">
                                {user.email === 'info@playabrava.com' ? (
                                    <span className="flex items-center gap-1 text-[#0054a6] font-bold text-xs bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100 w-fit">
                                        <Icons.Glamping size={14} /> SUPER ADMIN
                                    </span>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <select 
                                            value={user.role}
                                            onChange={(e) => onUpdateRole(user.email, e.target.value as UserRole)}
                                            className={`text-sm rounded-lg border px-3 py-1.5 font-medium transition-colors focus:ring-2 focus:ring-[#0054a6] outline-none cursor-pointer ${
                                                user.role === 'ADMIN' 
                                                ? 'bg-blue-50 border-blue-200 text-[#0054a6]' 
                                                : 'bg-white border-slate-300 text-slate-600'
                                            }`}
                                        >
                                            <option value="USER">USER (Editar)</option>
                                            <option value="ADMIN">ADMIN (Total)</option>
                                        </select>
                                    </div>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </div>
      
      <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex items-start gap-3">
            <Icons.Other className="text-[#0054a6] mt-0.5 flex-shrink-0" size={20} />
            <div className="text-sm text-blue-900">
                <p className="font-bold mb-1">Sobre la seguridad:</p>
                <ul className="list-disc list-inside space-y-1 opacity-90">
                    <li>Los usuarios solo pueden entrar con el email y contraseña aquí definidos.</li>
                    <li><strong>ADMIN:</strong> Pueden crear incidencias y gestionar usuarios.</li>
                    <li><strong>USER:</strong> Pueden crear incidencias pero no pueden cambiar estado ni acceder a usuarios.</li>
                </ul>
            </div>
      </div>

      {/* Modal Crear Usuario */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-slate-800">Dar de alta Usuario</h3>
                    <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                        <Icons.Close size={24} />
                    </button>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Nombre</label>
                        <input 
                            type="text" required 
                            value={formData.name}
                            onChange={e => setFormData({...formData, name: e.target.value})}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0054a6] focus:border-[#0054a6]"
                            placeholder="Ej. Juan Pérez"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Email</label>
                        <input 
                            type="email" required 
                            value={formData.email}
                            onChange={e => setFormData({...formData, email: e.target.value})}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0054a6] focus:border-[#0054a6]"
                            placeholder="juan@playabrava.com"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Contraseña</label>
                        <div className="relative">
                            <input 
                                type="password" required 
                                value={formData.password}
                                onChange={e => setFormData({...formData, password: e.target.value})}
                                className="w-full px-3 py-2 pl-9 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0054a6] focus:border-[#0054a6]"
                                placeholder="••••••••"
                            />
                            <div className="absolute left-3 top-2.5 text-slate-400">
                                <Icons.Lock size={16} />
                            </div>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Departamento</label>
                        <select 
                            value={formData.department}
                            onChange={e => setFormData({...formData, department: e.target.value as Department})}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0054a6] focus:border-[#0054a6] bg-white"
                        >
                            {Object.values(Department).map(d => (
                                <option key={d} value={d}>{d}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Rol / Permisos</label>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => setFormData({...formData, role: 'USER'})}
                                className={`px-4 py-2 rounded-lg border text-sm font-bold transition-all ${
                                    formData.role === 'USER' 
                                    ? 'bg-slate-800 text-white border-slate-800' 
                                    : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                                }`}
                            >
                                USER
                            </button>
                            <button
                                type="button"
                                onClick={() => setFormData({...formData, role: 'ADMIN'})}
                                className={`px-4 py-2 rounded-lg border text-sm font-bold transition-all ${
                                    formData.role === 'ADMIN' 
                                    ? 'bg-[#0054a6] text-white border-[#0054a6]' 
                                    : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                                }`}
                            >
                                ADMIN
                            </button>
                        </div>
                    </div>

                    <div className="pt-4 flex gap-3">
                        <button 
                            type="button" 
                            onClick={() => setIsModalOpen(false)}
                            className="flex-1 px-4 py-2 border border-slate-300 text-slate-600 font-bold rounded-lg hover:bg-slate-50"
                        >
                            Cancelar
                        </button>
                        <button 
                            type="submit" 
                            className="flex-1 px-4 py-2 bg-[#0054a6] text-white font-bold rounded-lg hover:bg-[#004080] shadow-lg shadow-blue-200"
                        >
                            Crear Usuario
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
};
