package com.springboot.MyTodoList.controller;

import com.springboot.MyTodoList.config.BotProps;
import com.springboot.MyTodoList.service.DeepSeekService;
import com.springboot.MyTodoList.service.KpiService;
import com.springboot.MyTodoList.service.SprintService;
import com.springboot.MyTodoList.service.TareaService;
import com.springboot.MyTodoList.service.ToDoItemService;
import com.springboot.MyTodoList.service.UsuarioService;
import com.springboot.MyTodoList.util.BotActions;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.telegram.telegrambots.client.okhttp.OkHttpTelegramClient;
import org.telegram.telegrambots.longpolling.BotSession;
import org.telegram.telegrambots.longpolling.interfaces.LongPollingUpdateConsumer;
import org.telegram.telegrambots.longpolling.starter.AfterBotRegistration;
import org.telegram.telegrambots.longpolling.starter.SpringLongPollingBot;
import org.telegram.telegrambots.longpolling.util.LongPollingSingleThreadUpdateConsumer;
import org.telegram.telegrambots.meta.api.objects.Update;
import org.telegram.telegrambots.meta.generics.TelegramClient;

@Component
public class ToDoItemBotController implements SpringLongPollingBot, LongPollingSingleThreadUpdateConsumer {

	private static final Logger logger = LoggerFactory.getLogger(ToDoItemBotController.class);

	private final ToDoItemService toDoItemService;
	private final DeepSeekService deepSeekService;
	private final TareaService tareaService;
	private final SprintService sprintService;
	private final KpiService kpiService;
	private final UsuarioService usuarioService;
	private final TelegramClient telegramClient;
	private final BotProps botProps;

	@Value("${telegram.bot.token}")
	private String telegramBotToken;

	@Override
	public String getBotToken() {
		if (telegramBotToken != null && !telegramBotToken.trim().isEmpty()) {
			return telegramBotToken;
		} else {
			return botProps.getToken();
		}
	}

	public ToDoItemBotController(BotProps bp, ToDoItemService tsvc, DeepSeekService ds,
	                              TareaService tareas, SprintService sprints,
	                              KpiService kpis, UsuarioService usuarios) {
		this.botProps = bp;
		this.telegramClient = new OkHttpTelegramClient(getBotToken());
		this.toDoItemService = tsvc;
		this.deepSeekService = ds;
		this.tareaService = tareas;
		this.sprintService = sprints;
		this.kpiService = kpis;
		this.usuarioService = usuarios;
	}

	@Override
	public LongPollingUpdateConsumer getUpdatesConsumer() {
		return this;
	}

	@Override
	public void consume(Update update) {
		if (!update.hasMessage() || !update.getMessage().hasText()) return;

		String messageText = update.getMessage().getText();
		long chatId = update.getMessage().getChatId();

		BotActions actions = new BotActions(
			telegramClient, toDoItemService, deepSeekService,
			tareaService, sprintService, kpiService, usuarioService
		);
		actions.setRequestText(messageText);
		actions.setChatId(chatId);

		actions.fnStart();
		actions.fnMisTareas();
		actions.fnKpis();
		actions.fnSprint();
		actions.fnBloqueos();
		actions.fnRendimiento();
		actions.fnAnalizar();
		actions.fnDone();
		actions.fnUndo();
		actions.fnDelete();
		actions.fnHide();
		actions.fnListAll();
		actions.fnAddItem();
		actions.fnElse();
	}

	@AfterBotRegistration
	public void afterRegistration(BotSession botSession) {
		System.out.println("Registered bot running state is: " + botSession.isRunning());
	}
}
