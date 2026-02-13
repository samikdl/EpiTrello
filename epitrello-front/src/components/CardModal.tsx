import { useState, useEffect } from "react";
import { X, Clock, Tag, AlignLeft, Calendar } from "lucide-react";
import { updateCard } from "../api";

interface Card {
  id: number;
  title: string;
  description: string;
  dueDate?: string;
  labels?: string[];
}

interface CardModalProps {
  card: Card;
  onClose: () => void;
  onUpdate: () => void;
}

export default function CardModal({ card, onClose, onUpdate }: CardModalProps) {
  const [title, setTitle] = useState(card.title);
  const [description, setDescription] = useState(card.description || "");
  const [dueDate, setDueDate] = useState(card.dueDate ? card.dueDate.split('T')[0] : "");
  const [newLabel, setNewLabel] = useState("");
  const [labels, setLabels] = useState<string[]>(card.labels || []);

  const handleSave = async () => {
    try {
        const dateToSend = dueDate ? `${dueDate}T00:00:00` : undefined;
        
        await updateCard(card.id, { 
            title, 
            description, 
            dueDate: dateToSend,
            labels 
        });
        onUpdate();
        onClose();
    } catch (error) {
        alert("Erreur lors de la sauvegarde");
    }
  };

  const addLabel = () => {
      if (newLabel && !labels.includes(newLabel)) {
          setLabels([...labels, newLabel]);
          setNewLabel("");
      }
  };

  const removeLabel = (labelToRemove: string) => {
      setLabels(labels.filter(l => l !== labelToRemove));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative">
        

        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800">
          <X size={24} />
        </button>

        {/* --- Header Image (Optionnel, style Trello) --- */}
        <div className="h-32 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-t-xl"></div>

        <div className="p-8">
            {/* --- TITRE --- */}
            <div className="mb-6">
                <input 
                    type="text" 
                    value={title} 
                    onChange={(e) => setTitle(e.target.value)}
                    className="text-2xl font-bold w-full border-none focus:ring-2 focus:ring-blue-500 rounded p-1 text-gray-800 bg-transparent"
                />
                <p className="text-sm text-gray-500 mt-1 ml-1">Dans la liste...</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Colonne Gauche (Contenu Principal) */}
                <div className="md:col-span-2 space-y-6">
                    
                    {/* LABELS */}
                    <div>
                        <h3 className="flex items-center gap-2 font-semibold text-gray-700 mb-2">
                            <Tag size={18} /> Étiquettes
                        </h3>
                        <div className="flex flex-wrap gap-2 mb-2">
                            {labels.map(label => (
                                <span key={label} className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                                    {label}
                                    <button onClick={() => removeLabel(label)} className="hover:text-blue-900"><X size={12}/></button>
                                </span>
                            ))}
                        </div>
                        <div className="flex gap-2">
                            <input 
                                type="text" 
                                placeholder="Nouvelle étiquette..." 
                                className="border rounded px-2 py-1 text-sm flex-1"
                                value={newLabel}
                                onChange={(e) => setNewLabel(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && addLabel()}
                            />
                            <button onClick={addLabel} className="bg-gray-100 px-3 py-1 rounded text-sm hover:bg-gray-200">Ajouter</button>
                        </div>
                    </div>

                    {/* DESCRIPTION */}
                    <div>
                        <h3 className="flex items-center gap-2 font-semibold text-gray-700 mb-2">
                            <AlignLeft size={18} /> Description
                        </h3>
                        <textarea 
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Ajouter une description plus détaillée..."
                            className="w-full min-h-[150px] p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none text-gray-700 bg-gray-50 focus:bg-white transition-colors"
                        />
                    </div>
                </div>

                {/* Colonne Droite (Métadonnées / Actions) */}
                <div className="space-y-6">
                    
                    {/* DATE D'ÉCHÉANCE */}
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                        <h3 className="flex items-center gap-2 font-semibold text-gray-700 mb-3 text-sm">
                            <Calendar size={16} /> Date d'échéance
                        </h3>
                        <input 
                            type="date" 
                            value={dueDate}
                            onChange={(e) => setDueDate(e.target.value)}
                            className="w-full border rounded p-2 text-sm text-gray-600"
                        />
                    </div>

                    {/* ACTIONS */}
                    <button 
                        onClick={handleSave}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded shadow-lg transition-transform active:scale-95"
                    >
                        Sauvegarder
                    </button>
                    
                    <p className="text-xs text-center text-gray-400">
                        Appuyez sur Echap pour annuler
                    </p>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}