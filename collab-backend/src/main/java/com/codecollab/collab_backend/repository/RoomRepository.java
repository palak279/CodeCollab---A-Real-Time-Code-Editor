package com.codecollab.collab_backend.repository;

import com.codecollab.collab_backend.model.Room;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RoomRepository extends JpaRepository<Room, Long> {
    Room findByRoomCode(String roomCode);
}