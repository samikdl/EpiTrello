const API_URL = "http://localhost:8081";

export const getBoards = async () => {
  const response = await fetch(`${API_URL}/boards`);
  if (!response.ok) throw new Error("Impossible de récupérer les tableaux");
  return response.json();
};

export const createBoard = async (name: string) => {
  const response = await fetch(`${API_URL}/boards`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });
  if (!response.ok) throw new Error("Impossible de créer le tableau");
  return response.json();
};

export const getLists = async (boardId: number) => {
  const response = await fetch(`${API_URL}/boards/${boardId}/lists`);
  if (!response.ok) throw new Error("Erreur lors de la récupération des listes");
  return response.json();
};

export const createList = async (boardId: number, title: string) => {
  const response = await fetch(`${API_URL}/boards/${boardId}/lists`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, position: 0 }),
  });
  if (!response.ok) throw new Error("Impossible de créer la liste");
  return response.json();
};



export const deleteList = async (listId: number) => {
  const response = await fetch(`${API_URL}/lists/${listId}`, { 
    method: "DELETE" 
  });
  
  if (!response.ok) {
    throw new Error("Erreur lors de la suppression de la liste");
  }
};

export const updateList = async (listId: number, title: string) => {
  const response = await fetch(`${API_URL}/lists/${listId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title }),
  });
  if (!response.ok) throw new Error("Impossible de modifier la liste");
  return response.json();
};

export const getCards = async (listId: number) => {
  const response = await fetch(`${API_URL}/lists/${listId}/cards`);
  if (!response.ok) throw new Error("Erreur lors de la récupération des cartes");
  return response.json();
};

export const createCard = async (listId: number, title: string) => {
  const response = await fetch(`${API_URL}/lists/${listId}/cards`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, position: 0 }),
  });
  if (!response.ok) throw new Error("Impossible de créer la carte");
  return response.json();
};

export const deleteCard = async (cardId: number) => {
  await fetch(`${API_URL}/cards/${cardId}`, { method: "DELETE" });
};

export interface CardUpdateData {
  title?: string;
  description?: string;
  dueDate?: string;
  labels?: string[];
}

export const updateCard = async (cardId: number, data: CardUpdateData) => {
  const response = await fetch(`${API_URL}/cards/${cardId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Erreur mise à jour carte");
  return response.json();
};

export const moveCard = async (cardId: number, newListId: number, position?: number) => {
  const response = await fetch(`${API_URL}/cards/${cardId}/move`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ newListId, position }),
  });
  if (!response.ok) throw new Error("Erreur lors du déplacement de la carte");
  return response.json();
};