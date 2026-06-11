package com.springboot.MyTodoList.config;

import com.fasterxml.jackson.databind.module.SimpleModule;
import com.fasterxml.jackson.databind.ser.std.ToStringSerializer;
import org.springframework.boot.autoconfigure.jackson.Jackson2ObjectMapperBuilderCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class JacksonConfig {

    /**
     * Serialize all Long/long values as JSON strings to prevent JavaScript
     * precision loss for IDs larger than Number.MAX_SAFE_INTEGER (2^53 - 1).
     * Oracle sequences can generate 64-bit IDs that exceed this limit.
     */
    @Bean
    public Jackson2ObjectMapperBuilderCustomizer jacksonLongAsString() {
        return builder -> {
            SimpleModule module = new SimpleModule();
            module.addSerializer(Long.class, ToStringSerializer.instance);
            module.addSerializer(long.class, ToStringSerializer.instance);
            builder.modules(module);
        };
    }
}
