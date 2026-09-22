package com.codecollab.collab_backend.controller;

import com.codecollab.collab_backend.model.EditMessage;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;

@Controller
public class EditController {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/edit")
    public void handleEdit(EditMessage message) {
        messagingTemplate.convertAndSend("/topic/room/" + message.getRoomCode(), message);
    }
}