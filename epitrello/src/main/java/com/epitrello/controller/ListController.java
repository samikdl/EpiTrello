package com.epitrello.controller;

import com.epitrello.model.Board;
import com.epitrello.model.TaskList;
import com.epitrello.repository.BoardRepository;
import com.epitrello.repository.TaskListRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@CrossOrigin(origins = "http://localhost:5173")
public class ListController {

    @Autowired
    private TaskListRepository taskListRepository;

    @Autowired
    private BoardRepository boardRepository;

    @GetMapping("/boards/{boardId}/lists")
    public List<TaskList> getListsByBoard(@PathVariable Long boardId) {
        return taskListRepository.findByBoardIdOrderByPositionAsc(boardId);
    }

    @PostMapping("/boards/{boardId}/lists")
    public TaskList createList(@PathVariable Long boardId, @RequestBody TaskList taskList) {
        Board board = boardRepository.findById(boardId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Tableau non trouvé"));
        
        taskList.setBoard(board);
        if (taskList.getPosition() == null) {
            taskList.setPosition(0); 
        }
        return taskListRepository.save(taskList);
    }

    @PutMapping("/lists/{id}")
    public TaskList updateList(@PathVariable Long id, @RequestBody TaskList listDetails) {
        TaskList taskList = taskListRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Liste non trouvée"));

        if (listDetails.getTitle() != null) taskList.setTitle(listDetails.getTitle());
        if (listDetails.getPosition() != null) taskList.setPosition(listDetails.getPosition());

        return taskListRepository.save(taskList);
    }

    @DeleteMapping("/lists/{id}")
    public void deleteList(@PathVariable Long id) {
        taskListRepository.deleteById(id);
    }
}