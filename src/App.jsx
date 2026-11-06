import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInAnonymously, 
  signInWithCustomToken, 
  onAuthStateChanged 
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  doc, 
  deleteDoc, 
  arrayUnion, 
  serverTimestamp 
} from 'firebase/firestore';
import { 
  Scissors, 
  UserPlus, 
  Search, 
  Award, 
  History, 
  PlusCircle, 
  Trash2, 
  Phone, 
  Calendar, 
  Star, 
  Gift, 
  CheckCircle2, 
  Sparkles,
  Users,
  DollarSign,
  Info
} from 'lucide-react';

// -----------------------------------------------------------------------------
// Configuração do Firebase & Inicialização
// -----------------------------------------------------------------------------
const firebaseConfig = typeof __firebase_config !== 'undefined' 
  ? JSON.parse(__firebase_config) 
  : {
      apiKey: "demo-api-key",
      authDomain: "demo-app.firebaseapp.com",
      projectId: "demo-app",
      storageBucket: "demo-app.appspot.com",
      messagingSenderId: "123456789",
      appId: "1:123456789:web:demo"
    };

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'leo-hair-stylist';

export default function App() {
  // -----------------------------------------------------------------------------
  // Estados Globais e Autenticação
  // -----------------------------------------------------------------------------
  const [user, setUser] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [clients, setClients] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  
  // Estados de Interface
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClient, setSelectedClient] = useState(null);
  const [isAddClientModalOpen, setIsAddClientModalOpen] = useState(false);
  const [isAddServiceModalOpen, setIsAddServiceModalOpen] = useState(false);
  
  // Formulários
  const [newClient, setNewClient] = useState({ name: '', phone: '', birthday: '', notes: '' });
  const [newService, setNewService] = useState({ serviceName: 'Corte Masculino', price: 40, points: 10, notes: '' });

  // -----------------------------------------------------------------------------
  // 1. Efeito de Autenticação Automática
  // -----------------------------------------------------------------------------
  useEffect(() => {
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (err) {
        console.error("Erro na autenticação Firebase:", err);
      }
    };
    
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoadingAuth(false);
    });

    return () => unsubscribe();
  }, []);

  // -----------------------------------------------------------------------------
  // 2. Efeito de Leitura dos Clientes do Firestore em Tempo Real
  // -----------------------------------------------------------------------------
  useEffect(() => {
    if (!user) return;

    setLoadingData(true);
    // Coleção pública conforme Regra 1
    const clientsRef = collection(db, 'artifacts', appId, 'public', 'data', 'clients');

    const unsubscribe = onSnapshot(
      clientsRef,
      (snapshot) => {
        const clientList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        // Ordena por nome na memória JS (Regra 2: Sem queries complexas no Firestore)
        clientList.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        
        setClients(clientList);
        
        // Atualiza a seleção atual se houver cliente selecionado
        if (selectedClient) {
          const updatedSelected = clientList.find(c => c.id === selectedClient.id);
          if (updatedSelected) {
            setSelectedClient(updatedSelected);
          }
        }
        
        setLoadingData(false);
      },
      (error) => {
        console.error("Erro ao escutar clientes no Firestore:", error);
        setLoadingData(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  // -----------------------------------------------------------------------------
  // Ações do Banco de Dados (Firestore)
  // -----------------------------------------------------------------------------
  
  // Adicionar Novo Cliente / Amigo
  const handleAddClient = async (e) => {
    e.preventDefault();
    if (!newClient.name.trim() || !user) return;

    try {
      const clientsRef = collection(db, 'artifacts', appId, 'public', 'data', 'clients');
      await addDoc(clientsRef, {
        name: newClient.name,
        phone: newClient.phone || '',
        birthday: newClient.birthday || '',
        notes: newClient.notes || '',
        points: 0,
        history: [],
        createdAt: serverTimestamp()
      });

      setNewClient({ name: '', phone: '', birthday: '', notes: '' });
      setIsAddClientModalOpen(false);
    } catch (error) {
      console.error("Erro ao salvar cliente:", error);
    }
  };

  // Registrar Novo Serviço / Acumular Pontos
  const handleAddService = async (e) => {
    e.preventDefault();
    if (!selectedClient || !user) return;

    try {
      const clientRef = doc(db, 'artifacts', appId, 'public', 'data', 'clients', selectedClient.id);
      
      const serviceEntry = {
        id: Date.now().toString(),
        serviceName: newService.serviceName,
        price: Number(newService.price) || 0,
        pointsEarned: Number(newService.points) || 0,
        date: new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
        notes: newService.notes
      };

      const newTotalPoints = (selectedClient.points || 0) + Number(newService.points);

      await updateDoc(clientRef, {
        points: newTotalPoints,
        history: arrayUnion(serviceEntry)
      });

      setIsAddServiceModalOpen(false);
      setNewService({ serviceName: 'Corte Masculino', price: 40, points: 10, notes: '' });
    } catch (error) {
      console.error("Erro ao registrar serviço:", error);
    }
  };

  // Resgatar Recompensa de Fidelidade (Ex: Trocar 100 Pontos por Corte Grátis)
  const handleRedeemReward = async (pointsCost, rewardName) => {
    if (!selectedClient || (selectedClient.points || 0) < pointsCost || !user) return;

    try {
      const clientRef = doc(db, 'artifacts', appId, 'public', 'data', 'clients', selectedClient.id);
      
      const redemptionEntry = {
        id: Date.now().toString(),
        serviceName: `🎁 Resgate: ${rewardName}`,
        price: 0,
        pointsEarned: -pointsCost,
        date: new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
        notes: 'Recompensa de Fidelidade Resgatada!'
      };

      await updateDoc(clientRef, {
        points: selectedClient.points - pointsCost,
        history: arrayUnion(redemptionEntry)
      });
    } catch (error) {
      console.error("Erro ao resgatar pontos:", error);
    }
  };

  // Excluir Cliente
  const handleDeleteClient = async (clientId) => {
    if (!user) return;
    try {
      const clientRef = doc(db, 'artifacts', appId, 'public', 'data', 'clients', clientId);
      await deleteDoc(clientRef);
      if (selectedClient?.id === clientId) {
        setSelectedClient(null);
      }
    } catch (error) {
      console.error("Erro ao remover cliente:", error);
    }
  };

  // Filtragem de clientes por busca
  const filteredClients = clients.filter(client => 
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (client.phone && client.phone.includes(searchTerm))
  );

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 font-sans flex flex-col">
      {/* -----------------------------------------------------------------------------
          Header / Barra Superior
         ----------------------------------------------------------------------------- */}
      <header className="bg-neutral-900 border-b border-amber-500/20 sticky top-0 z-20 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-tr from-amber-600 to-amber-400 p-2.5 rounded-xl text-neutral-950 shadow-md shadow-amber-500/10">
              <Scissors className="h-7 w-7 stroke-[2.5]" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                Leo Hair Stylist
                <span className="text-xs bg-amber-500/10 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-full font-normal">
                  VIP Club
                </span>
              </h1>
              <p className="text-xs text-neutral-400">Sistema de Gestão & Fidelidade Nuvem</p>
            </div>
          </div>

          <button
            onClick={() => setIsAddClientModalOpen(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-neutral-950 font-semibold px-4 py-2.5 rounded-xl transition duration-200 shadow-md shadow-amber-500/20 active:scale-95"
          >
            <UserPlus className="w-5 h-5" />
            <span className="hidden sm:inline">Cadastrar Amigo</span>
          </button>
        </div>
      </header>

      {/* -----------------------------------------------------------------------------
          Conteúdo Principal
         ----------------------------------------------------------------------------- */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* COLUNA DA ESQUERDA: Busca e Lista de Clientes (5 colunas no Desktop) */}
        <section className="lg:col-span-5 flex flex-col gap-4">
          
          {/* Card Estatísticas Rápidas */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-neutral-900/80 border border-neutral-800 p-4 rounded-2xl flex items-center gap-3">
              <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-neutral-400">Amigos/Clientes</p>
                <p className="text-xl font-bold text-white">{clients.length}</p>
              </div>
            </div>
            <div className="bg-neutral-900/80 border border-neutral-800 p-4 rounded-2xl flex items-center gap-3">
              <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-neutral-400">Total de Pontos</p>
                <p className="text-xl font-bold text-white">
                  {clients.reduce((acc, c) => acc + (c.points || 0), 0)}
                </p>
              </div>
            </div>
          </div>

          {/* Campo de Busca */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
            <input
              type="text"
              placeholder="Buscar amigo por nome ou telefone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-neutral-900 border border-neutral-800 focus:border-amber-500 text-white rounded-xl pl-11 pr-4 py-3 outline-none transition duration-200 placeholder:text-neutral-500"
            />
          </div>

          {/* Lista de Clientes */}
          <div className="bg-neutral-900/50 border border-neutral-800/80 rounded-2xl p-4 flex-1 flex flex-col min-h-[400px]">
            <h2 className="text-sm font-semibold text-neutral-400 uppercase tracking-wider mb-3 px-1">
              Clientes Cadastrados ({filteredClients.length})
            </h2>

            {loadingData ? (
              <div className="flex-1 flex items-center justify-center text-neutral-500">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
              </div>
            ) : filteredClients.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-neutral-500">
                <Users className="w-12 h-12 mb-2 stroke-[1.5] text-neutral-600" />
                <p className="text-sm">Nenhum amigo encontrado.</p>
                <p className="text-xs mt-1 text-neutral-600">Clique em "Cadastrar Amigo" para salvar o primeiro!</p>
              </div>
            ) : (
              <div className="space-y-2 overflow-y-auto max-h-[600px] pr-1 custom-scrollbar">
                {filteredClients.map((client) => {
                  const isSelected = selectedClient?.id === client.id;
                  return (
                    <div
                      key={client.id}
                      onClick={() => setSelectedClient(client)}
                      className={`p-4 rounded-xl border transition cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? 'bg-neutral-800 border-amber-500/50 shadow-md shadow-amber-500/5'
                          : 'bg-neutral-900/90 border-neutral-800/70 hover:border-neutral-700 hover:bg-neutral-800/50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                          isSelected ? 'bg-amber-500 text-neutral-950' : 'bg-neutral-800 text-amber-400 border border-neutral-700'
                        }`}>
                          {client.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="font-semibold text-white text-base leading-snug">{client.name}</h3>
                          <div className="flex items-center gap-3 text-xs text-neutral-400 mt-0.5">
                            {client.phone && (
                              <span className="flex items-center gap-1">
                                <Phone className="w-3 h-3" />
                                {client.phone}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
                          <Star className="w-3.5 h-3.5 fill-amber-400" />
                          {client.points || 0} pts
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* COLUNA DA DIREITA: Detalhes do Cliente Selecionado & Cartão de Fidelidade (7 colunas no Desktop) */}
        <section className="lg:col-span-7">
          {selectedClient ? (
            <div className="space-y-6">
              
              {/* Header do Cliente Selecionado */}
              <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 relative overflow-hidden shadow-xl">
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none"></div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-5">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-300 text-neutral-950 font-extrabold text-2xl flex items-center justify-center shadow-lg shadow-amber-500/20">
                      {selectedClient.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">{selectedClient.name}</h2>
                      <div className="flex flex-wrap items-center gap-4 text-xs text-neutral-400 mt-1">
                        {selectedClient.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="w-3.5 h-3.5 text-amber-500" />
                            {selectedClient.phone}
                          </span>
                        )}
                        {selectedClient.birthday && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-amber-500" />
                            {selectedClient.birthday}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsAddServiceModalOpen(true)}
                      className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-semibold px-4 py-2 rounded-xl text-sm transition shadow-md shadow-amber-500/10"
                    >
                      <PlusCircle className="w-4 h-4" />
                      Novo Corte / Serviço
                    </button>
                    <button
                      onClick={() => handleDeleteClient(selectedClient.id)}
                      title="Excluir Amigo"
                      className="p-2 text-neutral-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Observações */}
                {selectedClient.notes && (
                  <div className="mt-4 bg-neutral-950/60 p-3 rounded-xl border border-neutral-800 text-xs text-neutral-300 flex items-start gap-2">
                    <Info className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <p><span className="font-semibold text-neutral-400">Obs:</span> {selectedClient.notes}</p>
                  </div>
                )}
              </div>

              {/* Cartão de Fidelidade Digital */}
              <div className="bg-gradient-to-br from-neutral-900 via-neutral-900 to-amber-950/40 border border-amber-500/30 rounded-2xl p-6 relative shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-amber-400" />
                    <h3 className="font-bold text-white text-lg">Cartão Fidelidade VIP</h3>
                  </div>
                  <span className="text-amber-400 font-bold text-xl flex items-center gap-1 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
                    <Star className="w-5 h-5 fill-amber-400" />
                    {selectedClient.points || 0} PTS
                  </span>
                </div>

                <p className="text-xs text-neutral-400 mb-6">
                  Acumule pontos a cada visita no Leo Hair Stylist e troque por cortes e prêmios exclusivos!
                </p>

                {/* Opções de Resgate */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="bg-neutral-950/80 border border-neutral-800 p-3.5 rounded-xl flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-white text-sm">Corte Grátis</p>
                      <p className="text-xs text-amber-400 font-medium">100 Pontos</p>
                    </div>
                    <button
                      onClick={() => handleRedeemReward(100, 'Corte Grátis')}
                      disabled={(selectedClient.points || 0) < 100}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                        (selectedClient.points || 0) >= 100
                          ? 'bg-amber-500 hover:bg-amber-400 text-neutral-950 cursor-pointer'
                          : 'bg-neutral-800 text-neutral-600 cursor-not-allowed'
                      }`}
                    >
                      Resgatar
                    </button>
                  </div>

                  <div className="bg-neutral-950/80 border border-neutral-800 p-3.5 rounded-xl flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-white text-sm">Barba ou Hidratação</p>
                      <p className="text-xs text-amber-400 font-medium">60 Pontos</p>
                    </div>
                    <button
                      onClick={() => handleRedeemReward(60, 'Barba ou Hidratação')}
                      disabled={(selectedClient.points || 0) < 60}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                        (selectedClient.points || 0) >= 60
                          ? 'bg-amber-500 hover:bg-amber-400 text-neutral-950 cursor-pointer'
                          : 'bg-neutral-800 text-neutral-600 cursor-not-allowed'
                      }`}
                    >
                      Resgatar
                    </button>
                  </div>
                </div>
              </div>

              {/* Histórico de Serviços */}
              <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-xl">
                <div className="flex items-center gap-2 mb-4 border-b border-neutral-800 pb-3">
                  <History className="w-5 h-5 text-amber-500" />
                  <h3 className="font-bold text-white text-lg">Histórico de Atendimentos</h3>
                </div>

                {!selectedClient.history || selectedClient.history.length === 0 ? (
                  <div className="text-center py-8 text-neutral-500 text-sm">
                    Nenhum serviço registrado para este amigo ainda.
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                    {[...selectedClient.history].reverse().map((item) => (
                      <div
                        key={item.id}
                        className="bg-neutral-950/60 border border-neutral-800/80 p-3.5 rounded-xl flex items-center justify-between"
                      >
                        <div>
                          <p className="font-semibold text-white text-sm">{item.serviceName}</p>
                          <p className="text-xs text-neutral-400 mt-0.5">{item.date}</p>
                          {item.notes && <p className="text-xs text-neutral-500 italic mt-1">{item.notes}</p>}
                        </div>

                        <div className="text-right">
                          <p className="font-bold text-white text-sm">
                            {item.price > 0 ? `R$ ${item.price.toFixed(2)}` : 'GRÁTIS'}
                          </p>
                          <span className={`text-xs font-semibold flex items-center justify-end gap-1 ${
                            item.pointsEarned >= 0 ? 'text-amber-400' : 'text-emerald-400'
                          }`}>
                            {item.pointsEarned >= 0 ? `+${item.pointsEarned} pts` : `${item.pointsEarned} pts`}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          ) : (
            /* Estado quando nenhum cliente está selecionado */
            <div className="bg-neutral-900/50 border border-neutral-800 rounded-2xl p-12 text-center flex flex-col items-center justify-center min-h-[400px]">
              <div className="w-16 h-16 bg-neutral-800 rounded-full flex items-center justify-center text-amber-500 mb-4">
                <Scissors className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-white">Selecione um Amigo</h3>
              <p className="text-sm text-neutral-400 max-w-sm mt-1">
                Escolha um cliente da lista à esquerda para ver os pontos acumulados, resgatar recompensas ou registrar um novo corte.
              </p>
            </div>
          )}
        </section>
      </main>

      {/* -----------------------------------------------------------------------------
          MODAL 1: Cadastrar Novo Cliente
         ----------------------------------------------------------------------------- */}
      {isAddClientModalOpen && (
        <div className="fixed inset-0 bg-neutral-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 w-full max-w-md rounded-2xl p-6 shadow-2xl relative">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-amber-500" />
              Cadastrar Novo Amigo
            </h3>

            <form onSubmit={handleAddClient} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-1">Nome Completo *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Carlos Silva"
                  value={newClient.name}
                  onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
                  className="w-full bg-neutral-950 border border-neutral-800 focus:border-amber-500 text-white rounded-xl px-4 py-2.5 outline-none text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-1">Telefone / WhatsApp</label>
                <input
                  type="text"
                  placeholder="Ex: (11) 99999-9999"
                  value={newClient.phone}
                  onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })}
                  className="w-full bg-neutral-950 border border-neutral-800 focus:border-amber-500 text-white rounded-xl px-4 py-2.5 outline-none text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-1">Data de Aniversário</label>
                <input
                  type="text"
                  placeholder="Ex: 15/10"
                  value={newClient.birthday}
                  onChange={(e) => setNewClient({ ...newClient, birthday: e.target.value })}
                  className="w-full bg-neutral-950 border border-neutral-800 focus:border-amber-500 text-white rounded-xl px-4 py-2.5 outline-none text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-1">Observações (Preferências de Corte)</label>
                <textarea
                  rows="2"
                  placeholder="Ex: Gosta de degradê navalhado, café sem açúcar..."
                  value={newClient.notes}
                  onChange={(e) => setNewClient({ ...newClient, notes: e.target.value })}
                  className="w-full bg-neutral-950 border border-neutral-800 focus:border-amber-500 text-white rounded-xl px-4 py-2.5 outline-none text-sm resize-none"
                ></textarea>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddClientModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-neutral-400 hover:text-white transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-amber-500 hover:bg-amber-400 text-neutral-950 font-semibold px-5 py-2 rounded-xl text-sm transition shadow-md shadow-amber-500/10"
                >
                  Salvar Cliente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* -----------------------------------------------------------------------------
          MODAL 2: Registrar Novo Corte / Atendimento
         ----------------------------------------------------------------------------- */}
      {isAddServiceModalOpen && selectedClient && (
        <div className="fixed inset-0 bg-neutral-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 w-full max-w-md rounded-2xl p-6 shadow-2xl relative">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Scissors className="w-5 h-5 text-amber-500" />
              Novo Serviço para {selectedClient.name}
            </h3>

            <form onSubmit={handleAddService} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-1">Serviço Realizado</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Corte + Barba"
                  value={newService.serviceName}
                  onChange={(e) => setNewService({ ...newService, serviceName: e.target.value })}
                  className="w-full bg-neutral-950 border border-neutral-800 focus:border-amber-500 text-white rounded-xl px-4 py-2.5 outline-none text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-1">Valor (R$)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={newService.price}
                    onChange={(e) => setNewService({ ...newService, price: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-800 focus:border-amber-500 text-white rounded-xl px-4 py-2.5 outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-1">Pontos Fidelidade</label>
                  <input
                    type="number"
                    min="0"
                    value={newService.points}
                    onChange={(e) => setNewService({ ...newService, points: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-800 focus:border-amber-500 text-white rounded-xl px-4 py-2.5 outline-none text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-1">Observações do Atendimento</label>
                <input
                  type="text"
                  placeholder="Ex: Usou pomada fosca"
                  value={newService.notes}
                  onChange={(e) => setNewService({ ...newService, notes: e.target.value })}
                  className="w-full bg-neutral-950 border border-neutral-800 focus:border-amber-500 text-white rounded-xl px-4 py-2.5 outline-none text-sm"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddServiceModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-neutral-400 hover:text-white transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-amber-500 hover:bg-amber-400 text-neutral-950 font-semibold px-5 py-2 rounded-xl text-sm transition shadow-md shadow-amber-500/10"
                >
                  Confirmar Serviço
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
