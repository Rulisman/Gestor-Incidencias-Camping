import React, { useState, useEffect } from 'react';
import { Priority, Category, AIAnalysisResult } from '../../types';
import { Icons } from '../ui/Icons';
import { analyzeIncidentDescription } from '../../services/gemini';

interface IncidentFormProps {
  onSubmit: (data: { title: string; description: string; location: string; priority: Priority; category: Category }) => void;
  onCancel: () => void;
}

export const IncidentForm: React.FC<IncidentFormProps> = ({ onSubmit, onCancel }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [priority, setPriority] = useState<Priority>(Priority.MEDIA);
  const [category, setCategory] = useState<Category>(Category.PARCELAS);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);

  // Auto-análisis cuando el usuario escribe una descripción y lugar
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (description.length > 15 && !title) {
         await handleAIAnalysis();
      }
    }, 1500);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [description]);

  const handleAIAnalysis = async () => {
    if (description.length < 5) return;
    
    setIsAnalyzing(true);
    try {
      const result: AIAnalysisResult = await analyzeIncidentDescription(description, location);
      
      if (!title) setTitle(result.titleSuggestion);
      setPriority(result.priority);
      setCategory(result.category);
      setAiSuggestions(result.suggestedSteps);
    } catch (e) {
      console.error("Fallo análisis IA", e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ title, description, location, priority, category });
  };

  return (
    <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-8 max-w-2xl w-full mx-auto animate-fade-in border-t-4 border-[#0054a6]">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <div className="bg-blue-50 p-2 rounded-lg text-[#0054a6]"><Icons.Add size={24} /></div>
            Nueva Incidencia
        </h2>
        <button onClick={onCancel} className="text-slate-400 hover:text-slate-600 transition-colors">
          <Icons.Close size={24} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                    Lugar / Ubicación
                </label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Icons.Location size={16} />
                    </div>
                    <input
                        type="text"
                        required
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#0054a6] focus:border-[#0054a6] transition-all"
                        placeholder="ej. Bungalow 42, Piscina..."
                    />
                </div>
            </div>
            <div>
                 <label className="block text-sm font-bold text-slate-700 mb-2">
                    Título (Opcional, auto por IA)
                 </label>
                 <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#0054a6] focus:border-[#0054a6] transition-all"
                    placeholder="Resumen breve"
                 />
            </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">
            Descripción del Problema
          </label>
          <div className="relative">
            <textarea
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#0054a6] focus:border-[#0054a6] transition-all min-h-[120px]"
              placeholder="Describe qué ha sucedido, qué falla, etc..."
            />
            <button
                type="button"
                onClick={handleAIAnalysis}
                disabled={isAnalyzing || description.length < 5}
                className="absolute bottom-3 right-3 text-xs bg-blue-50 text-[#0054a6] hover:bg-blue-100 border border-blue-200 px-3 py-1.5 rounded-full flex items-center gap-1.5 transition-colors disabled:opacity-50 font-medium shadow-sm"
            >
                {isAnalyzing ? (
                    <span className="animate-spin rounded-full h-3 w-3 border-b-2 border-[#0054a6]"></span>
                ) : (
                    <Icons.Magic size={12} />
                )}
                {isAnalyzing ? 'Analizando...' : 'Auto-Completar IA'}
            </button>
          </div>
        </div>

        {/* AI Suggestions Panel */}
        {aiSuggestions.length > 0 && (
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-100 animate-fade-in">
                <h4 className="text-xs font-bold text-[#0054a6] uppercase tracking-wider mb-2 flex items-center gap-2">
                    <Icons.Magic size={12} /> Sugerencias Iniciales
                </h4>
                <ul className="text-sm text-blue-900 list-disc list-inside space-y-1">
                    {aiSuggestions.map((step, idx) => (
                        <li key={idx}>{step}</li>
                    ))}
                </ul>
            </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Categoría</label>
            <div className="relative">
                <select
                value={category}
                onChange={(e) => setCategory(e.target.value as Category)}
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#0054a6] focus:border-[#0054a6] appearance-none bg-white font-medium text-slate-700"
                >
                {Object.values(Category).map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                ))}
                </select>
                <div className="absolute left-3 top-3.5 text-slate-500 pointer-events-none">
                    {category === Category.PARCELAS && <Icons.Parcelas size={18} />}
                    {category === Category.BUNGALOWS && <Icons.Bungalows size={18} />}
                    {category === Category.GLAMPING && <Icons.Glamping size={18} />}
                    {category === Category.RESTAURANT && <Icons.Restaurant size={18} />}
                    {category === Category.COCINA && <Icons.Cocina size={18} />}
                    {category === Category.TTOO && <Icons.TTOO size={18} />}
                    {category === Category.SANITARIOS && <Icons.Sanitarios size={18} />}
                </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Prioridad</label>
            <div className="flex gap-2">
                {Object.values(Priority).map((p) => (
                    <button
                        key={p}
                        type="button"
                        onClick={() => setPriority(p)}
                        className={`flex-1 py-2.5 px-1 rounded-lg text-xs md:text-sm font-bold transition-all border ${
                            priority === p 
                            ? 'bg-[#0054a6] text-white border-[#0054a6] shadow-md' 
                            : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                        }`}
                    >
                        {p}
                    </button>
                ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 mt-6">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2.5 rounded-lg text-slate-600 font-medium hover:bg-slate-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-6 py-2.5 rounded-lg bg-[#0054a6] text-white font-bold hover:bg-[#004080] shadow-lg shadow-blue-200 transition-all transform active:scale-95 flex items-center gap-2"
          >
            <Icons.Check size={18} />
            Crear Incidencia
          </button>
        </div>
      </form>
    </div>
  );
};