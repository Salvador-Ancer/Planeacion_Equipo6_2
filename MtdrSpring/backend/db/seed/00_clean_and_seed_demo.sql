-- =====================================================================
-- 00_clean_and_seed_demo.sql
-- Limpia todos los datos actuales y carga un set de datos de demo
-- para la presentacion: 1 proyecto, equipo de 5 personas, Sprint 1
-- (cerrado) y Sprint 2 (activo, enfocado en testing/QA), KPIs con
-- valores ya capturados.
--
-- Ejecutar con el usuario ADMIN.
-- =====================================================================

-- ---------------------------------------------------------------
-- 1) LIMPIEZA (respetando dependencias por FK)
-- ---------------------------------------------------------------
DELETE FROM ADMIN.TAREA_KPI;
DELETE FROM ADMIN.KPI_SNAPSHOTS;
DELETE FROM ADMIN.TAREA_HISTORIAL;
DELETE FROM ADMIN.KPIS;
DELETE FROM ADMIN.TAREAS;
DELETE FROM ADMIN.SPRINTS;
DELETE FROM ADMIN.CREDENCIALES;
DELETE FROM ADMIN.PROYECTOS;
DELETE FROM ADMIN.USUARIOS;
COMMIT;

-- ---------------------------------------------------------------
-- 2) EQUIPO DE 5 PERSONAS
-- ---------------------------------------------------------------
INSERT INTO ADMIN.USUARIOS (USER_ID, FULL_NAME, EMAIL, ROL) VALUES (1, 'Ana Torres',      'ana.torres@demo.com',     'Scrum Master');
INSERT INTO ADMIN.USUARIOS (USER_ID, FULL_NAME, EMAIL, ROL) VALUES (2, 'Luis Hernandez',  'luis.hernandez@demo.com', 'Developer');
INSERT INTO ADMIN.USUARIOS (USER_ID, FULL_NAME, EMAIL, ROL) VALUES (3, 'Maria Gomez',     'maria.gomez@demo.com',    'Developer');
INSERT INTO ADMIN.USUARIOS (USER_ID, FULL_NAME, EMAIL, ROL) VALUES (4, 'Carlos Ramirez',  'carlos.ramirez@demo.com', 'Developer');
INSERT INTO ADMIN.USUARIOS (USER_ID, FULL_NAME, EMAIL, ROL) VALUES (5, 'Sofia Mendoza',   'sofia.mendoza@demo.com',  'Product Owner');

-- Credenciales: password para todos = Demo1234!
INSERT INTO ADMIN.CREDENCIALES (HASH_PASSWORD, EMAIL, FECHA_CREACION, ACTIVO, USER_ID)
VALUES ('$2b$12$ATQiQMSiqObLnwrN164vGei4Fa88LYBo3Bs3MLKw7IbonBDqCJvtO', 'ana.torres@demo.com', SYSDATE, 1, 1);
INSERT INTO ADMIN.CREDENCIALES (HASH_PASSWORD, EMAIL, FECHA_CREACION, ACTIVO, USER_ID)
VALUES ('$2b$12$ATQiQMSiqObLnwrN164vGei4Fa88LYBo3Bs3MLKw7IbonBDqCJvtO', 'luis.hernandez@demo.com', SYSDATE, 1, 2);
INSERT INTO ADMIN.CREDENCIALES (HASH_PASSWORD, EMAIL, FECHA_CREACION, ACTIVO, USER_ID)
VALUES ('$2b$12$ATQiQMSiqObLnwrN164vGei4Fa88LYBo3Bs3MLKw7IbonBDqCJvtO', 'maria.gomez@demo.com', SYSDATE, 1, 3);
INSERT INTO ADMIN.CREDENCIALES (HASH_PASSWORD, EMAIL, FECHA_CREACION, ACTIVO, USER_ID)
VALUES ('$2b$12$ATQiQMSiqObLnwrN164vGei4Fa88LYBo3Bs3MLKw7IbonBDqCJvtO', 'carlos.ramirez@demo.com', SYSDATE, 1, 4);
INSERT INTO ADMIN.CREDENCIALES (HASH_PASSWORD, EMAIL, FECHA_CREACION, ACTIVO, USER_ID)
VALUES ('$2b$12$ATQiQMSiqObLnwrN164vGei4Fa88LYBo3Bs3MLKw7IbonBDqCJvtO', 'sofia.mendoza@demo.com', SYSDATE, 1, 5);

