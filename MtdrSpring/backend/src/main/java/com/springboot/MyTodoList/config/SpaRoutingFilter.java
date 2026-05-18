package com.springboot.MyTodoList.config;

import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
@Order(1)
public class SpaRoutingFilter implements Filter {

    @Override
    public void doFilter(ServletRequest req, ServletResponse res, FilterChain chain)
            throws IOException, ServletException {

        HttpServletRequest request = (HttpServletRequest) req;

        String method = request.getMethod();
        String path   = request.getRequestURI();
        String accept = request.getHeader("Accept");

        boolean isBrowserNav  = accept != null && accept.contains("text/html");
        boolean isGet         = "GET".equalsIgnoreCase(method);
        boolean isStaticAsset = path.contains(".");
        boolean isForward     = request.getAttribute("jakarta.servlet.forward.request_uri") != null;

        if (isGet && isBrowserNav && !isStaticAsset && !isForward) {
            request.getRequestDispatcher("/index.html").forward(req, res);
            return;
        }

        chain.doFilter(req, res);
    }
}
