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

-- 2.1) Credencial de Object Storage (necesaria incluso para objetos publicos)
--      Reemplaza username y password por tu usuario de OCI y un Auth Token
--      (Profile -> User Settings -> Auth Tokens -> Generate Token)
BEGIN
    DBMS_CLOUD.CREATE_CREDENTIAL(
        credential_name => 'OBJ_STORE_CRED',
        username        => 'a00840038@tec.mx',
        password        => 'ejemplo'
    );
EXCEPTION WHEN OTHERS THEN
    IF SQLCODE != -20022 THEN -- ORA-20022: credential already exists
        RAISE;
    END IF;
END;
/

-- 3) Descargar y cargar el modelo (solo si no existe ya)
DECLARE
    model_count   INT;
    onnx_mod_file VARCHAR2(100) := 'all_MiniLM_L12_v2.onnx';
    modname       VARCHAR2(500) := 'ALL_MINILM_L12_V2';
    location_uri  VARCHAR2(300) := 'https://objectstorage.mx-queretaro-1.oraclecloud.com/n/axe5wdod0see/b/onnx-models/o/';
BEGIN
    SELECT COUNT(*) INTO model_count
    FROM user_mining_models
    WHERE model_name = modname;

    IF model_count = 0 THEN
        DBMS_CLOUD.GET_OBJECT(
            credential_name => 'OBJ_STORE_CRED',
            directory_name  => 'STAGING',
            object_uri      => location_uri || onnx_mod_file
        );

        DBMS_VECTOR.DROP_ONNX_MODEL(model_name => modname, force => true);

        DBMS_VECTOR.LOAD_ONNX_MODEL(
            'STAGING',
            onnx_mod_file,
            modname,
            JSON('{"function" : "embedding", "embeddingOutput" : "embedding", "input": {"input": ["DATA"]}}')
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
