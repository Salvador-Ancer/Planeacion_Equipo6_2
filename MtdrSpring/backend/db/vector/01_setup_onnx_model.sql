-- =====================================================================
-- 01_setup_onnx_model.sql
-- Carga el modelo de embeddings ALL_MINILM_L12_V2 dentro de la ADB.
-- Ejecutar UNA SOLA VEZ con el usuario ADMIN.
-- =====================================================================

-- 1) Permitir que ADMIN se conecte a Object Storage publico para descargar el modelo
BEGIN
    DBMS_NETWORK_ACL_ADMIN.APPEND_HOST_ACE(
        host => '*',
        ace  => xs$ace_type(
            privilege_list => xs$name_list('connect'),
            principal_name => 'ADMIN',
            principal_type => xs_acl.ptype_db)
    );
END;
/

-- 2) Directorio de staging para el archivo ONNX
CREATE OR REPLACE DIRECTORY staging AS 'staging';

-- 3) Descargar y cargar el modelo (solo si no existe ya)
DECLARE
    model_count   INT;
    onnx_mod_file VARCHAR2(100) := 'all-MiniLM-L12-v2.onnx';
    modname       VARCHAR2(500) := 'ALL_MINILM_L12_V2';
    location_uri  VARCHAR2(300) := 'https://objectstorage.us-ashburn-1.oraclecloud.com/n/adwc4pm/b/OML-Resources/o/';
BEGIN
    SELECT COUNT(*) INTO model_count
    FROM user_mining_models
    WHERE model_name = modname;

    IF model_count = 0 THEN
        DBMS_CLOUD.GET_OBJECT(
            credential_name => NULL, -- objeto publico
            directory_name  => 'STAGING',
            object_uri      => location_uri || onnx_mod_file
        );

        DBMS_VECTOR.LOAD_ONNX_MODEL(
            directory  => 'STAGING',
            file_name  => onnx_mod_file,
            model_name => modname,
            metadata   => '{"function" : "embedding", "embeddingOutput" : "embedding", "input": {"input": ["DATA"]}}'
        );

        DBMS_OUTPUT.PUT_LINE('Modelo ' || modname || ' cargado correctamente.');
    ELSE
        DBMS_OUTPUT.PUT_LINE('Modelo ' || modname || ' ya existe, no se vuelve a cargar.');
    END IF;
END;
/

-- 4) Verificacion rapida: generar un embedding de prueba
SELECT VECTOR_EMBEDDING(ALL_MINILM_L12_V2 USING 'Hola mundo' AS data) AS test_embedding
FROM dual;
