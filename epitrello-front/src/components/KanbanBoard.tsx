import { useEffect, useState } from "react";
import { DragDropContext, Droppable, Draggable, type DropResult } from "@hello-pangea/dnd";
import { Plus, X, Trash2, Clock, GripVertical } from "lucide-react";
import toast from "react-hot-toast";
import { getLists, getCards, moveCard, createList, createCard, deleteCard, deleteList, updateList } from "../api";
import CardModal from "./CardModal";

interface Card {
  id: number; title: string; description: string;
  position: number; dueDate?: string; labels?: string[];
}
interface TaskList {
  id: number; title: string; position: number; cards: Card[];
}
interface KanbanBoardProps { boardId: number; }

const API_BASE_URL = "http://localhost:8081";

const LIST_COLORS = [
  '#6366f1','#f43f5e','#f59e0b','#10b981','#06b6d4','#a855f7','#f97316','#14b8a6'
];

export default function KanbanBoard({ boardId }: KanbanBoardProps) {
  const [lists, setLists] = useState<TaskList[]>([]);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [isAddingList, setIsAddingList] = useState(false);
  const [newListTitle, setNewListTitle] = useState("");
  const [addingCardToListId, setAddingCardToListId] = useState<number | null>(null);
  const [newCardTitle, setNewCardTitle] = useState("");

  const fetchData = async () => {
    try {
      const listsData = await getLists(boardId);
      const listsWithCards = await Promise.all(
        listsData.map(async (list: any) => {
          const cards = await getCards(list.id);
          cards.sort((a: Card, b: Card) => a.position - b.position);
          return { ...list, cards };
        })
      );
      listsWithCards.sort((a, b) => a.position - b.position);
      setLists(listsWithCards);
    } catch { toast.error("Impossible de charger le tableau"); }
  };

  useEffect(() => { if (boardId) { setLists([]); fetchData(); } }, [boardId]);

  const handleCreateList = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newListTitle.trim()) return;
    try {
      await createList(boardId, newListTitle);
      setNewListTitle(""); setIsAddingList(false);
      fetchData(); toast.success("Liste créée !");
    } catch { toast.error("Erreur création liste"); }
  };

  const handleRenameList = async (list: TaskList) => {
    const newTitle = prompt("Nouveau nom de la liste :", list.title);
    if (newTitle && newTitle !== list.title) {
      try {
        setLists(prev => prev.map(l => l.id === list.id ? { ...l, title: newTitle } : l));
        await updateList(list.id, newTitle);
        toast.success("Liste renommée");
      } catch { toast.error("Erreur renommage"); fetchData(); }
    }
  };

  const handleCreateCard = async (e: React.FormEvent, listId: number) => {
    e.preventDefault();
    if (!newCardTitle.trim()) return;
    try {
      await createCard(listId, newCardTitle);
      setNewCardTitle(""); setAddingCardToListId(null);
      fetchData(); toast.success("Carte ajoutée");
    } catch { toast.error("Erreur création carte"); }
  };

  const handleDeleteCard = async (cardId: number) => {
    if (!confirm("Supprimer cette carte ?")) return;
    try {
      setLists(prev => prev.map(l => ({ ...l, cards: l.cards.filter(c => c.id !== cardId) })));
      await deleteCard(cardId);
      toast.success("Carte supprimée");
    } catch { toast.error("Erreur suppression"); fetchData(); }
  };

  const handleDeleteList = async (listId: number) => {
    if (!confirm("Supprimer cette liste et ses cartes ?")) return;
    try {
      setLists(prev => prev.filter(l => l.id !== listId));
      await deleteList(listId);
      toast.success("Liste supprimée");
    } catch { toast.error("Erreur suppression"); fetchData(); }
  };

  const onDragEnd = async (result: DropResult) => {
    const { source, destination, draggableId, type } = result;
    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    // Drag & drop des LISTES
    if (type === "LIST") {
      const newLists = [...lists];
      const [moved] = newLists.splice(source.index, 1);
      newLists.splice(destination.index, 0, moved);
      setLists(newLists);

      // Mettre à jour la position de chaque liste côté serveur
      try {
        await Promise.all(
          newLists.map((list, index) =>
            fetch(`${API_BASE_URL}/lists/${list.id}`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ title: list.title, position: index }),
            })
          )
        );
      } catch { toast.error("Erreur déplacement liste"); fetchData(); }
      return;
    }

    // Drag & drop des CARTES
    const newLists = [...lists];
    const srcIdx = newLists.findIndex(l => l.id.toString() === source.droppableId);
    const dstIdx = newLists.findIndex(l => l.id.toString() === destination.droppableId);
    if (srcIdx === -1 || dstIdx === -1) return;

    const [movedCard] = newLists[srcIdx].cards.splice(source.index, 1);
    newLists[dstIdx].cards.splice(destination.index, 0, movedCard);
    setLists(newLists);

    try {
      await moveCard(Number(draggableId), newLists[dstIdx].id);
    } catch { toast.error("Erreur déplacement"); }
  };

  const isOverdue = (d: string) => new Date(d) < new Date();

  return (
    <div className="flex-1 overflow-x-auto bg-gradient-to-br from-slate-100 to-indigo-50/50 p-4 sm:p-6 flex items-start gap-4 min-h-full">
      <DragDropContext onDragEnd={onDragEnd}>
        {/* Zone de drag pour les listes */}
        <Droppable droppableId="board" type="LIST" direction="horizontal">
          {(boardProvided) => (
            <div
              ref={boardProvided.innerRef}
              {...boardProvided.droppableProps}
              className="flex items-start gap-4"
            >
              {lists.map((list, listIndex) => (
                <Draggable key={list.id} draggableId={`list-${list.id}`} index={listIndex}>
                  {(listProvided, listSnapshot) => (
                    <div
                      ref={listProvided.innerRef}
                      {...listProvided.draggableProps}
                      className={`flex-shrink-0 w-72 flex flex-col rounded-2xl border transition-all duration-200 ${
                        listSnapshot.isDragging
                          ? 'rotate-1 shadow-2xl shadow-slate-300/80 scale-105'
                          : 'shadow-sm'
                      } bg-white border-slate-200`}
                      style={{ 
                        maxHeight: 'calc(100vh - 140px)',
                        ...listProvided.draggableProps.style
                      }}
                    >
                      {/* List header */}
                      <div className="px-3 py-2.5 flex justify-between items-center border-b border-slate-100">
                        {/* Drag handle pour la liste */}
                        <div {...listProvided.dragHandleProps} className="p-1 cursor-grab active:cursor-grabbing text-slate-300 hover:text-slate-400 transition-colors">
                          <GripVertical size={14}/>
                        </div>
                        <div
                          className="w-2 h-2 rounded-full flex-shrink-0 mx-1"
                          style={{background: LIST_COLORS[listIndex % LIST_COLORS.length]}}
                        />
                        <span
                          onClick={() => handleRenameList(list)}
                          className="text-sm font-bold text-slate-700 cursor-pointer hover:text-indigo-600 transition-colors truncate flex-1 mx-1"
                        >
                          {list.title}
                        </span>
                        <span className="text-xs text-slate-400 font-semibold bg-slate-100 px-1.5 py-0.5 rounded-md mr-1">
                          {list.cards.length}
                        </span>
                        <button onClick={() => handleDeleteList(list.id)}
                          className="text-slate-300 hover:text-red-400 hover:bg-red-50 p-1 rounded-lg transition-all flex-shrink-0">
                          <X size={14}/>
                        </button>
                      </div>

                      {/* Cards droppable */}
                      <Droppable droppableId={list.id.toString()} type="CARD">
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                            className={`px-3 py-2 flex-1 overflow-y-auto space-y-2 min-h-[20px] transition-colors rounded-b-xl ${
                              snapshot.isDraggingOver ? 'bg-indigo-50/80' : ''
                            }`}
                          >
                            {list.cards.map((card, index) => (
                              <Draggable key={card.id} draggableId={card.id.toString()} index={index}>
                                {(provided, snapshot) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    onClick={() => setSelectedCard(card)}
                                    className={`group relative bg-white border rounded-xl p-3 cursor-pointer transition-all duration-150 ${
                                      snapshot.isDragging
                                        ? 'rotate-1 shadow-xl shadow-indigo-200/60 scale-105 border-indigo-300 z-50'
                                        : 'border-slate-200 hover:border-indigo-300 hover:shadow-md shadow-sm'
                                    }`}
                                  >
                                    {card.labels && card.labels.length > 0 && (
                                      <div className="flex flex-wrap gap-1 mb-2">
                                        {card.labels.map((l, i) => (
                                          <div key={i} className="h-1.5 w-7 rounded-full opacity-80"
                                            style={{background: LIST_COLORS[i % LIST_COLORS.length]}} title={l}/>
                                        ))}
                                      </div>
                                    )}
                                    <span className="text-sm text-slate-700 leading-snug break-words font-medium">
                                      {card.title}
                                    </span>
                                    {card.dueDate && (
                                      <div className={`mt-2 flex items-center gap-1.5 text-[10px] font-semibold py-1 px-2 rounded-lg w-fit border ${
                                        isOverdue(card.dueDate)
                                          ? 'bg-red-50 text-red-500 border-red-100'
                                          : 'bg-slate-50 text-slate-400 border-slate-100'
                                      }`}>
                                        <Clock size={9}/>
                                        {new Date(card.dueDate).toLocaleDateString('fr-FR', { day:'2-digit', month:'short' })}
                                      </div>
                                    )}
                                    <button onClick={(e) => { e.stopPropagation(); handleDeleteCard(card.id); }}
                                      className="absolute top-2 right-2 text-slate-300 hover:text-red-400 hover:bg-red-50 p-1 rounded-lg opacity-0 group-hover:opacity-100 transition-all">
                                      <Trash2 size={11}/>
                                    </button>
                                  </div>
                                )}
                              </Draggable>
                            ))}
                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>

                      {/* Add card */}
                      <div className="px-3 py-2 border-t border-slate-100">
                        {addingCardToListId === list.id ? (
                          <form onSubmit={(e) => handleCreateCard(e, list.id)} className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                            <textarea autoFocus rows={2} value={newCardTitle} onChange={(e) => setNewCardTitle(e.target.value)}
                              placeholder="Titre de la carte..."
                              className="w-full bg-transparent text-sm outline-none resize-none text-slate-700 placeholder-slate-400 mb-2"
                              onKeyDown={(e) => {
                                if (e.key==='Enter' && !e.shiftKey) { e.preventDefault(); handleCreateCard(e, list.id); }
                                if (e.key==='Escape') setAddingCardToListId(null);
                              }}/>
                            <div className="flex gap-2">
                              <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors">Ajouter</button>
                              <button type="button" onClick={() => setAddingCardToListId(null)} className="text-slate-400 hover:text-slate-600"><X size={16}/></button>
                            </div>
                          </form>
                        ) : (
                          <button onClick={() => setAddingCardToListId(list.id)}
                            className="w-full flex items-center gap-2 p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl text-xs font-semibold transition-all">
                            <Plus size={14}/> Ajouter une carte
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </Draggable>
              ))}
              {boardProvided.placeholder}
            </div>
          )}
        </Droppable>

        {/* Add list */}
        <div className="flex-shrink-0 w-72">
          {isAddingList ? (
            <form onSubmit={handleCreateList} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
              <input autoFocus type="text" value={newListTitle} onChange={(e) => setNewListTitle(e.target.value)} placeholder="Nom de la liste..."
                className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 rounded-xl p-2.5 text-sm text-slate-800 placeholder-slate-400 mb-3 outline-none transition-all"
                onKeyDown={(e) => e.key==='Escape' && setIsAddingList(false)}/>
              <div className="flex gap-2">
                <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold px-4 py-1.5 rounded-lg transition-colors">Ajouter</button>
                <button type="button" onClick={() => setIsAddingList(false)} className="text-slate-400 hover:text-slate-600"><X size={18}/></button>
              </div>
            </form>
          ) : (
            <button onClick={() => setIsAddingList(true)}
              className="w-full bg-white/70 hover:bg-white border border-dashed border-slate-300 hover:border-indigo-300 text-slate-500 hover:text-indigo-600 font-semibold py-3.5 px-4 rounded-2xl flex items-center gap-2 text-sm transition-all shadow-sm hover:shadow-md">
              <Plus size={16}/> Ajouter une liste
            </button>
          )}
        </div>
      </DragDropContext>

      {selectedCard && (
        <CardModal card={selectedCard} onClose={() => setSelectedCard(null)}
          onUpdate={() => { fetchData(); toast.success("Carte mise à jour ✓"); }}/>
      )}
    </div>
  );
}