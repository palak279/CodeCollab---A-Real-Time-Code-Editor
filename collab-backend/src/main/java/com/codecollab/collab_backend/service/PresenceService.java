package com.codecollab.collab_backend.service;

import com.codecollab.collab_backend.model.PresenceMessage;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Service
public class PresenceService {

    private final Map<String, PresenceMessage> sessionUsers = new ConcurrentHashMap<>();

    public void addUser(String sessionId, String roomCode, String username) {
        PresenceMessage msg = new PresenceMessage();
        msg.setRoomCode(roomCode);
        msg.setUsername(username);
        sessionUsers.put(sessionId, msg);
    }

    public String removeUser(String sessionId) {
        PresenceMessage removed = sessionUsers.remove(sessionId);
        return removed != null ? removed.getRoomCode() : null;
    }

    public List<String> getUsersInRoom(String roomCode) {
        return sessionUsers.values().stream()
                .filter(u -> u.getRoomCode().equals(roomCode))
                .map(PresenceMessage::getUsername)
                .collect(Collectors.toList());
    }
}