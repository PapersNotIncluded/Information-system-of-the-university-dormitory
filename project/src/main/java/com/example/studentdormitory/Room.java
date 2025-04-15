package com.example.studentdormitory;

import jakarta.persistence.*;

@Entity
@Table(name = "roomlist")
public class Room {
    private Long id;
    private Long roomNumber;
    private Long maxPlaces;

    protected Room() {

    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getRoomNumber() {
        return roomNumber;
    }

    public void setRoomNumber(Long roomNumber) {
        this.roomNumber = roomNumber;
    }

    public Long getMaxPlaces() {
        return maxPlaces;
    }

    public void setMaxPlaces(Long maxPlaces) {
        this.maxPlaces = maxPlaces;
    }
}

