package com.epitrello.controller;

import com.epitrello.model.Board;
import com.epitrello.repository.BoardRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin; 
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/boards")
@CrossOrigin(origins = "http://localhost:5173")
public class BoardController {

    @Autowired
    private BoardRepository boardRepository;

    @GetMapping
    public List<Board> getAllBoards() {
        return boardRepository.findAll();
    }

    @PostMapping
    public Board createBoard(@RequestBody Board board) {
        return boardRepository.save(board);
    }

    @PutMapping("/{id}")
    public Board updateBoard(@PathVariable Long id, @RequestBody Board boardDetails) {
        Board board = boardRepository.findById(id).orElseThrow();
        board.setName(boardDetails.getName());
        return boardRepository.save(board);
    }

    @DeleteMapping("/{id}")
    public void deleteBoard(@PathVariable Long id) {
        boardRepository.deleteById(id);
    }
}