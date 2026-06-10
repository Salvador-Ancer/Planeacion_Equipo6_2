package com.springboot.MyTodoList.service;

import com.springboot.MyTodoList.util.BotHelper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;
import org.telegram.telegrambots.meta.generics.TelegramClient;

@Service
@Profile("!local & !test")
public class TelegramNotificationService {

    private static final Logger logger = LoggerFactory.getLogger(TelegramNotificationService.class);

    private final TelegramClient telegramClient;
    private final UsuarioService usuarioService;

    public TelegramNotificationService(TelegramClient telegramClient, UsuarioService usuarioService) {
        this.telegramClient = telegramClient;
        this.usuarioService = usuarioService;
    }

    public void notifyUser(Long userId, String message) {
        if (userId == null || message == null || message.isBlank()) return;
        try {
            usuarioService.obtenerPorId(userId)
                .filter(u -> u.getTelegramId() != null)
                .ifPresent(u -> BotHelper.sendMessageToTelegram(u.getTelegramId(), message, telegramClient));
        } catch (Exception e) {
            logger.warn("No se pudo notificar por Telegram al usuario {}: {}", userId, e.getMessage());
        }
    }
}
