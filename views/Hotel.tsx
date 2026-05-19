
import React, { useState, useMemo } from 'react';
import { 
  BedDouble, Calendar, User, CheckCircle, 
  AlertCircle, Search, MoreVertical, LogIn, 
  LogOut, SprayCan, Plus, X, ArrowRight, UserPlus,
  ChevronRight, ArrowLeft, ChevronLeft, PieChart, Activity,
  Mail, Phone, Filter, Clock, History, FileText
} from 'lucide-react';
import { Room, Client } from '../types';
import { MOCK_CLIENTS } from '../constants';

// Enhanced Mock Data
const MOCK_ROOMS_EXTENDED: Room[] = [
  { id: '101', number: '101', type: 'SENCILLA', status: 'OCUPADA', priceNight: 45, guestName: 'Roberto Gomez', checkIn: '2024-10-28', checkOut: '2024-10-31' },
  { id: '102', number: '102', type: 'DOBLE', status: 'DISPONIBLE', priceNight: 65 },
  { id: '103', number: '103', type: 'SUITE', status: 'LIMPIEZA', priceNight: 120 },
  { id: '104', number: '104', type: 'SENCILLA', status: 'RESERVADA', priceNight: 45, guestName: 'Marco Aurelio', checkIn: '2024-11-01', checkOut: '2024-11-05' },
  { id: '201', number: '201', type: 'DOBLE', status: 'OCUPADA', priceNight: 65, guestName: 'Ana Smith', checkIn: '2024-10-25', checkOut: '2024-10-29' },
  { id: '202', number: '202', type: 'SUITE', status: 'MANTENIMIENTO', priceNight: 120 },
  { id: '203', number: '203', type: 'SENCILLA', status: 'DISPONIBLE', priceNight: 45 },
  { id: '204', number: '204', type: 'DOBLE', status: 'DISPONIBLE', priceNight: 65 },
  { id: '301', number: '301', type: 'SENCILLA', status: 'DISPONIBLE', priceNight: 45 },
  { id: '302', number: '302', type: 'DOBLE', status: 'OCUPADA', priceNight: 65, guestName: 'John Doe', checkIn: '2024-10-29', checkOut: '2024-11-02' },
  { id: '303', number: '303', type: 'SUITE', status: 'DISPONIBLE', priceNight: 120 },
  { id: '304', number: '304', type: 'SENCILLA', status: 'LIMPIEZA', priceNight: 45 },
];

// New Interface for Logs
interface RoomLog {
    id: string;
    roomId: string;
    action: 'CHECK_IN' | 'CHECK_OUT' | 'CLEANING_START' | 'CLEANING_END' | 'MAINTENANCE_START' | 'MAINTENANCE_END' | 'RESERVATION';
    previousStatus: string;
    newStatus: string;
    timestamp: Date;
    guestName?: string;
    staffName?: string; // Could be logged in user
    notes?: string;
}

// Generate some mock logs
const MOCK_LOGS: RoomLog[] = [
    { id: 'l1', roomId: '101', action: 'CHECK_IN', previousStatus: 'RESERVADA', newStatus: 'OCUPADA', timestamp: new Date(new Date().setHours(14, 30)), guestName: 'Roberto Gomez', staffName: 'Admin' },
    { id: 'l2', roomId: '101', action: 'CLEANING_END', previousStatus: 'LIMPIEZA', newStatus: 'DISPONIBLE', timestamp: new Date(new Date().setHours(10, 15)), staffName: 'Maria (Limpieza)' },
    { id: 'l3', roomId: '103', action: 'CHECK_OUT', previousStatus: 'OCUPADA', newStatus: 'LIMPIEZA', timestamp: new Date(new Date().setHours(11, 0)), guestName: 'Usuario Anterior', staffName: 'Admin' },
];