-- ---------------------------------------------------------------
-- 3) PROYECTO
-- ---------------------------------------------------------------
INSERT INTO ADMIN.PROYECTOS (PROYECTO_ID, NOMBRE, FECHA_INICIO, FECHA_FIN, ESTATUS, DESCRIPCION)
VALUES (1, 'Plataforma de Gestion de Proyectos MTDR',
        DATE '2026-05-01', DATE '2026-07-31', 'En Progreso',
        'Plataforma web para gestionar proyectos, sprints, tareas y KPIs de equipos de desarrollo, con asistente RAG integrado.');

-- ---------------------------------------------------------------
-- 4) SPRINTS
-- ---------------------------------------------------------------
INSERT INTO ADMIN.SPRINTS (SPRINT_ID, NOMBRE, FECHA_INICIO, FECHA_FIN, ESTATUS, OBJETIVO, PROYECTO_ID)
VALUES (1, 'Sprint 1 - Fundacion', DATE '2026-05-01', DATE '2026-05-15', 'Completado',
        'Construir el CRUD base de usuarios, proyectos y tareas, y disenar la base de datos.', 1);

INSERT INTO ADMIN.SPRINTS (SPRINT_ID, NOMBRE, FECHA_INICIO, FECHA_FIN, ESTATUS, OBJETIVO, PROYECTO_ID)
VALUES (2, 'Sprint 2 - QA y Testing', DATE '2026-05-18', DATE '2026-06-12', 'Activo',
        'Cubrir el sistema con pruebas unitarias, de integracion, de carga y de seguridad antes del release.', 1);

-- ---------------------------------------------------------------
-- 5) TAREAS
-- ---------------------------------------------------------------

-- Sprint 1 (cerrado): tareas base, todas completadas
INSERT INTO ADMIN.TAREAS (TAREA_ID, NOMBRE, PRIORIDAD, ESTATUS, FECHA_CREACION, FECHA_VENCIMIENTO, DESCRIPCION, HORAS_ESTIMADAS, HORAS_REALES, STORY_POINTS, BORRADO, SPRINT_ID, PROYECTO_ID, ASIGNADO_A, CREADO_POR)
VALUES (101, 'Diseno de la base de datos', 'Alta', 'Completado', DATE '2026-05-01', DATE '2026-05-04', 'Modelar tablas de usuarios, proyectos, sprints, tareas y KPIs.', 12, 11, 5, 0, 1, 1, 2, 1);

INSERT INTO ADMIN.TAREAS (TAREA_ID, NOMBRE, PRIORIDAD, ESTATUS, FECHA_CREACION, FECHA_VENCIMIENTO, DESCRIPCION, HORAS_ESTIMADAS, HORAS_REALES, STORY_POINTS, BORRADO, SPRINT_ID, PROYECTO_ID, ASIGNADO_A, CREADO_POR)
VALUES (102, 'Setup del proyecto Spring Boot', 'Alta', 'Completado', DATE '2026-05-01', DATE '2026-05-05', 'Configurar el backend, conexion a Oracle ADB y wallet.', 8, 9, 3, 0, 1, 1, 3, 1);

INSERT INTO ADMIN.TAREAS (TAREA_ID, NOMBRE, PRIORIDAD, ESTATUS, FECHA_CREACION, FECHA_VENCIMIENTO, DESCRIPCION, HORAS_ESTIMADAS, HORAS_REALES, STORY_POINTS, BORRADO, SPRINT_ID, PROYECTO_ID, ASIGNADO_A, CREADO_POR)
VALUES (103, 'CRUD de usuarios y autenticacion', 'Alta', 'Completado', DATE '2026-05-05', DATE '2026-05-10', 'Endpoints de registro, login y gestion de usuarios.', 10, 12, 5, 0, 1, 1, 4, 1);

