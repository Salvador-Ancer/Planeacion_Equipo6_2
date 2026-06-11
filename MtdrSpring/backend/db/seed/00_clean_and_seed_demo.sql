-- =====================================================================
-- 00_clean_and_seed_demo.sql
-- Limpia todos los datos actuales y carga: equipo de 5 personas + 1
-- admin, credenciales y proyecto.
-- Los Sprints 0-3, tareas, KPIs y TAREA_KPI se cargan despues con
-- 01_seed_sprints_tareas.sql y 02_seed_kpis_y_tarea_kpi.sql.
--
-- Ejecutar con el usuario ADMIN, ANTES de los scripts 01 y 02.
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
-- 2) EQUIPO DE 5 PERSONAS + 1 ADMIN
-- ---------------------------------------------------------------
INSERT INTO ADMIN.USUARIOS (USER_ID, FULL_NAME, EMAIL, ROL) VALUES (1, 'Ana Torres',      'ana.torres@demo.com',     'Scrum Master');
INSERT INTO ADMIN.USUARIOS (USER_ID, FULL_NAME, EMAIL, ROL) VALUES (2, 'Luis Hernandez',  'luis.hernandez@demo.com', 'Developer');
INSERT INTO ADMIN.USUARIOS (USER_ID, FULL_NAME, EMAIL, ROL) VALUES (3, 'Maria Gomez',     'maria.gomez@demo.com',    'Developer');
INSERT INTO ADMIN.USUARIOS (USER_ID, FULL_NAME, EMAIL, ROL) VALUES (4, 'Carlos Ramirez',  'carlos.ramirez@demo.com', 'Developer');
INSERT INTO ADMIN.USUARIOS (USER_ID, FULL_NAME, EMAIL, ROL) VALUES (5, 'Sofia Mendoza',   'sofia.mendoza@demo.com',  'Product Owner');
INSERT INTO ADMIN.USUARIOS (USER_ID, FULL_NAME, EMAIL, ROL) VALUES (6, 'Pedro Alvarez',   'pedro.alvarez@demo.com',  'Admin');

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
INSERT INTO ADMIN.CREDENCIALES (HASH_PASSWORD, EMAIL, FECHA_CREACION, ACTIVO, USER_ID)
VALUES ('$2b$12$ATQiQMSiqObLnwrN164vGei4Fa88LYBo3Bs3MLKw7IbonBDqCJvtO', 'pedro.alvarez@demo.com', SYSDATE, 1, 6);

-- ---------------------------------------------------------------
-- 3) PROYECTO
-- ---------------------------------------------------------------
INSERT INTO ADMIN.PROYECTOS (PROYECTO_ID, NOMBRE, FECHA_INICIO, FECHA_FIN, ESTATUS, DESCRIPCION)
VALUES (1, 'Plataforma de Gestion de Proyectos MTDR',
        DATE '2026-05-01', DATE '2026-07-31', 'En Progreso',
        'Plataforma web para gestionar proyectos, sprints, tareas y KPIs de equipos de desarrollo, con asistente RAG integrado.');

-- ---------------------------------------------------------------
-- NOTA: a continuacion ejecutar 01_seed_sprints_tareas.sql (sprints
-- 0-3 y tareas) y luego 02_seed_kpis_y_tarea_kpi.sql (KPIs y relacion
-- TAREA_KPI, dependen de que los Sprints y las Tareas ya existan).
-- ---------------------------------------------------------------
