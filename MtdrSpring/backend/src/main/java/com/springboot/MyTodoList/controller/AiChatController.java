package com.springboot.MyTodoList.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.springboot.MyTodoList.dto.AiChatRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.Map;

@RestController
@RequestMapping("/ai")
public class AiChatController {

    @Value("${anthropic.api.key:}")
    private String anthropicApiKey;

    private static final String ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";
    private static final String MODEL         = "claude-sonnet-4-20250514";
    private final ObjectMapper mapper = new ObjectMapper();

    @PostMapping("/chat")
    public ResponseEntity<Map<String, String>> chat(@RequestBody AiChatRequest req) {
        if (anthropicApiKey == null || anthropicApiKey.isBlank()) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body(Map.of("error", "Anthropic API key not configured on server"));
        }

        try {
            // Build Anthropic request body
            ObjectNode body = mapper.createObjectNode();
            body.put("model", MODEL);
            body.put("max_tokens", 1000);
            if (req.getSystem() != null) {
                body.put("system", req.getSystem());
            }

            ArrayNode messages = mapper.createArrayNode();
            if (req.getMessages() != null) {
                for (Map<String, String> msg : req.getMessages()) {
                    ObjectNode m = mapper.createObjectNode();
                    m.put("role",    msg.getOrDefault("role",    "user"));
                    m.put("content", msg.getOrDefault("content", ""));
                    messages.add(m);
                }
            }
            body.set("messages", messages);

            HttpClient client = HttpClient.newHttpClient();
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(ANTHROPIC_URL))
                    .header("Content-Type",        "application/json")
                    .header("x-api-key",           anthropicApiKey)
                    .header("anthropic-version",   "2023-06-01")
                    .POST(HttpRequest.BodyPublishers.ofString(mapper.writeValueAsString(body)))
                    .build();

            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() != 200) {
                return ResponseEntity.status(HttpStatus.BAD_GATEWAY)
                        .body(Map.of("error", "Anthropic returned " + response.statusCode()));
            }

            JsonNode respJson = mapper.readTree(response.body());
            String text = respJson.path("content").elements().hasNext()
                    ? respJson.path("content").get(0).path("text").asText("")
                    : "";

            return ResponseEntity.ok(Map.of("content", text));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage() != null ? e.getMessage() : "Error interno"));
        }
    }
}
