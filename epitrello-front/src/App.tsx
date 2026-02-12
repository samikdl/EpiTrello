import { useState, useEffect } from 'react';
import { User, Mail, Lock, ArrowRight, CheckCircle, AlertCircle, Layout, LogOut, Plus, Trello, ArrowLeft } from 'lucide-react';
import { getBoards, createBoard } from "./api";
import KanbanBoard from "./components/KanbanBoard";

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

  const [boards, setBoards] = useState<Board[]>([]);
  const [selectedBoard, setSelectedBoard] = useState<Board | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ username: "", email: "", password: "" });
  const [status, setStatus] = useState<{ type: 'success' | 'error' | null, message: string }>({ type: null, message: "" });

  useEffect(() => {
    if (user) {
      loadBoards();
    }
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
    const name = window.prompt("Nom du nouveau tableau :");
    if (name) {
      try {
        await createBoard(name);
        loadBoards();
      } catch (error) {
        alert("Erreur lors de la création");
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogout = () => {
    setUser(null);
    setSelectedBoard(null);
    setBoards([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: null, message: "" });

    const url = isLogin ? `${API_BASE_URL}/auth/login` : `${API_BASE_URL}/auth/register`;
    const payload = isLogin ? { username: formData.username, password: formData.password } : formData;

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const text = await response.text();
      if (response.ok) {
         setUser({ id: 0, username: formData.username });
      } else {
        setStatus({ type: 'error', message: text || "Erreur" });
      }
    } catch (error) {
      setStatus({ type: 'error', message: "Serveur inaccessible" });
    } finally {
      setLoading(false);
    }
  };

  if (user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white border-b border-gray-200 px-6 py-3 flex justify-between items-center sticky top-0 z-20 shadow-sm">
          <div className="flex items-center gap-2 text-indigo-600 font-bold text-xl cursor-pointer" onClick={() => setSelectedBoard(null)}>
            <Layout className="fill-current" />
            <span>EpiTrello</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">Bonjour, <b>{user.username}</b></span>
            <button onClick={handleLogout} className="text-red-600 hover:bg-red-50 p-2 rounded"><LogOut size={16} /></button>
          </div>
        </nav>

        {selectedBoard ? (
          <div className="h-[calc(100vh-64px)] flex flex-col">
            <div className="bg-white border-b border-gray-200 px-6 py-2 flex items-center gap-4 shadow-sm z-10">
                <button onClick={() => setSelectedBoard(null)} className="text-gray-500 hover:text-indigo-600 flex items-center gap-1 text-sm font-medium">
                    <ArrowLeft size={16}/> Retour
                </button>
                <div className="h-6 w-px bg-gray-300"></div>
                <h2 className="font-bold text-gray-800">{selectedBoard.name}</h2>
            </div>
            
            <KanbanBoard boardId={selectedBoard.id} />
          </div>
        ) : (
          
          <main className="max-w-6xl mx-auto p-6">
            <div className="flex justify-between items-end mb-6">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <Trello size={24} className="text-gray-500" />
                Vos Tableaux
              </h2>
              <button 
                onClick={handleCreateBoard}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors shadow-sm"
              >
                <Plus size={16} /> Nouveau tableau
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              
              {boards.map((board) => (
                <div 
                  key={board.id}
                  onClick={() => setSelectedBoard(board)}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md hover:border-indigo-300 cursor-pointer h-32 flex flex-col justify-between group transition-all"
                >
                  <h3 className="font-semibold text-gray-800 group-hover:text-indigo-600 transition-colors truncate">
                    {board.name}
                  </h3>
                  <div className="flex justify-between items-end">
                    <span className="text-xs text-gray-400">Ouvrir</span>
                    <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">
                      {board.name.charAt(0).toUpperCase()}
                    </div>
                  </div>
                </div>
              ))}

              <button 
                onClick={handleCreateBoard}
                className="border-2 border-dashed border-gray-300 rounded-xl p-4 h-32 flex flex-col items-center justify-center text-gray-400 hover:border-indigo-400 hover:text-indigo-500 hover:bg-indigo-50 transition-all"
              >
                <Plus size={32} />
                <span className="text-sm font-medium mt-2">Créer un tableau</span>
              </button>
            </div>
          </main>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 to-blue-500 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-800">EpiTrello</h1>
            <p className="text-gray-500 text-sm mt-1">{isLogin ? "Connectez-vous" : "Créez un compte"}</p>
          </div>
          {status.message && (
            <div className={`mb-6 p-3 rounded-lg flex items-center gap-3 text-sm ${status.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
              {status.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
              {status.message}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative group">
              <User className="absolute left-3 top-3.5 text-gray-400" size={18} />
              <input type="text" name="username" placeholder="Utilisateur" value={formData.username} onChange={handleChange} className="w-full pl-10 pr-4 py-3 bg-gray-50 border rounded-lg" required />
            </div>
            {!isLogin && (
               <div className="relative group">
                 <Mail className="absolute left-3 top-3.5 text-gray-400" size={18} />
                 <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} className="w-full pl-10 pr-4 py-3 bg-gray-50 border rounded-lg" required />
               </div>
            )}
            <div className="relative group">
              <Lock className="absolute left-3 top-3.5 text-gray-400" size={18} />
              <input type="password" name="password" placeholder="Mot de passe" value={formData.password} onChange={handleChange} className="w-full pl-10 pr-4 py-3 bg-gray-50 border rounded-lg" required />
            </div>
            <button type="submit" disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-lg shadow-lg flex justify-center items-center gap-2">
              {loading ? "..." : (isLogin ? "Se connecter" : "S'inscrire")} <ArrowRight size={16} />
            </button>
          </form>
          <div className="mt-6 text-center pt-6 border-t">
            <button onClick={() => setIsLogin(!isLogin)} className="text-indigo-600 font-semibold hover:underline">
              {isLogin ? "Créer un compte" : "Se connecter"}
            </button>
          </div>
      </div>
    </div>
  );
}

export default App;