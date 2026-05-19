
import React, { useState, useMemo } from 'react';
import { CheckCircle, XCircle, Clock, Search, Filter, Calendar, Download, AlertTriangle, MoreHorizontal, MapPin, ChevronLeft, ChevronRight } from 'lucide-react';
import { MOCK_ACCESS_LOGS } from '../constants';

const AccessControl: React.FC = () => {
  const [filter, setFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 8;

  // Generate a larger dataset for pagination demonstration
  const allLogs = useMemo(() => {
    return Array.from({ length: 45 }).map((_, i) => {
        const baseLog = MOCK_ACCESS_LOGS[i % MOCK_ACCESS_LOGS.length];
        return { 
            ...baseLog, 
            id: `${baseLog.id}-${i}`, 
            // Variate timestamps slightly for realism
            timestamp: i === 0 ? 'Ahora' : `Hace ${i * 5 + 2} min`
        };
    });
  }, []);

  const totalPages = Math.ceil(allLogs.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentLogs = allLogs.slice(startIndex, endIndex);

  const handlePrevPage = () => setCurrentPage(prev => Math.max(1, prev - 1));
  const handleNextPage = () => setCurrentPage(prev => Math.min(totalPages, prev + 1));

  return (
    <div className="space-y-6 md:space-y-8 animate-fade-in pb-20">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl lg:text-4xl font-light text-zinc-900 mb-2 tracking-tight">Historial de Accesos</h1>
          <p className="text-zinc-500 font-light tracking-wide text-sm">Registro detallado de entradas y salidas.</p>
        </div>
        <button className="w-full md:w-auto px-6 py-3 border border-zinc-200 text-zinc-600 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-zinc-50 flex items-center justify-center gap-2 transition-colors shadow-sm">
            <Download className="w-4 h-4" /> Exportar Reporte
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-2 rounded-xl border border-zinc-100 shadow-sm flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
               <input 
                  type="text" 
                  placeholder="Buscar en el historial..." 
                  className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 border-none rounded-lg text-sm focus:ring-0 placeholder:text-zinc-400"
               />
          </div>
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
               <button className="px-4 py-2.5 bg-white border border-zinc-200 rounded-lg text-zinc-500 text-sm font-medium flex items-center gap-2 hover:border-zinc-400 transition-colors whitespace-nowrap">
                  <Calendar className="w-4 h-4" /> Octubre 2024
               </button>
               <button className="px-4 py-2.5 bg-zinc-900 text-white rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-zinc-800 transition-colors whitespace-nowrap">
                  <Filter className="w-4 h-4" /> Filtrar
               </button>
          </div>
      </div>

      {/* Mobile Card View (Visible < md) */}
      <div className="grid grid-cols-1 gap-3 md:hidden">
          {currentLogs.map((log) => (
              <div key={log.id} className="bg-white p-4 rounded-xl border border-zinc-100 shadow-sm flex flex-col gap-3">
                  <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                          <img src={log.clientAvatar} className="w-10 h-10 rounded-full object-cover" />
                          <div>
                              <span className="block text-sm font-bold text-zinc-900">{log.clientName}</span>
                              <span className="flex items-center gap-1 text-xs text-zinc-500 mt-0.5">
                                  <Clock className="w-3 h-3" /> {log.timestamp}
                              </span>
                          </div>
                      </div>
                      <button className="text-zinc-300">
                          <MoreHorizontal className="w-5 h-5" />
                      </button>
                  </div>
                  
                  <div className="flex items-center justify-between pt-2 border-t border-zinc-50">
                      <div className="flex items-center gap-1.5 text-xs text-zinc-600 font-medium">
                          <MapPin className="w-3 h-3 text-zinc-400" /> {log.location}
                      </div>
                      
                      {log.status === 'GRANTED' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 rounded text-[10px] font-bold uppercase tracking-wide">
                              <CheckCircle className="w-3 h-3" /> Permitido
                          </span>
                      ) : log.status === 'DENIED' ? (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-50 text-red-700 rounded text-[10px] font-bold uppercase tracking-wide">
                              <XCircle className="w-3 h-3" /> Denegado
                          </span>
                      ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-50 text-yellow-700 rounded text-[10px] font-bold uppercase tracking-wide">
                              <AlertTriangle className="w-3 h-3" /> Manual
                          </span>
                      )}
                  </div>
                  {log.message && (
                    <div className="text-[10px] text-zinc-500 bg-zinc-50 px-3 py-2 rounded border border-zinc-100 italic">
                        Nota: {log.message}
                    </div>
                  )}
              </div>
          ))}
      </div>

      {/* Desktop Table View (Hidden < md) */}
      <div className="hidden md:block bg-white border border-zinc-100 rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full text-left">
              <thead className="bg-zinc-50 border-b border-zinc-100 text-[10px] uppercase font-bold text-zinc-400 tracking-wider">
                  <tr>
                      <th className="py-4 pl-6">Usuario</th>
                      <th className="py-4">Hora</th>
                      <th className="py-4">Ubicación</th>
                      <th className="py-4">Estado</th>
                      <th className="py-4 pr-6 text-right">Detalles</th>
                  </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50">
                  {currentLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-zinc-50 transition-colors">
                          <td className="py-4 pl-6">
                              <div className="flex items-center gap-3">
                                  <img src={log.clientAvatar} className="w-8 h-8 rounded-full object-cover" />
                                  <span className="text-sm font-medium text-zinc-900">{log.clientName}</span>
                              </div>
                          </td>
                          <td className="py-4 text-sm text-zinc-500 flex items-center gap-2">
                              <Clock className="w-3 h-3" /> {log.timestamp}
                          </td>
                          <td className="py-4 text-sm text-zinc-500">{log.location}</td>
                          <td className="py-4">
                              {log.status === 'GRANTED' ? (
                                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 rounded text-[10px] font-bold uppercase tracking-wide">
                                      <CheckCircle className="w-3 h-3" /> Permitido
                                  </span>
                              ) : log.status === 'DENIED' ? (
                                   <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-50 text-red-700 rounded text-[10px] font-bold uppercase tracking-wide">
                                      <XCircle className="w-3 h-3" /> Denegado
                                  </span>
                              ) : (
                                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-50 text-yellow-700 rounded text-[10px] font-bold uppercase tracking-wide">
                                      <AlertTriangle className="w-3 h-3" /> Manual
                                  </span>
                              )}
                          </td>
                          <td className="py-4 pr-6 text-right text-xs text-zinc-400">
                               {log.message || '-'}
                          </td>
                      </tr>
                  ))}
              </tbody>
          </table>
      </div>

      {/* Pagination Footer */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 py-2">
         <div className="text-xs text-zinc-500 font-medium">
             Mostrando <span className="text-zinc-900 font-bold">{Math.min(startIndex + 1, allLogs.length)}-{Math.min(endIndex, allLogs.length)}</span> de <span className="text-zinc-900 font-bold">{allLogs.length}</span> registros
         </div>
         
         <div className="flex items-center gap-2">
             <button 
                onClick={handlePrevPage}
                disabled={currentPage === 1}
                className="p-2.5 rounded-xl border border-zinc-200 text-zinc-500 hover:text-zinc-900 hover:border-zinc-400 hover:bg-white disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:border-zinc-200 disabled:cursor-not-allowed transition-all"
            >
                 <ChevronLeft className="w-4 h-4" />
             </button>
             
             <div className="flex items-center gap-1">
                 {/* Page Numbers Logic */}
                 {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                     // Simple pagination logic for demo: Show first 5 or shift logic
                     let p = i + 1;
                     // If total pages > 5 and current page > 3, shift window (simplified)
                     if(totalPages > 5 && currentPage > 3) {
                         p = currentPage - 2 + i;
                         if(p > totalPages) p = i + (totalPages - 4); // Clamp at end
                     }

                     return (
                         <button 
                            key={p}
                            onClick={() => setCurrentPage(p)}
                            className={`w-9 h-9 rounded-xl text-xs font-bold transition-all
                                ${currentPage === p 
                                    ? 'bg-zinc-900 text-white shadow-lg shadow-zinc-900/20' 
                                    : 'text-zinc-500 hover:bg-zinc-100'}`}
                         >
                             {p}
                         </button>
                     );
                 })}
             </div>

             <button 
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className="p-2.5 rounded-xl border border-zinc-200 text-zinc-500 hover:text-zinc-900 hover:border-zinc-400 hover:bg-white disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:border-zinc-200 disabled:cursor-not-allowed transition-all"
            >
                 <ChevronRight className="w-4 h-4" />
             </button>
         </div>
      </div>
    </div>
  );
};

export default AccessControl;
