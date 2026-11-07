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
  FileText,
  User,
  Camera,
  Loader2,
  ArrowRight
} from 'lucide-react';

// Suas chaves reais do projeto no Firebase
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

// ==========================================
// CHAVE SECRETA DO IMGBB (COLE AQUI DE NOVO!)
// ==========================================
const IMGBB_API_KEY = "2770837fe2649038481d1d8003d58f14"; 

export default function App() {
  const [loginType, setLoginType] = useState('client'); 
  
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const [loggedClientId, setLoggedClientId] = useState(null);
  const [clientNameInput, setClientNameInput] = useState('');
  const [clientBirthInput, setClientBirthInput] = useState('');
  const [clientLoginError, setClientLoginError] = useState('');

  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newBirthDate, setNewBirthDate] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [newNotes, setNewNotes] = useState('');

  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editBirthDate, setEditBirthDate] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editNotes, setEditNotes] = useState('');

  const [selectedClientForService, setSelectedClientForService] = useState(null);
  const [serviceType, setServiceType] = useState('Corte de Cabelo');
  const [serviceDetails, setServiceDetails] = useState('');
  const [serviceValue, setServiceValue] = useState('35,00');
  
  // DUAS FOTOS AGORA!
  const [imageBefore, setImageBefore] = useState(null);
  const [imageAfter, setImageAfter] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
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
  }, []);

  const handleAdminLogin = (e) => {
    e.preventDefault();
    if (email === 'admin@leohair.com' && password === '123456') {
      setIsAuthenticated(true);
      setLoginError('');
    } else {
      setLoginError('E-mail ou senha incorretos!');
    }
  };

  const handleClientLogin = (e) => {
    e.preventDefault();
    const foundClient = clients.find(c => 
      c.name.toLowerCase().trim() === clientNameInput.toLowerCase().trim() && 
      c.birthDate === clientBirthInput
    );
    if (foundClient) {
      setLoggedClientId(foundClient.id);
      setClientLoginError('');
    } else {
      setClientLoginError('Amigo não encontrado ou Data de Nascimento incorreta!');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setLoggedClientId(null);
    setEmail('');
    setPassword('');
    setClientNameInput('');
    setClientBirthInput('');
  };

  const handleAddClient = async (e) => {
    e.preventDefault();
    if (!newName.trim() || !newBirthDate) {
      alert("Nome e Data de Nascimento são obrigatórios!");
      return;
    }
    try {
      await addDoc(collection(db, 'clients'), {
        name: newName.trim(),
        phone: newPhone || 'Não informado',
        birthDate: newBirthDate,
        address: newAddress || '',
        notes: newNotes || '',
        points: 10,
        servicesHistory: [],
        createdAt: serverTimestamp()
      });
      setNewName(''); setNewPhone(''); setNewBirthDate(''); setNewAddress(''); setNewNotes('');
    } catch (error) {
      console.error("Erro ao adicionar cliente:", error);
    }
  };

  const startEditing = (client) => {
    setEditingId(client.id);
    setEditName(client.name);
    setEditPhone(client.phone);
    setEditBirthDate(client.birthDate || '');
    setEditAddress(client.address || '');
    setEditNotes(client.notes || '');
  };

  const handleSaveEdit = async (id) => {
    try {
      const clientRef = doc(db, 'clients', id);
      await updateDoc(clientRef, {
        name: editName.trim(), phone: editPhone, birthDate: editBirthDate, address: editAddress, notes: editNotes
      });
      setEditingId(null);
    } catch (error) {
      console.error("Erro ao editar cliente:", error);
    }
  };

  // Enviar DUAS fotos para a nuvem
  const handleSaveService = async (e) => {
    e.preventDefault();
    if (!selectedClientForService) return;

    setIsUploading(true);
    let urlBefore = '';
    let urlAfter = '';

    try {
      // Subir Foto Antes
      if (imageBefore) {
        const formDataBefore = new FormData();
        formDataBefore.append('image', imageBefore);
        const resBefore = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, { method: 'POST', body: formDataBefore });
        const dataBefore = await resBefore.json();
        if (dataBefore.success) urlBefore = dataBefore.data.url;
      }
      // Subir Foto Depois
      if (imageAfter) {
        const formDataAfter = new FormData();
        formDataAfter.append('image', imageAfter);
        const resAfter = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, { method: 'POST', body: formDataAfter });
        const dataAfter = await resAfter.json();
        if (dataAfter.success) urlAfter = dataAfter.data.url;
      }
    } catch (error) {
      console.error("Erro ao subir imagens para o ImgBB", error);
      alert("Houve um erro ao subir as fotos, mas o serviço será salvo!");
    }

    const client = selectedClientForService;
    const newService = {
      type: serviceType,
      details: serviceDetails,
      price: serviceValue,
      date: new Date().toLocaleDateString('pt-BR'),
      imageUrlBefore: urlBefore,
      imageUrlAfter: urlAfter
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
      setImageBefore(null);
      setImageAfter(null);
    } catch (error) {
      console.error("Erro ao adicionar serviço:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRedeemReward = async (id, currentPoints) => {
    if (currentPoints < 100) return;
    try {
      const clientRef = doc(db, 'clients', id);
      await updateDoc(clientRef, { points: currentPoints - 100 });
      alert("Recompensa resgatada com sucesso! Parabéns!");
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
    client.name.toLowerCase().includes(search.toLowerCase()) || client.phone.includes(search)
  );

  const activeClientData = clients.find(c => c.id === loggedClientId);

  if (!isAuthenticated && !loggedClientId) {
    return (
      <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center p-4">
        <div className="flex gap-2 mb-6 bg-neutral-900 p-1 rounded-xl border border-neutral-800">
          <button onClick={() => setLoginType('client')} className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 ${loginType === 'client' ? 'bg-amber-500 text-neutral-950' : 'text-neutral-400 hover:text-white'}`}><User className="w-4 h-4" /> Sou Amigo/Cliente</button>
          <button onClick={() => setLoginType('admin')} className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 ${loginType === 'admin' ? 'bg-neutral-700 text-white' : 'text-neutral-400 hover:text-white'}`}><Lock className="w-4 h-4" /> Administrador</button>
        </div>

        <div className="w-full max-w-md bg-neutral-900 border border-amber-500/20 rounded-2xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-500/10 border border-amber-500/30 rounded-full mb-4">
              <Scissors className="w-8 h-8 text-amber-500" />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-wide">LEO HAIR STYLIST</h1>
          </div>

          {loginType === 'client' && (
            <form onSubmit={handleClientLogin} className="space-y-4">
              {clientLoginError && <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs p-3 rounded-lg mb-6 text-center">{clientLoginError}</div>}
              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-1">Seu Nome Completo</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                  <input type="text" value={clientNameInput} onChange={(e) => setClientNameInput(e.target.value)} placeholder="Ex: Lourenço" required className="w-full bg-neutral-950 border border-neutral-800 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-amber-500" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-1">Sua Data de Nascimento (Senha)</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                  <input type="date" value={clientBirthInput} onChange={(e) => setClientBirthInput(e.target.value)} required className="w-full bg-neutral-950 border border-neutral-800 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-amber-500" />
                </div>
              </div>
              <button type="submit" disabled={loading} className="w-full bg-amber-500 hover:bg-amber-600 text-neutral-950 font-semibold py-2.5 rounded-lg transition-colors mt-6 shadow-lg shadow-amber-500/10">Acessar Meus Pontos</button>
            </form>
          )}

          {loginType === 'admin' && (
            <form onSubmit={handleAdminLogin} className="space-y-4">
              {loginError && <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs p-3 rounded-lg mb-6 text-center">{loginError}</div>}
              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-1">E-mail</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@leohair.com" required className="w-full bg-neutral-950 border border-neutral-800 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-amber-500" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-1">Senha</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                  <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required className="w-full bg-neutral-950 border border-neutral-800 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-amber-500" />
                </div>
              </div>
              <button type="submit" className="w-full bg-neutral-700 hover:bg-neutral-600 text-white font-semibold py-2.5 rounded-lg transition-colors mt-6">Entrar como Administrador</button>
            </form>
          )}
        </div>
      </div>
    );
  }

  // ==========================================
  // TELA DO CLIENTE (ÁREA VIP)
  // ==========================================
  if (loggedClientId && activeClientData) {
    return (
      <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col">
        <header className="border-b border-neutral-800 bg-neutral-900/50 backdrop-blur sticky top-0 z-10">
          <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-amber-500/10 border border-amber-500/30 rounded-lg flex items-center justify-center"><Sparkles className="w-5 h-5 text-amber-500" /></div>
              <div>
                <h1 className="font-bold text-lg text-white">Olá, {activeClientData.name}!</h1>
                <p className="text-xs text-neutral-400">Área VIP LEO HAIR STYLIST</p>
              </div>
            </div>
            <button onClick={handleLogout} className="flex items-center space-x-2 text-xs bg-neutral-800 hover:bg-neutral-700 text-neutral-300 px-3 py-2 rounded-lg transition-colors border border-neutral-700"><LogOut className="w-4 h-4" /> <span>Sair</span></button>
          </div>
        </header>

        <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8 space-y-6">
          <div className="bg-neutral-900 border border-amber-500/30 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10"><Award className="w-32 h-32 text-amber-500" /></div>
            <h2 className="text-sm font-semibold text-neutral-400 mb-2">Seus Pontos Acumulados</h2>
            <div className="text-5xl font-black text-amber-500 mb-4">{activeClientData.points || 0} <span className="text-lg text-amber-500/70">Pts</span></div>
            <div className="space-y-2 mb-6">
              <div className="flex justify-between text-xs text-neutral-400">
                <span>Progresso para recompensa (100 Pts)</span>
                <span>{Math.min(((activeClientData.points || 0) / 100) * 100, 100).toFixed(0)}%</span>
              </div>
              <div className="w-full bg-neutral-950 border border-neutral-800 h-3 rounded-full overflow-hidden">
                <div className="bg-amber-500 h-full transition-all duration-1000 ease-out relative" style={{ width: `${Math.min(((activeClientData.points || 0) / 100) * 100, 100)}%` }}><div className="absolute top-0 left-0 w-full h-full bg-white/20 animate-pulse"></div></div>
              </div>
            </div>
            <button onClick={() => handleRedeemReward(activeClientData.id, activeClientData.points || 0)} disabled={(activeClientData.points || 0) < 100} className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-lg ${(activeClientData.points || 0) >= 100 ? 'bg-amber-500 hover:bg-amber-400 text-neutral-950 shadow-amber-500/20' : 'bg-neutral-950 text-neutral-600 border border-neutral-800 cursor-not-allowed shadow-none'}`}><Award className="w-5 h-5" /> {(activeClientData.points || 0) >= 100 ? 'Resgatar Recompensa Agora!' : 'Faltam pontos para resgatar'}</button>
          </div>

          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
            <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-4"><History className="w-5 h-5 text-amber-500" /> Seu Histórico de Cortes e Fotos</h2>
            {(!activeClientData.servicesHistory || activeClientData.servicesHistory.length === 0) ? (
              <div className="text-center py-8 text-neutral-500 text-sm">Você ainda não tem serviços registrados.</div>
            ) : (
              <div className="space-y-6">
                {activeClientData.servicesHistory.map((srv, idx) => (
                  <div key={idx} className="bg-neutral-950 border border-neutral-800 rounded-xl p-4 overflow-hidden shadow-lg">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
                      <div>
                        <h4 className="font-bold text-xl text-neutral-200">{srv.type}</h4>
                        {srv.details && <p className="text-sm text-neutral-400 mt-1">{srv.details}</p>}
                        <span className="text-xs text-neutral-500 block mt-2 flex items-center gap-1"><Calendar className="w-3 h-3" /> {srv.date}</span>
                      </div>
                      <div className="text-amber-500 font-medium bg-amber-500/10 px-4 py-2 rounded-lg border border-amber-500/20 self-start md:self-center">R$ {srv.price}</div>
                    </div>
                    
                    {/* GALERIA ANTES E DEPOIS - CLIENTE */}
                    {(srv.imageUrlBefore || srv.imageUrlAfter) && (
                      <div className="mt-4 pt-4 border-t border-neutral-800/50">
                        <h5 className="text-xs font-semibold text-neutral-400 mb-3 uppercase tracking-wider flex items-center gap-2"><Camera className="w-4 h-4 text-amber-500" /> Transformação</h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {srv.imageUrlBefore && (
                            <div className="relative group rounded-lg overflow-hidden border border-neutral-800">
                              <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm text-white text-[10px] uppercase font-bold px-2 py-1 rounded">Antes</div>
                              <img src={srv.imageUrlBefore} alt="Antes" className="w-full h-48 md:h-72 object-cover transition-transform duration-500 group-hover:scale-105" />
                            </div>
                          )}
                          {srv.imageUrlAfter && (
                            <div className="relative group rounded-lg overflow-hidden border border-amber-500/30">
                              <div className="absolute top-2 left-2 bg-amber-500 text-neutral-950 text-[10px] uppercase font-bold px-2 py-1 rounded shadow-lg">Depois</div>
                              <img src={srv.imageUrlAfter} alt="Depois" className="w-full h-48 md:h-72 object-cover transition-transform duration-500 group-hover:scale-105" />
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    );
  }

  // ==========================================
  // TELA DO ADMIN
  // ==========================================
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col">
      <header className="border-b border-neutral-800 bg-neutral-900/50 backdrop-blur sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-amber-500/10 border border-amber-500/30 rounded-lg flex items-center justify-center"><Scissors className="w-5 h-5 text-amber-500" /></div>
            <div>
              <h1 className="font-bold text-lg text-white">LEO HAIR STYLIST</h1>
              <p className="text-xs text-neutral-400">Gestão de Clientes e Serviços</p>
            </div>
          </div>
          <button onClick={handleLogout} className="flex items-center space-x-2 text-xs bg-neutral-800 hover:bg-neutral-700 text-neutral-300 px-3 py-2 rounded-lg transition-colors border border-neutral-700"><LogOut className="w-4 h-4" /> <span>Sair do Painel</span></button>
        </div>
      </header>

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8 space-y-8">
        
        <section className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
          <h2 className="text-sm font-semibold text-amber-500 flex items-center gap-2 mb-4"><UserPlus className="w-4 h-4" /> Cadastrar Novo Amigo / Cliente</h2>
          <form onSubmit={handleAddClient} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input type="text" placeholder="Nome completo *" value={newName} onChange={(e) => setNewName(e.target.value)} className="bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-amber-500" required />
              <input type="text" placeholder="Telefone" value={newPhone} onChange={(e) => setNewPhone(e.target.value)} className="bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-amber-500" />
              <div className="relative">
                <input type="date" title="Data de Nascimento (Senha do Cliente)" value={newBirthDate} onChange={(e) => setNewBirthDate(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-amber-500" required />
                <span className="absolute -top-2.5 left-2 bg-neutral-900 px-1 text-[10px] text-amber-500 font-medium">Senha do Amigo *</span>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input type="text" placeholder="Endereço (Rua, Bairro...)" value={newAddress} onChange={(e) => setNewAddress(e.target.value)} className="bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-amber-500" />
              <input type="text" placeholder="Observações..." value={newNotes} onChange={(e) => setNewNotes(e.target.value)} className="bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-amber-500" />
            </div>
            <button type="submit" className="w-full md:w-auto bg-amber-500 hover:bg-amber-600 text-neutral-950 font-medium px-6 py-2 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm font-semibold"><PlusCircle className="w-4 h-4" /> Salvar Cadastro</button>
          </form>
        </section>

        {/* MODAL REGISTRAR SERVIÇO (DUAS FOTOS) */}
        {selectedClientForService && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className="bg-neutral-900 border border-amber-500/30 rounded-2xl p-6 max-w-md w-full space-y-4 my-8">
              <div className="flex justify-between items-center border-b border-neutral-800 pb-3">
                <h3 className="font-bold text-white flex items-center gap-2"><Scissors className="w-4 h-4 text-amber-500" /> Serviço para {selectedClientForService.name}</h3>
                <button onClick={() => {setSelectedClientForService(null); setImageBefore(null); setImageAfter(null);}} className="text-neutral-500 hover:text-white" disabled={isUploading}><X className="w-5 h-5" /></button>
              </div>

              <form onSubmit={handleSaveService} className="space-y-4">
                <div>
                  <label className="block text-xs text-neutral-400 mb-1">Tipo de Serviço</label>
                  <input type="text" value={serviceType} onChange={(e) => setServiceType(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500" required disabled={isUploading} />
                </div>
                <div>
                  <label className="block text-xs text-neutral-400 mb-1">Descrição</label>
                  <textarea rows={2} value={serviceDetails} onChange={(e) => setServiceDetails(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500 resize-none" disabled={isUploading} />
                </div>
                <div>
                  <label className="block text-xs text-neutral-400 mb-1">Valor (R$)</label>
                  <input type="text" value={serviceValue} onChange={(e) => setServiceValue(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500" required disabled={isUploading} />
                </div>
                
                {/* DOIS CAMPOS DE FOTO LADO A LADO */}
                <div className="grid grid-cols-2 gap-2">
                  <label className={`cursor-pointer block border border-dashed rounded-lg p-3 text-center transition-colors ${imageBefore ? 'border-amber-500 bg-amber-500/5' : 'border-neutral-700 bg-neutral-950/50 hover:border-amber-500/50'}`}>
                    <Camera className={`w-5 h-5 mx-auto mb-1 ${imageBefore ? 'text-amber-500' : 'text-neutral-500'}`} />
                    <span className={`text-[10px] font-bold uppercase block ${imageBefore ? 'text-amber-500' : 'text-neutral-400'}`}>Antes</span>
                    <span className="text-[9px] text-neutral-500 truncate block px-1 mt-1">{imageBefore ? imageBefore.name : 'Tirar foto'}</span>
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => setImageBefore(e.target.files[0])} disabled={isUploading} />
                  </label>

                  <label className={`cursor-pointer block border border-dashed rounded-lg p-3 text-center transition-colors ${imageAfter ? 'border-amber-500 bg-amber-500/5' : 'border-neutral-700 bg-neutral-950/50 hover:border-amber-500/50'}`}>
                    <Camera className={`w-5 h-5 mx-auto mb-1 ${imageAfter ? 'text-amber-500' : 'text-neutral-500'}`} />
                    <span className={`text-[10px] font-bold uppercase block ${imageAfter ? 'text-amber-500' : 'text-neutral-400'}`}>Depois</span>
                    <span className="text-[9px] text-neutral-500 truncate block px-1 mt-1">{imageAfter ? imageAfter.name : 'Tirar foto'}</span>
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => setImageAfter(e.target.files[0])} disabled={isUploading} />
                  </label>
                </div>

                <div className="flex gap-2 pt-2">
                  <button type="button" onClick={() => {setSelectedClientForService(null); setImageBefore(null); setImageAfter(null);}} className="flex-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 py-2.5 rounded-lg text-xs font-semibold" disabled={isUploading}>Cancelar</button>
                  <button type="submit" className="flex-1 bg-amber-500 hover:bg-amber-600 text-neutral-950 font-bold py-2.5 rounded-lg text-xs flex items-center justify-center gap-2" disabled={isUploading}>
                    {isUploading ? <><Loader2 className="w-4 h-4 animate-spin" /> Salvando...</> : 'Salvar e Somar +10 Pts'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2"><Users className="w-5 h-5 text-amber-500" /> Amigos Cadastrados ({clients.length})</h2>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
              <input type="text" placeholder="Buscar por nome ou telefone..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full bg-neutral-900 border border-neutral-800 rounded-lg pl-9 pr-4 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500" />
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12 text-neutral-500 text-sm">Carregando dados da nuvem...</div>
          ) : filteredClients.length === 0 ? (
            <div className="text-center py-12 bg-neutral-900/50 border border-neutral-800 rounded-xl text-neutral-500 text-sm">Nenhum amigo encontrado.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredClients.map((client) => (
                <div key={client.id} className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 flex flex-col justify-between space-y-4">
                  <div>
                    {editingId === client.id ? (
                      <div className="space-y-2">
                        <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} placeholder="Nome" className="w-full bg-neutral-950 border border-amber-500/50 rounded px-2 py-1 text-xs text-white" />
                        <input type="text" value={editPhone} onChange={(e) => setEditPhone(e.target.value)} placeholder="Telefone" className="w-full bg-neutral-950 border border-amber-500/50 rounded px-2 py-1 text-xs text-white" />
                        <input type="date" value={editBirthDate} onChange={(e) => setEditBirthDate(e.target.value)} className="w-full bg-neutral-950 border border-amber-500/50 rounded px-2 py-1 text-xs text-white" />
                        <input type="text" value={editAddress} onChange={(e) => setEditAddress(e.target.value)} placeholder="Endereço" className="w-full bg-neutral-950 border border-amber-500/50 rounded px-2 py-1 text-xs text-white" />
                        <input type="text" value={editNotes} onChange={(e) => setEditNotes(e.target.value)} placeholder="Observações" className="w-full bg-neutral-950 border border-amber-500/50 rounded px-2 py-1 text-xs text-white" />
                        <div className="flex gap-2 pt-1">
                          <button onClick={() => handleSaveEdit(client.id)} className="bg-amber-500 text-neutral-950 px-2 py-1 rounded text-xs flex items-center gap-1 font-semibold"><Check className="w-3 h-3" /> Salvar</button>
                          <button onClick={() => setEditingId(null)} className="bg-neutral-800 text-neutral-400 px-2 py-1 rounded text-xs">Cancelar</button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="flex justify-between items-start">
                          <h3 className="font-bold text-base text-white">{client.name}</h3>
                          <div className="flex gap-2">
                            <button onClick={() => startEditing(client)} className="text-neutral-500 hover:text-amber-500 transition-colors"><Edit2 className="w-4 h-4" /></button>
                            <button onClick={() => handleDeleteClient(client.id)} className="text-neutral-500 hover:text-red-400 transition-colors"><Trash2 className="w-4 h-4" /></button>
                          </div>
                        </div>
                        <div className="mt-2 space-y-1 text-xs text-neutral-400">
                          <p className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-neutral-500" /> {client.phone}</p>
                          {client.birthDate && <p className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-neutral-500" /> Nasc: {client.birthDate}</p>}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="bg-neutral-950 border border-neutral-800/80 rounded-lg p-3 space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-neutral-400 flex items-center gap-1"><Award className="w-3.5 h-3.5 text-amber-500" /> Pontos</span>
                      <span className="font-bold text-amber-500">{client.points || 0} pts</span>
                    </div>
                    <div className="w-full bg-neutral-800 h-2 rounded-full overflow-hidden">
                      <div className="bg-amber-500 h-full transition-all duration-300" style={{ width: `${Math.min(((client.points || 0) / 100) * 100, 100)}%` }} />
                    </div>
                  </div>

                  {client.servicesHistory && client.servicesHistory.length > 0 && (
                    <div className="bg-neutral-950/50 rounded-lg p-2.5 border border-neutral-800/40 text-xs space-y-3 max-h-48 overflow-y-auto">
                      <span className="text-neutral-400 font-semibold flex items-center gap-1 text-[11px]"><History className="w-3 h-3 text-amber-500" /> Histórico:</span>
                      {client.servicesHistory.map((srv, idx) => (
                        <div key={idx} className="border-b border-neutral-800/50 pb-2 last:border-0 last:pb-0">
                          <div className="flex justify-between font-medium text-neutral-200">
                            <span>{srv.type}</span>
                            <span className="text-amber-500">R$ {srv.price}</span>
                          </div>
                          {srv.details && <p className="text-[10px] text-neutral-400 mt-0.5">{srv.details}</p>}
                          <span className="text-[9px] text-neutral-600 block mt-0.5 mb-1.5">{srv.date}</span>
                          
                          {/* MOSTRA AS DUAS FOTOS PEQUENAS NO ADMIN */}
                          {(srv.imageUrlBefore || srv.imageUrlAfter) && (
                            <div className="flex gap-2">
                              {srv.imageUrlBefore && <div className="flex-1 relative"><div className="absolute top-0.5 left-0.5 bg-black/60 text-[8px] px-1 rounded text-white font-bold">A</div><img src={srv.imageUrlBefore} className="w-full h-12 object-cover rounded border border-neutral-800" /></div>}
                              {srv.imageUrlAfter && <div className="flex-1 relative"><div className="absolute top-0.5 left-0.5 bg-amber-500 text-[8px] px-1 rounded text-black font-bold">D</div><img src={srv.imageUrlAfter} className="w-full h-12 object-cover rounded border border-neutral-800" /></div>}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button onClick={() => setSelectedClientForService(client)} className="flex-1 bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 text-amber-400 text-xs font-medium py-2 rounded-lg transition-colors flex items-center justify-center gap-1">
                      <Scissors className="w-3.5 h-3.5" /> + Serviço
                    </button>
                    <button onClick={() => handleRedeemReward(client.id, client.points || 0)} disabled={(client.points || 0) < 100} className={`flex-1 text-xs font-medium py-2 rounded-lg transition-colors flex items-center justify-center gap-1 ${(client.points || 0) >= 100 ? 'bg-amber-500 hover:bg-amber-600 text-neutral-950 font-semibold' : 'bg-neutral-800/50 text-neutral-600 cursor-not-allowed'}`}>
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