const Hotel: React.FC = () => {
  const [view, setView] = useState<'BOARD' | 'ROOM_DETAIL'>('BOARD');
  const [rooms, setRooms] = useState<Room[]>(MOCK_ROOMS_EXTENDED);
  const [logs, setLogs] = useState<RoomLog[]>(MOCK_LOGS);
  const [clients, setClients] = useState<Client[]>(MOCK_CLIENTS);
  
  const [filter, setFilter] = useState<'TODAS' | 'DISPONIBLE' | 'OCUPADA' | 'LIMPIEZA' | 'MANTENIMIENTO' | 'RESERVADA'>('TODAS');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Selected Room for Detail View
  const [detailRoom, setDetailRoom] = useState<Room | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 8;

  // Drawer State (Booking)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedRoomForBooking, setSelectedRoomForBooking] = useState<Room | null>(null);
  const [isRegisteringNewGuest, setIsRegisteringNewGuest] = useState(false);
  const [isCheckInImmediate, setIsCheckInImmediate] = useState(false);
  
  // New Booking State
  const [bookingForm, setBookingForm] = useState({
    guestId: '',
    guestName: '',
    guestEmail: '',
    guestPhone: '',
    checkIn: new Date().toISOString().split('T')[0],
    checkOut: '',
    notes: ''
  });

  // --- LOGIC HELPERS ---

  const addLog = (roomId: string, action: RoomLog['action'], prev: string, next: string, guest?: string, notes?: string) => {
      const newLog: RoomLog = {
          id: Math.random().toString(36).substr(2, 9),
          roomId,
          action,
          previousStatus: prev,
          newStatus: next,
          timestamp: new Date(), // Capture exact time
          guestName: guest,
          staffName: 'Admin', // In a real app, this comes from auth
          notes
      };
      setLogs(prevLogs => [newLog, ...prevLogs]);
  };

  const filteredRooms = useMemo(() => {
    return rooms.filter(r => {
      const matchesFilter = filter === 'TODAS' || r.status === filter;
      const guestName = r.guestName || '';
      const matchesSearch = r.number.includes(searchQuery) || guestName.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [rooms, filter, searchQuery]);

  const paginatedRooms = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredRooms.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredRooms, currentPage]);

  const totalPages = Math.ceil(filteredRooms.length / ITEMS_PER_PAGE);

  const stats = useMemo(() => {
      const total = rooms.length;
      const occupied = rooms.filter(r => r.status === 'OCUPADA').length;
      const reserved = rooms.filter(r => r.status === 'RESERVADA').length;
      const cleaning = rooms.filter(r => r.status === 'LIMPIEZA').length;
      const available = rooms.filter(r => r.status === 'DISPONIBLE').length;
      const occupancyRate = total > 0 ? Math.round(((occupied + reserved) / total) * 100) : 0;

      return { total, occupied, reserved, cleaning, available, occupancyRate };
  }, [rooms]);

  // --- ACTIONS ---

  const handleRoomClick = (room: Room) => {
      setDetailRoom(room);
      setView('ROOM_DETAIL');
  };

  const openBooking = (e: React.MouseEvent, room?: Room) => {
    e.stopPropagation(); // Prevent triggering row click
    if (room && room.status !== 'DISPONIBLE') return;
    setSelectedRoomForBooking(room || null);
    setIsDrawerOpen(true);
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
    setSelectedRoomForBooking(null);
    setIsRegisteringNewGuest(false);
    setIsCheckInImmediate(false);
    setBookingForm({ 
      guestId: '', 
      guestName: '', 
      guestEmail: '',
      guestPhone: '',
      checkIn: new Date().toISOString().split('T')[0], 
      checkOut: '', 
      notes: '' 
    });
  };

  const handleCreateBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoomForBooking) return;

    let finalGuestName = bookingForm.guestName;

    if (isRegisteringNewGuest) {
      const newClient: Client = {
        id: Math.random().toString(36).substring(2, 9),
        name: bookingForm.guestName,
        email: bookingForm.guestEmail,
        phone: bookingForm.guestPhone,
        status: 'ACTIVO',
        activePlans: [`Habitación ${selectedRoomForBooking.number}`], 
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(bookingForm.guestName)}&background=1d4ed8&color=fff`,
        lastAccess: 'Registrado vía Hotel'
      };
      setClients(prev => [newClient, ...prev]);
      finalGuestName = newClient.name;
    }

    const nextStatus = isCheckInImmediate ? 'OCUPADA' : 'RESERVADA';
    const action = isCheckInImmediate ? 'CHECK_IN' : 'RESERVATION';

    // Update Room
    const updatedRooms = rooms.map(r => 
      r.id === selectedRoomForBooking.id 
        ? { 
            ...r, 
            status: nextStatus as any, 
            guestName: finalGuestName,
            checkIn: bookingForm.checkIn,
            checkOut: bookingForm.checkOut
          } 
        : r
    );
    setRooms(updatedRooms);
    
    // Add Log
    addLog(
        selectedRoomForBooking.id, 
        action, 
        selectedRoomForBooking.status, 
        nextStatus, 
        finalGuestName, 
        bookingForm.notes
    );

    closeDrawer();
  };

  const handleStatusChange = (e: React.MouseEvent, roomId: string, newStatus: Room['status']) => {
      e.stopPropagation();
      const room = rooms.find(r => r.id === roomId);
      if (!room) return;

      let action: RoomLog['action'] = 'MAINTENANCE_START';
      if (room.status === 'RESERVADA' && newStatus === 'OCUPADA') action = 'CHECK_IN';
      if (room.status === 'OCUPADA' && newStatus === 'LIMPIEZA') action = 'CHECK_OUT';
      if (room.status === 'LIMPIEZA' && newStatus === 'DISPONIBLE') action = 'CLEANING_END';

      // Update Room
      setRooms(prev => prev.map(r => 
        r.id === roomId 
            ? { ...r, status: newStatus, guestName: newStatus === 'DISPONIBLE' ? undefined : r.guestName } 
            : r
      ));

      // Add Log
      addLog(roomId, action, room.status, newStatus, room.guestName);
      
      // Update Detail view if open
      if (detailRoom && detailRoom.id === roomId) {
          setDetailRoom({ ...detailRoom, status: newStatus });
      }
  };

  const selectExistingGuest = (client: Client) => {
    setBookingForm({
      ...bookingForm,
      guestId: client.id,
      guestName: client.name,
      guestEmail: client.email,
      guestPhone: client.phone
    });
  };

  // --- VIEW: ROOM DETAIL ---
  if (view === 'ROOM_DETAIL' && detailRoom) {
      // Filter logs for this room and sort by newest
      const roomHistory = logs
        .filter(l => l.roomId === detailRoom.id)
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

      return (
          <div className="animate-fade-in pb-20 max-w-5xl mx-auto">
              {/* Header */}
              <div className="flex items-center gap-4 mb-8">
                  <button onClick={() => setView('BOARD')} className="w-10 h-10 rounded-full bg-white border border-zinc-200 flex items-center justify-center text-zinc-500 hover:text-black transition-all shadow-sm">
                      <ArrowLeft className="w-5 h-5" />
                  </button>
                  <div>
                      <h1 className="text-2xl lg:text-3xl font-light text-zinc-900">Habitación {detailRoom.number}</h1>
                      <p className="text-zinc-500 text-xs tracking-wide">Historial operativo y estado actual.</p>
                  </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  
                  {/* Left Column: Room Status Card */}
                  <div className="lg:col-span-1 space-y-6">
                      <div className="bg-white p-6 rounded-[2rem] border border-zinc-100 shadow-sm flex flex-col items-center text-center">
                          <div className="w-24 h-24 rounded-full bg-zinc-50 border-4 border-white shadow-lg flex items-center justify-center mb-4 text-3xl font-bold text-zinc-900">
                              {detailRoom.number}
                          </div>
                          
                          <div className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border mb-6
                                ${detailRoom.status === 'DISPONIBLE' ? 'bg-green-50 text-green-700 border-green-100' : 
                                detailRoom.status === 'OCUPADA' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                                detailRoom.status === 'RESERVADA' ? 'bg-indigo-50 text-indigo-700 border-indigo-100' :
                                detailRoom.status === 'LIMPIEZA' ? 'bg-yellow-50 text-yellow-700 border-yellow-100' :
                                'bg-red-50 text-red-700 border-red-100'}`}>
                              {detailRoom.status}
                          </div>

                          <div className="w-full grid grid-cols-2 gap-4 bg-zinc-50 p-4 rounded-xl border border-zinc-100">
                                <div className="text-center">
                                    <span className="block text-[10px] font-bold uppercase text-zinc-400 tracking-wider mb-1">Tipo</span>
                                    <span className="text-xs font-bold text-zinc-700">{detailRoom.type}</span>
                                </div>
                                <div className="text-center border-l border-zinc-200 pl-4">
                                    <span className="block text-[10px] font-bold uppercase text-zinc-400 tracking-wider mb-1">Tarifa</span>
                                    <span className="text-xs font-bold text-zinc-700">${detailRoom.priceNight}</span>
                                </div>
                          </div>
                      </div>

                      {/* Current Guest (if any) */}
                      {detailRoom.guestName && (
                          <div className="bg-white p-6 rounded-2xl border border-zinc-100 shadow-sm">
                              <h3 className="text-xs font-bold uppercase text-zinc-400 tracking-wider mb-4">Huésped Actual</h3>
                              <div className="flex items-center gap-3 mb-4">
                                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm">
                                      {detailRoom.guestName.charAt(0)}
                                  </div>
                                  <div>
                                      <p className="font-bold text-zinc-900">{detailRoom.guestName}</p>
                                      <p className="text-xs text-zinc-500">ID Reserva: #RES-{detailRoom.id}</p>
                                  </div>
                              </div>
                              <div className="flex justify-between items-center text-xs text-zinc-600 bg-zinc-50 p-3 rounded-lg">
                                  <span>Check-in: <strong>{detailRoom.checkIn}</strong></span>
                                  <ArrowRight className="w-3 h-3 text-zinc-300" />
                                  <span>Check-out: <strong>{detailRoom.checkOut}</strong></span>
                              </div>
                          </div>
                      )}
                  </div>

                  {/* Right Column: Timeline / Logs */}
                  <div className="lg:col-span-2">
                      <div className="bg-white p-6 md:p-8 rounded-[2rem] border border-zinc-100 shadow-sm h-full flex flex-col">
                          <h3 className="text-lg font-light text-zinc-900 mb-6 flex items-center gap-2">
                              <History className="w-5 h-5 text-zinc-400" /> Bitácora de Actividad
                          </h3>

                          <div className="flex-1 overflow-y-auto pr-2 space-y-6">
                              {roomHistory.length === 0 ? (
                                  <div className="text-center py-10 text-zinc-400 text-sm italic">
                                      No hay registros recientes para esta habitación.
                                  </div>
                              ) : (
                                  roomHistory.map((log, index) => (
                                      <div key={log.id} className="relative pl-8 pb-1 last:pb-0 group">
                                          {/* Timeline Line */}
                                          {index !== roomHistory.length - 1 && (
                                              <div className="absolute left-[11px] top-6 bottom-[-24px] w-px bg-zinc-200 group-hover:bg-zinc-300 transition-colors"></div>
                                          )}
                                          
                                          {/* Timeline Dot */}
                                          <div className={`absolute left-0 top-1.5 w-6 h-6 rounded-full border-2 border-white shadow-sm flex items-center justify-center z-10
                                              ${log.action === 'CHECK_IN' ? 'bg-blue-500 text-white' : 
                                                log.action === 'CHECK_OUT' ? 'bg-zinc-700 text-white' : 
                                                log.action === 'CLEANING_END' ? 'bg-green-500 text-white' :
                                                'bg-zinc-200 text-zinc-500'}`}>
                                              {log.action === 'CHECK_IN' ? <LogIn className="w-3 h-3" /> :
                                               log.action === 'CHECK_OUT' ? <LogOut className="w-3 h-3" /> :
                                               log.action === 'CLEANING_END' ? <CheckCircle className="w-3 h-3" /> :
                                               <Activity className="w-3 h-3" />}
                                          </div>

                                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                                              <div>
                                                  <h4 className="font-bold text-sm text-zinc-900">
                                                      {log.action.replace('_', ' ')}
                                                  </h4>
                                                  <p className="text-xs text-zinc-500 mt-0.5">
                                                      Estado: <span className="font-medium text-zinc-700">{log.previousStatus}</span> ➝ <span className="font-medium text-zinc-700">{log.newStatus}</span>
                                                  </p>
                                                  {log.guestName && (
                                                      <div className="inline-flex items-center gap-1 mt-1.5 px-2 py-1 bg-zinc-50 rounded border border-zinc-100 text-[10px] font-bold uppercase text-zinc-500">
                                                          <User className="w-3 h-3" /> {log.guestName}
                                                      </div>
                                                  )}
                                              </div>
                                              <div className="text-right flex flex-col items-end">
                                                  <span className="text-xs font-bold text-zinc-900 font-mono">
                                                      {log.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                                  </span>
                                                  <span className="text-[10px] text-zinc-400">
                                                      {log.timestamp.toLocaleDateString()}
                                                  </span>
                                                  <span className="text-[9px] text-zinc-300 mt-1">
                                                      Por: {log.staffName}
                                                  </span>
                                              </div>
                                          </div>
                                      </div>
                                  ))
                              )}
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      );
  }

  // --- VIEW: MAIN BOARD ---
  return (
    <div className="flex flex-col relative pb-20 animate-fade-in">
      
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 mb-8">
        <div>
          <h1 className="text-3xl lg:text-4xl font-light text-zinc-900 mb-2 tracking-tight">Panel de Ocupación</h1>
          <p className="text-zinc-500 font-light tracking-wide text-sm">Vista centralizada de disponibilidad y operaciones.</p>
        </div>
        
        <button 
            onClick={(e) => openBooking(e)}
            className="px-6 py-3 bg-zinc-900 text-white text-sm font-bold uppercase tracking-widest rounded-xl hover:bg-brand transition-all shadow-lg shadow-zinc-900/10 flex items-center gap-2"
        >
            <Plus className="w-4 h-4" /> Nueva Reserva
        </button>
      </div>

      {/* Stats Dashboard */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
           {/* Card 1: Occupancy */}
           <div className="bg-white p-5 rounded-xl border border-zinc-200 shadow-sm flex flex-col justify-between group hover:border-blue-200 transition-all">
                <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Ocupación</span>
                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                        <PieChart className="w-4 h-4" />
                    </div>
                </div>
                <div className="flex items-end gap-2">
                    <span className="text-3xl font-light text-zinc-900">{stats.occupancyRate}%</span>
                    <span className="text-xs text-zinc-400 font-medium mb-1">Total</span>
                </div>
                <div className="w-full bg-zinc-100 h-1 mt-3 rounded-full overflow-hidden">
                    <div className="bg-blue-500 h-full rounded-full" style={{ width: `${stats.occupancyRate}%` }}></div>
                </div>
           </div>

           {/* Card 2: Cleaning */}
           <div className="bg-white p-5 rounded-xl border border-zinc-200 shadow-sm flex flex-col justify-between group hover:border-yellow-200 transition-all">
                <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Limpieza</span>
                    <div className="w-8 h-8 rounded-lg bg-yellow-50 text-yellow-600 flex items-center justify-center">
                        <SprayCan className="w-4 h-4" />
                    </div>
                </div>
                <div className="flex items-end gap-2">
                    <span className="text-3xl font-light text-zinc-900">{stats.cleaning}</span>
                    <span className="text-xs text-zinc-400 font-medium mb-1">Habitaciones</span>
                </div>
                <div className="w-full bg-zinc-100 h-1 mt-3 rounded-full overflow-hidden">
                    <div className="bg-yellow-400 h-full rounded-full" style={{ width: `${(stats.cleaning / stats.total) * 100}%` }}></div>
                </div>
           </div>

           {/* Card 3: Available */}
           <div className="bg-white p-5 rounded-xl border border-zinc-200 shadow-sm flex flex-col justify-between group hover:border-green-200 transition-all">
                <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Disponibles</span>
                    <div className="w-8 h-8 rounded-lg bg-green-50 text-green-600 flex items-center justify-center">
                        <CheckCircle className="w-4 h-4" />
                    </div>
                </div>
                <div className="flex items-end gap-2">
                    <span className="text-3xl font-light text-zinc-900">{stats.available}</span>
                    <span className="text-xs text-zinc-400 font-medium mb-1">Listas</span>
                </div>
                <div className="w-full bg-zinc-100 h-1 mt-3 rounded-full overflow-hidden">
                    <div className="bg-green-500 h-full rounded-full" style={{ width: `${(stats.available / stats.total) * 100}%` }}></div>
                </div>
           </div>

           {/* Card 4: Guests */}
           <div className="bg-white p-5 rounded-xl border border-zinc-200 shadow-sm flex flex-col justify-between group hover:border-indigo-200 transition-all">
                <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Huéspedes</span>
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                        <User className="w-4 h-4" />
                    </div>
                </div>
                <div className="flex items-end gap-2">
                    <span className="text-3xl font-light text-zinc-900">{stats.occupied}</span>
                    <span className="text-xs text-zinc-400 font-medium mb-1">Activos</span>
                </div>
                 <div className="w-full bg-zinc-100 h-1 mt-3 rounded-full overflow-hidden">
                    <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${(stats.occupied / stats.total) * 100}%` }}></div>
                </div>
           </div>
      </div>

      {/* Control Bar & Search */}
      <div className="flex flex-col lg:flex-row gap-4 mb-6">
          <div className="bg-white p-1 rounded-xl border border-zinc-200 shadow-sm flex overflow-x-auto no-scrollbar max-w-full lg:max-w-fit">
            {['TODAS', 'DISPONIBLE', 'RESERVADA', 'OCUPADA', 'LIMPIEZA'].map((s) => (
                <button 
                    key={s}
                    onClick={() => { setFilter(s as any); setCurrentPage(1); }}
                    className={`px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all whitespace-nowrap
                        ${filter === s ? 'bg-zinc-900 text-white shadow-md' : 'text-zinc-400 hover:text-zinc-900 hover:bg-zinc-50'}`}
                >
                    {s}
                </button>
            ))}
          </div>

          <div className="relative flex-1 bg-white rounded-xl shadow-sm border border-zinc-200">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input 
                    type="text" 
                    placeholder="Buscar habitación o huésped..."
                    value={searchQuery}
                    onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                    className="w-full pl-10 pr-10 py-3 bg-transparent text-sm focus:outline-none transition-all placeholder:text-zinc-400"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-300">
                    <Filter className="w-4 h-4" />
                </div>
            </div>
      </div>

      {/* Mobile Card Grid (Visible < md) */}
      <div className="grid grid-cols-1 md:hidden gap-4 mb-6">
          {paginatedRooms.map(room => (
              <div key={room.id} onClick={() => handleRoomClick(room)} className="bg-white p-5 rounded-2xl border border-zinc-100 shadow-sm flex flex-col gap-4 active:scale-[0.98] transition-all cursor-pointer">
                   <div className="flex justify-between items-start">
                       <div className="flex items-center gap-3">
                           <div className="w-12 h-12 bg-zinc-50 rounded-xl flex items-center justify-center border border-zinc-100">
                               <span className="text-xl font-bold text-zinc-900">{room.number}</span>
                           </div>
                           <div>
                               <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">{room.type}</span>
                               <div className="mt-1">
                                    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider
                                        ${room.status === 'DISPONIBLE' ? 'bg-green-50 text-green-700' : 
                                            room.status === 'OCUPADA' ? 'bg-blue-50 text-blue-700' :
                                            room.status === 'RESERVADA' ? 'bg-indigo-50 text-indigo-700' :
                                            room.status === 'LIMPIEZA' ? 'bg-yellow-50 text-yellow-700' :
                                            'bg-red-50 text-red-700'}`}>
                                        <span className={`w-1.5 h-1.5 rounded-full ${room.status === 'DISPONIBLE' ? 'bg-green-500' : room.status === 'OCUPADA' ? 'bg-blue-500' : 'bg-current'}`}></span>
                                        {room.status}
                                    </span>
                               </div>
                           </div>
                       </div>
                       <div className="text-right">
                           <span className="block font-bold text-zinc-900">${room.priceNight}</span>
                           <span className="text-[10px] text-zinc-400 uppercase">Detalles &gt;</span>
                       </div>
                   </div>

                   {room.guestName && (
                       <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-100 flex items-center gap-3">
                           <div className="w-8 h-8 rounded-full bg-white border border-zinc-200 flex items-center justify-center text-[10px] font-bold text-zinc-500">
                               {room.guestName.charAt(0)}
                           </div>
                           <div>
                               <p className="text-xs font-bold text-zinc-900">{room.guestName}</p>
                               {room.checkIn && (
                                   <p className="text-[10px] text-zinc-400">{room.checkIn} → {room.checkOut}</p>
                               )}
                           </div>
                       </div>
                   )}

                   <div className="grid grid-cols-2 gap-2 pt-2 border-t border-zinc-50">
                        {room.status === 'DISPONIBLE' && (
                            <button onClick={(e) => openBooking(e, room)} className="col-span-2 py-2 bg-zinc-900 text-white rounded-lg text-xs font-bold uppercase tracking-wide">
                                Registrar
                            </button>
                        )}
                        {room.status === 'OCUPADA' && (
                             <button onClick={(e) => handleStatusChange(e, room.id, 'LIMPIEZA')} className="col-span-2 py-2 bg-white border border-zinc-200 text-zinc-600 rounded-lg text-xs font-bold uppercase tracking-wide">
                                Check-out
                            </button>
                        )}
                        {room.status === 'LIMPIEZA' && (
                             <button onClick={(e) => handleStatusChange(e, room.id, 'DISPONIBLE')} className="col-span-2 py-2 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-lg text-xs font-bold uppercase tracking-wide">
                                Marcar Lista
                            </button>
                        )}
                   </div>
              </div>
          ))}
      </div>

      {/* Desktop List View (Room Rack) */}
      <div className="hidden md:block bg-white rounded-3xl border border-zinc-100 shadow-sm overflow-hidden mb-6">
          <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                  <thead>
                      <tr className="bg-zinc-50/50 border-b border-zinc-100 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">
                          <th className="py-5 px-8 text-left font-normal">Habitación</th>
                          <th className="py-5 px-4 text-left font-normal">Estado</th>
                          <th className="py-5 px-4 text-left font-normal">Huésped Actual</th>
                          <th className="py-5 px-4 text-left font-normal">Estancia</th>
                          <th className="py-5 px-8 text-right font-normal">Acciones</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-50">
                      {paginatedRooms.map(room => (
                          <tr 
                            key={room.id} 
                            onClick={() => handleRoomClick(room)}
                            className="group hover:bg-zinc-50/50 transition-colors cursor-pointer"
                          >
                              <td className="py-4 px-8">
                                  <div className="flex items-center gap-5">
                                      <div className="font-bold text-xl text-zinc-900 w-8 flex justify-center">
                                          {room.number}
                                      </div>
                                      <div>
                                          <span className="block text-sm font-bold text-zinc-900">{room.type}</span>
                                          <span className="block text-[10px] text-zinc-400 uppercase tracking-widest">${room.priceNight} / noche</span>
                                      </div>
                                  </div>
                              </td>
                              <td className="py-4 px-4">
                                  <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-[10px] font-bold uppercase tracking-widest
                                      ${room.status === 'DISPONIBLE' ? 'bg-green-50 text-green-700 border-green-100' : 
                                        room.status === 'OCUPADA' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                                        room.status === 'RESERVADA' ? 'bg-indigo-50 text-indigo-700 border-indigo-100' :
                                        room.status === 'LIMPIEZA' ? 'bg-yellow-50 text-yellow-700 border-yellow-100' :
                                        'bg-red-50 text-red-700 border-red-100'}`}>
                                      {room.status === 'DISPONIBLE' && <CheckCircle className="w-3 h-3" />}
                                      {room.status === 'OCUPADA' && <User className="w-3 h-3" />}
                                      {room.status === 'RESERVADA' && <Calendar className="w-3 h-3" />}
                                      {room.status === 'LIMPIEZA' && <SprayCan className="w-3 h-3" />}
                                      {room.status === 'MANTENIMIENTO' && <AlertCircle className="w-3 h-3" />}
                                      {room.status}
                                  </div>
                              </td>
                              <td className="py-4 px-4">
                                  {room.guestName ? (
                                      <div className="flex items-center gap-3">
                                          <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-500 font-bold text-xs">
                                              {room.guestName.charAt(0)}
                                          </div>
                                          <span className="text-sm font-medium text-zinc-900">{room.guestName}</span>
                                      </div>
                                  ) : (
                                      <span className="text-xs text-zinc-300 italic">Sin asignar</span>
                                  )}
                              </td>
                              <td className="py-4 px-4">
                                  {room.checkIn ? (
                                      <div className="flex flex-col gap-1">
                                          <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-500">
                                              <span>{room.checkIn}</span>
                                              <ArrowRight className="w-3 h-3" />
                                              <span>{room.checkOut}</span>
                                          </div>
                                          <div className="w-24 h-1 bg-zinc-100 rounded-full overflow-hidden">
                                              <div className={`h-full w-[60%] ${room.status === 'RESERVADA' ? 'bg-indigo-400' : 'bg-brand'}`}></div>
                                          </div>
                                      </div>
                                  ) : (
                                      <span className="text-xs text-zinc-300">—</span>
                                  )}
                              </td>
                              <td className="py-4 px-8 text-right">
                                  <div className="flex justify-end gap-2">
                                      {room.status === 'DISPONIBLE' && (
                                          <button 
                                            onClick={(e) => openBooking(e, room)}
                                            className="px-4 py-2 bg-zinc-900 text-white rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-brand transition-all flex items-center gap-2"
                                          >
                                              <LogIn className="w-3 h-3" /> Registrar
                                          </button>
                                      )}
                                      {room.status === 'RESERVADA' && (
                                          <button 
                                            onClick={(e) => handleStatusChange(e, room.id, 'OCUPADA')}
                                            className="px-4 py-2 bg-brand text-white rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-brand-dark transition-all flex items-center gap-2 shadow-lg shadow-brand/10"
                                          >
                                              <LogIn className="w-3 h-3" /> Check-in
                                          </button>
                                      )}
                                      {room.status === 'OCUPADA' && (
                                          <button 
                                            onClick={(e) => handleStatusChange(e, room.id, 'LIMPIEZA')}
                                            className="px-4 py-2 bg-white border border-zinc-200 text-zinc-600 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:border-red-500 hover:text-red-500 transition-all flex items-center gap-2"
                                          >
                                              <LogOut className="w-3 h-3" /> Check-out
                                          </button>
                                      )}
                                      {room.status === 'LIMPIEZA' && (
                                          <button 
                                            onClick={(e) => handleStatusChange(e, room.id, 'DISPONIBLE')}
                                            className="px-4 py-2 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-emerald-100 transition-all flex items-center gap-2"
                                          >
                                              <SprayCan className="w-3 h-3" /> Listo
                                          </button>
                                      )}
                                      <button className="p-2 text-zinc-300 hover:text-zinc-900 rounded-lg transition-colors">
                                          <FileText className="w-4 h-4" />
                                      </button>
                                  </div>
                              </td>
                          </tr>
                      ))}
                  </tbody>
              </table>
          </div>
      </div>

      {/* Pagination Footer */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 px-2">
         <div className="text-xs text-zinc-500 font-medium order-2 md:order-1">
             Mostrando <span className="text-zinc-900 font-bold">{Math.min((currentPage - 1) * ITEMS_PER_PAGE + 1, filteredRooms.length)}-{Math.min(currentPage * ITEMS_PER_PAGE, filteredRooms.length)}</span> de <span className="text-zinc-900 font-bold">{filteredRooms.length}</span>
         </div>
         
         <div className="flex items-center gap-2 order-1 md:order-2">
             <button 
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="p-2.5 rounded-xl border border-zinc-200 text-zinc-500 hover:text-zinc-900 hover:border-zinc-400 hover:bg-white disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:border-zinc-200 disabled:cursor-not-allowed transition-all"
            >
                 <ChevronLeft className="w-4 h-4" />
             </button>
             
             <div className="flex items-center gap-1">
                 {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
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
                 ))}
             </div>

             <button 
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="p-2.5 rounded-xl border border-zinc-200 text-zinc-500 hover:text-zinc-900 hover:border-zinc-400 hover:bg-white disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:border-zinc-200 disabled:cursor-not-allowed transition-all"
            >
                 <ChevronRight className="w-4 h-4" />
             </button>
         </div>
      </div>

      {/* Registration Drawer / Slide-over */}
      {isDrawerOpen && (
          <>
            <div className="fixed inset-0 bg-zinc-900/40 backdrop-blur-sm z-[60] transition-opacity animate-fade-in" onClick={closeDrawer} />
            <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl z-[70] transform transition-transform duration-300 ease-out animate-slide-in flex flex-col">
                
                {/* Drawer Header */}
                <div className="p-8 border-b border-zinc-100 flex justify-between items-center bg-zinc-50/50">
                    <div>
                        <h2 className="text-2xl font-light text-zinc-900">{isRegisteringNewGuest ? 'Nuevo Registro' : 'Nueva Reserva'}</h2>
                        <p className="text-xs text-zinc-500 uppercase tracking-widest font-bold mt-1">
                            {selectedRoomForBooking ? `Habitación ${selectedRoomForBooking.number}` : 'Asignación Manual'}
                        </p>
                    </div>
                    <button onClick={closeDrawer} className="p-2 hover:bg-zinc-200 rounded-full transition-colors text-zinc-400">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Drawer Body */}
                <form onSubmit={handleCreateBooking} className="flex-1 overflow-y-auto p-8 space-y-8">
                    
                    {/* Guest Selection Section */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-end">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                                {isRegisteringNewGuest ? 'Datos del Nuevo Huésped' : 'Información del Huésped'}
                            </label>
                            
                            {!isRegisteringNewGuest ? (
                              <button 
                                type="button" 
                                onClick={() => setIsRegisteringNewGuest(true)}
                                className="text-brand text-[10px] font-bold uppercase flex items-center gap-1 hover:underline"
                              >
                                  <UserPlus className="w-3 h-3" /> Nuevo Cliente
                              </button>
                            ) : (
                              <button 
                                type="button" 
                                onClick={() => setIsRegisteringNewGuest(false)}
                                className="text-zinc-400 text-[10px] font-bold uppercase flex items-center gap-1 hover:text-zinc-900 transition-colors"
                              >
                                  <ArrowLeft className="w-3 h-3" /> Volver a buscar
                              </button>
                            )}
                        </div>
                        
                        {!isRegisteringNewGuest ? (
                          <div className="relative animate-fade-in">
                              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                              <input 
                                  type="text" 
                                  placeholder="Buscar cliente por nombre..."
                                  value={bookingForm.guestName}
                                  onChange={(e) => setBookingForm({...bookingForm, guestName: e.target.value, guestId: ''})}
                                  required
                                  className="w-full pl-10 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:border-brand focus:ring-1 focus:ring-brand outline-none transition-all"
                              />
                              {/* Simple Auto-suggest logic */}
                              {bookingForm.guestName.length > 2 && bookingForm.guestId === '' && (
                                  <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-zinc-100 rounded-xl shadow-xl z-10 overflow-hidden">
                                      {clients.filter(c => c.name.toLowerCase().includes(bookingForm.guestName.toLowerCase())).map(c => (
                                          <button 
                                              key={c.id} 
                                              type="button"
                                              onClick={() => selectExistingGuest(c)}
                                              className="w-full text-left px-4 py-3 hover:bg-zinc-50 flex items-center gap-3"
                                          >
                                              <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-xs font-bold text-zinc-400">
                                                  {c.name.charAt(0)}
                                              </div>
                                              <div>
                                                  <span className="block text-sm font-medium text-zinc-900">{c.name}</span>
                                                  <span className="block text-[10px] text-zinc-400">{c.email}</span>
                                              </div>
                                          </button>
                                      ))}
                                      {clients.filter(c => c.name.toLowerCase().includes(bookingForm.guestName.toLowerCase())).length === 0 && (
                                         <div className="px-4 py-3 text-xs text-zinc-400 italic">No se encontraron resultados.</div>
                                      )}
                                  </div>
                              )}
                          </div>
                        ) : (
                          <div className="space-y-4 animate-fade-in">
                              <div className="relative">
                                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                                  <input 
                                      type="text" 
                                      placeholder="Nombre completo"
                                      value={bookingForm.guestName}
                                      onChange={(e) => setBookingForm({...bookingForm, guestName: e.target.value})}
                                      required
                                      className="w-full pl-10 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:border-brand outline-none transition-all"
                                  />
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                  <div className="relative">
                                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                                      <input 
                                          type="email" 
                                          placeholder="Correo electrónico"
                                          value={bookingForm.guestEmail}
                                          onChange={(e) => setBookingForm({...bookingForm, guestEmail: e.target.value})}
                                          className="w-full pl-10 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:border-brand outline-none transition-all"
                                      />
                                  </div>
                                  <div className="relative">
                                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                                      <input 
                                          type="tel" 
                                          placeholder="Teléfono"
                                          value={bookingForm.guestPhone}
                                          onChange={(e) => setBookingForm({...bookingForm, guestPhone: e.target.value})}
                                          className="w-full pl-10 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:border-brand outline-none transition-all"
                                      />
                                  </div>
                              </div>
                          </div>
                        )}
                    </div>

                    {/* Dates Section */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Check-in</label>
                            <input 
                                type="date" 
                                value={bookingForm.checkIn}
                                onChange={(e) => setBookingForm({...bookingForm, checkIn: e.target.value})}
                                className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:border-brand outline-none"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Check-out</label>
                            <input 
                                type="date" 
                                required
                                value={bookingForm.checkOut}
                                onChange={(e) => setBookingForm({...bookingForm, checkOut: e.target.value})}
                                className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:border-brand outline-none"
                            />
                        </div>
                    </div>

                    {/* Check-in Now Toggle */}
                    <div className="flex items-center justify-between p-4 bg-zinc-50 rounded-2xl border border-zinc-100 transition-all">
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${isCheckInImmediate ? 'bg-brand/10 text-brand' : 'bg-zinc-200 text-zinc-500'}`}>
                                <LogIn className="w-4 h-4" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-zinc-900">Realizar Check-in inmediato</p>
                                <p className="text-[10px] text-zinc-500">Marcar habitación como Ocupada ahora mismo.</p>
                            </div>
                        </div>
                        <button 
                            type="button"
                            onClick={() => setIsCheckInImmediate(!isCheckInImmediate)}
                            className={`w-12 h-6 rounded-full relative transition-colors ${isCheckInImmediate ? 'bg-zinc-900' : 'bg-zinc-300'}`}
                        >
                            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow-sm ${isCheckInImmediate ? 'left-7' : 'left-1'}`} />
                        </button>
                    </div>

                    {/* Room Info Preview */}
                    {selectedRoomForBooking && (
                        <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-200 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white rounded-lg shadow-sm">
                                    <BedDouble className="w-5 h-5 text-zinc-400" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-zinc-900">Habitación {selectedRoomForBooking.number}</p>
                                    <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">{selectedRoomForBooking.type}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-bold text-zinc-900">${selectedRoomForBooking.priceNight}</p>
                                <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">X noche</p>
                            </div>
                        </div>
                    )}

                    {/* Extra Info */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Notas de Reserva</label>
                        <textarea 
                            rows={3}
                            placeholder="Ej. Prefiere habitación silenciosa, desayuno incluido..."
                            className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:border-brand outline-none resize-none"
                            value={bookingForm.notes}
                            onChange={(e) => setBookingForm({...bookingForm, notes: e.target.value})}
                        />
                    </div>
                </form>

                {/* Drawer Footer */}
                <div className="p-8 border-t border-zinc-100 bg-zinc-50/50">
                    <button 
                        onClick={handleCreateBooking}
                        className={`w-full py-4 text-white rounded-2xl font-bold text-xs uppercase tracking-[0.2em] transition-all shadow-xl flex items-center justify-center gap-3
                            ${isCheckInImmediate ? 'bg-zinc-900 hover:bg-brand shadow-zinc-900/20' : 'bg-brand hover:bg-brand-dark shadow-brand/20'}`}
                    >
                        {isCheckInImmediate ? (isRegisteringNewGuest ? 'Registrar y Check-in' : 'Confirmar Check-in') : (isRegisteringNewGuest ? 'Registrar y Reservar' : 'Confirmar Reserva')} 
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            </div>
          </>
      )}
    </div>
  );
};

export default Hotel;