INSERT INTO ADMIN.TAREAS (TAREA_ID, NOMBRE, PRIORIDAD, ESTATUS, FECHA_CREACION, FECHA_VENCIMIENTO, DESCRIPCION, HORAS_ESTIMADAS, HORAS_REALES, STORY_POINTS, BORRADO, SPRINT_ID, PROYECTO_ID, ASIGNADO_A, CREADO_POR)
VALUES (104, 'CRUD de proyectos, sprints y tareas', 'Alta', 'Completado', DATE '2026-05-06', DATE '2026-05-13', 'Endpoints REST para administrar proyectos, sprints y tareas.', 16, 18, 8, 0, 1, 1, 2, 1);

INSERT INTO ADMIN.TAREAS (TAREA_ID, NOMBRE, PRIORIDAD, ESTATUS, FECHA_CREACION, FECHA_VENCIMIENTO, DESCRIPCION, HORAS_ESTIMADAS, HORAS_REALES, STORY_POINTS, BORRADO, SPRINT_ID, PROYECTO_ID, ASIGNADO_A, CREADO_POR)
VALUES (105, 'Wireframes y diseno de UI', 'Media', 'Completado', DATE '2026-05-04', DATE '2026-05-12', 'Disenar pantallas de tablero, sprints y KPIs.', 8, 7, 3, 0, 1, 1, 5, 1);

-- Sprint 2 (activo): organizacion de pruebas / QA
INSERT INTO ADMIN.TAREAS (TAREA_ID, NOMBRE, PRIORIDAD, ESTATUS, FECHA_CREACION, FECHA_VENCIMIENTO, DESCRIPCION, HORAS_ESTIMADAS, HORAS_REALES, STORY_POINTS, BORRADO, SPRINT_ID, PROYECTO_ID, ASIGNADO_A, CREADO_POR)
VALUES (201, 'Pruebas unitarias - servicios de Tareas y Sprints', 'Alta', 'Completado', DATE '2026-05-18', DATE '2026-05-22', 'Cobertura de TareaService, SprintService y ProyectoService con JUnit.', 10, 9, 5, 0, 2, 1, 2, 1);

INSERT INTO ADMIN.TAREAS (TAREA_ID, NOMBRE, PRIORIDAD, ESTATUS, FECHA_CREACION, FECHA_VENCIMIENTO, DESCRIPCION, HORAS_ESTIMADAS, HORAS_REALES, STORY_POINTS, BORRADO, SPRINT_ID, PROYECTO_ID, ASIGNADO_A, CREADO_POR)
VALUES (202, 'Pruebas unitarias - autenticacion y credenciales', 'Alta', 'Completado', DATE '2026-05-18', DATE '2026-05-23', 'Pruebas de AuthController, registro, login y hashing de password.', 8, 7, 3, 0, 2, 1, 3, 1);

INSERT INTO ADMIN.TAREAS (TAREA_ID, NOMBRE, PRIORIDAD, ESTATUS, FECHA_CREACION, FECHA_VENCIMIENTO, DESCRIPCION, HORAS_ESTIMADAS, HORAS_REALES, STORY_POINTS, BORRADO, SPRINT_ID, PROYECTO_ID, ASIGNADO_A, CREADO_POR)
VALUES (203, 'Pruebas de integracion - API REST completa', 'Alta', 'Completado', DATE '2026-05-20', DATE '2026-05-27', 'Pruebas end-to-end de los endpoints de proyectos, sprints, tareas y KPIs via ORDS.', 12, 14, 8, 0, 2, 1, 4, 1);

