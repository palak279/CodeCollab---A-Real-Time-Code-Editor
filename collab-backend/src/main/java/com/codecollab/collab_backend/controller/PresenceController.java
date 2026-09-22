package com.codecollab.collab_backend.controller;

import com.codecollab.collab_backend.model.PresenceMessage;
import com.codecollab.collab_backend.service.PresenceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Controller
public class PresenceController {

    @Autowired
    private PresenceService presenceService;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/join")
    public void handleJoin(PresenceMessage message, SimpMessageHeaderAccessor headerAccessor) {
        String sessionId = headerAccessor.getSessionId();
        presenceService.addUser(sessionId, message.getRoomCode(), message.getUsername());

        messagingTemplate.convertAndSend(
                "/topic/room/" + message.getRoomCode() + "/presence",
                presenceService.getUsersInRoom(message.getRoomCode())
        );
    }
}