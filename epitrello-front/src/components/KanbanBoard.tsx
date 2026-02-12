import { useEffect, useState } from "react";
import { DragDropContext, Droppable, Draggable, type DropResult } from "@hello-pangea/dnd";
import { Plus, X, Trash2 } from "lucide-react"; 
import { getLists, getCards, moveCard, createList, createCard, deleteCard, deleteList } from "../api";

interface Card {
  id: number;
  title: string;
  description: string;
  position: number;
}

interface TaskList {
  id: number;
  title: string;
  position: number;
  cards: Card[];
}

interface KanbanBoardProps {
  boardId: number;
}

export default function KanbanBoard({ boardId }: KanbanBoardProps) {
  const [lists, setLists] = useState<TaskList[]>([]);

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
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (boardId) {
        setLists([]);
        fetchData();
    }
  }, [boardId]);


  const handleCreateList = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newListTitle.trim()) return;
    await createList(boardId, newListTitle);
    setNewListTitle("");
    setIsAddingList(false);
    fetchData(); 
  };

  const handleCreateCard = async (e: React.FormEvent, listId: number) => {
    e.preventDefault();
    if (!newCardTitle.trim()) return;
    await createCard(listId, newCardTitle);
    setNewCardTitle("");
    setAddingCardToListId(null);
    fetchData();
  };

  const handleDeleteCard = async (cardId: number) => {
    if(!confirm("Supprimer cette carte ?")) return;
    const newLists = lists.map(l => ({
        ...l,
        cards: l.cards.filter(c => c.id !== cardId)
    }));
    setLists(newLists);
    await deleteCard(cardId);
  };
  
  const handleDeleteList = async (listId: number) => {
    if(!confirm("Supprimer cette liste et ses cartes ?")) return;
    setLists(lists.filter(l => l.id !== listId));
    await deleteList(listId);
  };

  const onDragEnd = async (result: DropResult) => {
    const { source, destination, draggableId } = result;
    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    const newLists = [...lists];
    const sourceListIndex = newLists.findIndex(l => l.id.toString() === source.droppableId);
    const destListIndex = newLists.findIndex(l => l.id.toString() === destination.droppableId);

    if (sourceListIndex === -1 || destListIndex === -1) return;

    const sourceList = newLists[sourceListIndex];
    const destList = newLists[destListIndex];
    const [movedCard] = sourceList.cards.splice(source.index, 1);
    destList.cards.splice(destination.index, 0, movedCard);

    setLists(newLists);
    await moveCard(Number(draggableId), destList.id);
  };

  return (
    <div className="flex-1 overflow-x-auto bg-blue-600 p-6 flex items-start gap-4 min-h-screen">
      <DragDropContext onDragEnd={onDragEnd}>
        {lists.map((list) => (
          <Droppable key={list.id} droppableId={list.id.toString()}>
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className="bg-gray-100 rounded-xl w-72 flex-shrink-0 flex flex-col max-h-[80vh] shadow-lg"
              >
                <div className="p-3 font-bold text-sm text-gray-700 flex justify-between items-center">
                    <span>{list.title}</span>
                    <button onClick={() => handleDeleteList(list.id)} className="text-gray-400 hover:text-red-500 transition-colors">
                        <Trash2 size={14}/>
                    </button>
                </div>

                <div className="px-2 pb-2 flex-1 overflow-y-auto min-h-[10px]">
                  {list.cards.map((card, index) => (
                    <Draggable key={card.id} draggableId={card.id.toString()} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={`bg-white p-2.5 rounded-lg shadow-sm mb-2 text-sm text-gray-800 border border-gray-200 group hover:border-blue-400 ${snapshot.isDragging ? "rotate-2 shadow-lg" : ""}`}
                        >
                          <div className="flex justify-between items-start gap-2">
                             <span className="break-words w-full">{card.title}</span>
                             <button onClick={() => handleDeleteCard(card.id)} className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                                <X size={14}/>
                             </button>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>

                <div className="p-2 pt-0">
                    {addingCardToListId === list.id ? (
                        <form onSubmit={(e) => handleCreateCard(e, list.id)} className="mt-2 bg-white p-2 rounded shadow-sm">
                            <textarea 
                                autoFocus
                                className="w-full text-sm outline-none resize-none mb-2"
                                placeholder="Saisissez un titre..."
                                rows={2}
                                value={newCardTitle}
                                onChange={e => setNewCardTitle(e.target.value)}
                                onKeyDown={e => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleCreateCard(e, list.id); }}}
                            />
                            <div className="flex gap-2 items-center">
                                <button type="submit" className="bg-blue-600 text-white text-xs px-3 py-1.5 rounded hover:bg-blue-700 font-medium">Ajouter</button>
                                <button type="button" onClick={() => setAddingCardToListId(null)} className="text-gray-500 hover:text-gray-800"><X size={18}/></button>
                            </div>
                        </form>
                    ) : (
                        <button onClick={() => setAddingCardToListId(list.id)} className="w-full flex items-center gap-2 p-2 text-gray-500 hover:bg-gray-200 rounded text-sm text-left transition-colors">
                            <Plus size={16} /> Ajouter une carte
                        </button>
                    )}
                </div>
              </div>
            )}
          </Droppable>
        ))}
        
        <div className="w-72 flex-shrink-0">
            {isAddingList ? (
                <form onSubmit={handleCreateList} className="bg-white p-3 rounded-xl shadow-lg border border-blue-500">
                    <input 
                        autoFocus
                        type="text" 
                        className="w-full border-2 border-blue-500 rounded p-2 text-sm mb-2 outline-none"
                        placeholder="Nom de la liste..."
                        value={newListTitle}
                        onChange={(e) => setNewListTitle(e.target.value)}
                    />
                    <div className="flex gap-2 items-center">
                        <button type="submit" className="bg-blue-600 text-white text-sm px-4 py-1.5 rounded hover:bg-blue-700">Ajouter</button>
                        <button type="button" onClick={() => setIsAddingList(false)} className="text-gray-500 hover:text-gray-800"><X size={20}/></button>
                    </div>
                </form>
            ) : (
                <button onClick={() => setIsAddingList(true)} className="w-full bg-white/20 hover:bg-white/30 text-white font-medium p-3 rounded-xl flex items-center gap-2 backdrop-blur-sm transition-colors">
                    <Plus size={20} /> Ajouter une liste
                </button>
            )}
        </div>
      </DragDropContext>
    </div>
  );
}