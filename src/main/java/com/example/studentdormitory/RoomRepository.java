package com.example.studentdormitory;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface RoomRepository extends JpaRepository<Room, Long> {
    @Query("SELECT r.maxPlaces FROM Room r WHERE r.roomNumber = :roomNumber")
    Integer getMaxPlacesById(@Param("roomNumber") Long roomNumber);
}
