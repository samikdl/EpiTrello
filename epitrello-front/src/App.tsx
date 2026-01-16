import { useState } from 'react';
import { User, Mail, Lock, ArrowRight, CheckCircle, AlertCircle, Layout, LogOut, Plus, Trello, ArrowLeft } from 'lucide-react';
import KanbanBoard from "./components/KanbanBoard";

interface UserData {
  id: number;
  username: string;
  email?: string;
}

const API_BASE_URL = "http://localhost:8081";

function App() {
  const [user, setUser] = useState<UserData | null>(null);
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [selectedBoard, setSelectedBoard] = useState<number | null>(null);
  
  const [formData, setFormData] = useState({ username: "", email: "", password: "" });
  const [status, setStatus] = useState<{ type: 'success' | 'error' | null, message: string }>({ type: null, message: "" });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogout = () => {
    setUser(null);
    setSelectedBoard(null);
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
          if (typeof userData === 'object') {
            setUser(userData);
          } else {
            setUser({ id: 0, username: formData.username });
          }
        } catch {
          setUser({ id: 0, username: formData.username });
        }
      } else {
        setStatus({ type: 'error', message: text || "Identifiants incorrects" });
      }
    } catch (error) {
      setStatus({ type: 'error', message: "Serveur inaccessible (Vérifie que Spring Boot tourne)" });
    } finally {
      setLoading(false);
    }
  };

  if (user) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* NAVBAR Commune */}
        <nav className="bg-white border-b border-gray-200 px-6 py-3 flex justify-between items-center sticky top-0 z-20 shadow-sm">
          <div className="flex items-center gap-2 text-indigo-600 font-bold text-xl cursor-pointer" onClick={() => setSelectedBoard(null)}>
            <Layout className="fill-current" />
            <span>EpiTrello</span>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden md:block text-sm text-gray-600">
              Bonjour, <span className="font-semibold text-gray-900">{user.username}</span>
            </div>
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 text-sm font-medium text-red-600 hover:bg-red-50 px-3 py-2 rounded-lg transition-colors"
            >
              <LogOut size={16} />
              Déconnexion
            </button>
          </div>
        </nav>

        {selectedBoard !== null ? (
          <div className="h-[calc(100vh-64px)]">
             {/* Barre d'outils du tableau */}
            <div className="bg-white border-b border-gray-200 px-6 py-2 flex items-center gap-4">
                <button 
                    onClick={() => setSelectedBoard(null)}
                    className="text-gray-500 hover:text-indigo-600 transition-colors flex items-center gap-1 text-sm font-medium"
                >
                    <ArrowLeft size={16}/> Retour
                </button>
                <div className="h-6 w-px bg-gray-300"></div>
                <h2 className="font-bold text-gray-800">Projet EpiTrello</h2>
            </div>     
            <KanbanBoard />
          </div>
        ) : (
          
          <main className="max-w-6xl mx-auto p-6">
            <div className="flex justify-between items-end mb-6">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <Trello size={24} className="text-gray-500" />
                Vos Tableaux
              </h2>
              <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors shadow-sm">
                <Plus size={16} />
                Nouveau tableau
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              
              <div 
                onClick={() => setSelectedBoard(1)}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-all hover:border-indigo-300 cursor-pointer h-32 flex flex-col justify-between group"
              >
                <h3 className="font-semibold text-gray-800 group-hover:text-indigo-600 transition-colors">Projet EpiTrello</h3>
                <div className="flex justify-between items-end">
                  <span className="text-xs text-gray-400">Cliquez pour ouvrir</span>
                  <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                </div>
              </div>

               <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl shadow-sm p-4 h-32 flex flex-col justify-between text-white opacity-70 cursor-not-allowed" title="Bientôt disponible">
                <h3 className="font-semibold">Dev Personnel</h3>
                <span className="text-xs text-purple-100">Bientôt disponible</span>
              </div>

              <button className="border-2 border-dashed border-gray-300 rounded-xl p-4 h-32 flex flex-col items-center justify-center text-gray-400 hover:border-indigo-400 hover:text-indigo-500 hover:bg-indigo-50 transition-all">
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
      <div className="fixed top-10 left-10 w-72 h-72 bg-white opacity-10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="fixed bottom-10 right-10 w-96 h-96 bg-indigo-400 opacity-20 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden relative z-10">
        <div className="p-8">
          
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 mb-4">
              <Layout size={24} />
            </div>
            <h1 className="text-2xl font-bold text-gray-800">EpiTrello</h1>
            <p className="text-gray-500 text-sm mt-1">
              {isLogin ? "Connectez-vous à votre espace." : "Créez votre compte en quelques secondes."}
            </p>
          </div>

          {status.message && (
            <div className={`mb-6 p-3 rounded-lg flex items-center gap-3 text-sm ${
              status.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {status.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
              {status.message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative group">
              <User className="absolute left-3 top-3.5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
              <input 
                type="text" 
                name="username"
                placeholder="Nom d'utilisateur" 
                value={formData.username}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-sm"
                required 
              />
            </div>

            {!isLogin && (
              <div className={`relative group transition-all duration-300 ${isLogin ? 'hidden' : 'block'}`}>
                <Mail className="absolute left-3 top-3.5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                <input 
                  type="email" 
                  name="email"
                  placeholder="Adresse email" 
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-sm"
                  required={!isLogin} 
                />
              </div>
            )}

            <div className="relative group">
              <Lock className="absolute left-3 top-3.5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
              <input 
                type="password" 
                name="password"
                placeholder="Mot de passe" 
                value={formData.password}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-sm"
                required 
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-lg shadow-lg shadow-indigo-500/30 flex items-center justify-center gap-2 transition-all transform hover:scale-[1.01] active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed text-sm"
            >
              {loading ? (
                <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
              ) : (
                <>
                  {isLogin ? "Se connecter" : "S'inscrire"} <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center pt-6 border-t border-gray-100">
            <p className="text-gray-500 text-xs">
              {isLogin ? "Pas encore de compte ?" : "Vous avez déjà un compte ?"}
              <button 
                onClick={() => { setIsLogin(!isLogin); setStatus({type:null, message:""}); }} 
                className="ml-1 text-indigo-600 font-semibold hover:text-indigo-800 transition-colors hover:underline"
              >
                {isLogin ? "Créer un compte" : "Se connecter"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;