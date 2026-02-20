import { useEffect, useState } from "react";
import { DragDropContext, Droppable, Draggable, type DropResult } from "@hello-pangea/dnd";
import { Plus, X, Trash2, Clock, MoreHorizontal } from "lucide-react";
import toast from "react-hot-toast";
import { getLists, getCards, moveCard, createList, createCard, deleteCard, deleteList, updateList } from "../api";
import CardModal from "./CardModal";

interface Card {
  id: number;
  title: string;
  description: string;
  position: number;
  dueDate?: string;
  labels?: string[];
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
    } catch (error) {
      toast.error("Impossible de charger le tableau");
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
    try {
      await createList(boardId, newListTitle);
      setNewListTitle("");
      setIsAddingList(false);
      fetchData();
      toast.success("Liste créée !");
    } catch (e) {
      toast.error("Erreur création liste");
    }
  };

  const handleRenameList = async (list: TaskList) => {
    const newTitle = prompt("Nouveau nom de la liste :", list.title);
    if (newTitle && newTitle !== list.title) {
      try {
        const newLists = [...lists];
        const index = newLists.findIndex((l) => l.id === list.id);
        if (index !== -1) {
          newLists[index].title = newTitle;
          setLists(newLists);
        }
        await updateList(list.id, newTitle);
        toast.success("Liste renommée");
      } catch (e) {
        toast.error("Erreur renommage");
        fetchData();
      }
    }
  };

  const handleCreateCard = async (e: React.FormEvent, listId: number) => {
    e.preventDefault();
    if (!newCardTitle.trim()) return;
    try {
      await createCard(listId, newCardTitle);
      setNewCardTitle("");
      setAddingCardToListId(null);
      fetchData();
      toast.success("Carte ajoutée");
    } catch (e) {
      toast.error("Erreur création carte");
    }
  };

  const handleDeleteCard = async (cardId: number) => {
    if (!confirm("Supprimer cette carte ?")) return;
    try {
      const newLists = lists.map((l) => ({
        ...l,
        cards: l.cards.filter((c) => c.id !== cardId),
      }));
      setLists(newLists);
      await deleteCard(cardId);
      toast.success("Carte supprimée");
    } catch (e) {
      toast.error("Erreur suppression");
      fetchData();
    }
  };

  const handleDeleteList = async (listId: number) => {
    if (!confirm("Supprimer cette liste et ses cartes ?")) return;
    try {
      const newLists = lists.filter((l) => l.id !== listId);
      setLists(newLists);
      await deleteList(listId);
      toast.success("Liste supprimée");
    } catch (e) {
      toast.error("Erreur suppression");
      fetchData();
    }
  };

  const onDragEnd = async (result: DropResult) => {
    const { source, destination, draggableId } = result;

    if (!destination) return;
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    )
      return;

    const newLists = [...lists];
    const sourceListIndex = newLists.findIndex(
      (l) => l.id.toString() === source.droppableId
    );
    const destListIndex = newLists.findIndex(
      (l) => l.id.toString() === destination.droppableId
    );

    if (sourceListIndex === -1 || destListIndex === -1) return;

    const sourceList = newLists[sourceListIndex];
    const destList = newLists[destListIndex];
    const [movedCard] = sourceList.cards.splice(source.index, 1);
    destList.cards.splice(destination.index, 0, movedCard);

    setLists(newLists);

    try {
      await moveCard(Number(draggableId), destList.id);
    } catch (error) {
      toast.error("Erreur déplacement");
    }
  };

  return (
    <div className="flex-1 overflow-x-auto bg-slate-800 p-8 flex items-start gap-6 min-h-full font-sans">
      <DragDropContext onDragEnd={onDragEnd}>
        {lists.map((list) => (
          <Droppable key={list.id} droppableId={list.id.toString()}>
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className="bg-[#F1F2F4] rounded-xl w-[280px] flex-shrink-0 flex flex-col max-h-[78vh] shadow-xl border border-white/10"
              >
                <div className="p-3 px-4 font-bold text-gray-700 flex justify-between items-center group/header">
                  <span
                    onClick={() => handleRenameList(list)}
                    className="text-sm cursor-pointer hover:bg-gray-200 px-2 py-1 rounded-md w-full truncate transition-colors"
                  >
                    {list.title}
                  </span>
                  <button
                    onClick={() => handleDeleteList(list.id)}
                    className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-1 rounded opacity-0 group-hover/header:opacity-100 transition-all"
                  >
                    <MoreHorizontal size={16} />
                  </button>
                </div>

                <div className="px-3 pb-2 flex-1 overflow-y-auto min-h-[10px] custom-scrollbar space-y-2">
                  {list.cards.map((card, index) => (
                    <Draggable
                      key={card.id}
                      draggableId={card.id.toString()}
                      index={index}
                    >
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          onClick={() => setSelectedCard(card)}
                          className={`
                            bg-white p-3 rounded-lg shadow-sm border border-gray-200 group hover:border-indigo-400 hover:shadow-md cursor-pointer transition-all duration-200 relative
                            ${
                              snapshot.isDragging
                                ? "rotate-2 shadow-2xl scale-105 ring-2 ring-indigo-500 ring-offset-2 z-50"
                                : ""
                            }
                          `}
                        >
                          {card.labels && card.labels.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-2">
                              {card.labels.map((l, i) => (
                                <div
                                  key={i}
                                  className="h-1.5 w-8 bg-indigo-400 rounded-full"
                                  title={l}
                                ></div>
                              ))}
                            </div>
                          )}

                          <div className="flex justify-between items-start gap-2">
                            <span className="text-sm font-medium text-gray-800 leading-snug break-words w-full">
                              {card.title}
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteCard(card.id);
                              }}
                              className="text-gray-300 hover:text-red-500 hover:bg-red-50 p-1 rounded opacity-0 group-hover:opacity-100 transition-all absolute top-2 right-2 bg-white/90"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>

                          {card.dueDate && (
                            <div className="mt-3 flex items-center gap-1.5 text-[10px] font-semibold text-gray-400 bg-gray-50 py-1 px-2 rounded-md w-fit">
                              <Clock size={10} />
                              {new Date(card.dueDate).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>

                <div className="p-3 pt-1">
                  {addingCardToListId === list.id ? (
                    <form
                      onSubmit={(e) => handleCreateCard(e, list.id)}
                      className="mt-1 bg-white p-2 rounded-xl shadow-md border border-indigo-200 animate-in fade-in zoom-in duration-200"
                    >
                      <textarea
                        autoFocus
                        className="w-full text-sm outline-none resize-none mb-2 text-gray-700 placeholder:text-gray-400"
                        placeholder="Saisissez un titre..."
                        rows={2}
                        value={newCardTitle}
                        onChange={(e) => setNewCardTitle(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            handleCreateCard(e, list.id);
                          }
                        }}
                      />
                      <div className="flex gap-2 items-center justify-between">
                        <button
                          type="submit"
                          className="bg-indigo-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-indigo-700 shadow-sm transition-colors"
                        >
                          Ajouter
                        </button>
                        <button
                          type="button"
                          onClick={() => setAddingCardToListId(null)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <X size={18} />
                        </button>
                      </div>
                    </form>
                  ) : (
                    <button
                      onClick={() => setAddingCardToListId(list.id)}
                      className="w-full flex items-center gap-2 p-2 text-gray-500 hover:bg-gray-200 hover:text-gray-800 rounded-lg text-sm font-medium transition-colors"
                    >
                      <Plus size={16} /> Ajouter une carte
                    </button>
                  )}
                </div>
              </div>
            )}
          </Droppable>
        ))}

        <div className="w-[280px] flex-shrink-0">
          {isAddingList ? (
            <form
              onSubmit={handleCreateList}
              className="bg-[#F1F2F4] p-3 rounded-xl shadow-xl border border-white/20 animate-in slide-in-from-right-4 duration-300"
            >
              <input
                autoFocus
                type="text"
                className="w-full border-2 border-indigo-500 rounded-lg p-2 text-sm mb-2 outline-none"
                placeholder="Nom de la liste..."
                value={newListTitle}
                onChange={(e) => setNewListTitle(e.target.value)}
              />
              <div className="flex gap-2 items-center">
                <button
                  type="submit"
                  className="bg-indigo-600 text-white text-sm font-bold px-4 py-1.5 rounded-lg hover:bg-indigo-700 shadow-lg"
                >
                  Ajouter
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddingList(false)}
                  className="text-gray-500 hover:text-gray-800"
                >
                  <X size={20} />
                </button>
              </div>
            </form>
          ) : (
            <button
              onClick={() => setIsAddingList(true)}
              className="w-full bg-white/10 hover:bg-white/20 text-white font-bold p-4 rounded-xl flex items-center gap-2 transition-all border border-white/10 shadow-lg"
            >
              <Plus size={20} /> Ajouter une autre liste
            </button>
          )}
        </div>
      </DragDropContext>

      {selectedCard && (
        <CardModal
          card={selectedCard}
          onClose={() => setSelectedCard(null)}
          onUpdate={() => {
            fetchData();
            toast.success("Carte mise à jour");
          }}
        />
      )}
    </div>
  );
}