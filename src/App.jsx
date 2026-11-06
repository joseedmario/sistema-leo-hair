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
  Calendar, 
  LogOut, 
  Lock, 
  Mail, 
  Sparkles 
} from 'lucide-react';

// ==========================================
// CONFIGURAÇÃO DO FIREBASE
// Substitua os valores abaixo pelas chaves do seu projeto no Firebase
// ==========================================
const firebaseConfig = {
  apiKey: "SUA_API_KEY_AQUI",
  authDomain: "SEU_PROJETO.firebaseapp.com",
  projectId: "SEU_PROJETO_ID",
  storageBucket: "SEU_PROJETO.appspot.com",
  messagingSenderId: "SEU_SENDER_ID",
  appId: "SEU_APP_ID"
};

// Inicialização do Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export default function App() {
  // Estado de Autenticação
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Estados do Sistema
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Formulário de Novo Cliente
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');

  // Sincronização em Tempo Real com o Firestore
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

  // Função de Login
  const handleLogin = (e) => {
    e.preventDefault();
    if (email === 'admin@leohair.com' && password === '123456') {
      setIsAuthenticated(true);
      setLoginError('');
    } else {
      setLoginError('E-mail ou senha incorretos! Tente admin@leohair.com / 123456');
    }
  };

  // Função de Logout
  const handleLogout = () => {
    setIsAuthenticated(false);
    setEmail('');
    setPassword('');
  };

  // Adicionar Cliente
  const handleAddClient = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;

    try {
      await addDoc(collection(db, 'clients'), {
        name: newName,
        phone: newPhone || 'Não informado',
        points: 10, // Pontos de boas-vindas
        servicesCount: 1,
        createdAt: serverTimestamp()
      });
      setNewName('');
      setNewPhone('');
    } catch (error) {
      console.error("Erro ao adicionar cliente:", error);
    }
  };

  // Adicionar Serviço / Pontos
  const handleAddService = async (id, currentPoints, currentCount) => {
    try {
      const clientRef = doc(db, 'clients', id);
      await updateDoc(clientRef, {
        points: currentPoints + 10,
        servicesCount: currentCount + 1
      });
    } catch (error) {
      console.error("Erro ao atualizar pontos:", error);
    }
  };

  // Resgatar Recompensa (Gastar Pontos)
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

  // Eliminar Cliente
  const handleDeleteClient = async (id) => {
    if (window.confirm("Deseja realmente remover este cliente?")) {
      try {
        await deleteDoc(doc(db, 'clients', id));
      } catch (error) {
        console.error("Erro ao eliminar cliente:", error);
      }
    }
  };

  // Filtragem de Clientes
  const filteredClients = clients.filter(client => 
    client.name.toLowerCase().includes(search.toLowerCase()) ||
    client.phone.includes(search)
  );

  // TELA DE LOGIN
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
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-amber-500"
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
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-amber-500"
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

          <p className="text-center text-xs text-neutral-500 mt-6">
            Dica de teste: <span className="text-neutral-400">admin@leohair.com</span> / <span className="text-neutral-400">123456</span>
          </p>
        </div>
      </div>
    );
  }

  // TELA PRINCIPAL / PAINEL
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col">
      {/* Cabeçalho */}
      <header className="border-b border-neutral-800 bg-neutral-900/50 backdrop-blur sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-amber-500/10 border border-amber-500/30 rounded-lg flex items-center justify-center">
              <Scissors className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <h1 className="font-bold text-lg text-white">LEO HAIR STYLIST</h1>
              <p className="text-xs text-neutral-400">Gestão & Fidelidade</p>
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

      {/* Conteúdo Principal */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8 space-y-8">
        
        {/* Formulário de Novo Cliente */}
        <section className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
          <h2 className="text-sm font-semibold text-amber-500 flex items-center gap-2 mb-4">
            <UserPlus className="w-4 h-4" /> Cadastrar Novo Amigo / Cliente
          </h2>
          <form onSubmit={handleAddClient} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              placeholder="Nome do amigo"
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
            <button
              type="submit"
              className="bg-amber-500 hover:bg-amber-600 text-neutral-950 font-medium py-2 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm"
            >
              <PlusCircle className="w-4 h-4" /> Salvar Cadastro
            </button>
          </form>
        </section>

        {/* Lista de Clientes */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-amber-500" /> Clientes Cadastrados ({clients.length})
            </h2>

            {/* Busca */}
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
              Nenhum cliente encontrado.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredClients.map((client) => (
                <div key={client.id} className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex justify-between items-start">
                      <h3 className="font-bold text-base text-white">{client.name}</h3>
                      <button
                        onClick={() => handleDeleteClient(client.id)}
                        className="text-neutral-500 hover:text-red-400 transition-colors"
                        title="Eliminar Cliente"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-xs text-neutral-400 flex items-center gap-1.5 mt-1">
                      <Phone className="w-3.5 h-3.5" /> {client.phone}
                    </p>
                  </div>

                  {/* Cartão de Fidelidade */}
                  <div className="bg-neutral-950 border border-neutral-800/80 rounded-lg p-3 space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-neutral-400 flex items-center gap-1">
                        <Award className="w-3.5 h-3.5 text-amber-500" /> Pontos VIP
                      </span>
                      <span className="font-bold text-amber-500">{client.points || 0} pts</span>
                    </div>

                    {/* Barra de Progresso */}
                    <div className="w-full bg-neutral-800 h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-amber-500 h-full transition-all duration-300"
                        style={{ width: `${Math.min(((client.points || 0) / 100) * 100, 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Ações do Cliente */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAddService(client.id, client.points || 0, client.servicesCount || 0)}
                      className="flex-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-medium py-2 rounded-lg transition-colors flex items-center justify-center gap-1"
                    >
                      <PlusCircle className="w-3.5 h-3.5 text-amber-500" /> +10 Pts
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
