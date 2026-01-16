package com.epitrello.controller;

import com.epitrello.model.Card;
import com.epitrello.model.TaskList;
import com.epitrello.repository.CardRepository;
import com.epitrello.repository.TaskListRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

@RestController
@CrossOrigin(origins = "http://localhost:5173")
public class CardController {

    @Autowired
    private CardRepository cardRepository;

    @Autowired
    private TaskListRepository taskListRepository;

    @GetMapping("/lists/{listId}/cards")
    public List<Card> getCardsByList(@PathVariable Long listId) {
        return cardRepository.findByTaskListIdOrderByPositionAsc(listId);
    }

    @PostMapping("/lists/{listId}/cards")
    public Card createCard(@PathVariable Long listId, @RequestBody Card card) {
        TaskList taskList = taskListRepository.findById(listId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Liste non trouvée"));

        card.setTaskList(taskList);
        if (card.getPosition() == null) {
            card.setPosition(0);
        }
        return cardRepository.save(card);
    }

    @PutMapping("/cards/{id}")
    public Card updateCard(@PathVariable Long id, @RequestBody Card cardDetails) {
        Card card = cardRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Carte non trouvée"));

        if (cardDetails.getTitle() != null) card.setTitle(cardDetails.getTitle());
        if (cardDetails.getDescription() != null) card.setDescription(cardDetails.getDescription());
        if (cardDetails.getPosition() != null) card.setPosition(cardDetails.getPosition());

        return cardRepository.save(card);
    }

    @PutMapping("/cards/{id}/move")
    public Card moveCard(@PathVariable Long id, @RequestBody Map<String, Long> payload) {
        Long newListId = payload.get("newListId");
        if (newListId == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "ID de la nouvelle liste requis");
        }

        Card card = cardRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Carte non trouvée"));

        TaskList newTaskList = taskListRepository.findById(newListId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Nouvelle liste non trouvée"));

        card.setTaskList(newTaskList);
        
        if (payload.containsKey("position")) {
            card.setPosition(payload.get("position").intValue());
        }

        return cardRepository.save(card);
    }

    @DeleteMapping("/cards/{id}")
    public void deleteCard(@PathVariable Long id) {
        cardRepository.deleteById(id);
    }
}