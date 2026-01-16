import { useEffect, useState } from "react";
import { DragDropContext, Droppable, Draggable, type DropResult } from "@hello-pangea/dnd";
import { getLists, getCards, moveCard } from "../api";


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

export default function KanbanBoard() {
  const [lists, setLists] = useState<TaskList[]>([]);
  const BOARD_ID = 1;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const listsData = await getLists(BOARD_ID);
        const listsWithCards = await Promise.all(
          listsData.map(async (list: any) => {
            const cards = await getCards(list.id);
            return { ...list, cards };
          })
        );
        listsWithCards.sort((a, b) => a.position - b.position);
        setLists(listsWithCards);
      } catch (error) {
        console.error("Erreur de chargement:", error);
      }
    };
    fetchData();
  }, []);

  const onDragEnd = async (result: DropResult) => {
    const { source, destination, draggableId } = result;

    if (!destination) return;
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    const newLists = [...lists];
    const sourceListIndex = newLists.findIndex(l => l.id.toString() === source.droppableId);
    const destListIndex = newLists.findIndex(l => l.id.toString() === destination.droppableId);

    if (sourceListIndex === -1 || destListIndex === -1) return;

    const sourceList = newLists[sourceListIndex];
    const destList = newLists[destListIndex];
    const [movedCard] = sourceList.cards.splice(source.index, 1);
    
    destList.cards.splice(destination.index, 0, movedCard);
    setLists(newLists);

    try {
      await moveCard(Number(draggableId), destList.id);
      console.log(`Carte ${draggableId} déplacée vers la liste ${destList.id}`);
    } catch (error) {
      console.error("Erreur lors de la sauvegarde du déplacement", error);
      alert("Erreur de sauvegarde ! La carte va revenir à sa place au rechargement.");
    }
  };

  return (
    <div className="min-h-screen bg-blue-600 p-8 flex flex-col items-start">
      <h1 className="text-3xl font-bold text-white mb-8">EpiTrello Board</h1>
      
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex gap-6 overflow-x-auto pb-4 w-full items-start">
          
          {lists.map((list) => (
            <Droppable key={list.id} droppableId={list.id.toString()}>
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="bg-gray-100 rounded-lg p-4 w-72 shadow-xl flex-shrink-0"
                >
                  <h2 className="font-bold text-gray-700 mb-4 flex justify-between">
                    {list.title}
                    <span className="text-sm font-normal text-gray-400 bg-gray-200 px-2 rounded-full">
                      {list.cards.length}
                    </span>
                  </h2>

                  <div className="flex flex-col gap-3 min-h-[50px]">
                    {list.cards.map((card, index) => (
                      <Draggable key={card.id} draggableId={card.id.toString()} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            style={{ 
                              ...provided.draggableProps.style,
                              opacity: snapshot.isDragging ? 0.8 : 1
                            }}
                            className={`bg-white p-3 rounded shadow-sm border border-gray-200 hover:border-blue-400 cursor-pointer transition-colors ${snapshot.isDragging ? "rotate-2 shadow-lg" : ""}`}
                          >
                            <h3 className="font-medium text-gray-800">{card.title}</h3>
                            {card.description && (
                              <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                                {card.description}
                              </p>
                            )}
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                </div>
              )}
            </Droppable>
          ))}
          
        </div>
      </DragDropContext>
    </div>
  );
}