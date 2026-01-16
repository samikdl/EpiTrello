const API_URL = "http://localhost:8081";

export const getLists = async (boardId: number) => {
  const response = await fetch(`${API_URL}/boards/${boardId}/lists`);
  if (!response.ok) throw new Error("Erreur lors de la récupération des listes");
  return response.json();
};

export const getCards = async (listId: number) => {
  const response = await fetch(`${API_URL}/lists/${listId}/cards`);
  if (!response.ok) throw new Error("Erreur lors de la récupération des cartes");
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