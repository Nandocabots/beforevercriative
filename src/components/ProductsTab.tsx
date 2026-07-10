import React, { useState } from 'react';
import { useDatabase } from '../databaseService';
import { Product, Service } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Trash, Palette, DollarSign, Package, FileText, Sparkles } from 'lucide-react';

const PRESET_COLORS = [
  { name: 'Azul Marinho', hex: '#0B1B3D' },
  { name: 'Marrom', hex: '#8B5A2B' },
  { name: 'Areia', hex: '#C2B280' },
  { name: 'Grafite', hex: '#4A5568' },
  { name: 'Verde Oliva', hex: '#556B2F' },
  { name: 'Vinho', hex: '#800020' },
  { name: 'Verde Esmeralda', hex: '#0F766E' },
  { name: 'Indigo', hex: '#4338CA' }
];

export default function ProductsTab() {
  const { 
    products, 
    services, 
    addProduct, 
    updateProduct, 
    deleteProduct, 
    addServiceItem, 
    updateServiceItem, 
    deleteServiceItem 
  } = useDatabase();
  const [activeSubTab, setActiveSubTab] = useState<'produtos' | 'servicos'>('produtos');

  // Delete confirm states
  const [deleteProductConfirmId, setDeleteProductConfirmId] = useState<string | null>(null);
  const [deleteServiceConfirmId, setDeleteServiceConfirmId] = useState<string | null>(null);

  // Editing state
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingService, setEditingService] = useState<Service | null>(null);

  // Product states
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [prodName, setProdName] = useState('');
  const [prodDescription, setProdDescription] = useState('');
  const [prodBgColor, setProdBgColor] = useState('#0B1B3D');

  // Service states
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [svcName, setSvcName] = useState('');
  const [svcDescription, setSvcDescription] = useState('');
  const [svcCost, setSvcCost] = useState('');

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodName.trim()) return;

    if (editingProduct) {
      updateProduct({
        ...editingProduct,
        name: prodName.trim(),
        description: prodDescription.trim(),
        bgColor: prodBgColor,
      });
    } else {
      addProduct({
        name: prodName.trim(),
        description: prodDescription.trim(),
        bgColor: prodBgColor,
      });
    }

    // Reset
    setProdName('');
    setProdDescription('');
    setProdBgColor('#0B1B3D');
    setEditingProduct(null);
    setIsProductModalOpen(false);
  };

  const handleSaveService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!svcName.trim() || !svcCost.trim()) return;

    if (editingService) {
      updateServiceItem({
        ...editingService,
        name: svcName.trim(),
        description: svcDescription.trim(),
        cost: parseFloat(svcCost) || 0,
      });
    } else {
      addServiceItem({
        name: svcName.trim(),
        description: svcDescription.trim(),
        cost: parseFloat(svcCost) || 0,
      });
    }

    // Reset
    setSvcName('');
    setSvcDescription('');
    setSvcCost('');
    setEditingService(null);
    setIsServiceModalOpen(false);
  };

  const handleEditProduct = (p: Product) => {
    setEditingProduct(p);
    setProdName(p.name);
    setProdDescription(p.description);
    setProdBgColor(p.bgColor);
    setIsProductModalOpen(true);
  };

  const handleEditService = (s: Service) => {
    setEditingService(s);
    setSvcName(s.name);
    setSvcDescription(s.description);
    setSvcCost(s.cost.toString());
    setIsServiceModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-display font-semibold text-gray-900 dark:text-white">
            Portfólio de Atendimentos
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Gerencie os Produtos (que colorem a agenda) e Serviços adicionais (que somam ao valor final)
          </p>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-2">
          {activeSubTab === 'produtos' ? (
            <button
              onClick={() => {
                setEditingProduct(null);
                setProdName('');
                setProdDescription('');
                setProdBgColor('#0B1B3D');
                setIsProductModalOpen(true);
              }}
              className="px-4 py-2 bg-[#0B1B3D] hover:bg-[#152952] text-white text-sm font-semibold rounded-xl shadow-sm flex items-center gap-2 transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Incluir Produto</span>
            </button>
          ) : (
            <button
              onClick={() => {
                setEditingService(null);
                setSvcName('');
                setSvcDescription('');
                setSvcCost('');
                setIsServiceModalOpen(true);
              }}
              className="px-4 py-2 bg-[#8B5A2B] hover:bg-[#9C6B3C] text-white text-sm font-semibold rounded-xl shadow-sm flex items-center gap-2 transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Incluir Serviço</span>
            </button>
          )}
        </div>
      </div>

      {/* Sub-tabs Selector */}
      <div className="flex border-b border-gray-100 dark:border-zinc-800">
        <button
          onClick={() => setActiveSubTab('produtos')}
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${
            activeSubTab === 'produtos'
              ? 'border-[#0B1B3D] text-[#0B1B3D] dark:text-blue-300 dark:border-blue-300'
              : 'border-transparent text-gray-400 hover:text-gray-600 dark:hover:text-zinc-200'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Produtos ({products.length})</span>
        </button>
        <button
          onClick={() => setActiveSubTab('servicos')}
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${
            activeSubTab === 'servicos'
              ? 'border-[#8B5A2B] text-[#8B5A2B] dark:text-[#E6D8B8] dark:border-[#E6D8B8]'
              : 'border-transparent text-gray-400 hover:text-gray-600 dark:hover:text-zinc-200'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Serviços ({services.length})</span>
        </button>
      </div>

      {/* Render Products SubTab */}
      {activeSubTab === 'produtos' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((p) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={() => handleEditProduct(p)}
              className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800/80 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between cursor-pointer hover:border-[#0B1B3D]/30 dark:hover:border-blue-300/30 group"
            >
              <div>
                <div className="flex items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="w-4 h-4 rounded-full shrink-0 border border-black/10 dark:border-white/10"
                      style={{ backgroundColor: p.bgColor }}
                    />
                    <h3 className="font-display font-bold text-gray-900 dark:text-white truncate group-hover:text-[#0B1B3D] dark:group-hover:text-blue-300 transition-colors">
                      {p.name}
                    </h3>
                  </div>
                  {/* Delete product button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (deleteProductConfirmId === p.id) {
                        deleteProduct(p.id);
                        setDeleteProductConfirmId(null);
                      } else {
                        setDeleteProductConfirmId(p.id);
                        setTimeout(() => setDeleteProductConfirmId(null), 3000);
                      }
                    }}
                    className={`p-1.5 rounded-lg transition-all flex items-center gap-1 text-xs font-bold ${
                      deleteProductConfirmId === p.id 
                        ? 'bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 animate-pulse' 
                        : 'hover:bg-rose-50 dark:hover:bg-rose-950/20 text-gray-400 hover:text-rose-600'
                    }`}
                    title={deleteProductConfirmId === p.id ? "Clique novamente para confirmar exclusão" : "Excluir produto"}
                  >
                    <Trash className="w-4 h-4" />
                    {deleteProductConfirmId === p.id && <span>Confirmar?</span>}
                  </button>
                </div>
                <p className="text-xs text-gray-500 dark:text-zinc-400 min-h-[40px] line-clamp-2">
                  {p.description || 'Sem descrição cadastrada.'}
                </p>
              </div>

              {/* Footer displaying color detail */}
              <div className="mt-4 pt-3 border-t border-slate-50 dark:border-zinc-800/60 flex items-center justify-between text-[11px] text-gray-400">
                <span className="flex items-center gap-1">
                  <Palette className="w-3.5 h-3.5" />
                  <span>Cor da Agenda:</span>
                </span>
                <span className="font-mono font-bold bg-slate-50 dark:bg-zinc-800 px-2 py-0.5 rounded text-gray-600 dark:text-zinc-300">
                  {p.bgColor}
                </span>
              </div>
            </motion.div>
          ))}
          {products.length === 0 && (
            <div className="col-span-full py-12 text-center text-sm text-gray-400">
              Nenhum produto cadastrado. Clique em "+ Incluir Produto" para criar um.
            </div>
          )}
        </div>
      )}

      {/* Render Services SubTab */}
      {activeSubTab === 'servicos' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((s) => (
            <motion.div
              key={s.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={() => handleEditService(s)}
              className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800/80 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between cursor-pointer hover:border-[#8B5A2B]/30 dark:hover:border-[#E6D8B8]/30 group"
            >
              <div>
                <div className="flex items-center justify-between gap-3 mb-3">
                  <h3 className="font-display font-bold text-gray-900 dark:text-white truncate group-hover:text-[#8B5A2B] dark:group-hover:text-[#E6D8B8] transition-colors">
                    {s.name}
                  </h3>
                  {/* Delete service button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (deleteServiceConfirmId === s.id) {
                        deleteServiceItem(s.id);
                        setDeleteServiceConfirmId(null);
                      } else {
                        setDeleteServiceConfirmId(s.id);
                        setTimeout(() => setDeleteServiceConfirmId(null), 3000);
                      }
                    }}
                    className={`p-1.5 rounded-lg transition-all flex items-center gap-1 text-xs font-bold ${
                      deleteServiceConfirmId === s.id 
                        ? 'bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 animate-pulse' 
                        : 'hover:bg-rose-50 dark:hover:bg-rose-950/20 text-gray-400 hover:text-rose-600'
                    }`}
                    title={deleteServiceConfirmId === s.id ? "Clique novamente para confirmar exclusão" : "Excluir serviço"}
                  >
                    <Trash className="w-4 h-4" />
                    {deleteServiceConfirmId === s.id && <span>Confirmar?</span>}
                  </button>
                </div>
                <p className="text-xs text-gray-500 dark:text-zinc-400 min-h-[40px] line-clamp-2">
                  {s.description || 'Sem descrição cadastrada.'}
                </p>
              </div>

              {/* Footer displaying cost */}
              <div className="mt-4 pt-3 border-t border-slate-50 dark:border-zinc-800/60 flex items-center justify-between text-[11px] text-gray-400">
                <span className="flex items-center gap-1">
                  <DollarSign className="w-3.5 h-3.5 text-[#8B5A2B]" />
                  <span>Custo do Serviço:</span>
                </span>
                <span className="font-mono font-bold text-[#8B5A2B] dark:text-[#E6D8B8] text-sm">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(s.cost)}
                </span>
              </div>
            </motion.div>
          ))}
          {services.length === 0 && (
            <div className="col-span-full py-12 text-center text-sm text-gray-400">
              Nenhum serviço cadastrado. Clique em "+ Incluir Serviço" para criar um.
            </div>
          )}
        </div>
      )}

      {/* Product Creation Modal */}
      <AnimatePresence>
        {isProductModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsProductModalOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-2xl shadow-xl max-w-md w-full overflow-hidden z-10 relative"
            >
              <div className="px-6 py-4 border-b border-slate-50 dark:border-zinc-800 flex items-center justify-between">
                <h3 className="text-lg font-display font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Package className="w-5 h-5 text-[#0B1B3D]" />
                  <span>{editingProduct ? "Editar Produto / Atendimento" : "Cadastrar Novo Produto"}</span>
                </h3>
              </div>

              <form onSubmit={handleSaveProduct} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                    Nome do Produto *
                  </label>
                  <input
                    type="text"
                    required
                    value={prodName}
                    onChange={(e) => setProdName(e.target.value)}
                    placeholder="Ex: Noiva, Maquiagem Social, etc."
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0B1B3D]/30 focus:border-[#0B1B3D] text-gray-900 dark:text-zinc-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                    Descrição do Atendimento
                  </label>
                  <textarea
                    rows={3}
                    value={prodDescription}
                    onChange={(e) => setProdDescription(e.target.value)}
                    placeholder="Especifique o que o produto engloba..."
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0B1B3D]/30 focus:border-[#0B1B3D] text-gray-900 dark:text-zinc-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">
                    Cor do Fundo (Agenda) *
                  </label>
                  {/* Preset Colors Grid */}
                  <div className="grid grid-cols-4 gap-2.5 mb-3">
                    {PRESET_COLORS.map((c) => (
                      <button
                        key={c.hex}
                        type="button"
                        onClick={() => setProdBgColor(c.hex)}
                        title={c.name}
                        className={`py-2 rounded-lg border text-xs font-semibold flex flex-col items-center gap-1 transition-all ${
                          prodBgColor === c.hex
                            ? 'border-[#0B1B3D] bg-slate-100/60 dark:bg-zinc-800/80 ring-2 ring-[#0B1B3D]/25'
                            : 'border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-800/30'
                        }`}
                      >
                        <span
                          className="w-4 h-4 rounded-full border border-black/10 shrink-0"
                          style={{ backgroundColor: c.hex }}
                        />
                        <span className="text-[9px] text-gray-500 truncate max-w-full px-1">{c.name}</span>
                      </button>
                    ))}
                  </div>

                  {/* Manual color picker input */}
                  <div className="flex items-center gap-3 bg-slate-50 dark:bg-zinc-800/40 p-2.5 rounded-xl border border-slate-100 dark:border-zinc-800">
                    <input
                      type="color"
                      value={prodBgColor}
                      onChange={(e) => setProdBgColor(e.target.value)}
                      className="w-8 h-8 rounded border-none cursor-pointer"
                    />
                    <div className="text-xs">
                      <span className="text-gray-400 block font-medium">Cor Selecionada:</span>
                      <span className="font-mono font-bold text-gray-700 dark:text-zinc-300">{prodBgColor}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsProductModalOpen(false);
                      setEditingProduct(null);
                    }}
                    className="px-4 py-2 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-gray-700 dark:text-zinc-200 text-sm font-semibold rounded-xl transition-all"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#0B1B3D] hover:bg-[#152952] text-white text-sm font-semibold rounded-xl transition-all flex items-center gap-1"
                  >
                    <span>{editingProduct ? "Salvar Alterações" : "Salvar Produto"}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Service Creation Modal */}
      <AnimatePresence>
        {isServiceModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsServiceModalOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-2xl shadow-xl max-w-md w-full overflow-hidden z-10 relative"
            >
              <div className="px-6 py-4 border-b border-slate-50 dark:border-zinc-800 flex items-center justify-between">
                <h3 className="text-lg font-display font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[#8B5A2B]" />
                  <span>{editingService ? "Editar Serviço" : "Cadastrar Novo Serviço"}</span>
                </h3>
              </div>

              <form onSubmit={handleSaveService} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                    Nome do Serviço *
                  </label>
                  <input
                    type="text"
                    required
                    value={svcName}
                    onChange={(e) => setSvcName(e.target.value)}
                    placeholder="Ex: Corte de Cabelo, Hidratação, etc."
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#8B5A2B]/30 focus:border-[#8B5A2B] text-gray-900 dark:text-zinc-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                    Descrição do Serviço
                  </label>
                  <textarea
                    rows={3}
                    value={svcDescription}
                    onChange={(e) => setSvcDescription(e.target.value)}
                    placeholder="Especifique os detalhes adicionais deste serviço..."
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#8B5A2B]/30 focus:border-[#8B5A2B] text-gray-900 dark:text-zinc-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                    Custo / Valor Adicional (R$) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-2.5 text-xs text-gray-400 font-bold font-mono">R$</span>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      value={svcCost}
                      onChange={(e) => setSvcCost(e.target.value)}
                      placeholder="Ex: 150"
                      className="w-full pl-9 pr-3.5 py-2 bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#8B5A2B]/30 focus:border-[#8B5A2B] text-gray-900 dark:text-zinc-100 font-mono"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsServiceModalOpen(false);
                      setEditingService(null);
                    }}
                    className="px-4 py-2 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-gray-700 dark:text-zinc-200 text-sm font-semibold rounded-xl transition-all"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#8B5A2B] hover:bg-[#9C6B3C] text-white text-sm font-semibold rounded-xl transition-all flex items-center gap-1"
                  >
                    <span>{editingService ? "Salvar Alterações" : "Salvar Serviço"}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
