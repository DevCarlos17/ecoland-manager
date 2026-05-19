import React, { useState } from 'react';
import { MOCK_PRODUCTS } from '../constants';
import { Search, AlertTriangle, Package, MoreHorizontal, Plus, ArrowDown, ArrowLeft, ChevronLeft, ChevronRight, Upload, Save, Trash2, Camera, DollarSign, BarChart3, Image as ImageIcon, Tag } from 'lucide-react';
import { Product } from '../types';

const Inventory: React.FC = () => {
  const [view, setView] = useState<'LIST' | 'DETAIL'>('LIST');
  const [filter, setFilter] = useState('TODOS');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  
  // Detail Form State
  const [formData, setFormData] = useState<Partial<Product>>({});

  const categories = ['TODOS', 'SUPLEMENTOS', 'BEBIDAS', 'ALIMENTOS', 'EQUIPO'];
  const allCategories = ['SUPLEMENTOS', 'BEBIDAS', 'ALIMENTOS', 'EQUIPO', 'ACCESO'];

  const getStockStatus = (stock: number) => {
    if (stock <= 10) return { label: 'CRÍTICO', color: 'text-red-600 bg-red-50 border-red-100', icon: AlertTriangle };
    if (stock <= 30) return { label: 'BAJO', color: 'text-yellow-600 bg-yellow-50 border-yellow-100', icon: AlertTriangle };
    return { label: 'OPTIMO', color: 'text-green-600 bg-green-50 border-green-100', icon: Package };
  };

  const handleProductClick = (product: Product) => {
      setSelectedProduct(product);
      setFormData(product);
      setView('DETAIL');
  };

  const handleNewProduct = () => {
      const newProd: Product = {
          id: Math.random().toString(36).substring(7),
          name: '',
          category: 'SUPLEMENTOS',
          priceUsd: 0,
          stock: 0,
          image: ''
      };
      setSelectedProduct(newProd);
      setFormData(newProd);
      setView('DETAIL');
  };

  // --- VIEW: DETAIL ---
  if (view === 'DETAIL' && selectedProduct) {
      return (
          <div className="animate-fade-in max-w-5xl mx-auto pb-20">
              {/* Header */}
              <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4">
                       <button 
                          onClick={() => setView('LIST')}
                          className="w-10 h-10 rounded-full bg-white border border-zinc-200 flex items-center justify-center text-zinc-500 hover:text-black hover:border-black transition-all"
                      >
                          <ArrowLeft className="w-5 h-5" />
                      </button>
                      <div>
                        <h1 className="text-2xl lg:text-3xl font-light text-zinc-900">
                            {selectedProduct.name ? 'Editar Producto' : 'Nuevo Producto'}
                        </h1>
                        <p className="text-zinc-500 text-xs tracking-wide">Gestión de inventario y catálogo.</p>
                      </div>
                  </div>
                  <div className="flex gap-3">
                      {selectedProduct.name && (
                           <button className="px-4 py-2.5 rounded-xl border border-red-100 text-red-500 flex items-center gap-2 hover:bg-red-50 transition-colors text-xs font-bold uppercase tracking-wider">
                                <Trash2 className="w-4 h-4" /> Eliminar
                           </button>
                      )}
                      <button 
                        onClick={() => setView('LIST')}
                        className="px-6 py-2.5 rounded-xl bg-zinc-900 text-white flex items-center gap-2 text-xs font-bold uppercase tracking-widest hover:bg-brand transition-all shadow-lg shadow-zinc-900/10"
                      >
                          <Save className="w-4 h-4" /> Guardar Cambios
                      </button>
                  </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  
                  {/* Left Column: Main Info & Pricing */}
                  <div className="lg:col-span-2 space-y-8">
                      {/* Section: Basic Info */}
                      <div className="bg-white p-8 rounded-[1.5rem] border border-zinc-100 shadow-sm">
                          <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-900 mb-6 flex items-center gap-2">
                              <Tag className="w-4 h-4 text-zinc-400" /> Información Básica
                          </h3>
                          
                          <div className="space-y-6">
                              <div>
                                  <label className="block text-xs font-bold uppercase text-zinc-500 mb-2 tracking-wider">Nombre del Producto</label>
                                  <input 
                                      type="text" 
                                      value={formData.name}
                                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                                      className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-zinc-900 focus:border-brand outline-none transition-all placeholder:text-zinc-400 text-base"
                                      placeholder="Ej. Proteína Whey Gold Standard"
                                  />
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                  <div>
                                      <label className="block text-xs font-bold uppercase text-zinc-500 mb-2 tracking-wider">SKU / Código</label>
                                      <input 
                                          type="text" 
                                          value={selectedProduct.id}
                                          disabled
                                          className="w-full px-4 py-3 bg-zinc-100 border border-zinc-200 rounded-xl text-zinc-500 cursor-not-allowed font-mono text-sm"
                                      />
                                  </div>
                                  <div>
                                      <label className="block text-xs font-bold uppercase text-zinc-500 mb-2 tracking-wider">Categoría</label>
                                      <div className="relative">
                                        <select 
                                            value={formData.category}
                                            onChange={(e) => setFormData({...formData, category: e.target.value as any})}
                                            className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-zinc-900 focus:border-brand outline-none transition-all appearance-none cursor-pointer"
                                        >
                                            {allCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                        </select>
                                        <ArrowDown className="w-4 h-4 text-zinc-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                                      </div>
                                  </div>
                              </div>

                              <div>
                                  <label className="block text-xs font-bold uppercase text-zinc-500 mb-2 tracking-wider">Descripción</label>
                                  <textarea 
                                      rows={4}
                                      className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-zinc-900 focus:border-brand outline-none transition-all resize-none placeholder:text-zinc-400"
                                      placeholder="Describe las características del producto..."
                                  />
                              </div>
                          </div>
                      </div>

                      {/* Section: Pricing & Inventory */}
                      <div className="bg-white p-8 rounded-[1.5rem] border border-zinc-100 shadow-sm">
                          <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-900 mb-6 flex items-center gap-2">
                              <DollarSign className="w-4 h-4 text-zinc-400" /> Precios e Inventario
                          </h3>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                              <div>
                                  <label className="block text-xs font-bold uppercase text-zinc-500 mb-2 tracking-wider">Precio Venta (USD)</label>
                                  <div className="relative">
                                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 font-medium">$</span>
                                      <input 
                                          type="number" 
                                          step="0.01"
                                          value={formData.priceUsd}
                                          onChange={(e) => setFormData({...formData, priceUsd: parseFloat(e.target.value)})}
                                          className="w-full pl-8 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-zinc-900 focus:border-brand outline-none transition-all font-medium"
                                      />
                                  </div>
                              </div>
                              <div>
                                  <label className="block text-xs font-bold uppercase text-zinc-500 mb-2 tracking-wider">Costo Unitario</label>
                                  <div className="relative">
                                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 font-medium">$</span>
                                      <input 
                                          type="number" 
                                          step="0.01"
                                          placeholder="0.00"
                                          className="w-full pl-8 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-zinc-900 focus:border-brand outline-none transition-all"
                                      />
                                  </div>
                              </div>
                              <div>
                                  <label className="block text-xs font-bold uppercase text-zinc-500 mb-2 tracking-wider">Stock Actual</label>
                                  <input 
                                      type="number" 
                                      value={formData.stock}
                                      onChange={(e) => setFormData({...formData, stock: parseInt(e.target.value)})}
                                      className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-zinc-900 focus:border-brand outline-none transition-all"
                                  />
                              </div>
                          </div>
                      </div>
                  </div>

                  {/* Right Column: Media & Status */}
                  <div className="space-y-8">
                       {/* Section: Media */}
                      <div className="bg-white p-8 rounded-[1.5rem] border border-zinc-100 shadow-sm">
                          <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-900 mb-6 flex items-center gap-2">
                              <ImageIcon className="w-4 h-4 text-zinc-400" /> Multimedia
                          </h3>
                          
                          <div className="w-full aspect-square bg-zinc-50 rounded-2xl border-2 border-dashed border-zinc-200 flex flex-col items-center justify-center relative overflow-hidden group cursor-pointer hover:border-brand hover:bg-brand/5 transition-all">
                              {formData.image ? (
                                  <>
                                    <img src={formData.image} className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <p className="text-white text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                                            <Upload className="w-4 h-4" /> Cambiar Imagen
                                        </p>
                                    </div>
                                  </>
                              ) : (
                                  <div className="text-center p-6">
                                      <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-3 text-zinc-300 shadow-sm border border-zinc-100">
                                        <Camera className="w-6 h-6" />
                                      </div>
                                      <span className="block text-xs font-bold uppercase tracking-widest text-zinc-400 group-hover:text-brand">Subir Imagen</span>
                                      <span className="block text-[10px] text-zinc-400 mt-2">JPG, PNG max 2MB</span>
                                  </div>
                              )}
                          </div>
                      </div>

                       {/* Section: Status */}
                      <div className="bg-white p-8 rounded-[1.5rem] border border-zinc-100 shadow-sm">
                          <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-900 mb-6 flex items-center gap-2">
                              <BarChart3 className="w-4 h-4 text-zinc-400" /> Estado
                          </h3>
                          
                          <div className="space-y-4">
                              <div className="flex justify-between items-center p-3 rounded-xl bg-zinc-50 border border-zinc-100">
                                  <span className="text-sm text-zinc-600">Disponibilidad</span>
                                  <div className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest border ${getStockStatus(formData.stock || 0).color}`}>
                                      {getStockStatus(formData.stock || 0).label}
                                  </div>
                              </div>
                              
                              <div className="flex items-center gap-2 mt-4">
                                  <input type="checkbox" id="active" className="w-4 h-4 text-brand rounded focus:ring-brand border-gray-300" defaultChecked />
                                  <label htmlFor="active" className="text-sm text-zinc-600 select-none cursor-pointer">Producto Activo en Catálogo</label>
                              </div>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      );
  }

  // --- VIEW: LIST ---
  return (
    <div className="space-y-8 animate-fade-in pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 pb-2">
        <div>
          <h1 className="text-3xl lg:text-4xl font-light text-zinc-900 mb-2 tracking-tight">Inventario</h1>
          <p className="text-zinc-500 font-light tracking-wide text-sm">Control de stock, precios y rotación de productos.</p>
        </div>
        <div className="flex gap-3">
             <button className="px-6 py-3 bg-white border border-zinc-200 text-zinc-900 text-sm font-bold uppercase tracking-widest rounded-xl hover:bg-zinc-50 transition-all flex items-center gap-2">
                <ArrowDown className="w-4 h-4" /> Importar
            </button>
            <button 
                onClick={handleNewProduct}
                className="px-6 py-3 bg-zinc-900 text-white text-sm font-bold uppercase tracking-widest rounded-xl hover:bg-brand transition-all shadow-lg shadow-zinc-900/20 flex items-center gap-2"
            >
                <Plus className="w-4 h-4" /> Nuevo Producto
            </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-zinc-100 shadow-sm">
             <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-2">Valor Total</p>
             <h3 className="text-2xl font-light text-zinc-900">$12,450</h3>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-zinc-100 shadow-sm">
             <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-2">Items Totales</p>
             <h3 className="text-2xl font-light text-zinc-900">1,204</h3>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-zinc-100 shadow-sm">
             <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-2">Stock Bajo</p>
             <h3 className="text-2xl font-light text-red-500 flex items-center gap-2">
                12 <AlertTriangle className="w-4 h-4" />
             </h3>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-zinc-100 shadow-sm">
             <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-2">Más Vendido</p>
             <h3 className="text-lg font-light text-zinc-900 truncate">Proteína Whey</h3>
          </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col lg:flex-row justify-between items-center bg-white p-2 rounded-xl border border-zinc-100 shadow-sm gap-4">
        <div className="relative w-full lg:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input 
                type="text" 
                placeholder="Buscar por nombre, SKU o categoría..." 
                className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 border-none rounded-lg text-sm focus:ring-0 placeholder:text-zinc-400"
            />
        </div>
        <div className="flex gap-2 w-full lg:w-auto overflow-x-auto no-scrollbar">
            {categories.map(cat => (
                 <button 
                    key={cat}
                    onClick={() => setFilter(cat)}
                    className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors whitespace-nowrap
                        ${filter === cat ? 'bg-zinc-900 text-white' : 'bg-zinc-50 text-zinc-500 hover:bg-zinc-100'}`}
                 >
                    {cat}
                 </button>
            ))}
        </div>
      </div>

      {/* Product List */}
      <div className="bg-white border border-zinc-100 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
                <tr className="border-b border-zinc-100 text-[10px] uppercase text-zinc-400 font-bold tracking-[0.2em] bg-zinc-50/50">
                <th className="py-5 pl-8 font-normal">Producto</th>
                <th className="py-5 font-normal">Categoría</th>
                <th className="py-5 font-normal">Precio (USD)</th>
                <th className="py-5 font-normal">Existencia</th>
                <th className="py-5 font-normal">Estado</th>
                <th className="py-5"></th>
                </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
                {MOCK_PRODUCTS.filter(p => filter === 'TODOS' || p.category === filter).map((product) => {
                    const status = getStockStatus(product.stock);
                    const StatusIcon = status.icon;
                    return (
                        <tr 
                            key={product.id} 
                            onClick={() => handleProductClick(product)}
                            className="group hover:bg-zinc-50/60 transition-colors cursor-pointer"
                        >
                            <td className="py-4 pl-8">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-zinc-50 p-1 border border-zinc-100">
                                        <img src={product.image} alt="" className="w-full h-full object-cover rounded-lg" />
                                    </div>
                                    <div>
                                        <span className="block font-medium text-sm text-zinc-900">{product.name}</span>
                                        <span className="block text-[10px] text-zinc-400 mt-0.5">SKU: {product.id.toUpperCase()}</span>
                                    </div>
                                </div>
                            </td>
                            <td className="py-4">
                                <span className="px-2 py-1 bg-zinc-50 text-zinc-500 rounded text-[10px] font-bold uppercase tracking-wider border border-zinc-100">
                                    {product.category}
                                </span>
                            </td>
                            <td className="py-4">
                                <span className="font-medium text-zinc-900">${product.priceUsd.toFixed(2)}</span>
                            </td>
                            <td className="py-4">
                                <span className="text-sm text-zinc-600">{product.stock} un.</span>
                            </td>
                            <td className="py-4">
                                <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border ${status.color}`}>
                                    <StatusIcon className="w-3 h-3" />
                                    <span className="text-[9px] font-bold uppercase tracking-widest">{status.label}</span>
                                </div>
                            </td>
                            <td className="py-4 text-right pr-8">
                                <button className="p-2 rounded-lg text-zinc-300 hover:text-black hover:bg-zinc-100 transition-all">
                                    <MoreHorizontal className="w-5 h-5" />
                                </button>
                            </td>
                        </tr>
                    );
                })}
            </tbody>
            </table>
        </div>

        {/* Pagination Footer */}
        <div className="border-t border-zinc-100 p-4 flex items-center justify-between bg-zinc-50/30">
            <span className="text-xs text-zinc-400">Mostrando <span className="font-medium text-zinc-900">1-6</span> de <span className="font-medium text-zinc-900">24</span></span>
            
            <div className="flex items-center gap-1">
                <button className="p-2 rounded-lg border border-zinc-200 text-zinc-400 hover:text-black hover:border-black hover:bg-white transition-all disabled:opacity-50">
                    <ChevronLeft className="w-4 h-4" />
                </button>
                <div className="flex items-center gap-1 px-2">
                    <button className="w-8 h-8 rounded-lg bg-zinc-900 text-white text-xs font-bold">1</button>
                    <button className="w-8 h-8 rounded-lg text-zinc-500 hover:bg-zinc-100 text-xs font-medium">2</button>
                    <button className="w-8 h-8 rounded-lg text-zinc-500 hover:bg-zinc-100 text-xs font-medium">3</button>
                    <span className="text-zinc-400 text-xs">...</span>
                </div>
                <button className="p-2 rounded-lg border border-zinc-200 text-zinc-400 hover:text-black hover:border-black hover:bg-white transition-all">
                    <ChevronRight className="w-4 h-4" />
                </button>
            </div>
        </div>

      </div>
    </div>
  );
};

export default Inventory;