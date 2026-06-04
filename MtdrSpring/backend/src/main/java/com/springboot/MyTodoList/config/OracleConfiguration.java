package com.springboot.MyTodoList.config;


import oracle.jdbc.pool.OracleDataSource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.core.env.Environment;

import javax.sql.DataSource;
import java.sql.SQLException;

// No se carga en los perfiles 'test' ni 'local'.
// En esos perfiles Spring Boot auto-configura H2 vía application-{profile}.properties.
@Configuration
@Profile("!test & !local")
public class OracleConfiguration {

    Logger logger = LoggerFactory.getLogger(OracleConfiguration.class);

    @Autowired
    private DbSettings dbSettings;

    @Autowired
    private Environment env;

    @Bean
    public DataSource dataSource() throws SQLException {
        OracleDataSource ds = new OracleDataSource();

        // Spring's SystemEnvironmentPropertySource convierte DB_URL → db_url,
        // por lo que esta lectura funciona tanto con variables de entorno en
        // mayúsculas (Kubernetes) como con el nombre legacy en minúsculas.
        String dbUrl = env.getProperty("DB_URL");
        if (dbUrl == null) {
            dbUrl = env.getProperty("db_url"); // compatibilidad con despliegues anteriores
        }

        if (dbUrl != null) {
            // Kubernetes / Docker — credenciales desde env vars
            String dbUser     = coalesce(env.getProperty("DB_USER"),     env.getProperty("db_user"));
            String dbPassword = coalesce(env.getProperty("DB_PASSWORD"), env.getProperty("dbpassword"));
            String tnsAdmin   = env.getProperty("TNS_ADMIN_PATH");

            if (tnsAdmin != null) {
                System.setProperty("oracle.net.tns_admin", tnsAdmin);
            }

            ds.setURL(dbUrl);
            ds.setUser(dbUser);
            ds.setPassword(dbPassword);
            logger.info("DataSource Oracle configurado desde variables de entorno. URL: {}", dbUrl);
        } else {
            // Desarrollo local — credenciales desde application.properties
            if (dbSettings.getTnsAdmin() != null) {
                System.setProperty("oracle.net.tns_admin", dbSettings.getTnsAdmin());
            }
            ds.setURL(dbSettings.getUrl());
            ds.setUser(dbSettings.getUsername());
            ds.setPassword(dbSettings.getPassword());
            logger.info("DataSource Oracle configurado desde application.properties. URL: {}", dbSettings.getUrl());
        }

        return ds;
    }

    private String coalesce(String first, String second) {
        return first != null ? first : second;
    }
}
