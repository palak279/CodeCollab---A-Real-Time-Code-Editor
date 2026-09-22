package com.codecollab.collab_backend.controller;

import com.codecollab.collab_backend.model.Room;
import com.codecollab.collab_backend.repository.RoomRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/rooms")
@CrossOrigin(origins = "http://localhost:5173")
public class RoomController {

    @Autowired
    private RoomRepository roomRepository;

    @GetMapping
    public List<Room> getAllRooms() {
        return roomRepository.findAll();
    }

    @PostMapping
    public Room createRoom(@RequestBody Room room) {
        Room existing = roomRepository.findByRoomCode(room.getRoomCode());
        if (existing != null) {
            existing.setContent(room.getContent());
            return roomRepository.save(existing);
        }
        return roomRepository.save(room);
    }

    @GetMapping("/code/{roomCode}")
    public Room getRoomByCode(@PathVariable String roomCode) {
        return roomRepository.findByRoomCode(roomCode);
    }
}