INSERT INTO ADMIN.TAREAS (TAREA_ID, NOMBRE, PRIORIDAD, ESTATUS, FECHA_CREACION, FECHA_VENCIMIENTO, DESCRIPCION, HORAS_ESTIMADAS, HORAS_REALES, STORY_POINTS, BORRADO, SPRINT_ID, PROYECTO_ID, ASIGNADO_A, CREADO_POR)
VALUES (204, 'Pruebas de integracion - asistente RAG', 'Alta', 'Completado', DATE '2026-05-21', DATE '2026-05-28', 'Validar busqueda semantica con embeddings ONNX y respuestas de Groq.', 10, 11, 5, 0, 2, 1, 2, 1);

INSERT INTO ADMIN.TAREAS (TAREA_ID, NOMBRE, PRIORIDAD, ESTATUS, FECHA_CREACION, FECHA_VENCIMIENTO, DESCRIPCION, HORAS_ESTIMADAS, HORAS_REALES, STORY_POINTS, BORRADO, SPRINT_ID, PROYECTO_ID, ASIGNADO_A, CREADO_POR)
VALUES (205, 'Configurar pipeline de pruebas de carga (JMeter)', 'Alta', 'En Progreso', DATE '2026-05-22', DATE '2026-06-05', 'Plan de pruebas con JMeter: carga normal (25), pico (50) y estres (100 usuarios).', 12, 8, 8, 0, 2, 1, 3, 1);

INSERT INTO ADMIN.TAREAS (TAREA_ID, NOMBRE, PRIORIDAD, ESTATUS, FECHA_CREACION, FECHA_VENCIMIENTO, DESCRIPCION, HORAS_ESTIMADAS, HORAS_REALES, STORY_POINTS, BORRADO, SPRINT_ID, PROYECTO_ID, ASIGNADO_A, CREADO_POR)
VALUES (206, 'Optimizar tasa de error bajo carga (umbral 5%)', 'Alta', 'En Progreso', DATE '2026-05-25', DATE '2026-06-08', 'Reducir errores en pruebas de estres revisando pool de conexiones y EmbeddingSyncService.', 10, 4, 5, 0, 2, 1, 4, 1);

INSERT INTO ADMIN.TAREAS (TAREA_ID, NOMBRE, PRIORIDAD, ESTATUS, FECHA_CREACION, FECHA_VENCIMIENTO, DESCRIPCION, HORAS_ESTIMADAS, HORAS_REALES, STORY_POINTS, BORRADO, SPRINT_ID, PROYECTO_ID, ASIGNADO_A, CREADO_POR)
VALUES (207, 'Pruebas E2E del tablero de sprints (UI)', 'Media', 'En Progreso', DATE '2026-05-26', DATE '2026-06-09', 'Automatizar flujo de creacion y arrastre de tareas entre columnas del tablero.', 8, 3, 3, 0, 2, 1, 5, 1);

INSERT INTO ADMIN.TAREAS (TAREA_ID, NOMBRE, PRIORIDAD, ESTATUS, FECHA_CREACION, FECHA_VENCIMIENTO, DESCRIPCION, HORAS_ESTIMADAS, HORAS_REALES, STORY_POINTS, BORRADO, SPRINT_ID, PROYECTO_ID, ASIGNADO_A, CREADO_POR)
VALUES (208, 'Revision de seguridad de endpoints API', 'Media', 'Pendiente', DATE '2026-05-28', DATE '2026-06-10', 'Revisar autorizacion por proyecto/usuario y exposicion de credenciales en configuracion.', 8, 0, 5, 0, 2, 1, 1, 1);

INSERT INTO ADMIN.TAREAS (TAREA_ID, NOMBRE, PRIORIDAD, ESTATUS, FECHA_CREACION, FECHA_VENCIMIENTO, DESCRIPCION, HORAS_ESTIMADAS, HORAS_REALES, STORY_POINTS, BORRADO, SPRINT_ID, PROYECTO_ID, ASIGNADO_A, CREADO_POR)
VALUES (209, 'Documentar plan de pruebas del Sprint 2', 'Baja', 'Pendiente', DATE '2026-05-29', DATE '2026-06-11', 'Consolidar casos de prueba, resultados y pendientes para la presentacion.', 4, 0, 2, 0, 2, 1, 1, 1);

