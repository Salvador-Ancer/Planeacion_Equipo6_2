# Tareas pendientes / backlog técnico

## Integrar el asistente RAG en el bot de Telegram

Actualmente el RAG (`RagService` + `POST /rag/chat`) solo está disponible desde
el frontend web (`ChatWidget.jsx`). El bot de Telegram (`MyTodoListBot`,
`ToDoItemBotController`, `BotActions`) no tiene ninguna integración con él.

**Propuesta:**
- En `ToDoItemBotController`, detectar mensajes de texto libre que no sean
  comandos del menú/teclado existente.
- Resolver el `proyectoId` del usuario que escribe (vía `UsuarioRepository` /
  chat ID -> usuario -> proyecto).
- Llamar a `RagService.ask(proyectoId, textoDelMensaje)` y responder al chat
  con el texto generado.
- Manejar errores (sin `GROQ_API_KEY`, timeouts de Groq/ORDS) con un mensaje
  amigable en lugar de romper el flujo del bot.
