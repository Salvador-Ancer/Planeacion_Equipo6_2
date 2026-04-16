package com.springboot.MyTodoList.config;

import jakarta.servlet.RequestDispatcher;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.boot.web.servlet.error.ErrorController;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
public class SpaFallbackController implements ErrorController {

    // Intercepta errores 404 y los redirige a index.html
    // para que React Router maneje la navegación del lado del cliente.
    // Las rutas /api/**, /swagger** y /v3/** siguen respondiendo normalmente.
    @RequestMapping("/error")
    public String handleError(HttpServletRequest request) {
        Object status = request.getAttribute(RequestDispatcher.ERROR_STATUS_CODE);
        Object uri = request.getAttribute(RequestDispatcher.ERROR_REQUEST_URI);

        if (status != null && Integer.parseInt(status.toString()) == 404) {
            String path = uri != null ? uri.toString() : "";
            if (!path.startsWith("/api") && !path.startsWith("/swagger") && !path.startsWith("/v3")) {
                return "forward:/index.html";
            }
        }
        return "forward:/index.html";
    }
}
