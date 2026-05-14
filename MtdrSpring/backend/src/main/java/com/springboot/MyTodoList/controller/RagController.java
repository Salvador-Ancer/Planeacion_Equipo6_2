package com.springboot.MyTodoList.controller;

import com.springboot.MyTodoList.dto.RagChatRequest;
import com.springboot.MyTodoList.service.RagService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/rag")
public class RagController {

    private final RagService ragService;

    public RagController(RagService ragService) {
        this.ragService = ragService;
    }

    @PostMapping("/chat")
    public ResponseEntity<Map<String, String>> chat(@RequestBody RagChatRequest req) {
        if (req.getProyectoId() == null || req.getPregunta() == null || req.getPregunta().isBlank()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "proyectoId y pregunta son requeridos"));
        }

        try {
            String respuesta = ragService.ask(req.getProyectoId(), req.getPregunta());
            return ResponseEntity.ok(Map.of("respuesta", respuesta));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage() != null ? e.getMessage() : "Error interno del RAG engine"));
        }
    }
}
