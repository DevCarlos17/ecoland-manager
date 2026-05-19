
import React, { useState, useMemo } from 'react';
import { MOCK_TRAINERS, MOCK_CLIENTS } from '../constants';
import { 
  Briefcase, DollarSign, Users, MoreHorizontal, 
  Search, LayoutGrid, List, Plus, ArrowLeft, 
  ChevronLeft, ChevronRight, Mail, Upload, Save,
  CheckCircle, XCircle, User
} from 'lucide-react';
import { Trainer } from '../types';

const Team: React.FC = () => {
  const [view, setView] = useState<'MAIN' | 'DETAIL' | 'REGISTER'>('MAIN');
  const [trainers, setTrainers] = useState<Trainer[]>(MOCK_TRAINERS);
  const [selectedTrainer, setSelectedTrainer] = useState<Trainer | null>(null);
  
  // Main View State
  const [viewMode, setViewMode] = useState<'GRID' | 'LIST'>('GRID');
  const [filterType, setFilterType] = useState<'ALL' | 'INTERNO' | 'EXTERNO'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Detail View State
  const [clientPage, setClientPage] = useState(1);
  const CLIENTS_PER_PAGE = 5;

  // Registration Form State
  const [formData, setFormData] = useState<Partial<Trainer>>({
      name: '',
      specialty: '',
      type: 'INTERNO',
      fixedFee: 0,
      status: 'ACTIVO'
  });

  // --- Logic for Main View ---
  const filteredTrainers = useMemo(() => {
      return trainers.filter(t => {
          const matchesType = filterType === 'ALL' || t.type === filterType;
          const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                t.specialty.toLowerCase().includes(searchQuery.toLowerCase());
          return matchesType && matchesSearch;
      });
  }, [trainers, filterType, searchQuery]);

  const stats = useMemo(() => {
      const totalClients = trainers.reduce((acc, t) => acc + t.activeClients, 0);
      const totalRevenue = trainers.reduce((acc, t) => acc + t.monthlyRevenue, 0);
      const activeTrainers = trainers.filter(t => t.status === 'ACTIVO').length;

      return {
          activeTrainers,
          totalClients,
          totalRevenue,
      };
  }, [trainers]);

  const handleTrainerClick = (trainer: Trainer) => {
      setSelectedTrainer(trainer);
      setClientPage(1);
      setView('DETAIL');
  };

  const handleNewTrainer = () => {
      setFormData({
          name: '',
          specialty: '',
          type: 'INTERNO',
          fixedFee: 0,
          status: 'ACTIVO'
      });
      setView('REGISTER');
  };

  const handleSaveNewTrainer = () => {
      if (!formData.name || !formData.specialty) return; // Simple validation

      const newTrainer: Trainer = {
          id: Math.random().toString(36).substring(7),
          name: formData.name,
          specialty: formData.specialty,
          type: formData.type as 'INTERNO' | 'EXTERNO',
          fixedFee: Number(formData.fixedFee),
          status: formData.status as 'ACTIVO' | 'INACTIVO',
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name)}&background=random`,
          monthlyRevenue: 0,
          activeClients: 0
      };

      setTrainers([...trainers, newTrainer]);
      setView('MAIN');
  };

  // --- Logic for Detail View ---
  const trainerClients = useMemo(() => {
      if (!selectedTrainer) return [];
      return Array.from({ length: selectedTrainer.activeClients }).map((_, i) => {
          const base = MOCK_CLIENTS[i % MOCK_CLIENTS.length];
          return {
              ...base,
              id: `${selectedTrainer.id}-c-${i}`,
              status: i % 5 === 0 ? 'VENCIDO' : 'ACTIVO',
              lastAccess: i % 3 === 0 ? 'Hoy' : 'Ayer'
          } as any; // Cast mainly for status strictness in Mocks
      });
  }, [selectedTrainer]);

  const paginatedClients = useMemo(() => {
      const start = (clientPage - 1) * CLIENTS_PER_PAGE;
      return trainerClients.slice(start, start + CLIENTS_PER_PAGE);
  }, [trainerClients, clientPage]);

  const totalClientPages = Math.ceil(trainerClients.length / CLIENTS_PER_PAGE);

  // --------------------------------------------------------------------------------
  // REGISTER VIEW COMPONENT
  // --------------------------------------------------------------------------------
  if (view === 'REGISTER') {
      return (
          <div className="animate-fade-in max-w-4xl mx-auto pb-20">
              {/* Header */}
              <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4">
                      <button onClick={() => setView('MAIN')} className="w-10 h-10 rounded-full bg-white border border-zinc-200 flex items-center justify-center text-zinc-500 hover:text-black transition-all shadow-sm">
                          <ArrowLeft className="w-5 h-5" />
                      </button>
                      <div>
                          <h1 className="text-2xl lg:text-3xl font-light text-zinc-900">Registrar Entrenador</h1>
                          <p className="text-zinc-500 text-xs tracking-wide">Alta de nuevo personal y configuración de tarifas.</p>
                      </div>
                  </div>
                  <button 
                    onClick={handleSaveNewTrainer}
                    className="px-6 py-2.5 bg-zinc-900 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-brand transition-all flex items-center gap-2 shadow-lg shadow-zinc-900/10"
                  >
                      <Save className="w-4 h-4" /> Guardar
                  </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {/* Left: Avatar & Basic Status */}
                  <div className="md:col-span-1 space-y-6">
                      <div className="bg-white p-6 rounded-[2rem] border border-zinc-100 shadow-sm flex flex-col items-center text-center">
                          <div className="w-32 h-32 rounded-full bg-zinc-50 border-2 border-dashed border-zinc-200 flex flex-col items-center justify-center text-zinc-400 mb-4 cursor-pointer hover:border-brand hover:text-brand transition-all">
                              <Upload className="w-8 h-8 mb-2" />
                              <span className="text-[10px] font-bold uppercase">Subir Foto</span>
                          </div>
                          <p className="text-xs text-zinc-400">Formatos permitidos: JPG, PNG</p>
                      </div>

                      <div className="bg-white p-6 rounded-2xl border border-zinc-100 shadow-sm">
                          <label className="block text-xs font-bold uppercase text-zinc-400 mb-3 tracking-wider">Estado Inicial</label>
                          <div className="flex gap-2">
                              <button 
                                onClick={() => setFormData({...formData, status: 'ACTIVO'})}
                                className={`flex-1 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest border transition-all flex items-center justify-center gap-2
                                    ${formData.status === 'ACTIVO' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-white text-zinc-400 border-zinc-200'}`}
                              >
                                  <CheckCircle className="w-3 h-3" /> Activo
                              </button>
                              <button 
                                onClick={() => setFormData({...formData, status: 'INACTIVO'})}
                                className={`flex-1 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest border transition-all flex items-center justify-center gap-2
                                    ${formData.status === 'INACTIVO' ? 'bg-zinc-100 text-zinc-600 border-zinc-200' : 'bg-white text-zinc-400 border-zinc-200'}`}
                              >
                                  <XCircle className="w-3 h-3" /> Inactivo
                              </button>
                          </div>
                      </div>
                  </div>

                  {/* Right: Form Fields */}
                  <div className="md:col-span-2 space-y-6">
                      <div className="bg-white p-8 rounded-[2rem] border border-zinc-100 shadow-sm space-y-6">
                          <div className="flex items-center gap-2 mb-2">
                              <User className="w-4 h-4 text-brand" />
                              <h3 className="font-bold text-zinc-900 text-sm uppercase tracking-wide">Información Personal</h3>
                          </div>
                          
                          <div className="space-y-4">
                              <div>
                                  <label className="block text-xs font-bold uppercase text-zinc-400 mb-1.5 ml-1">Nombre Completo</label>
                                  <input 
                                      type="text" 
                                      value={formData.name}
                                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                                      className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:border-brand outline-none transition-all placeholder:text-zinc-300"
                                      placeholder="Ej. Carlos Rodriguez"
                                  />
                              </div>
                              <div>
                                  <label className="block text-xs font-bold uppercase text-zinc-400 mb-1.5 ml-1">Especialidad</label>
                                  <select 
                                      value={formData.specialty}
                                      onChange={(e) => setFormData({...formData, specialty: e.target.value})}
                                      className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:border-brand outline-none transition-all cursor-pointer"
                                  >
                                      <option value="">Seleccione especialidad...</option>
                                      <option value="MUSCULACION">Musculación</option>
                                      <option value="BOXEO">Boxeo</option>
                                      <option value="CROSSFIT">CrossFit</option>
                                  </select>
                              </div>
                          </div>
                      </div>

                      <div className="bg-white p-8 rounded-[2rem] border border-zinc-100 shadow-sm space-y-6">
                           <div className="flex items-center gap-2 mb-2">
                              <Briefcase className="w-4 h-4 text-brand" />
                              <h3 className="font-bold text-zinc-900 text-sm uppercase tracking-wide">Contrato y Finanzas</h3>
                          </div>

                          <div className="grid grid-cols-2 gap-6">
                              <div>
                                  <label className="block text-xs font-bold uppercase text-zinc-400 mb-1.5 ml-1">Tipo de Contrato</label>
                                  <select 
                                      value={formData.type}
                                      onChange={(e) => setFormData({...formData, type: e.target.value as any})}
                                      className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:border-brand outline-none transition-all appearance-none cursor-pointer"
                                  >
                                      <option value="INTERNO">Interno (Staff)</option>
                                      <option value="EXTERNO">Externo (Freelance)</option>
                                  </select>
                              </div>
                              <div>
                                  <label className="block text-xs font-bold uppercase text-zinc-400 mb-1.5 ml-1">Cuota Fija ($)</label>
                                  <div className="relative">
                                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 font-bold">$</span>
                                      <input 
                                          type="number" 
                                          value={formData.fixedFee}
                                          onChange={(e) => setFormData({...formData, fixedFee: parseFloat(e.target.value)})}
                                          className="w-full pl-8 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:border-brand outline-none transition-all"
                                          placeholder="0.00"
                                      />
                                  </div>
                              </div>
                          </div>
                          <p className="text-[10px] text-zinc-400 italic bg-zinc-50 p-3 rounded-lg border border-zinc-100">
                              * La cuota fija se calcula automáticamente en base a los clientes asignados al final del corte.
                          </p>
                      </div>
                  </div>
              </div>
          </div>
      );
  }


  // --------------------------------------------------------------------------------
  // DETAIL VIEW COMPONENT
  // --------------------------------------------------------------------------------
  if (view === 'DETAIL' && selectedTrainer) {
      return (
          <div className="animate-fade-in pb-20 max-w-6xl mx-auto">
              {/* Header */}
              <div className="flex items-center gap-4 mb-8">
                  <button onClick={() => setView('MAIN')} className="w-10 h-10 rounded-full bg-white border border-zinc-200 flex items-center justify-center text-zinc-500 hover:text-black transition-all shadow-sm">
                      <ArrowLeft className="w-5 h-5" />
                  </button>
                  <div>
                      <h1 className="text-2xl lg:text-3xl font-light text-zinc-900">Detalle del Entrenador</h1>
                      <p className="text-zinc-500 text-xs tracking-wide">Gestión de cartera y pagos.</p>
                  </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                  
                  {/* Profile Card */}
                  <div className="bg-white p-6 lg:p-8 rounded-[2rem] border border-zinc-100 shadow-sm flex flex-col items-center text-center lg:col-span-1">
                      <div className="relative mb-4">
                          <img src={selectedTrainer.avatar} className="w-32 h-32 rounded-full object-cover border-4 border-zinc-50" />
                          <div className={`absolute bottom-2 right-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border bg-white ${selectedTrainer.status === 'ACTIVO' ? 'text-green-600 border-green-100' : 'text-zinc-400 border-zinc-200'}`}>
                              {selectedTrainer.status}
                          </div>
                      </div>
                      <h2 className="text-2xl font-bold text-zinc-900 mb-1">{selectedTrainer.name}</h2>
                      <p className="text-sm text-zinc-500 mb-6">{selectedTrainer.specialty}</p>
                      
                      <div className="w-full grid grid-cols-2 gap-4 bg-zinc-50 p-4 rounded-xl border border-zinc-100 mb-6">
                          <div className="text-center">
                              <span className="block text-[10px] font-bold uppercase text-zinc-400 tracking-wider mb-1">Tipo</span>
                              <span className={`text-xs font-bold px-2 py-0.5 rounded ${selectedTrainer.type === 'INTERNO' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                                  {selectedTrainer.type}
                              </span>
                          </div>
                          <div className="text-center border-l border-zinc-200 pl-4">
                               <span className="block text-[10px] font-bold uppercase text-zinc-400 tracking-wider mb-1">ID</span>
                               <span className="text-xs font-mono text-zinc-600">#{selectedTrainer.id.toUpperCase()}</span>
                          </div>
                      </div>

                      <div className="w-full space-y-3">
                          <button className="w-full py-3 bg-zinc-900 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-brand transition-colors flex items-center justify-center gap-2">
                              <Mail className="w-4 h-4" /> Contactar
                          </button>
                          <button className="w-full py-3 bg-white border border-zinc-200 text-zinc-600 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-zinc-50 transition-colors flex items-center justify-center gap-2">
                              <MoreHorizontal className="w-4 h-4" /> Opciones
                          </button>
                      </div>
                  </div>

                  {/* Stats & Financials */}
                  <div className="lg:col-span-2 space-y-6">
                      
                      {/* Financial Summary */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div className="bg-white p-6 rounded-2xl border border-zinc-100 shadow-sm">
                              <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 block mb-2">Cuota por Cliente</span>
                              <div className="flex items-center gap-2">
                                  <span className="text-3xl font-light text-zinc-900">${selectedTrainer.fixedFee}</span>
                                  <span className="text-[10px] bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-500">Fijo</span>
                              </div>
                          </div>
                          <div className="bg-white p-6 rounded-2xl border border-zinc-100 shadow-sm">
                              <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 block mb-2">Clientes Activos</span>
                              <div className="flex items-center gap-2">
                                  <span className="text-3xl font-light text-zinc-900">{selectedTrainer.activeClients}</span>
                                  <Users className="w-4 h-4 text-zinc-300" />
                              </div>
                          </div>
                          <div className="bg-zinc-900 p-6 rounded-2xl shadow-lg shadow-zinc-900/10 text-white relative overflow-hidden">
                              <div className="relative z-10">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 block mb-2">Ingreso Mensual</span>
                                <span className="text-3xl font-medium tracking-tight">${selectedTrainer.monthlyRevenue.toFixed(2)}</span>
                              </div>
                              <DollarSign className="absolute right-[-10px] bottom-[-10px] w-24 h-24 text-white/5 rotate-12" />
                          </div>
                      </div>

                      {/* Client Table */}
                      <div className="bg-white border border-zinc-100 rounded-2xl shadow-sm overflow-hidden flex flex-col h-full">
                          <div className="p-5 border-b border-zinc-100 flex justify-between items-center bg-zinc-50/30">
                              <h3 className="font-bold text-sm text-zinc-900 flex items-center gap-2">
                                  <Users className="w-4 h-4 text-zinc-400" /> Cartera de Clientes
                              </h3>
                              <div className="flex items-center gap-2">
                                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider bg-white border border-zinc-200 px-2 py-1 rounded-lg">Total: {trainerClients.length}</span>
                              </div>
                          </div>

                          <div className="overflow-x-auto">
                              <table className="w-full text-left border-collapse min-w-[600px]">
                                  <thead>
                                      <tr className="border-b border-zinc-100 text-[10px] uppercase font-bold text-zinc-400 tracking-wider">
                                          <th className="py-4 pl-6">Cliente</th>
                                          <th className="py-4">Plan Activo</th>
                                          <th className="py-4">Estado</th>
                                          <th className="py-4 text-right pr-6">Pago Cuota</th>
                                      </tr>
                                  </thead>
                                  <tbody className="divide-y divide-zinc-50">
                                      {paginatedClients.map((client, i) => (
                                          <tr key={i} className="hover:bg-zinc-50 transition-colors">
                                              <td className="py-3 pl-6">
                                                  <div className="flex items-center gap-3">
                                                      <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-xs font-bold text-zinc-500 border border-zinc-200">
                                                          {client.name.charAt(0)}
                                                      </div>
                                                      <div>
                                                          <span className="block text-sm font-medium text-zinc-900">{client.name}</span>
                                                          <span className="block text-[10px] text-zinc-400">{client.email}</span>
                                                      </div>
                                                  </div>
                                              </td>
                                              <td className="py-3 text-xs text-zinc-600">
                                                  {client.activePlans[0] || 'Entrenamiento Personalizado'}
                                              </td>
                                              <td className="py-3">
                                                   <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border
                                                      ${client.status === 'ACTIVO' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-700 border-red-100'}`}>
                                                      {client.status}
                                                  </span>
                                              </td>
                                              <td className="py-3 pr-6 text-right">
                                                  <span className="text-xs font-mono font-bold text-zinc-900 bg-zinc-50 px-2 py-1 rounded border border-zinc-100">
                                                      ${selectedTrainer.fixedFee.toFixed(2)}
                                                  </span>
                                              </td>
                                          </tr>
                                      ))}
                                  </tbody>
                              </table>
                          </div>
                          
                          {/* Pagination Footer */}
                          <div className="p-4 border-t border-zinc-100 flex justify-between items-center bg-zinc-50/30 mt-auto">
                              <span className="text-[10px] text-zinc-400 font-medium">
                                  Página {clientPage} de {totalClientPages}
                              </span>
                              <div className="flex gap-1">
                                  <button 
                                    onClick={() => setClientPage(Math.max(1, clientPage - 1))}
                                    disabled={clientPage === 1}
                                    className="p-1.5 rounded-lg border border-zinc-200 text-zinc-400 hover:text-black hover:bg-white disabled:opacity-50"
                                  >
                                      <ChevronLeft className="w-4 h-4" />
                                  </button>
                                  <button 
                                    onClick={() => setClientPage(Math.min(totalClientPages, clientPage + 1))}
                                    disabled={clientPage === totalClientPages}
                                    className="p-1.5 rounded-lg border border-zinc-200 text-zinc-400 hover:text-black hover:bg-white disabled:opacity-50"
                                  >
                                      <ChevronRight className="w-4 h-4" />
                                  </button>
                              </div>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      );
  }

  // --------------------------------------------------------------------------------
  // MAIN VIEW COMPONENT
  // --------------------------------------------------------------------------------
  return (
    <div className="space-y-8 animate-fade-in pb-20">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-3xl lg:text-4xl font-light text-zinc-900 mb-2 tracking-tight">Gestión de Equipo</h1>
          <p className="text-zinc-500 font-light tracking-wide text-sm">Control de entrenadores y recaudación de cuotas.</p>
        </div>
        <button 
            onClick={handleNewTrainer}
            className="px-6 py-3 bg-zinc-900 text-white text-sm font-bold uppercase tracking-widest rounded-xl hover:bg-brand transition-all shadow-lg shadow-zinc-900/20 flex items-center gap-2"
        >
            <Plus className="w-4 h-4" /> Nuevo Entrenador
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-zinc-100 shadow-sm flex flex-col justify-between h-32">
              <div className="flex justify-between items-start">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Total Staff</span>
                  <Briefcase className="w-4 h-4 text-zinc-300" />
              </div>
              <div>
                  <span className="text-3xl font-light text-zinc-900 block">{stats.activeTrainers}</span>
                  <span className="text-xs text-zinc-500">Entrenadores Activos</span>
              </div>
          </div>
          
          <div className="bg-white p-5 rounded-2xl border border-zinc-100 shadow-sm flex flex-col justify-between h-32">
              <div className="flex justify-between items-start">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Total Clientes</span>
                  <Users className="w-4 h-4 text-zinc-300" />
              </div>
              <div>
                  <span className="text-3xl font-light text-zinc-900 block">{stats.totalClients}</span>
                  <span className="text-xs text-zinc-500">Miembros asignados</span>
              </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-zinc-100 shadow-sm flex flex-col justify-between h-32 relative overflow-hidden group hover:border-green-200 transition-colors">
               <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                   <DollarSign className="w-24 h-24 text-green-600" />
               </div>
              <div className="flex justify-between items-start relative z-10">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Ingresos Estimados</span>
                  <div className="w-6 h-6 rounded-full bg-green-50 flex items-center justify-center text-green-600">
                     <DollarSign className="w-3 h-3" />
                  </div>
              </div>
              <div className="relative z-10">
                  <span className="text-3xl font-light text-zinc-900 block">${stats.totalRevenue.toFixed(2)}</span>
                  <span className="text-xs text-green-600 font-bold uppercase tracking-wide">Mensual Recurrente</span>
              </div>
          </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col lg:flex-row justify-between items-center bg-white p-2 rounded-2xl border border-zinc-100 shadow-sm gap-4">
            <div className="relative w-full lg:w-96">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input 
                    type="text" 
                    placeholder="Buscar por nombre o especialidad..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 border-none rounded-xl text-sm focus:ring-0 placeholder:text-zinc-400"
                />
            </div>
            
            <div className="flex w-full lg:w-auto gap-2 items-center justify-between lg:justify-end">
                 <div className="flex bg-zinc-100 p-1 rounded-xl">
                    {['ALL', 'INTERNO', 'EXTERNO'].map(type => (
                        <button 
                            key={type}
                            onClick={() => setFilterType(type as any)}
                            className={`px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all
                                ${filterType === type ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'}`}
                        >
                            {type === 'ALL' ? 'Todos' : type}
                        </button>
                    ))}
                 </div>
                 
                 <div className="w-px h-6 bg-zinc-200 hidden lg:block mx-2"></div>

                 <div className="flex bg-zinc-100 p-1 rounded-xl">
                    <button 
                        onClick={() => setViewMode('GRID')}
                        className={`p-2 rounded-lg transition-all ${viewMode === 'GRID' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-400'}`}
                    >
                        <LayoutGrid className="w-4 h-4" />
                    </button>
                    <button 
                        onClick={() => setViewMode('LIST')}
                        className={`p-2 rounded-lg transition-all ${viewMode === 'LIST' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-400'}`}
                    >
                        <List className="w-4 h-4" />
                    </button>
                 </div>
            </div>
      </div>

      {/* Content: Grid Mode */}
      {viewMode === 'GRID' && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 animate-fade-in">
            {filteredTrainers.map(trainer => (
                <div 
                    key={trainer.id} 
                    onClick={() => handleTrainerClick(trainer)}
                    className="bg-white border border-zinc-100 rounded-[2rem] p-6 lg:p-8 hover:shadow-xl hover:shadow-zinc-200/50 hover:-translate-y-1 transition-all duration-300 group flex flex-col h-full cursor-pointer relative overflow-hidden"
                >
                    {/* Top Accent */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-zinc-100 via-zinc-200 to-zinc-100 opacity-0 group-hover:opacity-100 transition-opacity"></div>

                    {/* Card Header */}
                    <div className="flex justify-between items-start mb-6">
                        <div className="flex gap-4">
                            <div className="relative">
                                <img src={trainer.avatar} alt={trainer.name} className="w-16 h-16 rounded-2xl object-cover shadow-sm bg-zinc-50" />
                                <div className={`absolute -bottom-2 -right-2 px-2 py-0.5 bg-white rounded-md border text-[9px] font-bold uppercase tracking-wider shadow-sm
                                    ${trainer.type === 'INTERNO' ? 'text-brand border-blue-100' : 'text-purple-600 border-purple-100'}`}>
                                    {trainer.type}
                                </div>
                            </div>
                            <div>
                                <h3 className="font-bold text-lg text-zinc-900 leading-tight mb-1">{trainer.name}</h3>
                                <p className="text-xs text-zinc-500 font-medium">{trainer.specialty}</p>
                            </div>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-4 mb-8 flex-1">
                        <div className="bg-zinc-50 rounded-xl p-3 border border-zinc-100">
                            <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block mb-1">Clientes</span>
                            <div className="flex items-end gap-2">
                                <span className="text-xl font-medium text-zinc-900">{trainer.activeClients}</span>
                            </div>
                        </div>
                         <div className="bg-zinc-50 rounded-xl p-3 border border-zinc-100">
                            <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block mb-1">Cuota Fija</span>
                            <div className="flex items-end gap-2">
                                <span className="text-xl font-medium text-zinc-900">${trainer.fixedFee}</span>
                            </div>
                        </div>
                    </div>

                    {/* Footer / Actions */}
                    <div className="mt-auto pt-6 border-t border-dashed border-zinc-200">
                        <div className="flex justify-between items-center mb-4">
                            <div className="flex flex-col">
                                <span className="text-[9px] uppercase font-bold tracking-widest text-zinc-400">Ingreso Mensual</span>
                                <span className="text-xl font-bold text-green-600">
                                    ${trainer.monthlyRevenue.toFixed(2)}
                                </span>
                            </div>
                            <button className="w-8 h-8 rounded-full bg-zinc-50 flex items-center justify-center text-zinc-300 group-hover:bg-zinc-900 group-hover:text-white transition-all">
                                <ArrowLeft className="w-4 h-4 rotate-180" />
                            </button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
      )}

      {/* Content: List Mode */}
      {viewMode === 'LIST' && (
          <div className="bg-white border border-zinc-100 rounded-2xl overflow-hidden shadow-sm animate-fade-in overflow-x-auto">
             <table className="w-full text-left border-collapse min-w-[900px]">
                <thead>
                    <tr className="bg-zinc-50/50 border-b border-zinc-100 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">
                        <th className="py-5 px-8 font-normal">Entrenador</th>
                        <th className="py-5 px-4 font-normal">Tipo</th>
                        <th className="py-5 px-4 font-normal">Clientes</th>
                        <th className="py-5 px-4 font-normal">Cuota ($)</th>
                        <th className="py-5 px-4 font-normal">Ingreso Mensual</th>
                        <th className="py-5 px-8 text-right font-normal"></th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-zinc-50">
                    {filteredTrainers.map(trainer => (
                        <tr 
                            key={trainer.id} 
                            onClick={() => handleTrainerClick(trainer)}
                            className="group hover:bg-zinc-50/50 transition-colors cursor-pointer"
                        >
                            <td className="py-4 px-8">
                                <div className="flex items-center gap-4">
                                    <img src={trainer.avatar} className="w-10 h-10 rounded-xl object-cover bg-zinc-100" />
                                    <div>
                                        <span className="block font-bold text-sm text-zinc-900">{trainer.name}</span>
                                        <span className="block text-[10px] text-zinc-400 uppercase tracking-wide">{trainer.specialty}</span>
                                    </div>
                                </div>
                            </td>
                            <td className="py-4 px-4">
                                <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border
                                    ${trainer.type === 'INTERNO' ? 'bg-blue-50 text-blue-700 border-blue-100' : 'bg-purple-50 text-purple-700 border-purple-100'}`}>
                                    {trainer.type}
                                </span>
                            </td>
                            <td className="py-4 px-4">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold text-zinc-600">{trainer.activeClients} <span className="text-[10px] text-zinc-400 font-normal">Activos</span></span>
                                </div>
                            </td>
                            <td className="py-4 px-4">
                                <span className="text-sm font-mono text-zinc-600">${trainer.fixedFee.toFixed(2)}</span>
                            </td>
                            <td className="py-4 px-4">
                                <span className="text-sm font-bold font-mono text-green-600">
                                    ${trainer.monthlyRevenue.toFixed(2)}
                                </span>
                            </td>
                            <td className="py-4 px-8 text-right">
                                <button className="p-1.5 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition-colors">
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
             </table>
          </div>
      )}

      {filteredTrainers.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center bg-zinc-50 rounded-2xl border border-dashed border-zinc-200">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm text-zinc-300">
                  <Search className="w-8 h-8" />
              </div>
              <h3 className="text-zinc-900 font-bold">No se encontraron entrenadores</h3>
              <p className="text-zinc-500 text-sm mt-1">Intenta con otro término de búsqueda o filtro.</p>
              <button 
                onClick={() => { setSearchQuery(''); setFilterType('ALL'); }}
                className="mt-4 px-4 py-2 bg-white border border-zinc-200 text-zinc-600 text-xs font-bold uppercase tracking-widest rounded-lg hover:border-zinc-400 transition-colors"
              >
                  Limpiar Filtros
              </button>
          </div>
      )}
    </div>
  );
};

export default Team;
