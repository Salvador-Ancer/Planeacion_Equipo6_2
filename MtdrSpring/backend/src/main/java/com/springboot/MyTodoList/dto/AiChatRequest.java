package com.springboot.MyTodoList.dto;

import java.util.List;
import java.util.Map;

public class AiChatRequest {

    private String system;
    private List<Map<String, String>> messages;

    public String getSystem() { return system; }
    public void setSystem(String system) { this.system = system; }

    public List<Map<String, String>> getMessages() { return messages; }
    public void setMessages(List<Map<String, String>> messages) { this.messages = messages; }
}
