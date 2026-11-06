import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  onSnapshot, 
  doc, 
  updateDoc, 
  deleteDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { 
  Users, 
  UserPlus, 
  Scissors, 
  Award, 
  Search, 
  Trash2, 
  PlusCircle, 
  Phone, 
  LogOut, 
  Lock, 
  Mail, 
  Sparkles,
  Edit2,
  Check,
  X,
  History,
  Calendar,
  MapPin,
  FileText
} from 'lucide-react';

// Chaves reais do seu projeto no Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCyxBCU3RQfLx7mp82mqeH3HBmFp6YWgIQ",
  authDomain: "leo-hair-stylist.firebaseapp.com",
  projectId: "leo-hair-stylist",
  storageBucket: "leo-hair-stylist.firebasestorage.app",
  messagingSenderId: "631608912841",
  appId: "1:631608912841:web:d94d65b4f27526f6351618",
  measurementId: "G-HKP617EV8V"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Novo Cliente
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newBirthDate, setNewBirthDate] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [newNotes, setNewNotes] = useState('');

  // Edição de Cliente
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editBirthDate, setEditBirthDate] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editNotes, setEditNotes] = useState('');

  // Novo Serviço Detalhado
  const [selectedClientForService, setSelectedClientForService] = useState(null);
  const [serviceType, setServiceType] = useState('Corte de Cabelo');
  const [serviceDetails, setServiceDetails] = useState('');
  const [serviceValue, setServiceValue] = useState('35,00');

  useEffect(() => {
    if (!isAuthenticated) return;

    const unsubscribe = onSnapshot(collection(db, 'clients'), (snapshot) => {
      const clientList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setClients(clientList);
      setLoading(false);
    }, (error) => {
      console.error("Erro ao buscar clientes:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [isAuthenticated]);

  const handleLogin = (e) => {
    e.preventDefault();
    if (email === 'admin@leohair.com' && password === '123456') {
      setIsAuthenticated(true);
      setLoginError('');
    } else {
      setLoginError('E-mail ou senha incorretos! Tente admin@leohair.com / 123456');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setEmail('');
    setPassword('');
  };

  // Cadastrar Amigo com Novos Campos
  const handleAddClient = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;

    try {
      await addDoc(collection(db, 'clients'), {
        name: newName,
        phone: newPhone || 'Não informado',
        birthDate: newBirthDate || '',
        address: newAddress || '',
        notes: newNotes || '',
        points: 10,
        servicesHistory: [],
        createdAt: serverTimestamp()
      });
      setNewName('');
      setNewPhone('');
      setNewBirthDate('');
      setNewAddress('');
      setNewNotes('');
    } catch (error) {
      console.error("Erro ao adicionar cliente:", error);
    }
  };

  // Iniciar Edição
  const startEditing = (client) => {
    setEditingId(client.id);
    setEditName(client.name);
    setEditPhone(client.phone);
    setEditBirthDate(client.birthDate || '');
    setEditAddress(client.address || '');
    setEditNotes(client.notes || '');
  };

  // Salvar Edição
  const handleSaveEdit = async (id) => {
    try {
      const clientRef = doc(db, 'clients', id);
      await updateDoc(clientRef, {
        name: editName,
        phone: editPhone,
        birthDate: editBirthDate,
        address: editAddress,
        notes: editNotes
      });
      setEditingId(null);
    } catch (error) {
      console.error("Erro ao editar cliente:", error);
    }
  };

  // Registrar Serviço Detalhado
  const handleSaveService = async (e) => {
    e.preventDefault();
    if (!selectedClientForService) return;

    const client = selectedClientForService;
    const newService = {
      type: serviceType,
      details: serviceDetails,
      price: serviceValue,
      date: new Date().toLocaleDateString('pt-BR')
    };

    const updatedHistory = [...(client.servicesHistory || []), newService];

    try {
      const clientRef = doc(db, 'clients', client.id);
      await updateDoc(clientRef, {
        points: (client.points || 0) + 10,
        servicesHistory: updatedHistory
      });
      setSelectedClientForService(null);
      setServiceType('Corte de Cabelo');
      setServiceDetails('');
      setServiceValue('35,00');
    } catch (error) {
      console.error("Erro ao adicionar serviço:", error);
    }
  };

  const handleRedeemReward = async (id, currentPoints) => {
    if (currentPoints < 100) return;
    try {
      const clientRef = doc(db, 'clients', id);
      await updateDoc(clientRef, {
        points: currentPoints - 100
      });
    } catch (error) {
      console.error("Erro ao resgatar recompensa:", error);
    }
  };

  const handleDeleteClient = async (id) => {
    if (window.confirm("Deseja realmente remover este amigo do cadastro?")) {
      try {
        await deleteDoc(doc(db, 'clients', id));
      } catch (error) {
        console.error("Erro ao eliminar cliente:", error);
      }
    }
  };

  const filteredClients = clients.filter(client => 
    client.name.toLowerCase().includes(search.toLowerCase()) ||
    client.phone.includes(search)
  );

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-neutral-900 border border-amber-500/20 rounded-2xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-500/10 border border-amber-500/30 rounded-full mb-4">
              <Scissors className="w-8 h-8 text-amber-500" />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-wide">LEO HAIR STYLIST</h1>
            <p className="text-neutral-400 text-sm mt-1">Acesso ao Painel Administrativo</p>
          </div>

          {loginError && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs p-3 rounded-lg mb-6 text-center">
              {loginError}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1">E-mail</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@leohair.com"
                  required
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1">Senha</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-amber-500 hover:bg-amber-600 text-neutral-950 font-semibold py-2.5 rounded-lg transition-colors mt-6 shadow-lg shadow-amber-500/10"
            >
              Entrar no Sistema
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col">
      <header className="border-b border-neutral-800 bg-neutral-900/50 backdrop-blur sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-amber-500/10 border border-amber-500/30 rounded-lg flex items-center justify-center">
              <Scissors className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <h1 className="font-bold text-lg text-white">LEO HAIR STYLIST</h1>
              <p className="text-xs text-neutral-400">Gestão de Clientes e Serviços</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 text-xs bg-neutral-800 hover:bg-neutral-700 text-neutral-300 px-3 py-2 rounded-lg transition-colors border border-neutral-700"
          >
            <LogOut className="w-4 h-4" />
            <span>Sair</span>
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8 space-y-8">
        
        {/* Formulário Completo de Cadastro */}
        <section className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
          <h2 className="text-sm font-semibold text-amber-500 flex items-center gap-2 mb-4">
            <UserPlus className="w-4 h-4" /> Cadastrar Novo Amigo / Cliente
          </h2>
          <form onSubmit={handleAddClient} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                type="text"
                placeholder="Nome completo (ex: Lourenço)"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                required
              />
              <input
                type="text"
                placeholder="Telefone (opcional)"
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
                className="bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
              />
              <input
                type="date"
                title="Data de Nascimento"
                value={newBirthDate}
                onChange={(e) => setNewBirthDate(e.target.value)}
                className="bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Endereço (Rua, Bairro...)"
                value={newAddress}
                onChange={(e) => setNewAddress(e.target.value)}
                className="bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
              />
              <input
                type="text"
                placeholder="Observações (ex: gosta de café sem açúcar, prefere degradê alto...)"
                value={newNotes}
                onChange={(e) => setNewNotes(e.target.value)}
                className="bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <button
              type="submit"
              className="w-full md:w-auto bg-amber-500 hover:bg-amber-600 text-neutral-950 font-medium px-6 py-2 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm font-semibold"
            >
              <PlusCircle className="w-4 h-4" /> Salvar Cadastro Completo
            </button>
          </form>
        </section>

        {/* Modal Registrar Serviço Detalhado */}
        {selectedClientForService && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-neutral-900 border border-amber-500/30 rounded-2xl p-6 max-w-md w-full space-y-4">
              <div className="flex justify-between items-center border-b border-neutral-800 pb-3">
                <h3 className="font-bold text-white flex items-center gap-2">
                  <Scissors className="w-4 h-4 text-amber-500" /> Serviço para {selectedClientForService.name}
                </h3>
                <button onClick={() => setSelectedClientForService(null)} className="text-neutral-500 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveService} className="space-y-4">
                <div>
                  <label className="block text-xs text-neutral-400 mb-1">Tipo de Serviço</label>
                  <input
                    type="text"
                    value={serviceType}
                    onChange={(e) => setServiceType(e.target.value)}
                    placeholder="Ex: Corte, Barba, Hidratação..."
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs text-neutral-400 mb-1">Descrição Detalhada do Serviço</label>
                  <textarea
                    rows={3}
                    value={serviceDetails}
                    onChange={(e) => setServiceDetails(e.target.value)}
                    placeholder="Descreva exatamente o que foi feito (ex: Corte degradê navalhado, alinhamento de barba com toalha quente e pomada mate)"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs text-neutral-400 mb-1">Valor (R$)</label>
                  <input
                    type="text"
                    value={serviceValue}
                    onChange={(e) => setServiceValue(e.target.value)}
                    placeholder="35,00"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedClientForService(null)}
                    className="flex-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 py-2 rounded-lg text-xs"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-amber-500 hover:bg-amber-600 text-neutral-950 font-semibold py-2 rounded-lg text-xs"
                  >
                    Salvar e Somar +10 Pts
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Lista de Amigos */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-amber-500" /> Amigos Cadastrados ({clients.length})
            </h2>

            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
              <input
                type="text"
                placeholder="Buscar por nome ou telefone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-neutral-900 border border-neutral-800 rounded-lg pl-9 pr-4 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12 text-neutral-500 text-sm">Carregando dados da nuvem...</div>
          ) : filteredClients.length === 0 ? (
            <div className="text-center py-12 bg-neutral-900/50 border border-neutral-800 rounded-xl text-neutral-500 text-sm">
              Nenhum amigo encontrado.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredClients.map((client) => (
                <div key={client.id} className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 flex flex-col justify-between space-y-4">
                  
                  {/* Nome e Edição */}
                  <div>
                    {editingId === client.id ? (
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          placeholder="Nome"
                          className="w-full bg-neutral-950 border border-amber-500/50 rounded px-2 py-1 text-xs text-white"
                        />
                        <input
                          type="text"
                          value={editPhone}
                          onChange={(e) => setEditPhone(e.target.value)}
                          placeholder="Telefone"
                          className="w-full bg-neutral-950 border border-amber-500/50 rounded px-2 py-1 text-xs text-white"
                        />
                        <input
                          type="date"
                          value={editBirthDate}
                          onChange={(e) => setEditBirthDate(e.target.value)}
                          className="w-full bg-neutral-950 border border-amber-500/50 rounded px-2 py-1 text-xs text-white"
                        />
                        <input
                          type="text"
                          value={editAddress}
                          onChange={(e) => setEditAddress(e.target.value)}
                          placeholder="Endereço"
                          className="w-full bg-neutral-950 border border-amber-500/50 rounded px-2 py-1 text-xs text-white"
                        />
                        <input
                          type="text"
                          value={editNotes}
                          onChange={(e) => setEditNotes(e.target.value)}
                          placeholder="Observações"
                          className="w-full bg-neutral-950 border border-amber-500/50 rounded px-2 py-1 text-xs text-white"
                        />
                        <div className="flex gap-2 pt-1">
                          <button
                            onClick={() => handleSaveEdit(client.id)}
                            className="bg-amber-500 text-neutral-950 px-2 py-1 rounded text-xs flex items-center gap-1 font-semibold"
                          >
                            <Check className="w-3 h-3" /> Salvar
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="bg-neutral-800 text-neutral-400 px-2 py-1 rounded text-xs"
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="flex justify-between items-start">
                          <h3 className="font-bold text-base text-white">{client.name}</h3>
                          <div className="flex gap-2">
                            <button
                              onClick={() => startEditing(client)}
                              className="text-neutral-500 hover:text-amber-500 transition-colors"
                              title="Editar amigo"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteClient(client.id)}
                              className="text-neutral-500 hover:text-red-400 transition-colors"
                              title="Remover"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Dados Detalhados */}
                        <div className="mt-2 space-y-1 text-xs text-neutral-400">
                          <p className="flex items-center gap-1.5">
                            <Phone className="w-3.5 h-3.5 text-neutral-500" /> {client.phone}
                          </p>
                          {client.birthDate && (
                            <p className="flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5 text-neutral-500" /> Nasc: {client.birthDate}
                            </p>
                          )}
                          {client.address && (
                            <p className="flex items-center gap-1.5">
                              <MapPin className="w-3.5 h-3.5 text-neutral-500" /> {client.address}
                            </p>
                          )}
                          {client.notes && (
                            <p className="flex items-start gap-1.5 text-amber-400/90 italic bg-amber-500/5 p-1.5 rounded border border-amber-500/10 mt-2">
                              <FileText className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" /> {client.notes}
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Cartão de Pontos */}
                  <div className="bg-neutral-950 border border-neutral-800/80 rounded-lg p-3 space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-neutral-400 flex items-center gap-1">
                        <Award className="w-3.5 h-3.5 text-amber-500" /> Pontos Fidelidade
                      </span>
                      <span className="font-bold text-amber-500">{client.points || 0} pts</span>
                    </div>

                    <div className="w-full bg-neutral-800 h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-amber-500 h-full transition-all duration-300"
                        style={{ width: `${Math.min(((client.points || 0) / 100) * 100, 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Histórico Detalhado */}
                  {client.servicesHistory && client.servicesHistory.length > 0 && (
                    <div className="bg-neutral-950/50 rounded-lg p-2.5 border border-neutral-800/40 text-xs space-y-2 max-h-32 overflow-y-auto">
                      <span className="text-neutral-400 font-semibold flex items-center gap-1 text-[11px]">
                        <History className="w-3 h-3 text-amber-500" /> Histórico de Serviços:
                      </span>
                      {client.servicesHistory.map((srv, idx) => (
                        <div key={idx} className="border-b border-neutral-800/50 pb-1.5 last:border-0 last:pb-0 text-[11px]">
                          <div className="flex justify-between font-medium text-neutral-200">
                            <span>{srv.type}</span>
                            <span className="text-amber-500">R$ {srv.price}</span>
                          </div>
                          {srv.details && (
                            <p className="text-[10px] text-neutral-400 mt-0.5">{srv.details}</p>
                          )}
                          <span className="text-[9px] text-neutral-600 block mt-0.5">{srv.date}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Botões de Ação */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedClientForService(client)}
                      className="flex-1 bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 text-amber-400 text-xs font-medium py-2 rounded-lg transition-colors flex items-center justify-center gap-1"
                    >
                      <Scissors className="w-3.5 h-3.5" /> + Serviço
                    </button>

                    <button
                      onClick={() => handleRedeemReward(client.id, client.points || 0)}
                      disabled={(client.points || 0) < 100}
                      className={`flex-1 text-xs font-medium py-2 rounded-lg transition-colors flex items-center justify-center gap-1 ${
                        (client.points || 0) >= 100 
                          ? 'bg-amber-500 hover:bg-amber-600 text-neutral-950 font-semibold' 
                          : 'bg-neutral-800/50 text-neutral-600 cursor-not-allowed'
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5" /> Resgatar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