INSERT INTO ADMIN.TAREAS (TAREA_ID, NOMBRE, PRIORIDAD, ESTATUS, FECHA_CREACION, FECHA_VENCIMIENTO, DESCRIPCION, HORAS_ESTIMADAS, HORAS_REALES, STORY_POINTS, BORRADO, SPRINT_ID, PROYECTO_ID, ASIGNADO_A, CREADO_POR)
VALUES (210, 'Pruebas de regresion - modulo de KPIs', 'Media', 'Completado', DATE '2026-05-23', DATE '2026-05-30', 'Verificar calculo y visualizacion de KPIs tras cambios en el backend.', 6, 6, 3, 0, 2, 1, 3, 1);

COMMIT;

-- ---------------------------------------------------------------
-- 6) KPIS (todos con valor_actual capturado para Sprint 2)
-- ---------------------------------------------------------------
INSERT INTO ADMIN.KPIS (KPI_ID, NOMBRE, DESCRIPCION, VALOR_ACTUAL, VALOR_META, UNIDAD, FECHA_MEDICION, PROYECTO_ID, SPRINT_ID, USER_ID, CREADO_EN, CREADO_POR)
VALUES (1, 'Velocidad del equipo', 'Story points completados en el sprint actual.', 24, 35, 'SP', DATE '2026-06-10', 1, 2, 1, DATE '2026-05-18', 1);

INSERT INTO ADMIN.KPIS (KPI_ID, NOMBRE, DESCRIPCION, VALOR_ACTUAL, VALOR_META, UNIDAD, FECHA_MEDICION, PROYECTO_ID, SPRINT_ID, USER_ID, CREADO_EN, CREADO_POR)
VALUES (2, 'Cobertura de pruebas unitarias', 'Porcentaje de cobertura de codigo del backend.', 72, 80, '%', DATE '2026-06-10', 1, 2, 2, DATE '2026-05-18', 1);

INSERT INTO ADMIN.KPIS (KPI_ID, NOMBRE, DESCRIPCION, VALOR_ACTUAL, VALOR_META, UNIDAD, FECHA_MEDICION, PROYECTO_ID, SPRINT_ID, USER_ID, CREADO_EN, CREADO_POR)
VALUES (3, 'Tareas completadas a tiempo', 'Porcentaje de tareas entregadas antes de su fecha de vencimiento.', 78, 90, '%', DATE '2026-06-10', 1, 2, 1, DATE '2026-05-18', 1);

INSERT INTO ADMIN.KPIS (KPI_ID, NOMBRE, DESCRIPCION, VALOR_ACTUAL, VALOR_META, UNIDAD, FECHA_MEDICION, PROYECTO_ID, SPRINT_ID, USER_ID, CREADO_EN, CREADO_POR)
VALUES (4, 'Bugs detectados en QA', 'Numero de defectos encontrados durante las pruebas del sprint.', 6, 5, 'bugs', DATE '2026-06-10', 1, 2, 4, DATE '2026-05-18', 1);

INSERT INTO ADMIN.KPIS (KPI_ID, NOMBRE, DESCRIPCION, VALOR_ACTUAL, VALOR_META, UNIDAD, FECHA_MEDICION, PROYECTO_ID, SPRINT_ID, USER_ID, CREADO_EN, CREADO_POR)
VALUES (5, 'Tiempo promedio de resolucion de bugs', 'Horas promedio para cerrar un defecto reportado.', 19, 24, 'horas', DATE '2026-06-10', 1, 2, 4, DATE '2026-05-18', 1);

INSERT INTO ADMIN.KPIS (KPI_ID, NOMBRE, DESCRIPCION, VALOR_ACTUAL, VALOR_META, UNIDAD, FECHA_MEDICION, PROYECTO_ID, SPRINT_ID, USER_ID, CREADO_EN, CREADO_POR)
VALUES (6, 'Precision de estimacion (horas)', 'Relacion entre horas reales y horas estimadas.', 93, 100, '%', DATE '2026-06-10', 1, 2, 1, DATE '2026-05-18', 1);

