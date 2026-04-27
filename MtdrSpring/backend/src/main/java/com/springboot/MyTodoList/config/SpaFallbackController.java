package com.springboot.MyTodoList.config;

import jakarta.servlet.RequestDispatcher;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.boot.web.servlet.error.ErrorController;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import java.util.Map;

@Controller
public class SpaFallbackController implements ErrorController {

    private static final String[] API_PREFIXES = {
        "/auth", "/tareas", "/sprints", "/proyectos", "/kpis",
        "/usuarios", "/credenciales", "/ai", "/swagger", "/v3"
    };

    @RequestMapping("/error")
    @ResponseBody
    public Object handleError(HttpServletRequest request) {
        Object statusAttr = request.getAttribute(RequestDispatcher.ERROR_STATUS_CODE);
        Object uri        = request.getAttribute(RequestDispatcher.ERROR_REQUEST_URI);
        String method     = request.getMethod();
        String path       = uri != null ? uri.toString() : "";
        int    status     = statusAttr != null ? Integer.parseInt(statusAttr.toString()) : 500;

        // API requests: return JSON error, never forward to index.html
        for (String prefix : API_PREFIXES) {
            if (path.startsWith(prefix)) {
                Object msg = request.getAttribute(RequestDispatcher.ERROR_MESSAGE);
                return ResponseEntity.status(status)
                    .body(Map.of("error", msg != null ? msg.toString() : "Error " + status, "path", path));
            }
        }

        // Non-GET frontend navigation: return the status without forwarding
        if (!HttpMethod.GET.matches(method)) {
            return ResponseEntity.status(status).body(Map.of("error", "Error " + status));
        }

        // GET frontend navigation: forward to React Router
        return "forward:/index.html";
    }
}
