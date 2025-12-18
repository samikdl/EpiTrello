package com.epitrello.model;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "cards")
public class Card {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private String description;
    private Integer position;

    @ManyToOne
    @JoinColumn(name = "list_id", nullable = false)
    @JsonIgnore
    private TaskList taskList;
    public Card() {}
    public Card(String title, String description, TaskList taskList) {
        this.title = title;
        this.description = description;
        this.taskList = taskList;
    }
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Integer getPosition() { return position; }
    public void setPosition(Integer position) { this.position = position; }

    public TaskList getTaskList() { return taskList; }
    public void setTaskList(TaskList taskList) { this.taskList = taskList; }
}