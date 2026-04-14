package com.springboot.MyTodoList.controller;

import com.springboot.MyTodoList.config.BotProps;
import com.springboot.MyTodoList.model.Usuario;
import com.springboot.MyTodoList.service.DeepSeekService;
import com.springboot.MyTodoList.service.KpiService;
import com.springboot.MyTodoList.service.SprintService;
import com.springboot.MyTodoList.service.TareaService;
import com.springboot.MyTodoList.service.ToDoItemService;
import com.springboot.MyTodoList.service.UsuarioService;
import com.springboot.MyTodoList.util.BotActions;
import com.springboot.MyTodoList.util.BotHelper;
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
import org.telegram.telegrambots.meta.api.methods.send.SendMessage;
import org.telegram.telegrambots.meta.api.objects.Update;
import org.telegram.telegrambots.meta.api.objects.replykeyboard.ReplyKeyboardMarkup;
import org.telegram.telegrambots.meta.api.objects.replykeyboard.buttons.KeyboardButton;
import org.telegram.telegrambots.meta.api.objects.replykeyboard.buttons.KeyboardRow;
import org.telegram.telegrambots.meta.generics.TelegramClient;
import java.util.Optional;

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
		if (!update.hasMessage()) return;

		long chatId = update.getMessage().getChatId();

		// Manejo de contacto compartido (registro por teléfono)
		if (update.getMessage().getContact() != null) {
			String telefono = update.getMessage().getContact().getPhoneNumber();
			if (!telefono.startsWith("+")) telefono = "+" + telefono;

			Optional<Usuario> usuarioOpt = usuarioService.obtenerPorTelefono(telefono);
			if (usuarioOpt.isPresent()) {
				usuarioService.vincularTelegram(usuarioOpt.get(), chatId);
				BotHelper.sendMessageToTelegram(chatId,
					"Bienvenido " + usuarioOpt.get().getFullName() + "! Ya estas registrado. Usa /start para ver el menu.",
					telegramClient);
			} else {
				BotHelper.sendMessageToTelegram(chatId,
					"Tu numero no esta registrado en el sistema. Pide a tu administrador que te agregue.",
					telegramClient);
			}
			return;
		}

		if (!update.getMessage().hasText()) return;

		String messageText = update.getMessage().getText();

		// Si el usuario no esta registrado y manda /start, pedir telefono
		if (messageText.equals("/start")) {
			Optional<Usuario> usuarioOpt = usuarioService.obtenerPorTelegram(chatId);
			if (usuarioOpt.isEmpty()) {
				try {
					KeyboardButton phoneButton = new KeyboardButton("Compartir mi numero de telefono");
					phoneButton.setRequestContact(true);
					KeyboardRow row = new KeyboardRow();
					row.add(phoneButton);
					ReplyKeyboardMarkup keyboard = ReplyKeyboardMarkup.builder()
						.resizeKeyboard(true)
						.oneTimeKeyboard(true)
						.keyboardRow(row)
						.build();
					SendMessage msg = SendMessage.builder()
						.chatId(chatId)
						.text("Para identificarte, por favor comparte tu numero de telefono:")
						.replyMarkup(keyboard)
						.build();
					telegramClient.execute(msg);
				} catch (Exception e) {
					logger.error("Error pidiendo telefono: {}", e.getMessage(), e);
				}
				return;
			}
		}

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
		actions.fnAddTarea();
		actions.fnAsignarSprint();
		actions.fnCompletarTarea();
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
