/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useDatabase } from '../databaseService';
import { Client } from '../types';
import { Search, UserPlus, Phone, Mail, CalendarDays, Clipboard, Edit3, Trash2, X, PlusCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function ClientsTab() {
  const { clients, addClient, updateClient, deleteClient } = useDatabase();
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [notes, setNotes] = useState('');
  const [category, setCategory] = useState<'clientes' | 'cerimonialistas' | 'terceiros'>('clientes');
  const [formError, setFormError] = useState('');

  // Tab filtering state
  const [activeFilter, setActiveFilter] = useState<'todos' | 'clientes' | 'cerimonialistas' | 'terceiros'>('todos');

  // Handle opening modal for creation
  const handleOpenCreate = () => {
    setEditingClient(null);
    setName('');
    setEmail('');
    setPhone('');
    setBirthDate('');
    setNotes('');
    setCategory('clientes');
    setFormError('');
    setIsModalOpen(true);
  };

  // Handle opening modal for editing
  const handleOpenEdit = (client: Client) => {
    setEditingClient(client);
    setName(client.name);
    setEmail(client.email);
    setPhone(client.phone);
    setBirthDate(client.birthDate);
    setNotes(client.notes);
    setCategory(client.category || 'clientes');
    setFormError('');
    setIsModalOpen(true);
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setFormError('Por favor, insira o nome.');
      return;
    }

    const payload = {
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      birthDate,
      notes: notes.trim(),
      category: category,
    };

    if (editingClient) {
      updateClient({
        ...editingClient,
        ...payload,
      });
    } else {
      addClient(payload);
    }

    setIsModalOpen(false);
  };

  // Filter clients
  const filteredClients = clients.filter((c) => {
    const matchesCategory = activeFilter === 'todos' || (c.category || 'clientes') === activeFilter;
    const term = searchQuery.toLowerCase();
    const matchesSearch = (
      c.name.toLowerCase().includes(term) ||
      c.phone.includes(term) ||
      c.email.toLowerCase().includes(term)
    );
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header with Search and Add buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-display font-semibold tracking-tight">
            Pessoas
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Cadastre, edite e organize seus clientes, cerimonialistas e terceiros.
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm rounded-xl transition-all duration-200 shadow-sm hover:shadow active:scale-95"
        >
          <UserPlus className="w-4 h-4" />
          <span>Nova Pessoa</span>
        </button>
      </div>

      {/* Search Input bar & Category Tabs */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 dark:border-zinc-800 pb-2">
        <div className="relative w-full max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
            <Search className="w-5 h-5" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por nome, celular ou e-mail..."
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 text-gray-900 dark:text-zinc-100 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Category segment tabs */}
        <div className="flex gap-1 overflow-x-auto py-1">
          {[
            { id: 'todos', label: 'Todos', count: clients.length },
            { id: 'clientes', label: 'Clientes', count: clients.filter(c => (c.category || 'clientes') === 'clientes').length },
            { id: 'cerimonialistas', label: 'Cerimonialistas', count: clients.filter(c => c.category === 'cerimonialistas').length },
            { id: 'terceiros', label: 'Terceiros', count: clients.filter(c => c.category === 'terceiros').length },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveFilter(tab.id as any)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-200 flex items-center gap-1.5 ${
                activeFilter === tab.id
                  ? 'bg-indigo-600 text-white shadow-sm font-bold'
                  : 'bg-slate-100 dark:bg-zinc-800 text-gray-600 hover:text-gray-900 dark:text-zinc-400 dark:hover:text-zinc-100'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                activeFilter === tab.id
                  ? 'bg-white/20 text-white'
                  : 'bg-slate-200 text-gray-700 dark:bg-zinc-700 dark:text-zinc-300'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Clients Grid */}
      {filteredClients.length === 0 ? (
        <div className="bg-white dark:bg-zinc-900 border border-dashed border-slate-200 dark:border-zinc-800 rounded-2xl p-12 text-center">
          <p className="text-gray-400 text-sm">Nenhum registro encontrado nesta categoria.</p>
          <button
            onClick={handleOpenCreate}
            className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            <PlusCircle className="w-4 h-4" />
            Cadastrar nova pessoa
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredClients.map((client) => (
            <motion.div
              key={client.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                {/* Client header */}
                <div className="flex items-start justify-between gap-2 mb-4">
                  <div className="min-w-0">
                    <h3 className="font-display font-semibold text-lg text-gray-900 dark:text-white truncate">
                      {client.name}
                    </h3>
                    <div className="flex flex-wrap gap-1.5 mt-1 items-center">
                      <span className="text-[10px] font-mono text-gray-400 bg-slate-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full">
                        ID: {client.id}
                      </span>
                      {(() => {
                        const cat = client.category || 'clientes';
                        if (cat === 'cerimonialistas') {
                          return (
                            <span className="text-[10px] font-semibold text-[#8B5A2B] bg-[#FAF7F0] dark:text-[#E6D8B8] dark:bg-[#5C4033]/30 px-2 py-0.5 rounded-full border border-[#8B5A2B]/20">
                              Cerimonialista
                            </span>
                          );
                        } else if (cat === 'terceiros') {
                          return (
                            <span className="text-[10px] font-semibold text-amber-700 bg-amber-100 dark:text-amber-300 dark:bg-amber-950/40 px-2 py-0.5 rounded-full border border-amber-200/50">
                              Terceiro
                            </span>
                          );
                        } else {
                          return (
                            <span className="text-[10px] font-semibold text-indigo-700 bg-indigo-100 dark:text-indigo-300 dark:bg-indigo-950/40 px-2 py-0.5 rounded-full border border-indigo-200/50">
                              Cliente
                            </span>
                          );
                        }
                      })()}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenEdit(client)}
                      title="Editar dados"
                      className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (deleteConfirmId === client.id) {
                          deleteClient(client.id);
                          setDeleteConfirmId(null);
                        } else {
                          setDeleteConfirmId(client.id);
                          setTimeout(() => setDeleteConfirmId(null), 3000);
                        }
                      }}
                      title={deleteConfirmId === client.id ? "Clique novamente para confirmar" : "Excluir cadastro"}
                      className={`p-1.5 rounded-lg transition-all flex items-center gap-1 text-xs font-bold ${
                        deleteConfirmId === client.id
                          ? 'bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 animate-pulse'
                          : 'text-gray-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40'
                      }`}
                    >
                      <Trash2 className="w-4 h-4" />
                      {deleteConfirmId === client.id && <span>Confirmar?</span>}
                    </button>
                  </div>
                </div>

                {/* Details layout */}
                <div className="space-y-2.5 text-xs text-gray-600 dark:text-zinc-300">
                  <div className="flex items-center gap-2.5">
                    <Phone className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                    <span className="font-mono">{client.phone || 'Telefone não informado'}</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Mail className="w-3.5 h-3.5 text-gray-400 shrink-0 truncate" />
                    <span className="truncate">{client.email || 'Email não informado'}</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <CalendarDays className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                    <span>Nascimento: <strong className="font-mono">{client.birthDate ? client.birthDate.split('-').reverse().join('/') : 'Não cadastrado'}</strong></span>
                  </div>
                  
                  {/* Notes box */}
                  <div className="mt-4 p-3 bg-slate-50 dark:bg-zinc-800/40 rounded-xl border border-slate-100 dark:border-zinc-800/50">
                    <div className="flex items-center gap-1.5 mb-1 text-[10px] text-gray-400 font-medium tracking-wide uppercase">
                      <Clipboard className="w-3 h-3" />
                      <span>Ficha e Notas Clínicas</span>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-zinc-400 line-clamp-3 italic">
                      {client.notes || 'Nenhuma observação clínica registrada.'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="text-[10px] text-gray-400 dark:text-gray-500 mt-4 pt-3 border-t border-slate-50 dark:border-zinc-800">
                Cadastrado em: {new Date(client.createdAt).toLocaleDateString('pt-BR')}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Modal - Create & Edit Patient */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 w-full max-w-lg rounded-2xl shadow-xl overflow-hidden relative z-10"
            >
              {/* Modal Title */}
              <div className="px-6 py-4 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between">
                <h3 className="text-lg font-display font-semibold text-gray-900 dark:text-white">
                  {editingClient ? 'Editar Cadastro' : 'Cadastrar Nova Pessoa'}
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-slate-50 dark:hover:bg-zinc-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {formError && (
                  <div className="p-3 bg-rose-50 dark:bg-rose-950/30 text-rose-500 text-xs rounded-lg font-medium">
                    {formError}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                      Nome Completo *
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Nome e sobrenome"
                      className="w-full px-3.5 py-2 bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 text-gray-900 dark:text-zinc-100"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                      Categoria *
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as any)}
                      className="w-full px-3.5 py-2 bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 text-gray-900 dark:text-zinc-100"
                    >
                      <option value="clientes">Cliente</option>
                      <option value="cerimonialistas">Cerimonialista</option>
                      <option value="terceiros">Terceiro</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                      Celular / Telefone
                    </label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="(11) 99999-9999"
                      className="w-full px-3.5 py-2 bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 text-gray-900 dark:text-zinc-100"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                      Data de Nascimento
                    </label>
                    <input
                      type="date"
                      value={birthDate}
                      onChange={(e) => setBirthDate(e.target.value)}
                      className="w-full px-3.5 py-2 bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 text-gray-900 dark:text-zinc-100 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                    E-mail
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="exemplo@email.com"
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 text-gray-900 dark:text-zinc-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                    Ficha / Anamnese / Observações Importantes
                  </label>
                  <textarea
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Preferências de aromaterapia, alergias, sensibilidades musculares, restrições médicas ou observações gerais de atendimento..."
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 text-gray-900 dark:text-zinc-100 italic resize-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-zinc-800 mt-6">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 font-medium rounded-lg"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg shadow-sm"
                  >
                    {editingClient ? 'Salvar Alterações' : 'Salvar Cadastro'}
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
