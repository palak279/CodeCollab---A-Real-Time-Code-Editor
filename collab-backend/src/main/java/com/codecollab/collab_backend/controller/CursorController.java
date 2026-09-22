package com.codecollab.collab_backend.controller;

import com.codecollab.collab_backend.model.CursorMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Controller
public class CursorController {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/cursor")
    public void handleCursor(CursorMessage message) {
        messagingTemplate.convertAndSend("/topic/room/" + message.getRoomCode() + "/cursor", message);
    }
}