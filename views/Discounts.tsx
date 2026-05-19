
import React, { useState, useMemo } from 'react';
import { MOCK_DISCOUNTS, MOCK_PRODUCTS } from '../constants';
import { Discount, Product } from '../types';
import { 
  Tag, Plus, Trash2, Save, ArrowLeft, Percent, DollarSign, 
  Target, ShoppingBag, Layers, Search,  
  Power, Zap, AlertCircle, X, ChevronRight, Scissors, Ticket
} from 'lucide-react';

const Discounts: React.FC = () => {
  const [view, setView] = useState<'LIST' | 'EDITOR'>('LIST');
  const [discounts, setDiscounts] = useState<Discount[]>(MOCK_DISCOUNTS);
  const [editingDiscount, setEditingDiscount] = useState<Partial<Discount>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');

  // Product Selector Modal State
  const [isProductSelectorOpen, setIsProductSelectorOpen] = useState(false);
  const [productSearchQuery, setProductSearchQuery] = useState('');

  const categories = ['SUPLEMENTOS', 'BEBIDAS', 'ALIMENTOS', 'EQUIPO', 'ACCESO'];

  // --- Logic Helpers ---

  const handleEdit = (discount?: Discount) => {
    if (discount) {
      setEditingDiscount({ ...discount });
    } else {
      setEditingDiscount({
        id: Math.random().toString(36).substring(7),
        name: '',
        type: 'PERCENTAGE',
        value: 10,
        target: 'TOTAL',
        isActive: true,
        minPurchase: 0
      });
    }
    setView('EDITOR');
  };

  const handleSave = () => {
      if (!editingDiscount.name || !editingDiscount.value) return;
      
      const newDiscount = editingDiscount as Discount;
      
      setDiscounts(prev => {
          const exists = prev.find(d => d.id === newDiscount.id);
          if (exists) return prev.map(d => d.id === newDiscount.id ? newDiscount : d);
          return [...prev, newDiscount];
      });
      setView('LIST');
  };

  const handleToggleActive = (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      setDiscounts(prev => prev.map(d => d.id === id ? { ...d, isActive: !d.isActive } : d));
  };

  const handleDelete = (id: string) => {
      setDiscounts(prev => prev.filter(d => d.id !== id));
      setView('LIST');
  };

  const handleSelectProduct = (product: Product) => {
      setEditingDiscount({ ...editingDiscount, targetValue: product.id });
      setIsProductSelectorOpen(false);
      setProductSearchQuery('');
  }

  // Derived State
  const filteredDiscounts = useMemo(() => {
      return discounts.filter(d => {
          const matchesSearch = d.name.toLowerCase().includes(searchQuery.toLowerCase());
          const matchesFilter = filterType === 'ALL' 
              ? true 
              : filterType === 'ACTIVE' ? d.isActive 
              : !d.isActive;
          return matchesSearch && matchesFilter;
      });
  }, [discounts, searchQuery, filterType]);

  const filteredProducts = useMemo(() => {
      if (!productSearchQuery) return MOCK_PRODUCTS.slice(0, 5); // Show first 5 by default
      return MOCK_PRODUCTS.filter(p => 
        p.name.toLowerCase().includes(productSearchQuery.toLowerCase()) || 
        p.id.toLowerCase().includes(productSearchQuery.toLowerCase())
      );
  }, [productSearchQuery]);

  const stats = useMemo(() => {
      return {
          total: discounts.length,
          active: discounts.filter(d => d.isActive).length,
          percentage: discounts.filter(d => d.type === 'PERCENTAGE').length,
      };
  }, [discounts]);

  // --- Components ---

  const CouponPreview = ({ data }: { data: Partial<Discount> }) => {
      const isPercent = data.type === 'PERCENTAGE';
      const isActive = data.isActive !== false;

      // Color Schemes
      const sidebarColor = isActive 
        ? isPercent 
            ? 'bg-zinc-900 text-white' 
            : 'bg-brand text-white'
        : 'bg-zinc-200 text-zinc-400';

      const bodyColor = isActive ? 'bg-white' : 'bg-zinc-50';
      const borderColor = isActive ? 'border-zinc-200' : 'border-zinc-200';
      const textColor = isActive ? 'text-zinc-900' : 'text-zinc-400';
      const labelColor = isActive ? 'text-zinc-400' : 'text-zinc-300';

      let targetDisplay = 'GLOBAL';
      if (data.target === 'CATEGORY') targetDisplay = (data.targetValue || 'CATEGORIA').toUpperCase();
      if (data.target === 'PRODUCT') targetDisplay = 'PRODUCTO';

      return (
          <div className={`w-full flex h-40 rounded-2xl overflow-hidden shadow-sm relative filter drop-shadow-sm transition-transform duration-300 hover:scale-[1.01] ${isActive ? '' : 'grayscale opacity-80'}`}>
              
              {/* Left Section - Value */}
              <div className={`${sidebarColor} w-32 flex flex-col items-center justify-center relative flex-shrink-0`}>
                  <div className="text-center z-10">
                      <div className="text-4xl font-bold tracking-tighter font-mono">
                          {isPercent ? `${data.value || 0}%` : `$${data.value || 0}`}
                      </div>
                      <div className="text-[9px] uppercase tracking-[0.2em] font-medium mt-1 opacity-80">
                          {isPercent ? 'OFF' : 'DESC'}
                      </div>
                  </div>
                  
                  {/* Decorative Pattern */}
                  <div className="absolute inset-0 opacity-10" 
                        style={{ backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)', backgroundSize: '8px 8px' }}>
                  </div>
              </div>

              {/* Right Section - Info */}
              <div className={`${bodyColor} flex-1 relative flex flex-col border-y border-r ${borderColor} rounded-r-2xl`}>
                  
                  {/* Perforated Line Logic */}
                  <div className="absolute inset-y-0 left-0 w-[1px] border-l-2 border-dashed border-zinc-300 z-10"></div>
                  
                  {/* Notches (The Cutouts) */}
                  <div className="absolute -left-2 -top-2 w-4 h-4 rounded-full bg-[#fafafa] z-20"></div>
                  <div className="absolute -left-2 -bottom-2 w-4 h-4 rounded-full bg-[#fafafa] z-20"></div>

                  <div className="flex-1 p-5 pl-7 flex flex-col justify-between">
                      {/* Header */}
                      <div className="flex justify-between items-start">
                          <div className="flex items-center gap-2">
                             <Ticket className={`w-3 h-3 ${labelColor}`} />
                             <span className={`text-[9px] font-bold uppercase tracking-[0.15em] ${labelColor}`}>
                                ECOLAND PROMOCIONES
                             </span>
                          </div>
                          {isActive && (
                            <Scissors className="w-3 h-3 text-zinc-300 -rotate-90 opacity-50" />
                          )}
                      </div>

                      {/* Main Title */}
                      <div>
                          <h3 className={`font-bold text-lg leading-tight line-clamp-2 ${textColor} mb-1`}>
                              {data.name || 'Nombre del Cupón'}
                          </h3>
                          <div className="flex items-center gap-2">
                              <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded border ${isActive ? 'bg-zinc-50 border-zinc-100 text-zinc-500' : 'bg-transparent border-zinc-200 text-zinc-400'}`}>
                                  {targetDisplay}
                              </span>
                              {data.minPurchase ? (
                                  <span className="text-[10px] text-zinc-400">Min: ${data.minPurchase}</span>
                              ) : null}
                          </div>
                      </div>

                      {/* Footer / Status */}
                      <div className="flex justify-between items-end">
                          <div className="text-[9px] text-zinc-400 font-mono">
                              ID: {data.id ? data.id.toUpperCase() : '####'}
                          </div>
                          <div className={`flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wider ${isActive ? 'text-green-600' : 'text-zinc-400'}`}>
                              <div className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-green-500 animate-pulse' : 'bg-zinc-300'}`}></div>
                              {isActive ? 'Activo' : 'Inactivo'}
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      )
  }

  // --- EDITOR VIEW ---
  if (view === 'EDITOR') {
      const selectedProduct = editingDiscount.targetValue ? MOCK_PRODUCTS.find(p => p.id === editingDiscount.targetValue) : null;

      return (
        <div className="animate-fade-in pb-20 max-w-7xl mx-auto relative">
            {/* Editor Header */}
            <div className="flex items-center justify-between mb-8 sticky top-0 bg-[#fafafa] z-30 py-4 border-b border-zinc-200/50 backdrop-blur-sm">
                <div className="flex items-center gap-4">
                     <button onClick={() => setView('LIST')} className="w-10 h-10 rounded-full bg-white border border-zinc-200 flex items-center justify-center text-zinc-500 hover:text-black hover:bg-zinc-50 transition-all">
                        <ArrowLeft className="w-5 h-5" />
                     </button>
                     <div>
                        <h1 className="text-2xl font-light text-zinc-900">
                            {editingDiscount.id && discounts.find(d => d.id === editingDiscount.id) ? 'Editar Promoción' : 'Nueva Promoción'}
                        </h1>
                     </div>
                </div>
                <div className="flex gap-3">
                     {editingDiscount.id && discounts.find(d => d.id === editingDiscount.id) && (
                        <button onClick={() => handleDelete(editingDiscount.id!)} className="px-5 py-2.5 rounded-xl border border-red-200 text-red-500 text-xs font-bold uppercase tracking-widest hover:bg-red-50 transition-colors flex items-center gap-2">
                             <Trash2 className="w-4 h-4" /> Eliminar
                        </button>
                     )}
                     <button onClick={handleSave} className="px-8 py-2.5 bg-zinc-900 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-brand transition-all flex items-center gap-2 shadow-lg shadow-zinc-900/10">
                        <Save className="w-4 h-4" /> Guardar
                     </button>
                </div>
            </div>

            {/* Split Content - Natural Flow */}
            <div className="flex flex-col lg:flex-row gap-8 items-start">
                
                {/* Left: Form */}
                <div className="flex-1 w-full space-y-6">
                    
                    {/* Section 1: Definition */}
                    <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
                        <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-900 mb-6 flex items-center gap-2">
                             <Ticket className="w-4 h-4 text-brand" /> Definición
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold uppercase text-zinc-500 mb-2">Título de la Promoción</label>
                                <input 
                                    type="text" 
                                    value={editingDiscount.name}
                                    onChange={(e) => setEditingDiscount({...editingDiscount, name: e.target.value})}
                                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:border-brand outline-none transition-all placeholder:text-zinc-300 font-medium"
                                    placeholder="Ej. VERANO 2024"
                                    autoFocus
                                    maxLength={25}
                                />
                                <span className="text-[10px] text-zinc-400 mt-1 block">Aparecerá en el cuerpo del cupón.</span>
                            </div>
                            <div className="flex items-center gap-4 pt-2">
                                <label className={`flex-1 flex items-center justify-between cursor-pointer select-none px-4 py-3 rounded-xl border transition-all ${editingDiscount.isActive ? 'bg-green-50 border-green-200' : 'bg-zinc-50 border-zinc-200'}`}>
                                    <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${editingDiscount.isActive ? 'bg-green-200 text-green-700' : 'bg-zinc-200 text-zinc-400'}`}>
                                            <Power className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <span className={`block text-sm font-bold ${editingDiscount.isActive ? 'text-green-800' : 'text-zinc-500'}`}>
                                                {editingDiscount.isActive ? 'Estado: Activo' : 'Estado: Inactivo'}
                                            </span>
                                            <span className="text-[10px] text-zinc-400">Disponible para canje</span>
                                        </div>
                                    </div>
                                    <input 
                                        type="checkbox" 
                                        checked={editingDiscount.isActive}
                                        onChange={(e) => setEditingDiscount({...editingDiscount, isActive: e.target.checked})}
                                        className="hidden" 
                                    />
                                    <div className={`w-10 h-6 rounded-full relative transition-colors ${editingDiscount.isActive ? 'bg-green-500' : 'bg-zinc-300'}`}>
                                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow-sm ${editingDiscount.isActive ? 'left-5' : 'left-1'}`}></div>
                                    </div>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Section 2: Value & Type */}
                    <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
                        <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-900 mb-6 flex items-center gap-2">
                             <Zap className="w-4 h-4 text-brand" /> Valor y Tipo
                        </h3>
                        
                        <div className="flex gap-4 mb-6">
                             <button 
                                onClick={() => setEditingDiscount({...editingDiscount, type: 'PERCENTAGE'})}
                                className={`flex-1 py-4 rounded-xl border-2 flex flex-col items-center justify-center gap-2 transition-all ${editingDiscount.type === 'PERCENTAGE' ? 'border-zinc-900 bg-zinc-900 text-white' : 'border-zinc-100 bg-white text-zinc-400 hover:border-zinc-300'}`}
                             >
                                 <Percent className="w-6 h-6" />
                                 <span className="text-xs font-bold uppercase tracking-wider">Porcentaje (%)</span>
                             </button>
                             <button 
                                onClick={() => setEditingDiscount({...editingDiscount, type: 'FIXED'})}
                                className={`flex-1 py-4 rounded-xl border-2 flex flex-col items-center justify-center gap-2 transition-all ${editingDiscount.type === 'FIXED' ? 'border-brand bg-brand text-white' : 'border-zinc-100 bg-white text-zinc-400 hover:border-zinc-300'}`}
                             >
                                 <DollarSign className="w-6 h-6" />
                                 <span className="text-xs font-bold uppercase tracking-wider">Monto Fijo ($)</span>
                             </button>
                        </div>

                        <div>
                            <label className="block text-xs font-bold uppercase text-zinc-500 mb-2">Valor del Descuento</label>
                            <div className="relative">
                                <input 
                                    type="number"
                                    value={editingDiscount.value}
                                    onChange={(e) => setEditingDiscount({...editingDiscount, value: parseFloat(e.target.value)})}
                                    className="w-full px-4 py-4 pl-12 text-3xl font-light text-zinc-900 bg-zinc-50 border border-zinc-200 rounded-xl focus:border-brand outline-none transition-all font-mono"
                                />
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400">
                                    {editingDiscount.type === 'PERCENTAGE' ? <Percent className="w-6 h-6" /> : <DollarSign className="w-6 h-6" />}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Section 3: Scope & Limits */}
                    <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
                        <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-900 mb-6 flex items-center gap-2">
                             <Target className="w-4 h-4 text-brand" /> Alcance y Límites
                        </h3>
                        
                        <div className="mb-6">
                            <label className="block text-xs font-bold uppercase text-zinc-500 mb-2">Aplicar a:</label>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                {['TOTAL', 'CATEGORY', 'PRODUCT'].map((t) => (
                                    <button 
                                        key={t}
                                        onClick={() => setEditingDiscount({...editingDiscount, target: t as any, targetValue: undefined})}
                                        className={`py-3 px-2 rounded-xl border text-xs font-bold uppercase transition-all flex items-center justify-center gap-2
                                            ${editingDiscount.target === t ? 'bg-zinc-900 text-white border-zinc-900' : 'bg-white border-zinc-200 text-zinc-500 hover:bg-zinc-50'}`}
                                    >
                                        {t === 'TOTAL' && <ShoppingBag className="w-3 h-3" />}
                                        {t === 'CATEGORY' && <Layers className="w-3 h-3" />}
                                        {t === 'PRODUCT' && <Tag className="w-3 h-3" />}
                                        {t === 'TOTAL' ? 'Global' : t === 'CATEGORY' ? 'Categoría' : 'Producto'}
                                    </button>
                                ))}
                            </div>
                        </div>

                         {/* Dynamic Select */}
                         {editingDiscount.target === 'CATEGORY' && (
                            <div className="mb-6 p-4 bg-zinc-50 rounded-xl animate-fade-in border border-zinc-100">
                                <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">Seleccionar Categoría</label>
                                <select 
                                    value={editingDiscount.targetValue}
                                    onChange={(e) => setEditingDiscount({...editingDiscount, targetValue: e.target.value})}
                                    className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-sm outline-none"
                                >
                                    <option value="">Seleccione...</option>
                                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                        )}

                        {editingDiscount.target === 'PRODUCT' && (
                             <div className="mb-6 p-4 bg-zinc-50 rounded-xl animate-fade-in border border-zinc-100">
                                <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">Seleccionar Producto</label>
                                
                                <button 
                                    onClick={() => setIsProductSelectorOpen(true)}
                                    className="w-full flex justify-between items-center px-4 py-3 bg-white border border-zinc-200 rounded-xl hover:border-zinc-400 hover:shadow-sm transition-all group"
                                >
                                    {selectedProduct ? (
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded bg-zinc-100 p-0.5 border border-zinc-100">
                                                <img src={selectedProduct.image} className="w-full h-full object-cover rounded" />
                                            </div>
                                            <div className="text-left">
                                                <span className="block text-sm font-bold text-zinc-900">{selectedProduct.name}</span>
                                                <span className="block text-[10px] text-zinc-400">SKU: {selectedProduct.id}</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <span className="text-zinc-400 text-sm font-medium">Buscar en catálogo...</span>
                                    )}
                                    <ChevronRight className="w-4 h-4 text-zinc-300 group-hover:text-zinc-600" />
                                </button>
                                <p className="text-[10px] text-zinc-400 mt-2 px-1">
                                    Esta promoción solo será válida si este producto está en el carrito.
                                </p>
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                             <div>
                                <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">Compra Mínima ($)</label>
                                <input 
                                    type="number" 
                                    placeholder="0.00"
                                    value={editingDiscount.minPurchase}
                                    onChange={(e) => setEditingDiscount({...editingDiscount, minPurchase: parseFloat(e.target.value)})}
                                    className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm outline-none focus:border-brand"
                                />
                             </div>
                             <div>
                                <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">Tope Máximo ($)</label>
                                <input 
                                    type="number" 
                                    placeholder="Sin límite"
                                    value={editingDiscount.maxDiscount}
                                    disabled={editingDiscount.type !== 'PERCENTAGE'}
                                    onChange={(e) => setEditingDiscount({...editingDiscount, maxDiscount: parseFloat(e.target.value)})}
                                    className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm outline-none focus:border-brand disabled:opacity-50 disabled:cursor-not-allowed"
                                />
                             </div>
                        </div>
                    </div>
                </div>

                {/* Right: Live Preview Panel (Sticky) */}
                <div className="lg:w-96 hidden lg:block sticky top-24 self-start">
                    <div className="bg-zinc-50 p-8 rounded-3xl border border-zinc-200">
                        <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-8 text-center">Vista Previa</h4>
                        <div className="mb-10 flex justify-center">
                            <div className="w-full max-w-[340px]">
                                <CouponPreview data={editingDiscount} />
                            </div>
                        </div>
                        
                        <div className="bg-white p-4 rounded-xl border border-zinc-100 text-xs text-zinc-500 leading-relaxed">
                            <p className="flex gap-2 mb-2">
                                <AlertCircle className="w-4 h-4 text-brand shrink-0" />
                                <span className="font-bold text-zinc-700">Resumen de Regla:</span>
                            </p>
                            <ul className="list-disc pl-5 space-y-1">
                                <li>
                                    Aplica un <strong>{editingDiscount.type === 'PERCENTAGE' ? `${editingDiscount.value}%` : `$${editingDiscount.value}`}</strong> de descuento.
                                </li>
                                <li>
                                    Alcance: <strong>{editingDiscount.target === 'TOTAL' ? 'Global' : editingDiscount.target === 'CATEGORY' ? 'Categoría' : 'Producto'}</strong>
                                    {selectedProduct && ` (${selectedProduct.name})`}.
                                </li>
                                {editingDiscount.minPurchase ? (
                                    <li>Requiere compra mínima de <strong>${editingDiscount.minPurchase}</strong>.</li>
                                ) : (
                                    <li>Sin mínimo de compra.</li>
                                )}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            {/* Product Selector Modal */}
            {isProductSelectorOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
                    <div className="absolute inset-0 bg-zinc-900/60 backdrop-blur-sm" onClick={() => setIsProductSelectorOpen(false)}></div>
                    <div className="relative bg-white w-full max-w-2xl rounded-[2rem] p-6 shadow-2xl animate-zoom-in overflow-hidden flex flex-col max-h-[80vh]">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-zinc-900">Seleccionar Producto</h3>
                            <button onClick={() => setIsProductSelectorOpen(false)} className="p-2 hover:bg-zinc-100 rounded-full transition-colors"><X className="w-5 h-5 text-zinc-500" /></button>
                        </div>
                        
                        {/* Search Bar */}
                        <div className="relative mb-6">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                            <input 
                                type="text"
                                autoFocus 
                                placeholder="Buscar por nombre o SKU..."
                                value={productSearchQuery}
                                onChange={(e) => setProductSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:border-brand outline-none"
                            />
                        </div>

                        {/* List */}
                        <div className="flex-1 overflow-y-auto space-y-2 pr-2">
                            {filteredProducts.map(p => (
                                <button 
                                    key={p.id}
                                    onClick={() => handleSelectProduct(p)}
                                    className="w-full flex items-center gap-4 p-3 rounded-xl border border-zinc-100 hover:border-brand hover:shadow-md transition-all group text-left"
                                >
                                    <div className="w-12 h-12 rounded-lg bg-zinc-50 p-1 border border-zinc-100 flex-shrink-0">
                                        <img src={p.image} className="w-full h-full object-cover rounded-md" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-bold text-zinc-900 text-sm">{p.name}</h4>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <span className="text-[10px] bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-500 font-bold uppercase">{p.category}</span>
                                            <span className="text-[10px] text-zinc-400 font-mono">SKU: {p.id}</span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="block font-bold text-zinc-900">${p.priceUsd}</span>
                                        {p.stock < 10 && <span className="text-[9px] text-red-500 font-bold">Poco Stock</span>}
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-zinc-300 group-hover:text-brand" />
                                </button>
                            ))}
                            {filteredProducts.length === 0 && (
                                <div className="text-center py-10 text-zinc-400 text-sm">
                                    No se encontraron productos.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
      );
  }

  // --- LIST VIEW ---
  return (
    <div className="space-y-8 animate-fade-in pb-20">
      
      {/* Header & Stats */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 pb-2">
        <div>
          <h1 className="text-3xl lg:text-4xl font-light text-zinc-900 mb-2 tracking-tight">Promociones</h1>
          <p className="text-zinc-500 font-light tracking-wide text-sm">Gestiona cupones y campañas de descuento.</p>
        </div>
        <div className="flex gap-4">
             <div className="hidden md:flex items-center gap-4 px-4 py-2 bg-white border border-zinc-100 rounded-xl shadow-sm">
                 <div className="flex flex-col">
                     <span className="text-[10px] font-bold uppercase text-zinc-400 tracking-wider">Activas</span>
                     <span className="text-lg font-bold text-zinc-900 leading-none">{stats.active}</span>
                 </div>
                 <div className="w-px h-6 bg-zinc-100"></div>
                 <div className="flex flex-col">
                     <span className="text-[10px] font-bold uppercase text-zinc-400 tracking-wider">Total</span>
                     <span className="text-lg font-bold text-zinc-900 leading-none">{stats.total}</span>
                 </div>
             </div>
             <button 
                onClick={() => handleEdit()}
                className="px-6 py-3 bg-zinc-900 text-white text-sm font-bold uppercase tracking-widest rounded-xl hover:bg-brand transition-all shadow-lg shadow-zinc-900/20 flex items-center gap-2"
            >
                <Plus className="w-4 h-4" /> Nueva
            </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-2 rounded-2xl border border-zinc-100 shadow-sm flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input 
                  type="text" 
                  placeholder="Buscar promoción..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 border-none rounded-xl text-sm focus:ring-0 placeholder:text-zinc-400 font-medium text-zinc-700"
              />
          </div>
          <div className="flex bg-zinc-100 p-1 rounded-xl">
               {['ALL', 'ACTIVE', 'INACTIVE'].map(status => (
                   <button 
                      key={status}
                      onClick={() => setFilterType(status as any)}
                      className={`px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all
                        ${filterType === status ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'}`}
                   >
                       {status === 'ALL' ? 'Todos' : status === 'ACTIVE' ? 'Activos' : 'Inactivos'}
                   </button>
               ))}
          </div>
      </div>

      {/* Cards Grid - Coupon Style */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 items-start">
          {filteredDiscounts.map(discount => {
              // Retrieve Name for display if Product
              let targetName = '';
              if (discount.target === 'PRODUCT') {
                   const p = MOCK_PRODUCTS.find(p => p.id === discount.targetValue);
                   targetName = p ? p.name : discount.targetValue || '';
              } else if (discount.target === 'CATEGORY') {
                   targetName = discount.targetValue || '';
              }

              return (
                  <div 
                    key={discount.id}
                    onClick={() => handleEdit(discount)}
                    className="group cursor-pointer"
                  >
                      <CouponPreview data={discount} />
                      
                      {/* Action Bar (Below Card) */}
                      <div className="flex justify-between items-center px-4 mt-2 opacity-50 group-hover:opacity-100 transition-opacity">
                         <div className="flex items-center gap-2">
                              <span className={`w-2 h-2 rounded-full ${discount.isActive ? 'bg-green-500' : 'bg-red-500'}`}></span>
                              <span className="text-[10px] font-bold uppercase text-zinc-400">
                                  {discount.isActive ? 'Cupón Activo' : 'Cupón Inactivo'}
                              </span>
                         </div>
                         <button 
                            onClick={(e) => handleToggleActive(e, discount.id)}
                            className="text-[10px] font-bold uppercase text-zinc-400 hover:text-zinc-900 hover:underline"
                        >
                            {discount.isActive ? 'Desactivar' : 'Activar'}
                        </button>
                      </div>
                  </div>
              )
          })}

          {/* New Card Place holder */}
          <button 
            onClick={() => handleEdit()}
            className="w-full h-40 border-2 border-dashed border-zinc-200 rounded-2xl flex flex-col items-center justify-center text-zinc-300 hover:text-brand hover:border-brand hover:bg-brand/5 transition-all group"
          >
              <div className="w-12 h-12 rounded-full bg-zinc-50 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <Plus className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold uppercase tracking-widest">Crear Nueva Promoción</span>
          </button>
      </div>
    </div>
  );
};

export default Discounts;