INSERT INTO ADMIN.KPIS (KPI_ID, NOMBRE, DESCRIPCION, VALOR_ACTUAL, VALOR_META, UNIDAD, FECHA_MEDICION, PROYECTO_ID, SPRINT_ID, USER_ID, CREADO_EN, CREADO_POR)
VALUES (7, 'Pruebas automatizadas ejecutadas', 'Numero total de pruebas automatizadas (unitarias + integracion) ejecutadas en CI.', 47, 50, 'tests', DATE '2026-06-10', 1, 2, 3, DATE '2026-05-18', 1);

INSERT INTO ADMIN.KPIS (KPI_ID, NOMBRE, DESCRIPCION, VALOR_ACTUAL, VALOR_META, UNIDAD, FECHA_MEDICION, PROYECTO_ID, SPRINT_ID, USER_ID, CREADO_EN, CREADO_POR)
VALUES (8, 'Tasa de error en pruebas de carga', 'Porcentaje de errores durante la prueba de estres (100 usuarios).', 6.59, 5, '%', DATE '2026-06-10', 1, 2, 5, DATE '2026-05-18', 1);

COMMIT;

-- ---------------------------------------------------------------
-- 7) Relacion TAREA_KPI (peso de cada tarea sobre cada KPI)
-- ---------------------------------------------------------------
INSERT INTO ADMIN.TAREA_KPI (TAREA_ID, KPI_ID, PESO) VALUES (201, 1, 1.0);
INSERT INTO ADMIN.TAREA_KPI (TAREA_ID, KPI_ID, PESO) VALUES (210, 1, 0.5);
INSERT INTO ADMIN.TAREA_KPI (TAREA_ID, KPI_ID, PESO) VALUES (201, 2, 1.0);
INSERT INTO ADMIN.TAREA_KPI (TAREA_ID, KPI_ID, PESO) VALUES (202, 2, 1.0);
INSERT INTO ADMIN.TAREA_KPI (TAREA_ID, KPI_ID, PESO) VALUES (203, 3, 1.0);
INSERT INTO ADMIN.TAREA_KPI (TAREA_ID, KPI_ID, PESO) VALUES (204, 3, 1.0);
INSERT INTO ADMIN.TAREA_KPI (TAREA_ID, KPI_ID, PESO) VALUES (203, 4, 1.0);
INSERT INTO ADMIN.TAREA_KPI (TAREA_ID, KPI_ID, PESO) VALUES (210, 4, 1.0);
INSERT INTO ADMIN.TAREA_KPI (TAREA_ID, KPI_ID, PESO) VALUES (206, 5, 1.0);
INSERT INTO ADMIN.TAREA_KPI (TAREA_ID, KPI_ID, PESO) VALUES (204, 6, 1.0);
INSERT INTO ADMIN.TAREA_KPI (TAREA_ID, KPI_ID, PESO) VALUES (203, 7, 1.0);
INSERT INTO ADMIN.TAREA_KPI (TAREA_ID, KPI_ID, PESO) VALUES (204, 7, 1.0);
INSERT INTO ADMIN.TAREA_KPI (TAREA_ID, KPI_ID, PESO) VALUES (205, 8, 1.0);
INSERT INTO ADMIN.TAREA_KPI (TAREA_ID, KPI_ID, PESO) VALUES (206, 8, 1.0);

COMMIT;

-- ---------------------------------------------------------------
-- NOTA: despues de correr este script, ejecutar de nuevo
-- db/vector/03_backfill_embeddings.sql para que las nuevas filas
-- (proyecto, sprints, tareas, kpis, usuarios) tengan EMBEDDING
-- y aparezcan en las busquedas semanticas del asistente RAG.
-- ---------------------------------------------------------------
