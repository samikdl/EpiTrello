import { useState, useEffect } from 'react';
import { User, Mail, Lock, ArrowRight, CheckCircle, AlertCircle, Layout, LogOut, Plus, Trello, ArrowLeft, Loader } from 'lucide-react';
import { Toaster } from 'react-hot-toast';
import KanbanBoard from "./components/KanbanBoard";
import { getBoards, createBoard } from "./api";

interface UserData {
  id: number;
  username: string;
}

interface Board {
  id: number;
  name: string;
}

const API_BASE_URL = "http://localhost:8081";

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

  useEffect(() => {
    if (user) loadBoards();
  }, [user]);

  const loadBoards = async () => {
    try {
      const data = await getBoards();
      setBoards(data);
    } catch (error) {
      console.error("Erreur chargement boards", error);
    }
  };

  const handleCreateBoard = async () => {
    const name = prompt("Nom du nouveau tableau :");
    if (name) {
      try {
        await createBoard(name);
        loadBoards();
      } catch (e) {
        alert("Erreur création board");
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogout = () => {
    setUser(null);
    setSelectedBoard(null);
    localStorage.removeItem("user");
    setFormData({ username: "", email: "", password: "" });
    setStatus({ type: null, message: "" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: null, message: "" });

    const url = isLogin 
      ? `${API_BASE_URL}/auth/login` 
      : `${API_BASE_URL}/auth/register`;

    const payload = isLogin 
      ? { username: formData.username, password: formData.password } 
      : formData;

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const text = await response.text();

      if (response.ok) {
        try {
          const userData = JSON.parse(text);
          const finalUser = (typeof userData === 'object') ? userData : { id: 0, username: formData.username };
          setUser(finalUser);
          localStorage.setItem("user", JSON.stringify(finalUser));
        } catch {
          const fallbackUser = { id: 0, username: formData.username };
          setUser(fallbackUser);
          localStorage.setItem("user", JSON.stringify(fallbackUser));
        }
      } else {
        setStatus({ type: 'error', message: text || "Identifiants incorrects" });
      }
    } catch (error) {
      setStatus({ type: 'error', message: "Serveur inaccessible" });
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F3F4F6] relative overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-yellow-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-[-20%] left-[20%] w-[500px] h-[500px] bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>

        <div className="w-full max-w-md bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/50 relative z-10">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-500 text-white mb-4 shadow-lg shadow-indigo-500/30">
              <Layout size={28} />
            </div>
            <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight">EpiTrello</h1>
            <p className="text-gray-500 mt-2 font-medium">{isLogin ? "Bon retour parmi nous !" : "Rejoignez l'aventure"}</p>
          </div>
          
          {status.message && (
            <div className={`mb-6 p-4 rounded-xl text-sm flex items-center gap-3 border ${status.type === 'success' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
              {status.type === 'error' ? <AlertCircle size={18}/> : <CheckCircle size={18}/>}
              {status.message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="relative group">
              <User className="absolute left-4 top-3.5 text-gray-400 group-focus-within:text-indigo-600 transition-colors" size={20} />
              <input type="text" name="username" placeholder="Nom d'utilisateur" value={formData.username} onChange={handleChange} className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium" required />
            </div>
            {!isLogin && (
              <div className="relative group">
                <Mail className="absolute left-4 top-3.5 text-gray-400 group-focus-within:text-indigo-600 transition-colors" size={20} />
                <input type="email" name="email" placeholder="Adresse email" value={formData.email} onChange={handleChange} className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium" required />
              </div>
            )}
            <div className="relative group">
              <Lock className="absolute left-4 top-3.5 text-gray-400 group-focus-within:text-indigo-600 transition-colors" size={20} />
              <input type="password" name="password" placeholder="Mot de passe" value={formData.password} onChange={handleChange} className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium" required />
            </div>
            <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-indigo-500/30 flex justify-center items-center gap-2 transition-all transform hover:scale-[1.02] active:scale-95">
              {loading ? <Loader className="animate-spin" size={20}/> : <>{isLogin ? "Connexion" : "Inscription"} <ArrowRight size={20} /></>}
            </button>
          </form>
          <div className="mt-8 text-center pt-6 border-t border-gray-100">
            <button onClick={() => setIsLogin(!isLogin)} className="text-sm text-gray-500 hover:text-indigo-600 font-semibold transition-colors">
              {isLogin ? "Pas de compte ? Créer un compte" : "Déjà un compte ? Se connecter"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Toaster position="bottom-center" toastOptions={{ style: { background: '#333', color: '#fff' } }} />

      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 px-6 py-4 flex justify-between items-center sticky top-0 z-30">
        <div className="flex items-center gap-3 text-indigo-600 font-bold text-xl cursor-pointer hover:opacity-80 transition-opacity" onClick={() => setSelectedBoard(null)}>
          <div className="p-2 bg-indigo-100 rounded-lg">
            <Layout className="fill-current w-5 h-5" />
          </div>
          <span className="font-extrabold tracking-tight text-gray-900">EpiTrello</span>
        </div>
        <div className="flex items-center gap-6">
          <span className="text-sm font-medium text-gray-500 hidden sm:block">Bonjour, <span className="text-gray-900">{user.username}</span></span>
          <button onClick={handleLogout} className="flex items-center gap-2 text-red-600 hover:bg-red-50 px-4 py-2 rounded-lg text-sm font-bold transition-colors">
            <LogOut size={18} /> <span className="hidden sm:inline">Déconnexion</span>
          </button>
        </div>
      </nav>

      {selectedBoard ? (
        <div className="h-[calc(100vh-80px)] flex flex-col">
          <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center gap-4 shadow-sm z-20">
            <button onClick={() => setSelectedBoard(null)} className="text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 px-3 py-1.5 rounded-lg flex items-center gap-2 text-sm font-bold transition-all">
              <ArrowLeft size={18}/> Retour
            </button>
            <div className="h-6 w-px bg-gray-300 mx-2"></div>
            <h2 className="font-bold text-xl text-gray-800">{selectedBoard.name}</h2>
          </div>
          <KanbanBoard boardId={selectedBoard.id} />
        </div>
      ) : (
        <main className="max-w-7xl mx-auto p-8">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Trello size={32} className="text-indigo-600" />
                Vos Espaces de Travail
              </h2>
              <p className="text-gray-500 mt-2">Gérez vos projets et collaborez en toute simplicité.</p>
            </div>
            <button onClick={handleCreateBoard} className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg shadow-indigo-500/20 transition-all hover:-translate-y-1">
              <Plus size={20} /> Nouveau tableau
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {boards.map((board) => (
              <div 
                key={board.id}
                onClick={() => setSelectedBoard(board)}
                className="bg-white rounded-2xl p-6 border border-gray-200 hover:border-indigo-300 hover:shadow-xl cursor-pointer h-40 flex flex-col justify-between group transition-all duration-300 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-indigo-100 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                
                <h3 className="font-bold text-lg text-gray-800 group-hover:text-indigo-600 truncate z-10">{board.name}</h3>
                <div className="flex justify-between items-end z-10">
                  <span className="text-xs font-semibold text-gray-400 group-hover:text-indigo-400 uppercase tracking-wider">Ouvrir</span>
                  <div className="w-8 h-8 rounded-full bg-gray-100 group-hover:bg-indigo-600 group-hover:text-white text-gray-600 flex items-center justify-center text-xs font-bold transition-colors">
                    {board.name.charAt(0).toUpperCase()}
                  </div>
                </div>
              </div>
            ))}
            
            <button onClick={handleCreateBoard} className="border-2 border-dashed border-gray-300 rounded-2xl p-6 h-40 flex flex-col items-center justify-center text-gray-400 hover:border-indigo-500 hover:text-indigo-600 hover:bg-indigo-50/50 transition-all duration-300 group">
              <div className="w-12 h-12 rounded-full bg-gray-100 group-hover:bg-indigo-100 flex items-center justify-center mb-3 transition-colors">
                <Plus size={24} />
              </div>
              <span className="text-sm font-bold">Créer un tableau</span>
            </button>
          </div>
        </main>
      )}
    </div>
  );
}

export default App;