-- =====================================================================
-- 03_backfill_embeddings.sql
-- Genera los embeddings iniciales para los registros existentes.
-- Ejecutar como ADMIN despues de 01 y 02.
-- Volver a correr (o llamar desde el backend) cada vez que cambien
-- los datos de texto relevantes de una fila.
-- =====================================================================

UPDATE ADMIN.PROYECTOS
SET EMBEDDING = dbms_vector_chain.utl_to_embedding(
    NVL(NOMBRE, ' ') || ' ' || NVL(ESTATUS, ' ') || ' ' || NVL(DESCRIPCION, ' '),
    JSON('{"provider":"database","model":"ALL_MINILM_L12_V2","dimensions":384}')
);

UPDATE ADMIN.SPRINTS
SET EMBEDDING = dbms_vector_chain.utl_to_embedding(
    NVL(NOMBRE, ' ') || ' ' || NVL(ESTATUS, ' ') || ' ' || NVL(OBJETIVO, ' '),
    JSON('{"provider":"database","model":"ALL_MINILM_L12_V2","dimensions":384}')
);

UPDATE ADMIN.TAREAS
SET EMBEDDING = dbms_vector_chain.utl_to_embedding(
    NVL(NOMBRE, ' ') || ' ' || NVL(ESTATUS, ' ') || ' ' || NVL(PRIORIDAD, ' ') || ' ' || NVL(DESCRIPCION, ' '),
    JSON('{"provider":"database","model":"ALL_MINILM_L12_V2","dimensions":384}')
);

UPDATE ADMIN.KPIS
SET EMBEDDING = dbms_vector_chain.utl_to_embedding(
    NVL(NOMBRE, ' ') || ' ' || NVL(DESCRIPCION, ' ') || ' ' || NVL(UNIDAD, ' '),
    JSON('{"provider":"database","model":"ALL_MINILM_L12_V2","dimensions":384}')
);

UPDATE ADMIN.USUARIOS
SET EMBEDDING = dbms_vector_chain.utl_to_embedding(
    NVL(FULL_NAME, ' ') || ' ' || NVL(ROL, ' '),
    JSON('{"provider":"database","model":"ALL_MINILM_L12_V2","dimensions":384}')
);

UPDATE ADMIN.TAREA_HISTORIAL
SET EMBEDDING = dbms_vector_chain.utl_to_embedding(
    NVL(CAMPO, ' ') || ' cambio de ' || NVL(VALOR_ANTERIOR, ' ') || ' a ' || NVL(VALOR_NUEVO, ' '),
    JSON('{"provider":"database","model":"ALL_MINILM_L12_V2","dimensions":384}')
);

COMMIT;
