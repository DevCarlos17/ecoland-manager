
import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Plus, Users, Calendar as CalendarIcon, X, Save, Trash2, Clock, AlertCircle, Phone, Filter, MoreHorizontal } from 'lucide-react';

// Extended type for internal logic handling real Dates
interface AgendaEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  trainer: string;
  phone?: string;
  type: 'CLASS' | 'MAINTENANCE' | 'PRIVATE';
  notes?: string;
}

const START_HOUR = 6;
const END_HOUR = 21;

// Generate 30 min intervals for the list view (Mobile)
const TIME_SLOTS: { hour: number, minute: number }[] = [];
for (let h = START_HOUR; h <= END_HOUR; h++) {
    TIME_SLOTS.push({ hour: h, minute: 0 });
    if(h !== END_HOUR) TIME_SLOTS.push({ hour: h, minute: 30 });
}

// Generate hours for Grid view (Desktop)
const HOURS = Array.from({ length: END_HOUR - START_HOUR + 1 }, (_, i) => i + START_HOUR);
const HOUR_HEIGHT = 100;

const Agenda: React.FC = () => {
  const [viewMode, setViewMode] = useState<'WEEK' | 'DAY'>('WEEK');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showAvailableOnly, setShowAvailableOnly] = useState(false); // Mobile filter
  
  // --- STATE: Events ---
  const [events, setEvents] = useState<AgendaEvent[]>(() => {
      const today = new Date();
      const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);
      
      return [
        { 
            id: '1', 
            title: 'CrossFit WOD', 
            start: new Date(today.setHours(8, 0, 0, 0)), 
            end: new Date(today.setHours(9, 0, 0, 0)), 
            trainer: 'Juan P.',
            phone: '0412-555-0101', 
            type: 'CLASS'
        },
        { 
            id: '2', 
            title: 'Mantenimiento General', 
            start: new Date(tomorrow.setHours(14, 0, 0, 0)), 
            end: new Date(tomorrow.setHours(17, 0, 0, 0)), 
            trainer: 'Staff',
            phone: '0212-999-9999', 
            type: 'MAINTENANCE',
            notes: 'Reparación de aire acondicionado'
        },
      ];
  });

  // --- STATE: Modal/Drawer ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Partial<AgendaEvent>>({});

  // --- Date Helpers ---
  const startOfWeek = useMemo(() => {
      const d = new Date(currentDate);
      const day = d.getDay();
      const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
      d.setDate(diff);
      d.setHours(0, 0, 0, 0);
      return d;
  }, [currentDate]);

  const displayedDays = useMemo(() => {
      const days = [];
      const start = new Date(startOfWeek);
      for (let i = 0; i < 7; i++) {
          const d = new Date(start);
          d.setDate(start.getDate() + i);
          days.push(d);
      }
      return days;
  }, [startOfWeek]);

  const displayedDaysDesktop = useMemo(() => {
      if (viewMode === 'WEEK') return displayedDays;
      return [currentDate];
  }, [viewMode, displayedDays, currentDate]);

  const isToday = (date: Date) => {
      const today = new Date();
      return date.getDate() === today.getDate() && 
             date.getMonth() === today.getMonth() && 
             date.getFullYear() === today.getFullYear();
  };

  const isSameDay = (d1: Date, d2: Date) => {
      return d1.getDate() === d2.getDate() && 
             d1.getMonth() === d2.getMonth() && 
             d1.getFullYear() === d2.getFullYear();
  }

  // --- Navigation Handlers ---
  const handlePrev = () => {
      const newDate = new Date(currentDate);
      newDate.setDate(newDate.getDate() - (viewMode === 'WEEK' ? 7 : 1));
      setCurrentDate(newDate);
  };

  const handleNext = () => {
      const newDate = new Date(currentDate);
      newDate.setDate(newDate.getDate() + (viewMode === 'WEEK' ? 7 : 1));
      setCurrentDate(newDate);
  };

  const handleToday = () => setCurrentDate(new Date());

  // --- CRUD Handlers ---

  const openNewEventModal = (preselectedDate?: Date, hour?: number, minute?: number) => {
      const start = preselectedDate ? new Date(preselectedDate) : new Date(currentDate);
      
      if (hour !== undefined) {
        start.setHours(hour, minute || 0, 0, 0);
      } else {
        const now = new Date();
        start.setHours(now.getHours() + 1, 0, 0, 0);
      }

      const end = new Date(start);
      end.setHours(start.getHours() + 1);

      setEditingEvent({
          id: undefined,
          title: '',
          start,
          end,
          trainer: '',
          phone: '',
          type: 'CLASS',
          notes: ''
      });
      setIsModalOpen(true);
  };

  const handleSlotClick = (date: Date, hour: number) => {
      openNewEventModal(date, hour);
  };

  const handleEventClick = (e: React.MouseEvent, event: AgendaEvent) => {
      e.stopPropagation();
      setEditingEvent({ ...event });
      setIsModalOpen(true);
  };

  const saveEvent = () => {
      if (!editingEvent.title || !editingEvent.start || !editingEvent.end) return;
      
      const newEvent = {
          ...editingEvent,
          id: editingEvent.id || Math.random().toString(36).substr(2, 9),
      } as AgendaEvent;

      setEvents(prev => {
          if (editingEvent.id) {
              return prev.map(e => e.id === newEvent.id ? newEvent : e);
          }
          return [...prev, newEvent];
      });
      setIsModalOpen(false);
  };

  const deleteEvent = () => {
      if (!editingEvent.id) return;
      setEvents(prev => prev.filter(e => e.id !== editingEvent.id));
      setIsModalOpen(false);
  };

  // --- Date/Time Split Logic ---
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newDateStr = e.target.value;
      if (!newDateStr) return;
      
      const newDate = new Date(newDateStr);
      const updateDatePart = (original: Date | undefined) => {
          const base = original ? new Date(original) : new Date();
          const hours = base.getHours();
          const mins = base.getMinutes();
          const updated = new Date(base);
          const [y, m, d] = newDateStr.split('-').map(Number);
          updated.setFullYear(y);
          updated.setMonth(m - 1);
          updated.setDate(d);
          updated.setHours(hours, mins, 0, 0);
          return updated;
      };

      setEditingEvent(prev => ({
          ...prev,
          start: updateDatePart(prev.start),
          end: updateDatePart(prev.end)
      }));
  };

  const handleTimeChange = (type: 'START' | 'END', e: React.ChangeEvent<HTMLInputElement>) => {
      const timeStr = e.target.value;
      if (!timeStr) return;
      const [hours, mins] = timeStr.split(':').map(Number);
      
      const baseDate = type === 'START' ? editingEvent.start : editingEvent.end;
      const newDate = baseDate ? new Date(baseDate) : new Date();
      newDate.setHours(hours);
      newDate.setMinutes(mins);

      if (type === 'START') {
          setEditingEvent(prev => ({ ...prev, start: newDate }));
      } else {
          setEditingEvent(prev => ({ ...prev, end: newDate }));
      }
  };

  const getDurationString = () => {
      if (!editingEvent.start || !editingEvent.end) return '';
      const diffMs = editingEvent.end.getTime() - editingEvent.start.getTime();
      const diffHrs = Math.floor(diffMs / 3600000);
      const diffMins = Math.round(((diffMs % 3600000) / 60000));
      if (diffHrs === 0) return `${diffMins}m`;
      if (diffMins === 0) return `${diffHrs}h`;
      return `${diffHrs}h ${diffMins}m`;
  };

  const formatDateForInput = (date?: Date) => {
      if (!date) return '';
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
  };

  const formatTimeForInput = (date?: Date) => {
      if (!date) return '';
      const hours = String(date.getHours()).padStart(2, '0');
      const mins = String(date.getMinutes()).padStart(2, '0');
      return `${hours}:${mins}`;
  }

  // --- Rendering Helpers ---

  // Check if an event overlaps with a specific day
  const doesEventOverlapDay = (event: AgendaEvent, day: Date) => {
      const dayStart = new Date(day); dayStart.setHours(0,0,0,0);
      const dayEnd = new Date(day); dayEnd.setHours(23,59,59,999);
      return event.start < dayEnd && event.end > dayStart;
  };

   // Logic to find an event in a specific time slot (for the Mobile List View)
   const getEventInSlot = (day: Date, hour: number, minute: number) => {
    return events.find(e => {
        const eStart = new Date(e.start);
        return isSameDay(e.start, day) && eStart.getHours() === hour && eStart.getMinutes() === minute;
    });
   }

  // Calculate position and height for an event on a specific day column
  const getEventStyle = (event: AgendaEvent, day: Date) => {
      const gridStartHour = START_HOUR;
      const gridEndHour = END_HOUR + 1;

      let effectiveStartHour = event.start.getHours() + event.start.getMinutes() / 60;
      let effectiveEndHour = event.end.getHours() + event.end.getMinutes() / 60;

      const isStartDay = isSameDay(event.start, day);
      const isEndDay = isSameDay(event.end, day);

      if (!isStartDay) effectiveStartHour = gridStartHour;
      if (!isEndDay) effectiveEndHour = gridEndHour;

      if (effectiveStartHour < gridStartHour) effectiveStartHour = gridStartHour;
      if (effectiveEndHour > gridEndHour) effectiveEndHour = gridEndHour;

      const duration = effectiveEndHour - effectiveStartHour;
      const topOffset = effectiveStartHour - gridStartHour;

      const top = topOffset * HOUR_HEIGHT;
      const height = duration * HOUR_HEIGHT;

      let eventColor = 'bg-brand';
      if (event.type === 'MAINTENANCE') eventColor = 'bg-orange-500';
      else if (event.type === 'PRIVATE') eventColor = 'bg-purple-500';

      return {
          style: { top: `${top}px`, height: `${Math.max(height, 50)}px` },
          className: `absolute inset-x-1 rounded-xl bg-white border border-zinc-200 shadow-sm p-3 text-xs flex flex-col hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 cursor-pointer z-10 group overflow-hidden`,
          isMultiDay: !isStartDay || !isEndDay,
          eventColor
      };
  };

  const formatDateRange = () => {
      if (viewMode === 'DAY') {
          return new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }).format(currentDate);
      }
      const end = displayedDaysDesktop[displayedDaysDesktop.length - 1];
      const startMonth = startOfWeek.toLocaleDateString('es-ES', { month: 'short' });
      const endMonth = end.toLocaleDateString('es-ES', { month: 'short' });
      
      if (startMonth === endMonth) {
          return `${startOfWeek.getDate()} - ${end.getDate()} ${startMonth} ${startOfWeek.getFullYear()}`;
      }
      return `${startOfWeek.getDate()} ${startMonth} - ${end.getDate()} ${endMonth} ${end.getFullYear()}`;
  };

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] lg:h-[calc(100vh-8rem)] pb-0 lg:pb-4 animate-fade-in relative max-w-[1600px] mx-auto w-full">
      
      {/* ---------------- MOBILE / TABLET VIEW ---------------- */}
      {/* List Layout - Styled to match reference but with Brand Colors */}
      <div className="lg:hidden flex flex-col h-full overflow-hidden">
         
         {/* Mobile Header */}
         <div className="flex-shrink-0 mb-4 px-1">
             <button onClick={() => openNewEventModal()} className="w-full py-4 bg-zinc-900 text-white rounded-xl font-bold text-sm uppercase tracking-widest hover:bg-zinc-800 transition-all shadow-lg shadow-zinc-900/20 flex items-center justify-center gap-2 mb-4">
                 <Plus className="w-5 h-5" /> Nueva Cita
             </button>
             
             {/* Date Nav Mobile */}
              <div className="bg-white border border-zinc-200 rounded-xl p-2 flex items-center justify-between shadow-sm mb-4">
                 <button onClick={() => {const d = new Date(currentDate); d.setDate(d.getDate()-1); setCurrentDate(d)}} className="p-2 hover:bg-zinc-50 rounded-lg text-zinc-400 hover:text-zinc-900">
                     <ChevronLeft className="w-5 h-5" />
                 </button>
                 <div className="flex flex-col items-center">
                     <span className="text-sm font-bold text-zinc-900 capitalize">
                         {currentDate.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
                     </span>
                 </div>
                 <button onClick={() => {const d = new Date(currentDate); d.setDate(d.getDate()+1); setCurrentDate(d)}} className="p-2 hover:bg-zinc-50 rounded-lg text-zinc-400 hover:text-zinc-900">
                     <ChevronRight className="w-5 h-5" />
                 </button>
             </div>

             {/* Filter Toggle Mobile */}
             <div className="flex justify-end mb-2">
                 <div 
                    onClick={() => setShowAvailableOnly(!showAvailableOnly)}
                    className="flex items-center gap-3 bg-white border border-zinc-200 rounded-lg px-3 py-1.5 shadow-sm cursor-pointer"
                 >
                     <span className="text-xs font-medium text-zinc-600">Solo disponibles</span>
                     <div className={`w-8 h-4 rounded-full relative transition-colors ${showAvailableOnly ? 'bg-zinc-900' : 'bg-zinc-200'}`}>
                         <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full shadow-sm transition-all ${showAvailableOnly ? 'left-4.5' : 'left-0.5'}`} />
                     </div>
                 </div>
             </div>
         </div>

         {/* Mobile List Content */}
         <div className="flex-1 overflow-y-auto custom-scrollbar pb-20 px-1">
             <div className="space-y-3">
                 {TIME_SLOTS.map((slot, idx) => {
                     const event = getEventInSlot(currentDate, slot.hour, slot.minute);
                     
                     if (showAvailableOnly && event) return null;

                     const timeString = `${slot.hour.toString().padStart(2, '0')}:${slot.minute.toString().padStart(2, '0')}`;

                     // Case 1: Event Exists
                     if (event) {
                         return (
                             <div key={idx} onClick={(e) => handleEventClick(e, event)} className="flex gap-4 group cursor-pointer animate-fade-in">
                                 <div className="w-12 pt-3 text-right flex-shrink-0">
                                     <span className="text-sm font-bold font-mono text-zinc-900">{timeString}</span>
                                 </div>
                                 <div className={`flex-1 p-4 rounded-xl border-l-4 shadow-sm relative overflow-hidden bg-white hover:shadow-md transition-all active:scale-[0.98]
                                    ${event.type === 'CLASS' ? 'border-brand' : event.type === 'MAINTENANCE' ? 'border-orange-500' : 'border-purple-500'}`}>
                                     
                                     <div className="flex justify-between items-start mb-2">
                                         <h3 className="font-bold text-zinc-900 text-sm leading-snug">{event.title}</h3>
                                         <MoreHorizontal className="w-4 h-4 text-zinc-300" />
                                     </div>
                                     <div className="flex flex-col gap-1">
                                         <div className="flex items-center gap-2 text-xs text-zinc-500">
                                             <Users className="w-3 h-3" /> {event.trainer}
                                         </div>
                                         {event.phone && (
                                             <div className="flex items-center gap-2 text-xs text-zinc-500">
                                                <Phone className="w-3 h-3" /> {event.phone}
                                             </div>
                                         )}
                                     </div>
                                 </div>
                             </div>
                         )
                     }

                     // Case 2: Available Slot
                     return (
                         <div key={idx} onClick={() => openNewEventModal(currentDate, slot.hour, slot.minute)} className="flex gap-4 group cursor-pointer">
                             <div className="w-12 pt-3 text-right flex-shrink-0">
                                 <span className="text-sm font-medium font-mono text-zinc-400 group-hover:text-zinc-900 transition-colors">{timeString}</span>
                             </div>
                             <div className="flex-1 p-3 rounded-xl border-2 border-dashed border-zinc-200 bg-zinc-50/30 flex items-center justify-between hover:border-zinc-900/50 hover:bg-zinc-900/5 transition-all active:scale-[0.99]">
                                 <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest group-hover:text-zinc-900 pl-2">Disponible</span>
                                 <div className="w-8 h-8 rounded-full bg-white border border-zinc-200 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                     <Plus className="w-4 h-4 text-zinc-900" />
                                 </div>
                             </div>
                         </div>
                     )
                 })}
             </div>
         </div>
      </div>


      {/* ---------------- DESKTOP VIEW ---------------- */}
      {/* Original Grid Layout - Preserved Exactly */}
      <div className="hidden lg:flex flex-col h-full overflow-hidden">
        {/* Toolbar */}
        <div className="flex flex-row justify-between items-center gap-6 mb-6 flex-shrink-0">
            <div>
                <h1 className="text-3xl font-light text-zinc-900 tracking-tight">Agenda</h1>
                <p className="text-zinc-500 font-light text-sm">Gestión de espacios y clases.</p>
            </div>

            <div className="flex items-center gap-3">
                <div className="flex bg-zinc-100 p-1 rounded-xl">
                    <button onClick={() => setViewMode('WEEK')} className={`px-4 py-2 text-xs font-bold uppercase tracking-widest rounded-lg transition-all ${viewMode === 'WEEK' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500'}`}>Semana</button>
                    <button onClick={() => setViewMode('DAY')} className={`px-4 py-2 text-xs font-bold uppercase tracking-widest rounded-lg transition-all ${viewMode === 'DAY' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500'}`}>Día</button>
                </div>

                <div className="flex items-center bg-white border border-zinc-200 rounded-xl shadow-sm">
                    <button onClick={handlePrev} className="p-2.5 hover:bg-zinc-50 text-zinc-500 rounded-l-xl border-r border-zinc-100"><ChevronLeft className="w-5 h-5" /></button>
                    <button onClick={handleToday} className="px-4 py-2 text-sm font-medium hover:bg-zinc-50 border-r border-zinc-100">Hoy</button>
                    <div className="px-5 py-2 min-w-[180px] text-center">
                        <span className="text-sm font-semibold text-zinc-900 capitalize">{formatDateRange()}</span>
                    </div>
                    <button onClick={handleNext} className="p-2.5 hover:bg-zinc-50 text-zinc-500 rounded-r-xl border-l border-zinc-100"><ChevronRight className="w-5 h-5" /></button>
                </div>

                <button onClick={() => openNewEventModal()} className="px-6 py-2.5 bg-zinc-900 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-brand transition-all shadow-lg shadow-zinc-900/20 flex items-center justify-center gap-2">
                    <Plus className="w-4 h-4" /> <span>Nuevo Evento</span>
                </button>
            </div>
        </div>

        {/* Main Calendar Container */}
        <div className="flex-1 bg-white border border-zinc-200 rounded-2xl shadow-sm overflow-hidden flex flex-col relative">
            
            {/* Scrollable Area */}
            <div className="overflow-auto h-full w-full relative custom-scrollbar">
                
                <div className="w-full"> 
                    
                    {/* Sticky Header Row: Days */}
                    <div className="sticky top-0 z-40 flex border-b border-zinc-200 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                        {/* Top Left Corner */}
                        <div className="sticky left-0 z-50 w-20 flex-shrink-0 bg-white border-r border-zinc-200 flex items-center justify-center text-[10px] font-bold text-zinc-400 tracking-widest uppercase h-20">
                            Hora
                        </div>
                        
                        {/* Days Header */}
                        <div className={`flex-1 grid ${viewMode === 'WEEK' ? 'grid-cols-7' : 'grid-cols-1'} bg-white`}>
                            {displayedDaysDesktop.map((date, i) => {
                                const active = isToday(date);
                                return (
                                    <div key={i} className={`h-20 flex flex-col items-center justify-center border-r border-zinc-200 last:border-r-0 ${active ? 'bg-brand/5' : ''}`}>
                                        <span className={`text-[10px] uppercase font-bold tracking-widest mb-1 ${active ? 'text-brand' : 'text-zinc-400'}`}>
                                            {date.toLocaleDateString('es-ES', { weekday: 'short' })}
                                        </span>
                                        <div className={`w-8 h-8 flex items-center justify-center rounded-full text-lg ${active ? 'bg-brand text-white font-bold shadow-md shadow-brand/20' : 'text-zinc-900'}`}>
                                            {date.getDate()}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Body Row */}
                    <div className="flex">
                        
                        {/* Sticky Time Column */}
                        <div className="sticky left-0 z-30 w-20 flex-shrink-0 bg-white border-r border-zinc-200">
                            {HOURS.map((hour) => (
                                <div key={hour} className="border-b border-zinc-200 text-right pr-4 pt-2 relative" style={{ height: `${HOUR_HEIGHT}px` }}>
                                    <span className="text-xs font-medium text-zinc-400 -top-2 relative block bg-white pl-2">
                                        {hour}:00
                                    </span>
                                </div>
                            ))}
                        </div>

                        {/* Events Grid */}
                        <div className={`flex-1 grid ${viewMode === 'WEEK' ? 'grid-cols-7' : 'grid-cols-1'} relative`}>
                            {/* Background Grid Lines */}
                            <div className="absolute inset-0 z-0 pointer-events-none border-t border-zinc-200">
                                {HOURS.map((_, i) => (
                                    <div key={i} className="border-b border-zinc-200 w-full" style={{ height: `${HOUR_HEIGHT}px` }}></div>
                                ))}
                            </div>
                            
                            {/* Columns */}
                            {displayedDaysDesktop.map((date, i) => {
                                    const active = isToday(date);
                                    
                                    // Find events that overlap this day
                                    const dayEvents = events.filter(e => doesEventOverlapDay(e, date));

                                    return (
                                    <div key={i} className={`relative border-r border-zinc-200 last:border-r-0 h-full ${active ? 'bg-brand/[0.02]' : ''}`}>
                                        
                                        {/* Clickable Slots Background Layer */}
                                        <div className="absolute inset-0 z-0 flex flex-col">
                                            {HOURS.map(hour => (
                                                <div 
                                                    key={hour} 
                                                    onClick={() => handleSlotClick(date, hour)}
                                                    className="w-full flex-shrink-0 hover:bg-zinc-50 transition-colors cursor-pointer"
                                                    style={{ height: `${HOUR_HEIGHT}px` }}
                                                    title={`Crear evento: ${hour}:00`}
                                                ></div>
                                            ))}
                                        </div>

                                        {/* Current Time Line */}
                                        {active && (
                                            <div className="absolute w-full border-t-2 border-red-500 z-20 pointer-events-none flex items-center opacity-80" style={{ top: '35%' }}>
                                                <div className="w-2 h-2 rounded-full bg-red-500 -ml-1"></div>
                                            </div>
                                        )}

                                        {/* Render Events */}
                                        {dayEvents.map(event => {
                                            const { style, className, isMultiDay, eventColor } = getEventStyle(event, date);
                                            return (
                                                <div 
                                                    key={event.id} 
                                                    style={style} 
                                                    className={className}
                                                    onClick={(e) => handleEventClick(e, event)}
                                                >
                                                    <div className="flex flex-col h-full w-full">
                                                        {/* Header: Time + Dot */}
                                                        <div className="flex items-center justify-between mb-0.5 gap-2">
                                                             <span className="text-[10px] font-bold text-zinc-500 font-mono tracking-tight leading-none">
                                                                {event.start.getHours()}:{String(event.start.getMinutes()).padStart(2,'0')}
                                                             </span>
                                                             <div className={`w-2 h-2 rounded-full ${eventColor} flex-shrink-0`}></div>
                                                        </div>
                                                        
                                                        {/* Body: Title */}
                                                        <div className="font-bold text-zinc-800 text-xs leading-snug line-clamp-2 mb-1">
                                                            {isMultiDay && <span className="text-[9px] mr-1 bg-zinc-100 px-1 rounded text-zinc-400 font-normal">...</span>}
                                                            {event.title}
                                                        </div>

                                                        {/* Footer: Trainer & Phone (Push to bottom) */}
                                                        <div className="mt-auto pt-2 space-y-1">
                                                             <div className="flex items-center gap-1.5 text-[10px] font-medium text-zinc-400 truncate">
                                                                 <Users className="w-2.5 h-2.5" />
                                                                 <span className="truncate">{event.trainer}</span>
                                                             </div>
                                                             {event.phone && (
                                                                <div className="flex items-center gap-1.5 text-[10px] font-medium text-zinc-400 truncate">
                                                                    <Phone className="w-2.5 h-2.5" />
                                                                    <span className="truncate">{event.phone}</span>
                                                                </div>
                                                             )}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </div>

      {/* SIDEBAR DRAWER (Replicating Hotel Module Style - Responsive) */}
      {isModalOpen && (
        <>
            {/* Backdrop */}
            <div className="fixed inset-0 bg-zinc-900/40 backdrop-blur-sm z-[60] transition-opacity animate-fade-in" onClick={() => setIsModalOpen(false)} />
            
            {/* Slide-over Panel */}
            <div className="fixed inset-y-0 right-0 w-full sm:w-[28rem] bg-white shadow-2xl z-[70] transform transition-transform duration-300 ease-out animate-slide-in flex flex-col">
                
                {/* Header */}
                <div className="p-6 md:p-8 border-b border-zinc-100 flex justify-between items-center bg-zinc-50/50">
                    <div>
                        <h2 className="text-xl md:text-2xl font-light text-zinc-900 leading-tight">
                            {editingEvent.id ? 'Editar Evento' : 'Nueva Cita'}
                        </h2>
                        <p className="text-xs text-zinc-500 mt-1 uppercase tracking-widest font-bold">
                            {editingEvent.id ? 'Modificar detalles' : 'Agendar espacio'}
                        </p>
                    </div>
                    <button onClick={() => setIsModalOpen(false)} className="p-2 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-200 rounded-full transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Form Body */}
                <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 md:space-y-8">
                    
                    {/* 1. Title Input */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 block ml-1">Título del Evento</label>
                        <input 
                            type="text"
                            autoFocus
                            value={editingEvent.title}
                            onChange={(e) => setEditingEvent({...editingEvent, title: e.target.value})}
                            placeholder="Ej. Clase de Yoga"
                            className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:border-brand outline-none transition-all placeholder:text-zinc-300 font-medium"
                        />
                    </div>

                    {/* 2. Visual Type Selector */}
                    <div className="space-y-3">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 block ml-1">Tipo de Actividad</label>
                        <div className="grid grid-cols-3 gap-3">
                            <button
                                onClick={() => setEditingEvent({...editingEvent, type: 'CLASS'})}
                                className={`p-3 md:p-4 rounded-xl border-2 flex flex-col items-center justify-center transition-all ${editingEvent.type === 'CLASS' ? 'border-zinc-900 bg-zinc-900 text-white shadow-md' : 'border-zinc-200 text-zinc-400 hover:border-zinc-900 hover:text-zinc-900 bg-white'}`}
                            >
                                <span className="text-[10px] font-bold uppercase tracking-wider">Clase</span>
                            </button>
                            <button
                                onClick={() => setEditingEvent({...editingEvent, type: 'PRIVATE'})}
                                className={`p-3 md:p-4 rounded-xl border-2 flex flex-col items-center justify-center transition-all ${editingEvent.type === 'PRIVATE' ? 'border-zinc-900 bg-zinc-900 text-white shadow-md' : 'border-zinc-200 text-zinc-400 hover:border-zinc-900 hover:text-zinc-900 bg-white'}`}
                            >
                                <span className="text-[10px] font-bold uppercase tracking-wider">Privado</span>
                            </button>
                            <button
                                onClick={() => setEditingEvent({...editingEvent, type: 'MAINTENANCE'})}
                                className={`p-3 md:p-4 rounded-xl border-2 flex flex-col items-center justify-center transition-all ${editingEvent.type === 'MAINTENANCE' ? 'border-zinc-900 bg-zinc-900 text-white shadow-md' : 'border-zinc-200 text-zinc-400 hover:border-zinc-900 hover:text-zinc-900 bg-white'}`}
                            >
                                <span className="text-[10px] font-bold uppercase tracking-wider">Mant.</span>
                            </button>
                        </div>
                    </div>

                    {/* 3. Time Configuration */}
                    <div className="space-y-3">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 block ml-1">Fecha y Hora</label>
                        <div className="bg-zinc-50 p-4 rounded-2xl border border-zinc-100 flex flex-col gap-4">
                            
                            {/* Date Input */}
                            <div>
                                <label className="block text-[10px] text-zinc-400 mb-1">Fecha</label>
                                <input 
                                    type="date"
                                    value={formatDateForInput(editingEvent.start)}
                                    onChange={handleDateChange}
                                    className="w-full px-4 py-3 bg-white border border-zinc-200 rounded-xl text-sm font-bold text-zinc-900 focus:border-brand outline-none"
                                />
                            </div>

                            {/* Time Inputs Split */}
                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <label className="block text-[10px] text-zinc-400 mb-1">Hora Inicio</label>
                                    <input 
                                        type="time"
                                        value={formatTimeForInput(editingEvent.start)}
                                        onChange={(e) => handleTimeChange('START', e)}
                                        className="w-full px-4 py-3 bg-white border border-zinc-200 rounded-xl text-sm font-bold text-zinc-900 focus:border-brand outline-none"
                                    />
                                </div>
                                <div className="flex-1">
                                    <label className="block text-[10px] text-zinc-400 mb-1">Hora Fin</label>
                                    <input 
                                        type="time"
                                        value={formatTimeForInput(editingEvent.end)}
                                        onChange={(e) => handleTimeChange('END', e)}
                                        className="w-full px-4 py-3 bg-white border border-zinc-200 rounded-xl text-sm font-bold text-zinc-900 focus:border-brand outline-none"
                                    />
                                </div>
                            </div>

                            {/* Duration Info Box */}
                            {editingEvent.start && editingEvent.end && editingEvent.end > editingEvent.start && (
                                <div className="flex items-center justify-center gap-2 text-xs font-bold text-zinc-500 bg-white py-2 rounded-lg border border-zinc-200 shadow-sm mt-1">
                                    <Clock className="w-3 h-3 text-zinc-400" /> Duración: {getDurationString()}
                                </div>
                            )}

                             {editingEvent.start && editingEvent.end && editingEvent.end <= editingEvent.start && (
                                <p className="text-[10px] text-red-500 flex items-center gap-1 justify-center font-bold mt-1">
                                    <AlertCircle className="w-3 h-3" /> Error en horario
                                </p>
                            )}
                        </div>
                    </div>

                    {/* 4. Details */}
                    <div className="space-y-4">
                         <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 block ml-1">Responsable</label>
                            <input 
                                type="text"
                                value={editingEvent.trainer}
                                onChange={(e) => setEditingEvent({...editingEvent, trainer: e.target.value})}
                                placeholder="Nombre del Entrenador"
                                className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:border-brand outline-none text-sm transition-all placeholder:text-zinc-300"
                            />
                        </div>

                         <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 block ml-1">Teléfono de Contacto</label>
                            <input 
                                type="tel"
                                value={editingEvent.phone || ''}
                                onChange={(e) => setEditingEvent({...editingEvent, phone: e.target.value})}
                                placeholder="+58 412 000 0000"
                                className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:border-brand outline-none text-sm transition-all placeholder:text-zinc-300"
                            />
                        </div>
                         
                         <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 block ml-1">Notas Adicionales</label>
                            <textarea 
                                rows={3}
                                value={editingEvent.notes}
                                onChange={(e) => setEditingEvent({...editingEvent, notes: e.target.value})}
                                className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:border-brand outline-none resize-none text-sm transition-all placeholder:text-zinc-300"
                                placeholder="Detalles, equipamiento necesario, etc..."
                            />
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="p-6 md:p-8 border-t border-zinc-100 flex gap-3 bg-zinc-50/50 safe-area-bottom pb-8 md:pb-8">
                    {editingEvent.id && (
                        <button 
                            onClick={deleteEvent}
                            className="px-6 py-4 border border-red-200 text-red-500 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-red-50 transition-colors flex items-center gap-2"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    )}
                    <button 
                        onClick={saveEvent}
                        className="flex-1 py-4 bg-zinc-900 text-white rounded-2xl font-bold text-xs uppercase tracking-[0.2em] hover:bg-brand transition-colors flex items-center justify-center gap-2 shadow-xl shadow-zinc-900/10"
                    >
                         {editingEvent.id ? 'Guardar Cambios' : 'Crear Evento'} <Save className="w-4 h-4" />
                    </button>
                </div>

            </div>
        </>
      )}
    </div>
  );
};

export default Agenda;
