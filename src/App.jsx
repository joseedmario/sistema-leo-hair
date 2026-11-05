import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, Plus, Edit2, Trash2, History, 
  LogOut, Star, Scissors, Calendar, MapPin, Phone, User, X
} from 'lucide-react';

// --- MOCK DATA (Dados Iniciais para Teste) ---
const initialCustomers = [
  { id: '1', name: 'Mariana Costa', dob: '1990-05-15', regDate: '2023-10-01', address: 'Rua das Flores, 123', phone: '(11) 98765-4321' },
  { id: '2', name: 'Sofia Viana', dob: '1985-11-22', regDate: '2023-11-15', address: 'Av. Paulista, 1000, Apto 45', phone: '(11) 91234-5678' },
  { id: '3', name: 'Helena Albuquerque', dob: '1992-03-08', regDate: '2024-01-20', address: 'Rua Augusta, 500', phone: '(11) 99988-7766' },
];

const initialServices = [
  { id: '101', customerId: '1', date: '2023-10-01', description: 'Corte e Escova', points: 3 },
  { id: '102', customerId: '1', date: '2023-12-10', description: 'Colorimetria (Mechas)', points: 3 },
  { id: '103', customerId: '2', date: '2023-11-15', description: 'Tratamento Reconstrutor', points: 3 },
];

