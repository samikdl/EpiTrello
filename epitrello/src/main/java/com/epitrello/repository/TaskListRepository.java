package com.epitrello.repository;

import com.epitrello.model.TaskList;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface TaskListRepository extends JpaRepository<TaskList, Long> {
    List<TaskList> findByBoardIdOrderByPositionAsc(Long boardId);
}