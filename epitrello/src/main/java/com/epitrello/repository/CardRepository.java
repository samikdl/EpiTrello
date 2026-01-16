package com.epitrello.repository;

import com.epitrello.model.Card;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CardRepository extends JpaRepository<Card, Long> {
    List<Card> findByTaskListIdOrderByPositionAsc(Long taskListId);
}