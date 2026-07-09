import React, { useState } from 'react';
import { useDatabase } from '../databaseService';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Trash, Shield, User as UserIcon, Lock, Eye, EyeOff, Edit2 } from 'lucide-react';

export default function UsersTab() {
  const { users, currentUser, addUser, updateUser, deleteUser } = useDatabase();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'master' | 'comum'>('comum');

  // Password view and edit states
  const [revealPassword, setRevealPassword] = useState<Record<string, boolean>>({});
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editingPassword, setEditingPassword] = useState('');

  if (currentUser?.role !== 'master') {
    return (
      <div className="p-8 text-center bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-2xl max-w-lg mx-auto my-12 shadow-sm">
        <h3 className="text-lg font-display font-bold text-rose-600 dark:text-rose-400">Acesso Restrito</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
          Esta página está disponível apenas para usuários com permissão Master.
        </p>
      </div>
    );
  }

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) return;

    addUser({
      username: username.trim(),
      password: password.trim(),
      role,
    });

    // Reset
    setUsername('');
    setPassword('');
    setRole('comum');
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-display font-semibold text-gray-900 dark:text-white">
            Gerenciamento de Usuários
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Gerencie os usuários do sistema, definindo papéis de Master ou Comum.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-[#0B1B3D] hover:bg-[#152952] text-white text-sm font-semibold rounded-xl shadow-sm flex items-center gap-2 self-start transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Incluir Usuário</span>
        </button>
      </div>

      {/* Users Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {users.map((u) => (
          <motion.div
            key={u.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800/80 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-slate-50 dark:bg-zinc-800 flex items-center justify-center border border-slate-100 dark:border-zinc-800 shrink-0 text-[#0B1B3D]">
                    <UserIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-gray-900 dark:text-white truncate">
                      {u.username}
                    </h3>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                      u.role === 'master'
                        ? 'bg-[#0B1B3D]/10 text-[#0B1B3D] dark:bg-blue-300/10 dark:text-blue-300'
                        : 'bg-gray-100 text-gray-600 dark:bg-zinc-800 dark:text-zinc-400'
                    }`}>
                      {u.role === 'master' ? 'Master' : 'Comum'}
                    </span>
                  </div>
                </div>

                {/* Delete user button - disabled for current logged-in user */}
                {currentUser?.id !== u.id && (
                  <button
                    onClick={() => {
                      if (deleteConfirmId === u.id) {
                        deleteUser(u.id);
                        setDeleteConfirmId(null);
                      } else {
                        setDeleteConfirmId(u.id);
                        setTimeout(() => setDeleteConfirmId(null), 3000);
                      }
                    }}
                    className={`p-1.5 rounded-lg transition-all flex items-center gap-1 text-xs font-bold ${
                      deleteConfirmId === u.id 
                        ? 'bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 animate-pulse' 
                        : 'hover:bg-rose-50 dark:hover:bg-rose-950/20 text-gray-400 hover:text-rose-600'
                    }`}
                    title={deleteConfirmId === u.id ? "Clique novamente para confirmar" : "Excluir usuário"}
                  >
                    <Trash className="w-4 h-4" />
                    {deleteConfirmId === u.id && <span>Confirmar?</span>}
                  </button>
                )}
              </div>

              {/* Password viewing & inline editing */}
              {editingUserId === u.id ? (
                <div className="mt-3 p-3 bg-blue-50/50 dark:bg-blue-950/10 rounded-xl border border-blue-100 dark:border-blue-900/30 space-y-2 text-xs">
                  <div>
                    <label className="block text-[10px] font-bold text-[#0B1B3D] dark:text-blue-400 uppercase tracking-wider mb-1">
                      Editar Senha
                    </label>
                    <div className="relative">
                      <Lock className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2" />
                      <input
                        type="text"
                        value={editingPassword}
                        onChange={(e) => setEditingPassword(e.target.value)}
                        className="w-full pl-8 pr-2 py-1.5 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg text-xs font-mono focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-900 dark:text-zinc-100"
                        placeholder="Nova senha"
                        autoFocus
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      onClick={() => {
                        setEditingUserId(null);
                        setEditingPassword('');
                      }}
                      className="text-[10px] font-semibold text-gray-500 hover:text-gray-700 dark:text-zinc-400 dark:hover:text-zinc-200"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={() => {
                        if (editingPassword.trim()) {
                          updateUser({
                            ...u,
                            password: editingPassword.trim()
                          });
                          setEditingUserId(null);
                          setEditingPassword('');
                        }
                      }}
                      className="px-2.5 py-1 bg-[#0B1B3D] hover:bg-[#152952] text-white text-[10px] font-semibold rounded-md shadow-sm transition-colors"
                    >
                      Salvar
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mt-3 p-3 bg-slate-50 dark:bg-zinc-800/40 rounded-xl border border-slate-100 dark:border-zinc-800/60 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 font-medium">Usuário:</span>
                    <span className="font-mono text-gray-700 dark:text-zinc-200 font-medium">{u.username}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <span className="text-gray-400 font-medium">Senha:</span>
                      <button
                        onClick={() => setRevealPassword(prev => ({ ...prev, [u.id]: !prev[u.id] }))}
                        className="p-1 hover:bg-slate-200 dark:hover:bg-zinc-700 rounded text-gray-400 hover:text-gray-600 transition-colors"
                        title={revealPassword[u.id] ? "Ocultar senha" : "Ver senha"}
                      >
                        {revealPassword[u.id] ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                      </button>
                    </div>
                    <span className="font-mono text-gray-700 dark:text-zinc-200 font-medium">
                      {revealPassword[u.id] ? u.password : '••••••••'}
                    </span>
                  </div>
                  <div className="pt-1 flex justify-end">
                    <button
                      onClick={() => {
                        setEditingUserId(u.id);
                        setEditingPassword(u.password);
                      }}
                      className="text-[10px] text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                    >
                      <Edit2 className="w-2.5 h-2.5" />
                      Alterar Senha
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Footer with key info */}
            <div className="mt-4 pt-3 border-t border-slate-50 dark:border-zinc-800/60 flex items-center gap-1.5 text-[11px] text-gray-400">
              <Shield className="w-3.5 h-3.5 text-[#C2B280]" />
              <span>Nível de acesso:</span>
              <strong className="text-gray-600 dark:text-zinc-300">
                {u.role === 'master' ? 'Acesso Completo (Master)' : 'Acesso Padrão'}
              </strong>
            </div>
          </motion.div>
        ))}
      </div>

      {/* User Creation Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
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
                  <UserIcon className="w-5 h-5 text-[#0B1B3D]" />
                  <span>Cadastrar Novo Usuário</span>
                </h3>
              </div>

              <form onSubmit={handleCreateUser} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                    Nome de Usuário (Login) *
                  </label>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Ex: joao.silva"
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0B1B3D]/30 focus:border-[#0B1B3D] text-gray-900 dark:text-zinc-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                    Senha *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Senha numérica ou de texto"
                      className="w-full pl-9 pr-3.5 py-2 bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0B1B3D]/30 focus:border-[#0B1B3D] text-gray-900 dark:text-zinc-100 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                    Nível de Acesso (Cargo) *
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as 'master' | 'comum')}
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0B1B3D]/30 focus:border-[#0B1B3D] text-gray-900 dark:text-zinc-100"
                  >
                    <option value="comum">Comum (Apenas agendar e gerenciar cadastros)</option>
                    <option value="master">Master (Controle total, inclusive gerenciar usuários)</option>
                  </select>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-gray-700 dark:text-zinc-200 text-sm font-semibold rounded-xl transition-all"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#0B1B3D] hover:bg-[#152952] text-white text-sm font-semibold rounded-xl transition-all flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Salvar Usuário</span>
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