export default function App() {
  // --- STATES ---
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [customers, setCustomers] = useState(initialCustomers);
  const [services, setServices] = useState(initialServices);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal States
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null); // null = Novo Cadastro
  
  const [historyModalCustomer, setHistoryModalCustomer] = useState(null);
  
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  // --- DERIVED DATA ---
  const filteredCustomers = useMemo(() => {
    return customers.filter(c => 
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      c.phone.includes(searchTerm)
    );
  }, [customers, searchTerm]);

  const getCustomerPoints = (customerId) => {
    return services.filter(s => s.customerId === customerId).reduce((total, s) => total + s.points, 0);
  };

  // --- HANDLERS ---
  const handleLogin = (e) => {
    e.preventDefault();
    // Simulação de login
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
  };

  const openNewCustomerModal = () => {
    setEditingCustomer(null);
    setIsCustomerModalOpen(true);
  };

  const openEditCustomerModal = (customer) => {
    setEditingCustomer(customer);
    setIsCustomerModalOpen(true);
  };

  const saveCustomer = (customerData) => {
    if (editingCustomer) {
      setCustomers(customers.map(c => c.id === editingCustomer.id ? { ...customerData, id: editingCustomer.id } : c));
    } else {
      setCustomers([...customers, { ...customerData, id: Date.now().toString() }]);
    }
    setIsCustomerModalOpen(false);
  };

  const deleteCustomer = () => {
    setCustomers(customers.filter(c => c.id !== deleteConfirmId));
    setServices(services.filter(s => s.customerId !== deleteConfirmId)); // Apaga serviços vinculados
    setDeleteConfirmId(null);
  };

  const addService = (customerId, description, date) => {
    const newService = {
      id: Date.now().toString(),
      customerId,
      description,
      date,
      points: 3 // Regra de negócio: 3 pontos por serviço
    };
    setServices([newService, ...services]);
  };

  // --- RENDERIZADORES CONDICIONAIS ---
  if (!isAuthenticated) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-zinc-50 font-sans text-zinc-900">
      {/* HEADER */}
      <header className="bg-zinc-950 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Scissors className="w-6 h-6 text-amber-500" />
            <h1 className="text-xl font-light tracking-widest uppercase" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
              Leo <span className="font-semibold">Hair Stylist</span>
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-zinc-400 hidden sm:inline-block">Painel Administrativo</span>
            <button onClick={handleLogout} className="text-zinc-400 hover:text-white transition-colors flex items-center gap-2">
              <LogOut className="w-5 h-5" />
              <span className="text-sm">Sair</span>
            </button>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* TOP BAR: Title & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <h2 className="text-2xl font-semibold text-zinc-800">Clientes Cadastrados</h2>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 w-5 h-5" />
              <input 
                type="text" 
                placeholder="Buscar por nome ou telefone..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full sm:w-72 pl-10 pr-4 py-2 border border-zinc-300 rounded-md focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent"
              />
            </div>
            <button 
              onClick={openNewCustomerModal}
              className="bg-zinc-900 hover:bg-zinc-800 text-white px-4 py-2 rounded-md flex items-center justify-center gap-2 transition-colors whitespace-nowrap"
            >
              <Plus className="w-5 h-5" />
              Novo Cliente
            </button>
          </div>
        </div>

        {/* TABLE */}
        <div className="bg-white rounded-lg shadow-sm border border-zinc-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-100 border-b border-zinc-200 text-sm font-semibold text-zinc-600 uppercase tracking-wider">
                  <th className="px-6 py-4">Nome</th>
                  <th className="px-6 py-4">Telefone</th>
                  <th className="px-6 py-4">Data Nasc.</th>
                  <th className="px-6 py-4">Pontos</th>
                  <th className="px-6 py-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {filteredCustomers.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-8 text-center text-zinc-500">
                      Nenhum cliente encontrado.
                    </td>
                  </tr>
                ) : (
                  filteredCustomers.map(customer => {
                    const points = getCustomerPoints(customer.id);
                    return (
                      <tr key={customer.id} className="hover:bg-zinc-50 transition-colors">
                        <td className="px-6 py-4 font-medium text-zinc-900 flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-zinc-200 flex items-center justify-center text-zinc-600 font-bold">
                            {customer.name.charAt(0)}
                          </div>
                          {customer.name}
                        </td>
                        <td className="px-6 py-4 text-zinc-600">{customer.phone}</td>
                        <td className="px-6 py-4 text-zinc-600">{formatDateBR(customer.dob)}</td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded-full text-xs font-semibold">
                            <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                            {points} pts
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button 
                              onClick={() => setHistoryModalCustomer(customer)}
                              title="Histórico de Serviços"
                              className="p-2 text-zinc-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                            >
                              <History className="w-5 h-5" />
                            </button>
                            <button 
                              onClick={() => openEditCustomerModal(customer)}
                              title="Editar"
                              className="p-2 text-zinc-400 hover:text-amber-600 hover:bg-amber-50 rounded-md transition-colors"
                            >
                              <Edit2 className="w-5 h-5" />
                            </button>
                            <button 
                              onClick={() => setDeleteConfirmId(customer.id)}
                              title="Excluir"
                              className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* MODALS */}
      {isCustomerModalOpen && (
        <CustomerFormModal 
          customer={editingCustomer} 
          onClose={() => setIsCustomerModalOpen(false)} 
          onSave={saveCustomer}
        />
      )}

      {historyModalCustomer && (
        <ServiceHistoryModal 
          customer={historyModalCustomer}
          services={services.filter(s => s.customerId === historyModalCustomer.id)}
          totalPoints={getCustomerPoints(historyModalCustomer.id)}
          onClose={() => setHistoryModalCustomer(null)}
          onAddService={addService}
        />
      )}

      {deleteConfirmId && (
        <DeleteConfirmModal 
          onCancel={() => setDeleteConfirmId(null)}
          onConfirm={deleteCustomer}
        />
      )}
    </div>
  );
}

// --- SUB-COMPONENTS (Telas e Modais) ---

function LoginScreen({ onLogin }) {
  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl p-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-zinc-700 via-zinc-400 to-zinc-700"></div>
        
        <div className="text-center mb-8">
          <h1 className="text-4xl font-light text-white tracking-[0.15em] uppercase" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            Leo<br/>
            <span className="text-xl tracking-widest text-zinc-400">Hair Stylist</span>
          </h1>
          <p className="text-zinc-500 mt-2 text-sm">Acesso ao Sistema Administrativo</p>
        </div>

        <form onSubmit={onLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">E-mail</label>
            <input 
              type="email" 
              required
              defaultValue="admin@leohair.com"
              className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-md text-white focus:outline-none focus:border-zinc-500 transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">Senha</label>
            <input 
              type="password" 
              required
              defaultValue="admin123"
              className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-md text-white focus:outline-none focus:border-zinc-500 transition-colors"
            />
          </div>
          <button 
            type="submit" 
            className="w-full py-3 bg-zinc-100 hover:bg-white text-zinc-950 font-medium uppercase tracking-wider text-sm rounded-md transition-colors"
          >
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
}

function CustomerFormModal({ customer, onClose, onSave }) {
  // Inicializa o formulário com dados do cliente (se for edição) ou vazio (se for novo)
  const today = new Date().toISOString().split('T')[0];
  const [formData, setFormData] = useState({
    name: customer?.name || '',
    dob: customer?.dob || '',
    regDate: customer?.regDate || today,
    address: customer?.address || '',
    phone: customer?.phone || ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center p-6 border-b border-zinc-100">
          <h3 className="text-xl font-semibold text-zinc-800 flex items-center gap-2">
            {customer ? <Edit2 className="w-5 h-5" /> : <User className="w-5 h-5" />}
            {customer ? 'Editar Cliente' : 'Novo Cliente'}
          </h3>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-600">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-zinc-700 mb-1">Nome Completo *</label>
              <input 
                type="text" required
                value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                className="w-full px-3 py-2 border border-zinc-300 rounded-md focus:outline-none focus:ring-2 focus:ring-zinc-900"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">Telefone / WhatsApp *</label>
              <input 
                type="text" required placeholder="(00) 00000-0000"
                value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})}
                className="w-full px-3 py-2 border border-zinc-300 rounded-md focus:outline-none focus:ring-2 focus:ring-zinc-900"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">Data de Nascimento</label>
              <input 
                type="date"
                value={formData.dob} onChange={e => setFormData({...formData, dob: e.target.value})}
                className="w-full px-3 py-2 border border-zinc-300 rounded-md focus:outline-none focus:ring-2 focus:ring-zinc-900"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-zinc-700 mb-1">Endereço Completo</label>
              <input 
                type="text"
                value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})}
                className="w-full px-3 py-2 border border-zinc-300 rounded-md focus:outline-none focus:ring-2 focus:ring-zinc-900"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-zinc-700 mb-1">Data de Cadastro</label>
              <input 
                type="date" required
                value={formData.regDate} onChange={e => setFormData({...formData, regDate: e.target.value})}
                className="w-full px-3 py-2 border border-zinc-300 rounded-md focus:outline-none focus:ring-2 focus:ring-zinc-900"
              />
            </div>
          </div>

          <div className="mt-8 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 border border-zinc-300 text-zinc-700 rounded-md hover:bg-zinc-50">
              Cancelar
            </button>
            <button type="submit" className="px-4 py-2 bg-zinc-900 text-white rounded-md hover:bg-zinc-800">
              Salvar Cliente
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ServiceHistoryModal({ customer, services, totalPoints, onClose, onAddService }) {
  const [isAdding, setIsAdding] = useState(false);
  const [newDesc, setNewDesc] = useState('');
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);

  const handleAdd = (e) => {
    e.preventDefault();
    if(newDesc.trim() === '') return;
    onAddService(customer.id, newDesc, newDate);
    setNewDesc('');
    setIsAdding(false);
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-zinc-50 rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
        
        {/* Modal Header */}
        <div className="bg-zinc-950 text-white p-6 flex justify-between items-start">
          <div>
            <h3 className="text-2xl font-light mb-1" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
              Perfil de {customer.name}
            </h3>
            <div className="flex gap-4 text-sm text-zinc-400 mt-2">
              <span className="flex items-center gap-1"><Phone className="w-4 h-4"/> {customer.phone}</span>
              <span className="flex items-center gap-1"><Calendar className="w-4 h-4"/> Cliente desde {formatDateBR(customer.regDate)}</span>
            </div>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Dashboard de Pontos */}
        <div className="bg-white border-b border-zinc-200 p-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-amber-100 rounded-full flex items-center justify-center">
              <Star className="w-8 h-8 text-amber-500 fill-amber-500" />
            </div>
            <div>
              <p className="text-sm text-zinc-500 uppercase tracking-wider font-semibold">Pontos Acumulados</p>
              <p className="text-3xl font-bold text-zinc-900">{totalPoints}</p>
            </div>
          </div>
          <button 
            onClick={() => setIsAdding(!isAdding)}
            className="bg-zinc-900 hover:bg-zinc-800 text-white px-4 py-2 rounded-md flex items-center gap-2 transition-colors"
          >
            {isAdding ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {isAdding ? 'Cancelar' : 'Adicionar Serviço'}
          </button>
        </div>

        {/* Formulário Novo Serviço */}
        {isAdding && (
          <form onSubmit={handleAdd} className="bg-zinc-100 p-6 border-b border-zinc-200 flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-zinc-700 mb-1">Descrição do Serviço</label>
              <input 
                type="text" required placeholder="Ex: Corte, Coloração, Penteado..."
                value={newDesc} onChange={e => setNewDesc(e.target.value)}
                className="w-full px-3 py-2 border border-zinc-300 rounded-md focus:outline-none focus:ring-2 focus:ring-zinc-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">Data</label>
              <input 
                type="date" required
                value={newDate} onChange={e => setNewDate(e.target.value)}
                className="w-full px-3 py-2 border border-zinc-300 rounded-md focus:outline-none focus:ring-2 focus:ring-zinc-900"
              />
            </div>
            <button type="submit" className="px-6 py-2 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-md transition-colors">
              Salvar (+3 pts)
            </button>
          </form>
        )}

        {/* Tabela de Histórico */}
        <div className="overflow-y-auto p-6 flex-1 bg-zinc-50">
          <h4 className="font-semibold text-zinc-800 mb-4 flex items-center gap-2">
            <History className="w-5 h-5 text-zinc-500"/> Histórico de Serviços
          </h4>
          
          {services.length === 0 ? (
            <p className="text-zinc-500 text-center py-8 bg-white rounded-lg border border-dashed border-zinc-300">
              Nenhum serviço registrado para este cliente ainda.
            </p>
          ) : (
            <div className="bg-white rounded-lg border border-zinc-200 overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-zinc-50 border-b border-zinc-200">
                  <tr>
                    <th className="px-4 py-3 font-medium text-zinc-600">Data</th>
                    <th className="px-4 py-3 font-medium text-zinc-600">Serviço Realizado</th>
                    <th className="px-4 py-3 font-medium text-zinc-600 text-right">Pontos Gerados</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {services.sort((a,b) => new Date(b.date) - new Date(a.date)).map(service => (
                    <tr key={service.id} className="hover:bg-zinc-50">
                      <td className="px-4 py-3 text-zinc-600">{formatDateBR(service.date)}</td>
                      <td className="px-4 py-3 font-medium text-zinc-900">{service.description}</td>
                      <td className="px-4 py-3 text-right">
                        <span className="text-amber-600 font-semibold">+{service.points}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function DeleteConfirmModal({ onCancel, onConfirm }) {
  return (
    <div className="fixed inset-0 bg-black/40 z-[60] flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-sm w-full p-6 text-center animate-in zoom-in-95 duration-200">
        <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <Trash2 className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-semibold text-zinc-900 mb-2">Excluir Cliente?</h3>
        <p className="text-zinc-500 text-sm mb-6">
          Tem certeza que deseja excluir este cliente? O histórico de serviços e os pontos acumulados também serão apagados. Esta ação não pode ser desfeita.
        </p>
        <div className="flex gap-3 justify-center">
          <button onClick={onCancel} className="px-4 py-2 border border-zinc-300 text-zinc-700 rounded-md hover:bg-zinc-50 w-full">
            Cancelar
          </button>
          <button onClick={onConfirm} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 w-full">
            Sim, excluir
          </button>
        </div>
      </div>
    </div>
  );
}

// --- UTILITÁRIOS ---
function formatDateBR(dateString) {
  if (!dateString) return '-';
  const [year, month, day] = dateString.split('-');
  return `${day}/${month}/${year}`;
}