import { useState, useEffect } from 'react';
import { User, Mail, Lock, ArrowRight, CheckCircle, AlertCircle, LogOut, Plus, ArrowLeft, Loader, Zap, Sparkles, Trash2 } from 'lucide-react';
import { Toaster } from 'react-hot-toast';
import KanbanBoard from "./components/KanbanBoard";
import { getBoards, createBoard } from "./api";

interface UserData { id: number; username: string; }
interface Board { id: number; name: string; }

const API_BASE_URL = "http://localhost:8081";

const BOARD_GRADIENTS = [
  { from: '#6366f1', to: '#8b5cf6' },
  { from: '#f43f5e', to: '#ec4899' },
  { from: '#f59e0b', to: '#f97316' },
  { from: '#10b981', to: '#14b8a6' },
  { from: '#06b6d4', to: '#3b82f6' },
  { from: '#a855f7', to: '#d946ef' },
];

function App() {
  const [user, setUser] = useState<UserData | null>(null);
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [boards, setBoards] = useState<Board[]>([]);
  const [selectedBoard, setSelectedBoard] = useState<Board | null>(null);
  const [formData, setFormData] = useState({ username: "", email: "", password: "" });
  const [status, setStatus] = useState<{ type: 'success' | 'error' | null, message: string }>({ type: null, message: "" });

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) setUser(JSON.parse(savedUser));
  }, []);

  useEffect(() => { if (user) loadBoards(); }, [user]);

  const loadBoards = async () => {
    try { setBoards(await getBoards()); } catch (e) { console.error(e); }
  };

  const handleCreateBoard = async () => {
    const name = prompt("Nom du nouveau tableau :");
    if (!name) return;
    try {
      await createBoard(name);
      loadBoards();
    } catch { alert("Erreur création board"); }
  };

  const handleDeleteBoard = async (e: React.MouseEvent, boardId: number) => {
    e.stopPropagation();
    if (!confirm("Supprimer ce tableau et toutes ses listes ?")) return;
    try {
      await fetch(`${API_BASE_URL}/boards/${boardId}`, { method: "DELETE" });
      setBoards(prev => prev.filter(b => b.id !== boardId));
    } catch { alert("Erreur suppression"); }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogout = () => {
    setUser(null); setSelectedBoard(null);
    localStorage.removeItem("user");
    setFormData({ username: "", email: "", password: "" });
    setStatus({ type: null, message: "" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setStatus({ type: null, message: "" });
    const url = isLogin ? `${API_BASE_URL}/auth/login` : `${API_BASE_URL}/auth/register`;
    const payload = isLogin ? { username: formData.username, password: formData.password } : formData;
    try {
      const response = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const text = await response.text();
      if (response.ok) {
        try {
          const userData = JSON.parse(text);
          const finalUser = typeof userData === 'object' ? userData : { id: 0, username: formData.username };
          setUser(finalUser); localStorage.setItem("user", JSON.stringify(finalUser));
        } catch {
          const fallback = { id: 0, username: formData.username };
          setUser(fallback); localStorage.setItem("user", JSON.stringify(fallback));
        }
      } else { setStatus({ type: 'error', message: text || "Identifiants incorrects" }); }
    } catch { setStatus({ type: 'error', message: "Serveur inaccessible" }); }
    finally { setLoading(false); }
  };

  if (!user) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 via-indigo-50 to-violet-50 relative overflow-hidden p-4">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-200/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-200/50 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3" />
      <div className="absolute inset-0" style={{backgroundImage:'radial-gradient(circle,rgba(99,102,241,0.07) 1px,transparent 1px)',backgroundSize:'32px 32px'}} />
      <div className="w-full max-w-sm relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2.5 mb-5">
            <div className="w-11 h-11 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-300/60">
              <Zap size={22} className="text-white" />
            </div>
            <span className="text-2xl font-black text-slate-800">EpiTrello</span>
          </div>
          <h1 className="text-3xl font-black text-slate-800 mb-1.5">{isLogin ? 'Bon retour 👋' : 'Créer un compte'}</h1>
          <p className="text-slate-500 text-sm">{isLogin ? 'Connectez-vous à votre espace' : "Rejoignez l'aventure"}</p>
        </div>
        <div className="bg-white/80 backdrop-blur-xl border border-white/80 rounded-2xl p-6 shadow-xl shadow-slate-200/70">
          {status.message && (
            <div className={`mb-5 p-3 rounded-xl text-sm flex items-center gap-2.5 ${status.type==='error' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-green-50 text-green-600 border border-green-100'}`}>
              {status.type==='error' ? <AlertCircle size={16}/> : <CheckCircle size={16}/>} {status.message}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div className="relative"><User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16}/>
              <input type="text" name="username" placeholder="Nom d'utilisateur" value={formData.username} onChange={handleChange} required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all"/>
            </div>
            {!isLogin && <div className="relative"><Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16}/>
              <input type="email" name="email" placeholder="Adresse email" value={formData.email} onChange={handleChange} required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all"/>
            </div>}
            <div className="relative"><Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16}/>
              <input type="password" name="password" placeholder="Mot de passe" value={formData.password} onChange={handleChange} required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all"/>
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold py-3 rounded-xl flex justify-center items-center gap-2 transition-all shadow-md shadow-indigo-200/80 active:scale-95 mt-1">
              {loading ? <Loader className="animate-spin" size={18}/> : <>{isLogin ? 'Connexion' : "S'inscrire"} <ArrowRight size={16}/></>}
            </button>
          </form>
        </div>
        <div className="text-center mt-5">
          <button onClick={() => setIsLogin(!isLogin)} className="text-sm text-slate-500 hover:text-indigo-600 transition-colors">
            {isLogin ? "Pas de compte ? " : "Déjà un compte ? "}
            <span className="font-bold text-indigo-500">{isLogin ? "S'inscrire" : "Se connecter"}</span>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <Toaster position="bottom-center" toastOptions={{ style: { background:'#1e293b', color:'#f1f5f9', borderRadius:'12px', fontSize:'14px' } }}/>

      <nav className="bg-white border-b border-slate-200 px-4 sm:px-6 py-3 flex justify-between items-center sticky top-0 z-30 shadow-sm">
        <div className="flex items-center gap-2.5 cursor-pointer group" onClick={() => setSelectedBoard(null)}>
          <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shadow-md shadow-indigo-200 group-hover:scale-105 transition-transform">
            <Zap size={16} className="text-white"/>
          </div>
          <span className="text-lg font-black text-slate-800">EpiTrello</span>
        </div>
        {selectedBoard && <div className="hidden sm:flex items-center gap-2"><span className="text-slate-300 text-xs">›</span><span className="text-sm font-semibold text-slate-700">{selectedBoard.name}</span></div>}
        <div className="flex items-center gap-3">
          <span className="hidden sm:block text-xs text-slate-400">Bonjour, <span className="text-slate-700 font-semibold">{user.username}</span></span>
          <button onClick={handleLogout} className="flex items-center gap-1.5 text-slate-500 hover:text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border border-transparent hover:border-red-100">
            <LogOut size={14}/><span className="hidden sm:inline">Déco</span>
          </button>
        </div>
      </nav>

      {selectedBoard ? (
        <div className="h-[calc(100vh-57px)] flex flex-col">
          <div className="bg-white border-b border-slate-200 px-4 sm:px-6 py-2.5 flex items-center gap-3">
            <button onClick={() => setSelectedBoard(null)} className="text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 text-xs font-bold transition-all">
              <ArrowLeft size={14}/> Retour
            </button>
            <div className="h-4 w-px bg-slate-200"/>
            <h2 className="font-bold text-base text-slate-800">{selectedBoard.name}</h2>
          </div>
          <KanbanBoard boardId={selectedBoard.id}/>
        </div>
      ) : (
        <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 mb-8 pt-2">
            <div>
              <div className="flex items-center gap-2 mb-1"><Sparkles size={14} className="text-indigo-500"/><span className="text-indigo-500 text-xs font-bold uppercase tracking-wider">Espace de travail</span></div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-800">Vos tableaux</h2>
              <p className="text-slate-400 text-sm mt-1">Gérez vos projets en toute simplicité</p>
            </div>
            <button onClick={handleCreateBoard} className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-4 py-2.5 rounded-xl text-sm font-bold shadow-md shadow-indigo-200/60 transition-all hover:-translate-y-0.5 active:scale-95 self-start sm:self-auto">
              <Plus size={16}/> Nouveau tableau
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {boards.map((board, index) => {
              const grad = BOARD_GRADIENTS[index % BOARD_GRADIENTS.length];
              return (
                <div key={board.id} onClick={() => setSelectedBoard(board)}
                  className="group relative bg-white border border-slate-200 hover:border-slate-300 rounded-2xl p-5 cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200/80 overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl" style={{background:`linear-gradient(to right, ${grad.from}, ${grad.to})`}}/>
                  <div className="flex justify-between items-start mb-6 mt-1">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-white text-sm shadow-md" style={{background:`linear-gradient(135deg, ${grad.from}, ${grad.to})`}}>
                      {board.name.charAt(0).toUpperCase()}
                    </div>
                    <button onClick={(e) => handleDeleteBoard(e, board.id)}
                      className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all" title="Supprimer">
                      <Trash2 size={14}/>
                    </button>
                  </div>
                  <h3 className="font-bold text-slate-800 text-base truncate mb-1">{board.name}</h3>
                  <p className="text-xs text-slate-400 group-hover:text-indigo-500 transition-colors font-semibold">Ouvrir →</p>
                </div>
              );
            })}
            <button onClick={handleCreateBoard} className="group border-2 border-dashed border-slate-200 hover:border-indigo-300 rounded-2xl p-5 flex flex-col items-center justify-center text-slate-400 hover:text-indigo-500 hover:bg-indigo-50/50 transition-all duration-200 min-h-[148px]">
              <div className="w-10 h-10 rounded-xl bg-slate-100 group-hover:bg-indigo-100 flex items-center justify-center mb-2.5 transition-colors"><Plus size={20}/></div>
              <span className="text-sm font-bold">Créer un tableau</span>
            </button>
          </div>
        </main>
      )}
    </div>
  );
}

export default App;