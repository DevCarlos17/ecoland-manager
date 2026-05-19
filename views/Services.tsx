import React from 'react';
import { MOCK_ROOMS } from '../constants';

const Services: React.FC = () => {
  return (
    <div className="space-y-12 animate-fade-in pb-20">
      <div className="flex justify-between items-end pb-4">
        <div>
          <h1 className="text-3xl lg:text-4xl font-light text-zinc-900 mb-2 tracking-tight">Servicios y Áreas</h1>
          <p className="text-zinc-500 font-light tracking-wide text-sm lg:text-base">Disponibilidad de habitaciones y agenda de clases.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-16">
        {/* Hotel Rooms Section */}
        <div>
            <div className="flex justify-between items-center mb-6 lg:mb-10 pl-2">
                <h3 className="font-light text-2xl text-zinc-900">Habitaciones</h3>
                <span className="text-[10px] uppercase tracking-widest text-brand font-bold bg-brand/5 px-3 py-1 rounded-full">En Vivo</span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
                {MOCK_ROOMS.map(room => (
                    <div key={room.id} className={`p-6 lg:p-8 border min-h-[12rem] lg:min-h-[14rem] rounded-[2rem] flex flex-col justify-between transition-all duration-300 group
                        ${room.status === 'DISPONIBLE' ? 'border-zinc-200 bg-white hover:border-brand hover:shadow-xl hover:shadow-brand/5' :
                          room.status === 'OCUPADA' ? 'bg-zinc-900 text-white border-zinc-900 shadow-xl shadow-zinc-900/20' :
                          'bg-zinc-50 border-transparent text-zinc-400'
                        }`}>
                        <div className="flex justify-between items-start">
                            <span className="text-4xl lg:text-5xl font-extralight tracking-tighter">{room.number}</span>
                            <div className={`w-3 h-3 rounded-full 
                                ${room.status === 'DISPONIBLE' ? 'bg-brand shadow-[0_0_10px_#1d4ed8]' : 
                                  room.status === 'OCUPADA' ? 'bg-white shadow-[0_0_10px_white]' : 'bg-zinc-300'}`}></div>
                        </div>
                        <div>
                            <p className="text-[10px] uppercase tracking-[0.2em] mb-2 opacity-60 font-bold">{room.type}</p>
                            <div className="flex justify-between items-baseline pt-4 border-t border-current border-opacity-10">
                                <span className="text-[10px] lg:text-xs font-bold uppercase tracking-widest">{room.status}</span>
                                <span className={`text-lg lg:text-xl font-light ${room.status === 'OCUPADA' ? 'text-zinc-300' : 'text-zinc-900'}`}>${room.priceNight}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>

        {/* Classes / Schedule Section */}
        <div>
            <div className="flex justify-between items-center mb-6 lg:mb-10 pl-2">
                <h3 className="font-light text-2xl text-zinc-900">Agenda de Clases</h3>
                <span className="text-[10px] uppercase tracking-widest text-zinc-900 font-bold border-b border-zinc-900 pb-0.5">Hoy</span>
            </div>

            <div className="space-y-4">
                {[
                    { time: '07:00 AM', name: 'CrossFit WOD', trainer: 'Juan P.', capacity: '12/15' },
                    { time: '09:00 AM', name: 'Boxeo Básico', trainer: 'Miguel T.', capacity: '8/10' },
                    { time: '05:00 PM', name: 'Yoga Flow', trainer: 'Ana S.', capacity: '5/12' },
                    { time: '06:30 PM', name: 'CrossFit Elite', trainer: 'Juan P.', capacity: '15/15' },
                ].map((cls, idx) => (
                    <div key={idx} className="flex flex-col sm:flex-row items-start sm:items-center py-6 px-6 lg:px-8 bg-white border border-zinc-100 hover:border-zinc-300 rounded-[2rem] transition-all group cursor-pointer hover:shadow-lg hover:shadow-zinc-200/50 gap-4 sm:gap-0">
                        <div className="w-full sm:w-24 flex sm:flex-col items-center sm:items-start justify-between sm:justify-center mr-0 sm:mr-8 pl-0 sm:pl-2 border-b sm:border-b-0 sm:border-l-2 border-zinc-100 group-hover:border-brand transition-colors pb-2 sm:pb-0">
                            <span className="text-sm font-bold text-zinc-900">{cls.time.split(' ')[0]}</span>
                            <span className="text-[10px] uppercase tracking-wider text-zinc-400 sm:mt-1">{cls.time.split(' ')[1]}</span>
                        </div>
                        <div className="flex-1">
                            <h4 className="font-medium text-lg lg:text-xl text-zinc-900 group-hover:text-brand transition-colors duration-300">{cls.name}</h4>
                            <p className="text-xs text-zinc-500 mt-1 font-light">con {cls.trainer}</p>
                        </div>
                        <div className="text-right w-full sm:w-auto mt-2 sm:mt-0">
                             <span className={`text-[10px] font-bold uppercase tracking-widest px-4 py-2 rounded-full border block sm:inline-block text-center ${cls.capacity.includes('15/15') ? 'bg-zinc-900 text-white border-zinc-900' : 'bg-zinc-50 border-zinc-200 text-zinc-500'}`}>
                                {cls.capacity}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      </div>
    </div>
  );
};

export default Services;