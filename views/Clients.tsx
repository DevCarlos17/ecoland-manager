
import React, { useState, useMemo } from 'react';
import { MOCK_CLIENTS, MOCK_ACCESS_LOGS } from '../constants';
import { MoreHorizontal, Plus, Upload, User, Mail, Phone, ArrowLeft, ChevronLeft, ChevronRight, Search, ShieldCheck, CheckCircle, XCircle, Clock, Dumbbell, MapPin, Tag, BedDouble, Waves, Coffee, Star, Wifi, Edit2, AlertCircle, Filter, Calendar, Activity, Zap, PauseCircle, PlayCircle, CreditCard, History } from 'lucide-react';
import { Client } from '../types';

const Clients: React.FC = () => {
  const [view, setView] = useState<'LIST' | 'REGISTER' | 'DETAIL'>('LIST');
  const [clients, setClients] = useState<Client[]>(MOCK_CLIENTS);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [filterStatus, setFilterStatus] = useState<'TODOS' | 'ACTIVO' | 'VENCIDO' | 'INACTIVO'>('TODOS');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 6;

  // Registration Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    initialPlan: 'Ninguno',
    notes: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Logic: If a plan is selected, user is ACTIVO. If 'Ninguno', user is INACTIVO (Lead).
    const initialStatus = formData.initialPlan !== 'Ninguno' ? 'ACTIVO' : 'INACTIVO';
    
    const newClient: Client = {
      id: Math.random().toString(36).substring(2, 9),
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      status: initialStatus,
      activePlans: formData.initialPlan === 'Ninguno' ? [] : [formData.initialPlan],
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name)}&background=1d4ed8&color=fff`,
      lastAccess: 'Recién Registrado',
      notes: formData.notes
    };

    setClients([newClient, ...clients]);
    setFormData({ name: '', email: '', phone: '', initialPlan: 'Ninguno', notes: '' });
    setView('LIST');
  };

  const handleClientClick = (client: Client) => {
      setSelectedClient(client);
      setView('DETAIL');
  };

  // Logic to Pause/Resume Membership
  const toggleClientPause = () => {
      if (!selectedClient) return;
      
      const newStatus = selectedClient.status === 'PAUSA_MEDICA' ? 'ACTIVO' : 'PAUSA_MEDICA';
      
      // Update local state for immediate UI feedback
      const updatedClient = { ...selectedClient, status: newStatus as any };
      setSelectedClient(updatedClient);

      // Update main list
      setClients(prev => prev.map(c => c.id === updatedClient.id ? updatedClient : c));
  };

  // Filter & Pagination Logic
  const filteredClients = useMemo(() => {
    return clients.filter(client => {
      const matchesStatus = filterStatus === 'TODOS' || client.status === filterStatus;
      const matchesSearch = client.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            client.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            client.id.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [clients, filterStatus, searchQuery]);

  const paginatedClients = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredClients.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredClients, currentPage]);

  const totalPages = Math.ceil(filteredClients.length / ITEMS_PER_PAGE);

  // Dynamic Tag Generator based on Plans
  const getClientTags = (plans: string[]) => {
      const tags = [];
      const planString = plans.join(' ').toLowerCase();

      // Logic to derive "Roles" from "Services"
      if (planString.includes('habitacion') || planString.includes('suite')) {
          tags.push({ label: 'Huésped', icon: BedDouble, color: 'bg-indigo-50 text-indigo-700 border-indigo-100' });
      }
      if (planString.includes('crossfit') || planString.includes('gym') || planString.includes('gimnasio')) {
          tags.push({ label: 'Club', icon: Dumbbell, color: 'bg-orange-50 text-orange-700 border-orange-100' });
      }
      if (planString.includes('piscina') || planString.includes('wet')) {
          tags.push({ label: 'Piscina', icon: Waves, color: 'bg-blue-50 text-blue-700 border-blue-100' });
      }
      
      // Default tag if Active but no specific plan match
      if (tags.length === 0 && plans.length > 0) {
          tags.push({ label: 'Servicios', icon: Star, color: 'bg-zinc-100 text-zinc-600 border-zinc-200' });
      }
      
      return tags;
  };

  // --- VIEW: REGISTRATION FORM ---
  if (view === 'REGISTER') {
    return (
      <div className="animate-fade-in max-w-5xl mx-auto pb-20">
        <div className="flex items-center gap-4 mb-6 lg:mb-8">
            <button onClick={() => setView('LIST')} className="w-10 h-10 rounded-full bg-white border border-zinc-200 flex items-center justify-center text-zinc-500 hover:text-black transition-all shadow-sm">
                <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
                <h1 className="text-2xl lg:text-3xl font-light text-zinc-900">Registrar Cliente</h1>
                <p className="text-zinc-500 text-xs lg:text-sm tracking-wide">Crear un nuevo perfil de usuario.</p>
            </div>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
                <div className="bg-white p-6 lg:p-8 rounded-2xl border border-zinc-100 shadow-sm">
                    <h3 className="text-lg font-medium text-zinc-900 mb-6 flex items-center gap-2"><User className="w-4 h-4 text-brand" /> Datos Personales</h3>
                    <div className="flex flex-col md:flex-row gap-8">
                        <div className="flex flex-col items-center space-y-3">
                            <div className="w-32 h-32 rounded-full bg-zinc-50 border-2 border-dashed border-zinc-200 flex flex-col items-center justify-center text-zinc-400 hover:border-brand cursor-pointer transition-all">
                                <Upload className="w-8 h-8 mb-2" />
                                <span className="text-[10px] font-bold uppercase">Foto</span>
                            </div>
                        </div>
                        <div className="flex-1 space-y-5">
                            <div>
                                <label className="block text-xs font-bold uppercase text-zinc-400 mb-1.5 tracking-wider">Nombre</label>
                                <input type="text" name="name" required value={formData.name} onChange={handleInputChange} className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:border-brand outline-none" placeholder="Nombre completo" />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-xs font-bold uppercase text-zinc-400 mb-1.5 tracking-wider">Email</label>
                                    <input type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:border-brand outline-none" placeholder="correo@ejemplo.com" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase text-zinc-400 mb-1.5 tracking-wider">Teléfono</label>
                                    <input type="tel" name="phone" required value={formData.phone} onChange={handleInputChange} className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:border-brand outline-none" placeholder="+58 412 000 0000" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                <div className="bg-white p-6 lg:p-8 rounded-2xl border border-zinc-100 shadow-sm h-full flex flex-col">
                    <h3 className="text-lg font-medium text-zinc-900 mb-6 flex items-center gap-2"><Tag className="w-4 h-4 text-brand" /> Suscripción Inicial</h3>
                    <div className="space-y-5 flex-1">
                        <div>
                            <label className="block text-xs font-bold uppercase text-zinc-400 mb-1.5 tracking-wider">Plan / Acceso</label>
                            <select name="initialPlan" value={formData.initialPlan} onChange={handleInputChange} className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl outline-none cursor-pointer">
                                <option value="Ninguno">Solo Registro (Inactivo)</option>
                                <option value="CrossFit Ilimitado">CrossFit Ilimitado</option>
                                <option value="Gimnasio Mensual">Gimnasio Mensual</option>
                                <option value="Day Pass Piscina">Day Pass Piscina</option>
                                <option value="Habitación Sencilla">Habitación Sencilla</option>
                            </select>
                            <p className="text-[10px] text-zinc-400 mt-2">
                                Si selecciona un plan, el estado será <strong>ACTIVO</strong> automáticamente.
                            </p>
                        </div>
                        
                        <div>
                            <label className="block text-xs font-bold uppercase text-zinc-400 mb-1.5 tracking-wider">Notas Iniciales</label>
                            <textarea name="notes" rows={3} value={formData.notes} onChange={handleInputChange} className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:border-brand outline-none resize-none" placeholder="Observaciones..." />
                        </div>
                    </div>
                    <div className="mt-8 flex gap-3">
                         <button type="button" onClick={() => setView('LIST')} className="flex-1 py-3 rounded-xl border border-zinc-200 text-zinc-600 font-bold text-xs uppercase tracking-widest hover:bg-zinc-50">Cancelar</button>
                        <button type="submit" className="flex-[2] py-3 rounded-xl bg-zinc-900 text-white font-bold text-xs uppercase tracking-widest hover:bg-brand shadow-lg">Crear Perfil</button>
                    </div>
                </div>
            </div>
        </form>
      </div>
    );
  }

  // --- VIEW: DETAIL ---
  if (view === 'DETAIL' && selectedClient) {
      const tags = getClientTags(selectedClient.activePlans);
      const clientLogs = MOCK_ACCESS_LOGS.filter(l => l.clientId === selectedClient.id || l.clientName === selectedClient.name).slice(0, 3);
      
      const isPaused = selectedClient.status === 'PAUSA_MEDICA';

      return (
          <div className="animate-fade-in max-w-6xl mx-auto pb-20">
              {/* Navigation & Header */}
              <div className="flex items-center justify-between mb-6">
                  <button onClick={() => setView('LIST')} className="flex items-center gap-2 text-zinc-500 hover:text-zinc-900 transition-colors">
                      <div className="w-8 h-8 rounded-full bg-white border border-zinc-200 flex items-center justify-center shadow-sm">
                          <ArrowLeft className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-medium">Volver al directorio</span>
                  </button>
                  
                  {/* Action Bar */}
                  <div className="flex gap-3">
                       <button 
                            onClick={toggleClientPause}
                            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-2 border shadow-sm
                                ${isPaused 
                                    ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100' 
                                    : 'bg-white text-orange-600 border-zinc-200 hover:border-orange-200 hover:bg-orange-50'}`}
                       >
                           {isPaused ? <PlayCircle className="w-4 h-4" /> : <PauseCircle className="w-4 h-4" />}
                           {isPaused ? 'Reactivar' : 'Pausar Membresía'}
                       </button>
                       <button className="px-4 py-2 bg-zinc-900 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-brand transition-all shadow-lg shadow-zinc-900/10 flex items-center gap-2">
                           <Plus className="w-4 h-4" /> Venta / Servicio
                       </button>
                  </div>
              </div>

              {/* UNIFIED PROFILE HEADER */}
              <div className="bg-white rounded-[2rem] border border-zinc-200 p-8 shadow-sm mb-8 relative overflow-hidden">
                  <div className="flex flex-col md:flex-row gap-8 items-start relative z-10">
                      
                      {/* Avatar */}
                      <div className="flex-shrink-0 relative">
                         <img src={selectedClient.avatar} className={`w-28 h-28 rounded-full object-cover border-4 shadow-sm ${isPaused ? 'border-orange-100 grayscale' : 'border-zinc-50'}`} />
                         <div className={`absolute bottom-1 right-1 p-1.5 rounded-full border-4 border-white ${isPaused ? 'bg-orange-500' : selectedClient.status === 'ACTIVO' ? 'bg-green-500' : 'bg-red-500'}`}>
                             {isPaused ? <PauseCircle className="w-4 h-4 text-white" /> : null}
                         </div>
                      </div>
                      
                      {/* Info & Stats Combined */}
                      <div className="flex-1 w-full">
                          <div className="flex flex-col md:flex-row justify-between items-start mb-4">
                             <div>
                                 <h2 className="text-3xl font-bold text-zinc-900 flex items-center gap-3">
                                     {selectedClient.name}
                                     <span className="text-sm font-normal text-zinc-400 font-mono bg-zinc-50 px-2 py-1 rounded-lg">#{selectedClient.id.toUpperCase()}</span>
                                 </h2>
                                 <div className="flex items-center gap-4 mt-2 text-sm text-zinc-500">
                                     <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" /> {selectedClient.email}</span>
                                     <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" /> {selectedClient.phone}</span>
                                 </div>
                             </div>
                             
                             {/* Status Badge */}
                             <div className={`px-4 py-2 rounded-xl border flex items-center gap-2 shadow-sm mt-2 md:mt-0
                                ${isPaused ? 'bg-orange-50 border-orange-100 text-orange-700' : 
                                  selectedClient.status === 'ACTIVO' ? 'bg-green-50 border-green-100 text-green-700' : 
                                  'bg-red-50 border-red-100 text-red-700'}`}>
                                 {isPaused ? <PauseCircle className="w-4 h-4" /> : selectedClient.status === 'ACTIVO' ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                                 <span className="text-xs font-bold uppercase tracking-widest">{selectedClient.status.replace('_', ' ')}</span>
                             </div>
                          </div>

                          {/* Integrated Stats Row */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-zinc-100">
                                <div>
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 block mb-1">Miembro Desde</span>
                                    <span className="text-sm font-medium text-zinc-900 flex items-center gap-2"><Calendar className="w-4 h-4 text-zinc-300" /> Oct 2023</span>
                                </div>
                                <div>
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 block mb-1">Último Acceso</span>
                                    <span className="text-sm font-medium text-zinc-900 flex items-center gap-2"><Clock className="w-4 h-4 text-zinc-300" /> {selectedClient.lastAccess}</span>
                                </div>
                                <div>
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 block mb-1">Visitas Mes</span>
                                    <span className="text-sm font-medium text-zinc-900 flex items-center gap-2"><Activity className="w-4 h-4 text-zinc-300" /> 24</span>
                                </div>
                                <div>
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 block mb-1">Saldo Pendiente</span>
                                    <span className="text-sm font-bold text-green-600 flex items-center gap-2"><CreditCard className="w-4 h-4 text-green-200" /> $0.00</span>
                                </div>
                          </div>
                      </div>
                  </div>
                  
                  {/* Decorative Background Pattern */}
                  <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-zinc-50 to-transparent rounded-bl-[100%] -z-0 opacity-50"></div>
              </div>

              {/* TWO COLUMN LAYOUT: Services List & History */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  
                  {/* LEFT: Services (Clean List) */}
                  <div className="lg:col-span-2 space-y-6">
                      <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-sm">
                          <div className="p-6 border-b border-zinc-100 bg-zinc-50/50 flex justify-between items-center">
                              <h3 className="font-bold text-zinc-900 text-sm flex items-center gap-2">
                                  <ShieldCheck className="w-4 h-4 text-brand" /> Planes y Servicios Activos
                              </h3>
                              <button className="text-[10px] font-bold uppercase text-brand hover:underline">+ Agregar</button>
                          </div>
                          
                          {selectedClient.activePlans.length > 0 ? (
                              <div className="divide-y divide-zinc-50">
                                  {selectedClient.activePlans.map((plan, idx) => (
                                      <div key={idx} className="p-5 flex items-center justify-between group hover:bg-zinc-50/50 transition-colors">
                                          <div className="flex items-center gap-4">
                                              {/* ICON CONTAINER UPDATED: Removed bg-zinc-100 and hover effects */}
                                              <div className={`w-10 h-10 flex items-center justify-center transition-colors
                                                  ${isPaused ? 'text-orange-400' : 'text-zinc-400'}`}>
                                                  {plan.toLowerCase().includes('habitacion') ? <BedDouble className="w-6 h-6" /> : 
                                                   plan.toLowerCase().includes('piscina') ? <Waves className="w-6 h-6" /> : 
                                                   <Dumbbell className="w-6 h-6" />}
                                              </div>
                                              <div>
                                                  <h4 className={`font-bold text-sm ${isPaused ? 'text-zinc-500' : 'text-zinc-900'}`}>{plan}</h4>
                                                  <p className="text-xs text-zinc-400 flex items-center gap-1">
                                                      Vence: 30 Nov 2024
                                                      {isPaused && <span className="text-orange-500 font-bold bg-orange-50 px-1 rounded ml-1">(Pausado)</span>}
                                                  </p>
                                              </div>
                                          </div>
                                          
                                          <div className="flex items-center gap-4">
                                              <div className="text-right hidden sm:block">
                                                  <span className="block text-[10px] font-bold uppercase text-zinc-400">Renovación</span>
                                                  <span className="text-xs font-medium text-zinc-700">Automática</span>
                                              </div>
                                              <button className="p-2 text-zinc-300 hover:text-zinc-900 rounded-lg hover:bg-zinc-100 transition-colors">
                                                  <MoreHorizontal className="w-5 h-5" />
                                              </button>
                                          </div>
                                      </div>
                                  ))}
                              </div>
                          ) : (
                              <div className="p-10 text-center text-zinc-400 italic bg-zinc-50/30">
                                  <p>No hay servicios activos.</p>
                              </div>
                          )}
                      </div>
                  </div>

                  {/* RIGHT: Notes & Timeline */}
                  <div className="space-y-6">
                      {/* Notes Box */}
                      <div className="bg-yellow-50/50 p-6 rounded-2xl border border-yellow-100 shadow-sm">
                          <div className="flex justify-between items-center mb-3">
                             <h4 className="text-xs font-bold uppercase tracking-wider text-yellow-800 flex items-center gap-2">
                                <Edit2 className="w-3 h-3" /> Notas Internas
                             </h4>
                          </div>
                          <textarea 
                            rows={3} 
                            className="w-full bg-transparent text-sm text-yellow-900/80 italic placeholder:text-yellow-700/30 focus:outline-none resize-none"
                            placeholder="Agregar nota..."
                            defaultValue={selectedClient.notes}
                          />
                      </div>

                      {/* Recent Activity Mini-Feed */}
                      <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-4 flex items-center gap-2">
                              <History className="w-3 h-3" /> Actividad Reciente
                          </h4>
                          <div className="space-y-0">
                              {clientLogs.length > 0 ? clientLogs.map((log, i) => (
                                  <div key={i} className="flex gap-3 relative pb-5 last:pb-0">
                                      {i !== clientLogs.length - 1 && <div className="absolute left-[5px] top-2 bottom-0 w-px bg-zinc-100"></div>}
                                      <div className={`w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0 ring-4 ring-white ${log.status === 'GRANTED' ? 'bg-green-400' : 'bg-red-400'}`}></div>
                                      <div>
                                          <p className="text-xs font-medium text-zinc-900">
                                              {log.status === 'GRANTED' ? 'Acceso Permitido' : 'Acceso Denegado'}
                                          </p>
                                          <p className="text-[10px] text-zinc-500 mt-0.5">{log.location} • {log.timestamp}</p>
                                      </div>
                                  </div>
                              )) : (
                                  <p className="text-xs text-zinc-400 italic">Sin actividad reciente.</p>
                              )}
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      );
  }

  // --- VIEW: LIST ---
  return (
    <div className="space-y-6 lg:space-y-8 animate-fade-in relative pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 pb-2">
        <div>
          <h1 className="text-3xl lg:text-4xl font-light text-zinc-900 mb-2 tracking-tight">Directorio de Clientes</h1>
          <p className="text-zinc-500 font-light tracking-wide text-sm">Gestión unificada de perfiles y accesos.</p>
        </div>
        <button 
          onClick={() => setView('REGISTER')}
          className="w-full md:w-auto px-6 py-3 bg-zinc-900 text-white text-sm font-bold uppercase tracking-widest rounded-xl hover:bg-brand transition-all shadow-lg shadow-zinc-900/20 flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" /> Nuevo Perfil
        </button>
      </div>

      {/* Tabs Filter (Status Based) */}
      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar border-b border-zinc-200">
          {(['TODOS', 'ACTIVO', 'VENCIDO', 'INACTIVO'] as const).map(status => (
              <button
                key={status}
                onClick={() => { setFilterStatus(status); setCurrentPage(1); }}
                className={`px-5 py-2 rounded-t-lg text-xs font-bold uppercase tracking-widest transition-all border-b-2 
                    ${filterStatus === status ? 'border-zinc-900 text-zinc-900 bg-zinc-50' : 'border-transparent text-zinc-400 hover:text-zinc-600'}`}
              >
                  {status}
              </button>
          ))}
      </div>

      {/* Search Bar */}
      <div className="bg-white p-2 rounded-xl border border-zinc-100 shadow-sm flex items-center gap-3">
          <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input 
                  type="text" 
                  placeholder="Buscar por nombre, correo o servicio..." 
                  className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 border-none rounded-lg text-sm focus:ring-0 placeholder:text-zinc-400" 
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              />
          </div>
          <div className="hidden md:flex items-center gap-2 px-3 text-zinc-400 border-l border-zinc-100">
              <Filter className="w-4 h-4" />
              <span className="text-xs font-medium">{filteredClients.length} Resultados</span>
          </div>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
          {paginatedClients.map(client => {
             const tags = getClientTags(client.activePlans);
             return (
              <div key={client.id} onClick={() => handleClientClick(client)} className="bg-white p-5 rounded-2xl border border-zinc-100 shadow-sm flex flex-col gap-4 active:scale-[0.98] transition-transform">
                  <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                          <img src={client.avatar} className="w-12 h-12 rounded-full object-cover" />
                          <div>
                              <h3 className="font-bold text-zinc-900">{client.name}</h3>
                              <p className="text-xs text-zinc-400">{client.email}</p>
                          </div>
                      </div>
                      <div className={`px-2 py-1 rounded border text-[10px] font-bold uppercase tracking-wide
                          ${client.status === 'ACTIVO' ? 'bg-green-50 text-green-700 border-green-100' : 
                            client.status === 'PAUSA_MEDICA' ? 'bg-orange-50 text-orange-700 border-orange-100' :
                            'bg-red-50 text-red-700 border-red-100'}`}>
                          {client.status.replace('_', ' ')}
                      </div>
                  </div>
                  
                  {/* Dynamic Tags */}
                  <div className="flex gap-2 pt-2 border-t border-zinc-50 flex-wrap">
                      {tags.length > 0 ? tags.map((tag, i) => (
                          <div key={i} className={`p-1.5 px-2 rounded-lg border text-[10px] font-bold uppercase tracking-wide flex items-center gap-1 ${tag.color}`}>
                              <tag.icon className="w-3 h-3" /> {tag.label}
                          </div>
                      )) : <span className="text-[10px] text-zinc-300 italic py-1">Sin servicios activos</span>}
                  </div>
              </div>
          )})}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block bg-white border border-zinc-100 rounded-2xl overflow-hidden shadow-sm overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="border-b border-zinc-100 text-[10px] uppercase text-zinc-400 font-bold tracking-[0.2em] bg-zinc-50/50">
              <th className="py-5 pl-8 font-normal">Cliente</th>
              <th className="py-5 font-normal">Contacto</th>
              <th className="py-5 font-normal">Roles / Servicios</th>
              <th className="py-5 font-normal">Estado</th>
              <th className="py-5 font-normal text-right pr-8">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-50">
            {paginatedClients.map((client) => {
              const tags = getClientTags(client.activePlans);
              
              return (
              <tr key={client.id} onClick={() => handleClientClick(client)} className="group hover:bg-zinc-50/60 transition-colors cursor-pointer">
                <td className="py-4 pl-8">
                  <div className="flex items-center gap-4">
                    <img src={client.avatar} className="w-10 h-10 object-cover rounded-full ring-2 ring-transparent group-hover:ring-zinc-200 transition-all" />
                    <div>
                        <span className="block font-medium text-base text-zinc-900">{client.name}</span>
                        <span className="block text-[10px] text-zinc-400 mt-0.5">ID: {client.id}</span>
                    </div>
                  </div>
                </td>
                <td className="py-4 text-sm text-zinc-600">
                    <div className="flex flex-col">
                        <span>{client.phone}</span>
                        <span className="text-xs text-zinc-400">{client.email}</span>
                    </div>
                </td>
                <td className="py-4">
                    <div className="flex gap-2 flex-wrap max-w-xs">
                        {tags.length > 0 ? tags.map((tag, i) => (
                            <span key={i} className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${tag.color}`}>
                                <tag.icon className="w-3 h-3" /> {tag.label}
                            </span>
                        )) : <span className="text-zinc-300 text-xs italic">Visitante</span>}
                    </div>
                </td>
                <td className="py-4">
                     <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border 
                        ${client.status === 'ACTIVO' ? 'bg-green-50 text-green-700 border-green-100' : 
                          client.status === 'PAUSA_MEDICA' ? 'bg-orange-50 text-orange-700 border-orange-100' :
                          'bg-zinc-50 text-zinc-500 border-zinc-100'}`}>
                        {client.status === 'ACTIVO' && <CheckCircle className="w-3 h-3" />}
                        {client.status === 'PAUSA_MEDICA' && <PauseCircle className="w-3 h-3" />}
                        {client.status.replace('_', ' ')}
                    </span>
                </td>
                <td className="py-4 text-right pr-8">
                    <button className="p-2 rounded-lg text-zinc-300 hover:text-black hover:bg-zinc-100 transition-all">
                        <MoreHorizontal className="w-5 h-5" />
                    </button>
                </td>
              </tr>
            )})}
          </tbody>
        </table>
      </div>

       {/* Pagination Footer */}
       <div className="border-t border-zinc-100 p-4 flex flex-col md:flex-row items-center justify-between bg-zinc-50/30 gap-4">
            <span className="text-xs text-zinc-400">
                Mostrando <span className="font-medium text-zinc-900">{Math.min((currentPage - 1) * ITEMS_PER_PAGE + 1, filteredClients.length)} - {Math.min(currentPage * ITEMS_PER_PAGE, filteredClients.length)}</span> de <span className="font-medium text-zinc-900">{filteredClients.length}</span>
            </span>
            
            <div className="flex items-center gap-1">
                <button 
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg border border-zinc-200 text-zinc-400 hover:text-black hover:border-black hover:bg-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <ChevronLeft className="w-4 h-4" />
                </button>
                
                <div className="flex items-center gap-1 px-2">
                    {Array.from({ length: totalPages }).map((_, i) => (
                         <button 
                            key={i}
                            onClick={() => setCurrentPage(i + 1)}
                            className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${currentPage === i + 1 ? 'bg-zinc-900 text-white shadow-lg shadow-zinc-900/10' : 'text-zinc-500 hover:bg-zinc-100'}`}
                        >
                            {i + 1}
                        </button>
                    ))}
                </div>

                <button 
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg border border-zinc-200 text-zinc-400 hover:text-black hover:border-black hover:bg-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <ChevronRight className="w-4 h-4" />
                </button>
            </div>
        </div>
    </div>
  );
};

export default Clients;
