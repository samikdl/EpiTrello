import { useState } from "react";
import { X, Tag, AlignLeft, Calendar, Save, Clock } from "lucide-react";
import { updateCard } from "../api";

interface Card { id: number; title: string; description: string; dueDate?: string; labels?: string[]; }
interface CardModalProps { card: Card; onClose: () => void; onUpdate: () => void; }

const PRESET_LABELS = ['Design','Dev','Bug','Feature','Urgent','Review','Test','Docs'];
const LABEL_STYLES: Record<string, string> = {
  'Design':'bg-violet-100 text-violet-700 border-violet-200',
  'Dev':'bg-blue-100 text-blue-700 border-blue-200',
  'Bug':'bg-red-100 text-red-700 border-red-200',
  'Feature':'bg-emerald-100 text-emerald-700 border-emerald-200',
  'Urgent':'bg-orange-100 text-orange-700 border-orange-200',
  'Review':'bg-amber-100 text-amber-700 border-amber-200',
  'Test':'bg-cyan-100 text-cyan-700 border-cyan-200',
  'Docs':'bg-fuchsia-100 text-fuchsia-700 border-fuchsia-200',
};
const getLabelStyle = (l: string) => LABEL_STYLES[l] || 'bg-slate-100 text-slate-600 border-slate-200';

export default function CardModal({ card, onClose, onUpdate }: CardModalProps) {
  const [title, setTitle] = useState(card.title);
  const [description, setDescription] = useState(card.description || "");
  const [dueDate, setDueDate] = useState(card.dueDate ? card.dueDate.split('T')[0] : "");
  const [newLabel, setNewLabel] = useState("");
  const [labels, setLabels] = useState<string[]>(card.labels || []);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateCard(card.id, { title, description, dueDate: dueDate ? `${dueDate}T00:00:00` : undefined, labels });
      onUpdate(); onClose();
    } catch { alert("Erreur lors de la sauvegarde"); }
    finally { setSaving(false); }
  };

  const addLabel = (label?: string) => {
    const lbl = label || newLabel;
    if (lbl && !labels.includes(lbl)) { setLabels([...labels, lbl]); setNewLabel(""); }
  };

  const removeLabel = (l: string) => setLabels(labels.filter(x => x !== l));

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-2xl shadow-2xl shadow-slate-300/50 w-full max-w-2xl max-h-[90vh] overflow-y-auto relative border border-slate-200">
        {/* Top accent */}
        <div className="h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-t-2xl"/>

        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 hover:bg-slate-100 p-1.5 rounded-lg transition-all z-10">
          <X size={18}/>
        </button>

        <div className="p-6 sm:p-8">
          {/* Title */}
          <div className="mb-7 pr-8">
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
              className="text-xl sm:text-2xl font-black w-full border-none outline-none text-slate-800 placeholder-slate-300 bg-transparent"
              placeholder="Titre de la carte..."/>
            <div className="h-px bg-gradient-to-r from-indigo-400/60 to-transparent mt-2"/>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="sm:col-span-2 space-y-6">
              {/* Labels */}
              <div>
                <h3 className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                  <Tag size={12}/> Étiquettes
                </h3>
                {labels.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {labels.map(label => (
                      <span key={label} className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border ${getLabelStyle(label)}`}>
                        {label}
                        <button onClick={() => removeLabel(label)} className="hover:opacity-60 transition-opacity"><X size={10}/></button>
                      </span>
                    ))}
                  </div>
                )}
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {PRESET_LABELS.filter(p => !labels.includes(p)).map(preset => (
                    <button key={preset} onClick={() => addLabel(preset)}
                      className="px-2.5 py-1 rounded-lg text-xs font-medium text-slate-500 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-all">
                      + {preset}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input type="text" placeholder="Étiquette personnalisée..." value={newLabel} onChange={(e) => setNewLabel(e.target.value)}
                    onKeyDown={(e) => e.key==='Enter' && addLabel()}
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 placeholder-slate-400 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all"/>
                  <button onClick={() => addLabel()} className="bg-slate-100 hover:bg-slate-200 text-slate-600 px-3 py-2 rounded-xl text-sm font-medium transition-colors border border-slate-200">
                    Ajouter
                  </button>
                </div>
              </div>

              {/* Description */}
              <div>
                <h3 className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                  <AlignLeft size={12}/> Description
                </h3>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ajouter une description détaillée..."
                  className="w-full min-h-[140px] p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 placeholder-slate-400 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 resize-none transition-all"/>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                <h3 className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                  <Calendar size={12}/> Échéance
                </h3>
                <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-sm text-slate-600 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all"/>
                {dueDate && (
                  <p className={`text-xs mt-2 font-semibold flex items-center gap-1 ${new Date(dueDate) < new Date() ? 'text-red-500' : 'text-emerald-600'}`}>
                    <Clock size={10}/> {new Date(dueDate) < new Date() ? 'En retard' : 'À venir'}
                  </p>
                )}
              </div>

              <button onClick={handleSave} disabled={saving}
                className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold py-2.5 px-4 rounded-xl shadow-md shadow-indigo-200/60 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-60">
                <Save size={15}/> {saving ? 'Sauvegarde...' : 'Sauvegarder'}
              </button>
              <p className="text-xs text-center text-slate-400">Échap pour annuler</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}