
import React, { useState } from 'react';
import { 
  Wallet, TrendingUp, DollarSign, 
  Download, Filter, Dumbbell, 
  Waves, BedDouble, Gamepad2, CircleDashed, 
  Activity, ArrowRight, PieChart as PieIcon, BarChart3,
  CreditCard, Smartphone, Banknote, Calendar
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';

// --- MOCK DATA ---

// 1. Data by Zone
const ZONE_DATA = [
  { id: 'z1', name: 'Gimnasio', revenue: 450.00, transactions: 32, icon: Dumbbell },
  { id: 'z2', name: 'CrossFit', revenue: 320.50, transactions: 18, icon: Activity },
  { id: 'z3', name: 'Hotel', revenue: 890.00, transactions: 8, icon: BedDouble },
  { id: 'z4', name: 'Piscina', revenue: 150.00, transactions: 12, icon: Waves },
  { id: 'z5', name: 'Zona Gamer', revenue: 85.00, transactions: 15, icon: Gamepad2 },
  { id: 'z6', name: 'Billar', revenue: 45.00, transactions: 5, icon: CircleDashed },
];

// 2. Data by Payment Method (Zelle removed)
const PAYMENT_DATA = [
  { name: 'Efectivo USD', value: 640.50, transactions: 45, icon: Banknote },
  { name: 'Punto de Venta', value: 450.00, transactions: 30, icon: CreditCard },
  { name: 'Pago Móvil', value: 210.00, transactions: 12, icon: Smartphone },
];

// Soft Pastel Colors for Payment Methods
const PASTEL_COLORS = [
    '#86efac', // Green-300 (Cash)
    '#93c5fd', // Blue-300 (POS)
    '#d8b4fe', // Purple-300 (Mobile)
    '#fca5a5', // Red-300 (Others)
];

type ChartViewType = 'ZONES' | 'PAYMENTS';

const Finance: React.FC = () => {
  const [timeRange, setTimeRange] = useState('HOY');
  const [chartView, setChartView] = useState<ChartViewType>('ZONES');

  // Global Calculations
  const totalRevenue = ZONE_DATA.reduce((acc, z) => acc + z.revenue, 0);
  const totalTransactions = ZONE_DATA.reduce((acc, z) => acc + z.transactions, 0);
  const ticketAverage = totalRevenue / totalTransactions;

  // Render Chart
  const renderChart = () => {
    switch (chartView) {
      case 'ZONES':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={ZONE_DATA} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#71717a', fontSize: 11, fontWeight: 500 }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#a1a1aa', fontSize: 11 }} tickFormatter={(val) => `$${val}`} />
              <Tooltip 
                cursor={{ fill: '#f4f4f5' }}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', fontSize: '12px' }}
                formatter={(value: number) => [`$${value.toFixed(2)}`, 'Ingresos']}
              />
              <Bar dataKey="revenue" fill="#18181b" radius={[4, 4, 4, 4]} barSize={60} />
            </BarChart>
          </ResponsiveContainer>
        );
      case 'PAYMENTS':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={PAYMENT_DATA}
                innerRadius={100}
                outerRadius={140}
                paddingAngle={4}
                dataKey="value"
                stroke="none"
              >
                {PAYMENT_DATA.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={PASTEL_COLORS[index % PASTEL_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                 contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', fontSize: '12px' }}
                 formatter={(value: number) => [`$${value.toFixed(2)}`, 'Total']}
              />
            </PieChart>
          </ResponsiveContainer>
        );
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-20 max-w-7xl mx-auto">
      
      {/* 1. Header & Controls Outside */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 px-1">
        <div>
          <h1 className="text-3xl lg:text-4xl font-light text-zinc-900 mb-2 tracking-tight">Finanzas</h1>
          <p className="text-zinc-500 font-light tracking-wide text-sm">Reporte consolidado de operaciones.</p>
        </div>
        
        <div className="flex items-center gap-3">
            <button className="h-10 px-4 bg-white border border-zinc-200 rounded-xl text-zinc-500 hover:text-zinc-900 hover:border-zinc-300 transition-all flex items-center gap-2 text-xs font-bold uppercase tracking-wider shadow-sm">
                <Calendar className="w-4 h-4" /> 
                <span className="hidden sm:inline">Personalizar</span>
            </button>
            <div className="h-10 p-1 bg-zinc-100 rounded-xl flex items-center">
                {['HOY', 'SEMANA', 'MES'].map(range => (
                    <button 
                        key={range}
                        onClick={() => setTimeRange(range)}
                        className={`h-full px-4 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all
                            ${timeRange === range ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-400 hover:text-zinc-600'}`}
                    >
                        {range}
                    </button>
                ))}
            </div>
            <button className="h-10 w-10 bg-zinc-900 text-white rounded-xl flex items-center justify-center hover:bg-zinc-800 transition-all shadow-lg shadow-zinc-900/10">
                <Download className="w-4 h-4" />
            </button>
        </div>
      </div>

      {/* 2. THE UNIFIED PANEL (The "Sheet") */}
      <div className="bg-white rounded-[2.5rem] border border-zinc-200 shadow-sm overflow-hidden flex flex-col">
          
          {/* SECTION A: KPI Header Strip */}
          <div className="flex flex-col lg:flex-row border-b border-zinc-100">
              {/* Primary Metric */}
              <div className="flex-1 p-8 lg:p-10 flex flex-col justify-center border-b lg:border-b-0 lg:border-r border-zinc-100 relative overflow-hidden">
                   <div className="relative z-10">
                        <span className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-2">
                            <Wallet className="w-4 h-4" /> Ingreso Total ({timeRange})
                        </span>
                        <div className="flex items-baseline gap-4">
                            <h2 className="text-5xl lg:text-6xl font-medium tracking-tighter text-zinc-900">
                                ${totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </h2>
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-zinc-50 border border-zinc-100 text-[10px] font-bold text-green-600 uppercase tracking-wide">
                                <TrendingUp className="w-3 h-3" /> +12.5%
                            </span>
                        </div>
                   </div>
              </div>

              {/* Secondary Metrics Grid */}
              <div className="lg:w-[400px] grid grid-cols-2 divide-x divide-zinc-100 bg-zinc-50/30">
                  <div className="p-8 flex flex-col justify-center gap-1">
                      <div className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-400 mb-2">
                          <Activity className="w-4 h-4" />
                      </div>
                      <span className="text-2xl font-bold text-zinc-900">{totalTransactions}</span>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Transacciones</span>
                  </div>
                  <div className="p-8 flex flex-col justify-center gap-1">
                      <div className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-400 mb-2">
                          <DollarSign className="w-4 h-4" />
                      </div>
                      <span className="text-2xl font-bold text-zinc-900">${ticketAverage.toFixed(0)}</span>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Ticket Promedio</span>
                  </div>
              </div>
          </div>

          {/* SECTION B: Chart & Controls */}
          <div className="p-8 lg:p-10 space-y-8">
              {/* Internal Tab Switcher */}
              <div className="flex items-center justify-between">
                  <div className="inline-flex bg-zinc-100 p-1 rounded-xl">
                      <button 
                          onClick={() => setChartView('ZONES')}
                          className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-2
                              ${chartView === 'ZONES' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-400 hover:text-zinc-600'}`}
                      >
                          <BarChart3 className="w-4 h-4" /> Por Zona
                      </button>
                      <button 
                          onClick={() => setChartView('PAYMENTS')}
                          className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-2
                              ${chartView === 'PAYMENTS' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-400 hover:text-zinc-600'}`}
                      >
                          <PieIcon className="w-4 h-4" /> Métodos de Pago
                      </button>
                  </div>
                  
                  {/* Legend (Only for Payments) - Updated Colors */}
                  {chartView === 'PAYMENTS' && (
                       <div className="hidden sm:flex gap-4">
                           {PAYMENT_DATA.map((p, i) => (
                               <div key={p.name} className="flex items-center gap-2 bg-zinc-50 px-3 py-1.5 rounded-lg border border-zinc-100">
                                   <div className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: PASTEL_COLORS[i % PASTEL_COLORS.length] }}></div>
                                   <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-wide">{p.name}</span>
                               </div>
                           ))}
                       </div>
                   )}
              </div>

              {/* The Chart Canvas */}
              <div className="h-[350px] w-full bg-zinc-50/50 rounded-2xl border border-zinc-100 p-4">
                  {renderChart()}
              </div>
          </div>

          {/* SECTION C: Data Table (Integrated at bottom) */}
          <div className="border-t border-zinc-100">
              <div className="flex items-center justify-between px-8 py-4 bg-zinc-50/50 border-b border-zinc-100">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                      <Filter className="w-3 h-3" /> Desglose Detallado
                  </h3>
              </div>
              <div className="overflow-x-auto">
                  <table className="w-full text-left">
                      <thead>
                          <tr className="text-[10px] uppercase text-zinc-400 font-bold tracking-wider">
                              <th className="py-4 px-8 pl-10 font-normal w-1/3">Concepto</th>
                              <th className="py-4 px-8 font-normal text-right">Transacciones</th>
                              <th className="py-4 px-8 font-normal text-right">Volumen</th>
                              <th className="py-4 px-8 font-normal text-right w-24">Acción</th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-50">
                          {(chartView === 'ZONES' ? ZONE_DATA : PAYMENT_DATA).map((item, idx) => {
                              const value = 'revenue' in item ? item.revenue : item.value;
                              const percent = Math.round((value / totalRevenue) * 100);
                              
                              // Determine color for the progress bar (use Pastel for Payments, Zinc for Zones)
                              const barColor = chartView === 'PAYMENTS' ? PASTEL_COLORS[idx % PASTEL_COLORS.length] : '#18181b';

                              return (
                                <tr key={idx} className="group hover:bg-zinc-50 transition-colors">
                                    <td className="py-4 px-8 pl-10">
                                        <div className="flex items-center gap-4">
                                            <span className="text-xs font-mono text-zinc-300 w-4">0{idx + 1}</span>
                                            {'icon' in item && (
                                                <div className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-400">
                                                    <item.icon className="w-4 h-4" />
                                                </div>
                                            )}
                                            <div>
                                                <span className="block text-sm font-bold text-zinc-900">{item.name}</span>
                                                <div className="w-24 h-1 bg-zinc-100 rounded-full mt-1.5 overflow-hidden">
                                                    <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${percent}%`, backgroundColor: barColor }}></div>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-4 px-8 text-right">
                                        <span className="text-sm font-medium text-zinc-500">{item.transactions}</span>
                                    </td>
                                    <td className="py-4 px-8 text-right">
                                        <div className="flex flex-col items-end">
                                            <span className="text-sm font-bold text-zinc-900">${value.toFixed(2)}</span>
                                            <span className="text-[10px] text-zinc-400">{percent}% del total</span>
                                        </div>
                                    </td>
                                    <td className="py-4 px-8 text-right">
                                        <button className="w-8 h-8 rounded-full border border-zinc-100 flex items-center justify-center text-zinc-300 hover:text-zinc-900 hover:border-zinc-300 transition-all">
                                            <ArrowRight className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                              );
                          })}
                      </tbody>
                  </table>
              </div>
              
              {/* Footer of the Card */}
              <div className="bg-zinc-50 p-4 border-t border-zinc-100 text-center">
                  <span className="text-[10px] text-zinc-400 uppercase tracking-widest font-bold">Fin del Reporte</span>
              </div>
          </div>
      </div>
    </div>
  );
};

export default Finance;
