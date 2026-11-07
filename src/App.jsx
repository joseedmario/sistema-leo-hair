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
  MessageCircle,
  Bot,
  Send,
  Star
} from 'lucide-react';

// Chaves reais do projeto no Firebase
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
// CHAVE SECRETA DO IMGBB E SEU WHATSAPP
// ==========================================
const IMGBB_API_KEY = "2770837fe2649038481d1d8003d58f14"; 
const SEU_NUMERO_DE_WHATSAPP = "557599211738"; 

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
  
  const [imageBefore, setImageBefore] = useState(null);
  const [imageAfter, setImageAfter] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  // ESTADOS DO FUNIL DO CHATBOT
  const [showChatbot, setShowChatbot] = useState(false);
  const [chatStep, setChatStep] = useState(1);
  const [chatName, setChatName] = useState('');
  const [chatPhone, setChatPhone] = useState('');
  const [botMessage, setBotMessage] = useState('Olá! Sou o assistente virtual do salão. Para começarmos, qual é o seu nome?');

  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&display=swap');
    .font-luxo { font-family: 'Playfair Display', serif; letter-spacing: 0.1em; }`;
    document.head.appendChild(style);

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
      alert("Amigo cadastrado com sucesso!");
    } catch (error) {
      console.error(error);
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
      await updateDoc(doc(db, 'clients', id), {
        name: editName.trim(),
        phone: editPhone,
        birthDate: editBirthDate,
        address: editAddress,
        notes: editNotes
      });
      setEditingId(null);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSaveService = async (e) => {
    e.preventDefault();
    if (!selectedClientForService) return;
    setIsUploading(true);
    let urlBefore = ''; let urlAfter = '';
    try {
      if (imageBefore) {
        const fb = new FormData(); fb.append('image', imageBefore);
        const rb = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, { method: 'POST', body: fb });
        const dbRes = await rb.json(); if (dbRes.success) urlBefore = dbRes.data.url;
      }
      if (imageAfter) {
        const fa = new FormData(); fa.append('image', imageAfter);
        const ra = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, { method: 'POST', body: fa });
        const daRes = await ra.json(); if (daRes.success) urlAfter = daRes.data.url;
      }
    } catch (error) { console.error(error); alert("Erro ao subir fotos, mas o serviço será salvo!"); }

    const client = selectedClientForService;
    const newService = { type: serviceType, details: serviceDetails, price: serviceValue, date: new Date().toLocaleDateString('pt-BR'), imageUrlBefore: urlBefore, imageUrlAfter: urlAfter };
    try {
      await updateDoc(doc(db, 'clients', client.id), { points: (client.points || 0) + 10, servicesHistory: [...(client.servicesHistory || []), newService] });
      setSelectedClientForService(null); setServiceType('Corte de Cabelo'); setServiceDetails(''); setServiceValue('35,00'); setImageBefore(null); setImageAfter(null);
    } catch (error) { console.error(error); } finally { setIsUploading(false); }
  };

  const handleRedeemReward = async (id, currentPoints) => {
    if (currentPoints < 100) return;
    try { await updateDoc(doc(db, 'clients', id), { points: currentPoints - 100 }); alert("Recompensa resgatada com sucesso!"); } catch (error) { console.error(error); }
  };

  const handleDeleteClient = async (id) => {
    if (window.confirm("Deseja realmente remover este amigo?")) { try { await deleteDoc(doc(db, 'clients', id)); } catch (error) { console.error(error); } }
  };

  const handleChatNext = (e) => {
    e.preventDefault();
    if (chatStep === 1 && chatName.trim() !== '') {
      setChatStep(2);
      setBotMessage(`Muito prazer, ${chatName}! Para o nosso registro, qual é o número de telefone de contato (mãe ou pai)?`);
    } else if (chatStep === 2 && chatPhone.trim() !== '') {
      setChatStep(3);
      setBotMessage(`Perfeito, ${chatName}. Como posso ajudar hoje? Escolha uma das opções abaixo:`);
    }
  };

  const handleChatOption = (option) => {
    if (option === 'servicos') {
      setBotMessage("Oferecemos serviços premium. O Corte de Cabelo clássico fica por R$ 35,00. Deseja agendar um horário?");
    } else if (option === 'endereco') {
      setBotMessage("Nosso espaço fica localizado em Euclides da Cunha, com uma vista privilegiada de frente para a lagoa. Deseja agendar um horário?");
    } else if (option === 'agendar') {
      setChatStep(4);
      setBotMessage("Excelente escolha! Vou encaminhar sua solicitação diretamente para o Emanuel, que irá alinhar com a dona Rosália o melhor horário para recebê-los. Clique no botão abaixo para confirmar o envio.");
    }
  };

  const handleSendWhatsApp = () => {
    const texto = `Olá Emanuel! Meu nome é *${chatName}*, telefone de contato: *${chatPhone}*. Acessei a página e gostaria de agendar um atendimento no salão!`;
    const url = `https://wa.me/${SEU_NUMERO_DE_WHATSAPP}?text=${encodeURIComponent(texto)}`;
    window.open(url, '_blank');
    setShowChatbot(false);
    setChatStep(1); setChatName(''); setChatPhone(''); setBotMessage('Olá! Sou o assistente virtual do salão. Para começarmos, qual é o seu nome?');
  };

  const filteredClients = clients.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search));
  const activeClientData = clients.find(c => c.id === loggedClientId);

  // ==========================================
  // TELA INICIAL (Dourado e Luxo)
  // ==========================================
  if (!isAuthenticated && !loggedClientId) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-neutral-300 font-sans selection:bg-[#d4af37] selection:text-black">
        <div className="w-full pt-20 pb-16 px-6 text-center border-b border-neutral-900 bg-gradient-to-b from-black to-[#0a0a0a]">
          <h1 className="font-luxo text-5xl md:text-7xl text-[#d4af37] mb-6 leading-tight uppercase tracking-widest drop-shadow-[0_0_15px_rgba(212,175,55,0.2)]">
            LEO<br/>HAIR<br/>STYLIST
          </h1>
          <div className="w-16 h-[1px] bg-[#d4af37]/40 mx-auto mb-6"></div>
          <p className="text-xs md:text-sm tracking-[0.2em] text-[#d4af37]/80 uppercase mb-20">
            A ARTE DA BELEZA EM CADA DETALHE
          </p>

          <h2 className="font-luxo text-3xl md:text-4xl text-neutral-200 mb-4">Nossa Essência</h2>
          <p className="text-neutral-400 font-light max-w-lg mx-auto leading-relaxed italic text-sm md:text-base">
            Trazemos à tona a sua melhor versão através de técnicas exclusivas e um olhar atento à sua personalidade.
          </p>
        </div>

        <div className="w-full py-20 px-4 bg-[#0a0a0a]">
          <h2 className="text-center font-luxo text-2xl md:text-3xl text-neutral-200 uppercase tracking-widest mb-12">
            EXPERIÊNCIAS
          </h2>
          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-[#111111] border border-neutral-800/50 p-8 rounded-sm">
              <div className="flex gap-1 mb-6 text-[#d4af37]">
                <Star fill="currentColor" className="w-4 h-4" /><Star fill="currentColor" className="w-4 h-4" /><Star fill="currentColor" className="w-4 h-4" /><Star fill="currentColor" className="w-4 h-4" /><Star fill="currentColor" className="w-4 h-4" />
              </div>
              <p className="font-luxo text-neutral-300 italic text-lg leading-relaxed mb-6">
                "O Leo tem uma sensibilidade incrível. Ele não apenas cortou meu cabelo, ele desenhou uma moldura perfeita para o meu rosto."
              </p>
              <p className="text-[10px] uppercase tracking-widest text-neutral-600">— Mariana Costa</p>
            </div>
            <div className="bg-[#111111] border border-neutral-800/50 p-8 rounded-sm">
              <div className="flex gap-1 mb-6 text-[#d4af37]">
                <Star fill="currentColor" className="w-4 h-4" /><Star fill="currentColor" className="w-4 h-4" /><Star fill="currentColor" className="w-4 h-4" /><Star fill="currentColor" className="w-4 h-4" /><Star fill="currentColor" className="w-4 h-4" />
              </div>
              <p className="font-luxo text-neutral-300 italic text-lg leading-relaxed mb-6">
                "Elegância do início ao fim. O atendimento é primoroso e o talento do Leo é indiscutível. Saí do salão me sentindo poderosa."
              </p>
              <p className="text-[10px] uppercase tracking-widest text-neutral-600">— Helena Albuquerque</p>
            </div>
          </div>
        </div>

        <div className="w-full py-24 px-6 text-center border-t border-neutral-900 bg-black">
          <h2 className="font-luxo text-3xl md:text-4xl text-neutral-200 mb-4">Revele sua essência</h2>
          <p className="text-neutral-500 font-light max-w-md mx-auto mb-12 text-sm md:text-base">
            Sua transformação começa com um horário marcado. Venha viver uma experiência exclusiva de beleza.
          </p>
          <button 
            onClick={() => setShowChatbot(true)}
            className="inline-block border border-[#d4af37] text-[#d4af37] hover:bg-[#d4af37] hover:text-black uppercase tracking-[0.2em] text-xs py-4 px-12 transition-all duration-300 font-semibold shadow-[0_0_20px_rgba(212,175,55,0.1)]"
          >
            AGENDAR ATENDIMENTO
          </button>
        </div>

        {/* MODAL DO FUNIL (ROBÔ) */}
        {showChatbot && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 z-50">
            <div className="bg-[#111111] border border-neutral-800 w-full max-w-md overflow-hidden flex flex-col rounded-sm shadow-2xl">
              <div className="p-4 flex items-center justify-between border-b border-neutral-800">
                <div className="flex items-center gap-3">
                  <div className="text-[#d4af37]"><Bot className="w-5 h-5" /></div>
                  <h3 className="font-luxo text-white tracking-wider">Atendimento Exclusivo</h3>
                </div>
                <button onClick={() => setShowChatbot(false)} className="text-neutral-500 hover:text-white transition-colors"><X className="w-6 h-6" /></button>
              </div>
              <div className="p-6 bg-[#0a0a0a] flex-1 space-y-6">
                <div className="flex gap-3">
                  <div className="bg-[#1a1a1a] p-4 rounded-sm text-sm text-neutral-300 border border-neutral-900 shadow-md font-light leading-relaxed">
                    {botMessage}
                  </div>
                </div>
                {chatStep === 1 && (
                  <form onSubmit={handleChatNext} className="flex gap-2 mt-4">
                    <input type="text" value={chatName} onChange={(e) => setChatName(e.target.value)} placeholder="Seu nome..." required className="flex-1 bg-black border border-neutral-800 px-4 py-3 text-sm text-white focus:outline-none focus:border-[#d4af37]" />
                    <button type="submit" className="bg-[#1a1a1a] border border-neutral-800 px-4 text-[#d4af37]"><Send className="w-4 h-4" /></button>
                  </form>
                )}
                {chatStep === 2 && (
                  <form onSubmit={handleChatNext} className="flex gap-2 mt-4">
                    <input type="text" value={chatPhone} onChange={(e) => setChatPhone(e.target.value)} placeholder="Telefone para contato..." required className="flex-1 bg-black border border-neutral-800 px-4 py-3 text-sm text-white focus:outline-none focus:border-[#d4af37]" />
                    <button type="submit" className="bg-[#1a1a1a] border border-neutral-800 px-4 text-[#d4af37]"><Send className="w-4 h-4" /></button>
                  </form>
                )}
                {chatStep === 3 && (
                  <div className="grid grid-cols-1 gap-3 mt-4">
                    <button onClick={() => handleChatOption('servicos')} className="bg-[#111111] hover:bg-[#1a1a1a] border border-neutral-800 p-4 text-xs tracking-wider uppercase text-left text-neutral-400">Serviços e Valores</button>
                    <button onClick={() => handleChatOption('endereco')} className="bg-[#111111] hover:bg-[#1a1a1a] border border-neutral-800 p-4 text-xs tracking-wider uppercase text-left text-neutral-400">Localização</button>
                    <button onClick={() => handleChatOption('agendar')} className="bg-[#111111] border border-[#d4af37] text-[#d4af37] p-4 text-xs tracking-wider uppercase text-left hover:bg-[#d4af37]/10">Desejo Agendar Horário</button>
                  </div>
                )}
                {chatStep === 4 && (
                  <button onClick={handleSendWhatsApp} className="w-full mt-4 border border-[#d4af37] text-[#d4af37] p-4 text-xs tracking-wider uppercase flex items-center justify-center gap-2 hover:bg-[#d4af37]/10">
                    <MessageCircle className="w-4 h-4" /> Confirmar e Enviar
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* LOGIN NO FUNDO */}
        <div className="w-full bg-[#0a0a0a] py-20 px-4 border-t border-neutral-900">
          <div className="max-w-md mx-auto">
            <h3 className="text-center font-luxo text-xl text-neutral-500 mb-8">Acesso Restrito</h3>
            <div className="flex gap-2 mb-6">
              <button onClick={() => setLoginType('client')} className={`flex-1 py-3 text-xs tracking-widest uppercase border ${loginType === 'client' ? 'border-[#d4af37] text-[#d4af37]' : 'border-neutral-800 text-neutral-600'}`}>Área VIP</button>
              <button onClick={() => setLoginType('admin')} className={`flex-1 py-3 text-xs tracking-widest uppercase border ${loginType === 'admin' ? 'border-[#d4af37] text-[#d4af37]' : 'border-neutral-800 text-neutral-600'}`}>Gestão</button>
            </div>
            <div className="bg-[#111111] border border-neutral-900 p-8 rounded-sm">
              {loginType === 'client' && (
                <form onSubmit={handleClientLogin} className="space-y-4">
                  {clientLoginError && <div className="text-red-500/80 text-xs p-3 border border-red-900/30 text-center">{clientLoginError}</div>}
                  <div>
                    <label className="block text-[10px] tracking-widest uppercase text-neutral-500 mb-2">Nome Completo</label>
                    <input type="text" value={clientNameInput} onChange={(e) => setClientNameInput(e.target.value)} required className="w-full bg-black border border-neutral-800 px-4 py-3 text-sm text-white focus:outline-none focus:border-[#d4af37]" />
                  </div>
                  <div>
                    <label className="block text-[10px] tracking-widest uppercase text-neutral-500 mb-2">Data de Nascimento (Senha)</label>
                    <input type="date" value={clientBirthInput} onChange={(e) => setClientBirthInput(e.target.value)} required className="w-full bg-black border border-neutral-800 px-4 py-3 text-sm text-white focus:outline-none focus:border-[#d4af37]" />
                  </div>
                  <button type="submit" disabled={loading} className="w-full bg-[#d4af37] text-black text-xs font-bold tracking-widest uppercase py-4 mt-6 hover:bg-[#e6c55c]">Acessar</button>
                </form>
              )}
              {loginType === 'admin' && (
                <form onSubmit={handleAdminLogin} className="space-y-4">
                  {loginError && <div className="text-red-500/80 text-xs p-3 border border-red-900/30 text-center">{loginError}</div>}
                  <div>
                    <label className="block text-[10px] tracking-widest uppercase text-neutral-500 mb-2">E-mail Corporativo</label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full bg-black border border-neutral-800 px-4 py-3 text-sm text-white focus:outline-none focus:border-[#d4af37]" />
                  </div>
                  <div>
                    <label className="block text-[10px] tracking-widest uppercase text-neutral-500 mb-2">Senha</label>
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full bg-black border border-neutral-800 px-4 py-3 text-sm text-white focus:outline-none focus:border-[#d4af37]" />
                  </div>
                  <button type="submit" className="w-full bg-[#1a1a1a] border border-[#d4af37]/50 text-[#d4af37] text-xs font-bold tracking-widest uppercase py-4 mt-6 hover:bg-[#d4af37]/10">Entrar no Sistema</button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // ÁREA VIP DO CLIENTE
  // ==========================================
  if (loggedClientId && activeClientData) {
    return (
      <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col">
        <header className="border-b border-neutral-800 bg-neutral-900/50 backdrop-blur sticky top-0 z-10">
          <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-[#d4af37]/10 border border-[#d4af37]/30 rounded-lg flex items-center justify-center"><Sparkles className="w-5 h-5 text-[#d4af37]" /></div>
              <div><h1 className="font-bold text-lg text-white">Olá, {activeClientData.name}!</h1><p className="text-xs text-neutral-400">Área VIP LEO HAIR STYLIST</p></div>
            </div>
            <button onClick={handleLogout} className="flex items-center space-x-2 text-xs bg-neutral-800 px-3 py-2 rounded-lg"><LogOut className="w-4 h-4" /> <span>Sair</span></button>
          </div>
        </header>
        <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8 space-y-6">
          <div className="bg-neutral-900 border border-[#d4af37]/30 rounded-2xl p-6 relative overflow-hidden">
            <h2 className="text-sm font-semibold text-neutral-400 mb-2">Seus Pontos</h2>
            <div className="text-5xl font-black text-[#d4af37] mb-4">{activeClientData.points || 0} <span className="text-lg">Pts</span></div>
            <div className="w-full bg-neutral-950 h-3 rounded-full overflow-hidden mb-6"><div className="bg-[#d4af37] h-full" style={{ width: `${Math.min(((activeClientData.points || 0) / 100) * 100, 100)}%` }}></div></div>
            <button onClick={() => handleRedeemReward(activeClientData.id, activeClientData.points || 0)} disabled={(activeClientData.points || 0) < 100} className={`w-full py-4 rounded-xl font-bold ${(activeClientData.points || 0) >= 100 ? 'bg-[#d4af37] text-neutral-950' : 'bg-neutral-950 text-neutral-600'}`}>Resgatar Recompensa</button>
          </div>
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
            <h2 className="text-lg font-bold text-white mb-4">Seu Histórico</h2>
            <div className="space-y-6">
              {(activeClientData.servicesHistory || []).map((srv, idx) => (
                <div key={idx} className="bg-neutral-950 border border-neutral-800 rounded-xl p-4">
                  <div className="flex justify-between mb-4"><div><h4 className="font-bold text-xl">{srv.type}</h4><span className="text-xs text-neutral-500">{srv.date}</span></div><div className="text-[#d4af37] bg-[#d4af37]/10 px-4 py-2 rounded-lg">R$ {srv.price}</div></div>
                  {(srv.imageUrlBefore || srv.imageUrlAfter) && (
                    <div className="grid grid-cols-2 gap-4 border-t border-neutral-800/50 pt-4">
                      {srv.imageUrlBefore && <div><div className="text-[10px] bg-neutral-800 px-2 py-1 rounded inline-block mb-1">ANTES</div><img src={srv.imageUrlBefore} className="w-full h-48 object-cover rounded-lg" /></div>}
                      {srv.imageUrlAfter && <div><div className="text-[10px] bg-[#d4af37] text-black px-2 py-1 rounded inline-block mb-1 font-bold">DEPOIS</div><img src={srv.imageUrlAfter} className="w-full h-48 object-cover rounded-lg" /></div>}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  // ==========================================
  // ÁREA DE GESTÃO (ADMIN) - COM FOTOS NO HISTÓRICO
  // ==========================================
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col">
      <header className="border-b border-neutral-800 bg-neutral-900/50 backdrop-blur sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3"><div className="w-10 h-10 bg-[#d4af37]/10 rounded-lg flex items-center justify-center"><Scissors className="w-5 h-5 text-[#d4af37]" /></div><div><h1 className="font-bold text-white">LEO HAIR STYLIST</h1></div></div>
          <button onClick={handleLogout} className="flex items-center space-x-2 text-xs bg-neutral-800 px-3 py-2 rounded-lg"><LogOut className="w-4 h-4" /> <span>Sair</span></button>
        </div>
      </header>
      
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8 space-y-8">
        
        {/* CADASTRO DE AMIGOS */}
        <section className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
          <h2 className="text-sm font-semibold text-[#d4af37] mb-4 flex items-center gap-2"><UserPlus className="w-4 h-4" /> Cadastrar Novo Amigo / Cliente</h2>
          <form onSubmit={handleAddClient} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input type="text" placeholder="Nome completo *" value={newName} onChange={(e) => setNewName(e.target.value)} className="bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-[#d4af37]" required />
              <input type="text" placeholder="Telefone" value={newPhone} onChange={(e) => setNewPhone(e.target.value)} className="bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-[#d4af37]" />
              <div className="relative">
                <input type="date" title="Data de Nascimento (Senha do Cliente)" value={newBirthDate} onChange={(e) => setNewBirthDate(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-[#d4af37]" required />
                <span className="absolute -top-2.5 left-2 bg-neutral-900 px-1 text-[10px] text-[#d4af37] font-medium">Senha do Amigo *</span>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input type="text" placeholder="Endereço (Rua, Bairro...)" value={newAddress} onChange={(e) => setNewAddress(e.target.value)} className="bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-[#d4af37]" />
              <input type="text" placeholder="Observações..." value={newNotes} onChange={(e) => setNewNotes(e.target.value)} className="bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-[#d4af37]" />
            </div>
            <button type="submit" className="w-full md:w-auto bg-[#d4af37] hover:bg-[#e6c55c] text-neutral-950 font-bold px-6 py-2 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm"><PlusCircle className="w-4 h-4" /> Salvar Cadastro</button>
          </form>
        </section>

        {/* MODAL DE SERVIÇO COM DUAS FOTOS */}
        {selectedClientForService && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className="bg-neutral-900 border border-[#d4af37]/30 rounded-2xl p-6 max-w-md w-full my-8 space-y-4">
              <div className="flex justify-between border-b border-neutral-800 pb-3"><h3 className="font-bold text-white">Serviço para {selectedClientForService.name}</h3><button onClick={() => setSelectedClientForService(null)}><X className="w-5 h-5" /></button></div>
              <form onSubmit={handleSaveService} className="space-y-4">
                <input type="text" value={serviceType} onChange={(e) => setServiceType(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white" required disabled={isUploading} />
                <input type="text" value={serviceValue} onChange={(e) => setServiceValue(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white" required disabled={isUploading} />
                
                <div className="grid grid-cols-2 gap-2">
                  <label className="border border-dashed border-neutral-700 p-3 text-center rounded-lg cursor-pointer bg-neutral-950/50">
                    <span className="text-[10px] text-[#d4af37] block font-bold">FOTO ANTES</span>
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => setImageBefore(e.target.files[0])} />
                  </label>
                  <label className="border border-dashed border-neutral-700 p-3 text-center rounded-lg cursor-pointer bg-neutral-950/50">
                    <span className="text-[10px] text-[#d4af37] block font-bold">FOTO DEPOIS</span>
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => setImageAfter(e.target.files[0])} />
                  </label>
                </div>

                <button type="submit" className="w-full bg-[#d4af37] text-neutral-950 font-bold py-2.5 rounded-lg text-xs" disabled={isUploading}>{isUploading ? 'Salvando...' : 'Salvar e Somar +10 Pts'}</button>
              </form>
            </div>
          </div>
        )}

        {/* LISTA DE AMIGOS COM FOTOS NO HISTÓRICO */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {clients.map(client => (
            <div key={client.id} className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 space-y-4">
              
              {editingId === client.id ? (
                <div className="space-y-2">
                  <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} placeholder="Nome" className="w-full bg-neutral-950 border border-[#d4af37] rounded px-2 py-1 text-xs text-white" />
                  <input type="text" value={editPhone} onChange={(e) => setEditPhone(e.target.value)} placeholder="Telefone" className="w-full bg-neutral-950 border border-[#d4af37] rounded px-2 py-1 text-xs text-white" />
                  <input type="date" value={editBirthDate} onChange={(e) => setEditBirthDate(e.target.value)} className="w-full bg-neutral-950 border border-[#d4af37] rounded px-2 py-1 text-xs text-white" />
                  <input type="text" value={editAddress} onChange={(e) => setEditAddress(e.target.value)} placeholder="Endereço" className="w-full bg-neutral-950 border border-[#d4af37] rounded px-2 py-1 text-xs text-white" />
                  <input type="text" value={editNotes} onChange={(e) => setEditNotes(e.target.value)} placeholder="Observações" className="w-full bg-neutral-950 border border-[#d4af37] rounded px-2 py-1 text-xs text-white" />
                  <div className="flex gap-2 pt-1">
                    <button onClick={() => handleSaveEdit(client.id)} className="bg-[#d4af37] text-neutral-950 px-2 py-1 rounded text-xs flex items-center gap-1 font-bold"><Check className="w-3 h-3" /> Salvar</button>
                    <button onClick={() => setEditingId(null)} className="bg-neutral-800 text-neutral-400 px-2 py-1 rounded text-xs">Cancelar</button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-base text-white">{client.name}</h3>
                    <div className="flex gap-2">
                      <button onClick={() => startEditing(client)} className="text-neutral-500 hover:text-[#d4af37] transition-colors" title="Editar amigo"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => handleDeleteClient(client.id)} className="text-neutral-500 hover:text-red-400 transition-colors" title="Remover"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                  <div className="mt-2 space-y-1 text-xs text-neutral-400">
                    <p>Telefone: {client.phone}</p>
                    {client.birthDate && <p>Nasc: {client.birthDate}</p>}
                    {client.address && <p>Endereço: {client.address}</p>}
                  </div>
                </div>
              )}

              {/* BARRA DE PONTOS */}
              <div className="bg-neutral-950 border border-neutral-800 rounded-lg p-3 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-neutral-400 flex items-center gap-1"><Award className="w-3.5 h-3.5 text-[#d4af37]" /> Pontos Fidelidade</span>
                  <span className="font-bold text-[#d4af37]">{client.points || 0} pts</span>
                </div>
                <div className="w-full bg-neutral-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-[#d4af37] h-full transition-all duration-300" style={{ width: `${Math.min(((client.points || 0) / 100) * 100, 100)}%` }} />
                </div>
              </div>

              {/* HISTÓRICO COM AS FOTOS ANTES E DEPOIS NO ADMIN */}
              {client.servicesHistory && client.servicesHistory.length > 0 && (
                <div className="bg-neutral-950/50 rounded-lg p-2.5 border border-neutral-800/40 text-xs space-y-3 max-h-48 overflow-y-auto">
                  <span className="text-neutral-400 font-semibold flex items-center gap-1 text-[11px]"><History className="w-3 h-3 text-[#d4af37]" /> Histórico e Fotos:</span>
                  {client.servicesHistory.map((srv, idx) => (
                    <div key={idx} className="border-b border-neutral-800/50 pb-2 last:border-0 last:pb-0">
                      <div className="flex justify-between font-medium text-neutral-200">
                        <span>{srv.type}</span>
                        <span className="text-[#d4af37]">R$ {srv.price}</span>
                      </div>
                      <span className="text-[9px] text-neutral-600 block mt-0.5 mb-1.5">{srv.date}</span>
                      
                      {/* FOTOS ANTES E DEPOIS NO PAINEL ADMIN */}
                      {(srv.imageUrlBefore || srv.imageUrlAfter) && (
                        <div className="grid grid-cols-2 gap-2 mt-2">
                          {srv.imageUrlBefore && (
                            <div className="relative">
                              <span className="absolute top-1 left-1 bg-black/70 text-[8px] text-white px-1 rounded font-bold">ANTES</span>
                              <img src={srv.imageUrlBefore} alt="Antes" className="w-full h-20 object-cover rounded border border-neutral-800" />
                            </div>
                          )}
                          {srv.imageUrlAfter && (
                            <div className="relative">
                              <span className="absolute top-1 left-1 bg-[#d4af37] text-[8px] text-black px-1 rounded font-bold">DEPOIS</span>
                              <img src={srv.imageUrlAfter} alt="Depois" className="w-full h-20 object-cover rounded border border-neutral-800" />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-2">
                <button onClick={() => setSelectedClientForService(client)} className="flex-1 bg-[#d4af37]/10 border border-[#d4af37]/30 hover:bg-[#d4af37]/20 text-[#d4af37] text-xs font-bold py-2 rounded-lg transition-colors flex items-center justify-center gap-1">
                  <Scissors className="w-3.5 h-3.5" /> + Servico
                </button>
                <button onClick={() => handleRedeemReward(client.id, client.points || 0)} disabled={(client.points || 0) < 100} className={`flex-1 text-xs font-bold py-2 rounded-lg transition-colors flex items-center justify-center gap-1 ${(client.points || 0) >= 100 ? 'bg-[#d4af37] hover:bg-[#e6c55c] text-neutral-950' : 'bg-neutral-800/50 text-neutral-600 cursor-not-allowed'}`}>
                  <Sparkles className="w-3.5 h-3.5" /> Resgatar
                </button>
              </div>

            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
