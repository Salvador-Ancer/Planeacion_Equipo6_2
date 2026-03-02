# M2. Actividad 3 — Project Charter

**Instituto Tecnológico de Estudios Superiores de Monterrey**
Planeación de sistemas de software · Gpo 106

**Equipo 62:**
Silvanna Farías A01178494 · Perla Sofía Reyes Bretado A00839262 · Salvador Ancer Saldaña A00840038 · Maria Claudia Cavada Felix A01723282 · Rogiero De La Torre Maldonado A00838656

**Fecha:** 27/02/2026 · Monterrey, Nuevo León, México.

---

## 1. Información General

**Proyecto:** Sistema de Gestión de Proyectos de Software con Portal Web y ChatBot con OCI

**Equipo:**
- Integrante 1: Silvanna Farías - Developer
- Integrante 2: Sofía Reyes - Product Owner
- Integrante 3: Salvador Ancer - Developer
- Integrante 4: María Cavada - Scrum Master
- Integrante 5: Rogiero De La Torre - Developer

**Fecha:** 27/02/2026
**Socio Formador / Empresa:** Oracle
**Sponsor:** Oswaldo (puesto pendiente)

---

## 2. Justificación del Proyecto (Business Case)

**Problemática:**
La empresa cuenta con equipos de desarrollo en modalidades remotas e híbridas, por lo cual enfrentan los siguientes problemas:

- Falta de visibilidad en el avance de actividades.
- Dificultad para dar seguimiento a tareas, bloqueos y carga de trabajo.
- Pérdida de tiempo en coordinación manual y reportes repetitivos.
- Comunicación dispersa entre múltiples herramientas.

Actualmente, los equipos gestionan sus tareas con múltiples herramientas y procesos manuales, lo que dificulta la visibilidad del progreso y la toma de decisiones por parte de los managers, generando retrasos, falta de seguimiento y menor eficiencia.

**Impacto medible:**
El líder y el equipo no cuentan con una vista clara y actualizada del sprint, lo que afecta:

- La productividad del equipo
- La toma de decisiones oportuna
- El cumplimiento de entregables

---

## 3. Objetivos del Proyecto (SMART)

1. Implementar un chatbot en Telegram que permita a los usuarios consultar y gestionar el 100% de sus tareas.
2. Desplegar el sistema en OCI utilizando prácticas Cloud Native y demostrar su funcionamiento mediante pruebas antes del cierre del semestre.
3. Desarrollar un prototipo funcional de portal web que permita visualizar, crear y monitorear tareas del equipo antes del cierre del semestre.

---

## 4. Alcance de Alto Nivel

**Incluye:**
- Portal web a alto nivel
- ChatBot Telegram
- Módulo de KPIs
- Seguridad: OCI IAM, roles, VCN, políticas de acceso por función
- Módulo de IA: resúmenes, detección de riesgos y apoyo en priorización
- OCI + OKE + BD con RAG
- Base de conocimiento (RAG)

**No incluye:**
- Migración o limpieza de datos históricos provenientes de otros sistemas
- Integraciones externas
- Gestión del cambio y capacitación
- Funcionalidades avanzadas de IA
- Personalización fuera del alcance definido

---

## 5. Stakeholders Clave

| Rol | Nombre o Área | Nivel de Influencia |
|---|---|---|
| Sponsor | Oswaldo / Oracle | Alta |
| Usuario Final | Integrantes del equipo de desarrollo remoto/híbrido | Media |
| Equipo Técnico | Silvanna Farías / Rogiero De La Torre / Salvador Ancer / María Cavada / Sofía Reyes | Media |
| Profesor | Adan Ruiz | Alta |

---

## 6. Criterios de Éxito

- El KPI de productividad aumenta 20%
- El sistema asigna tareas automáticamente
- El dashboard muestra el progreso del proyecto
- Se entrega documentación técnica y ejecutiva completa
- El socio formador valida la funcionalidad

---

## 7. Supuestos y Restricciones

**Supuestos:**
- El equipo contará con acceso a una cuenta de OCI con los servicios necesarios habilitados.
- Los integrantes usarán Telegram como canal de comunicación aceptado.
- Se dispondrá de datos de proyectos y sprints reales o simulados para validar los KPIs y el módulo de IA.
- El líder del equipo participará activamente en validaciones y retroalimentación durante el desarrollo.
- Los usuarios finales tienen conocimientos básicos para interactuar con un portal web y un chatbot.

**Restricciones:**
- Tiempo limitado al período académico del semestre.
- Presupuesto académico sin inversión económica real, se utilizarán créditos gratuitos o de prueba de OCI.
- El alcance de la IA se limita a resúmenes, alertas y recomendaciones basadas en los datos del sistema, sin integración con herramientas externas como Jira o GitHub.
- La solución no contempla soporte para múltiples idiomas en esta etapa.
- El chatbot estará restringido a la plataforma Telegram, no se contemplan otros canales en el alcance actual.

---

## 8. Riesgos Iniciales

| Riesgo | Probabilidad | Impacto | Mitigación |
|---|---|---|---|
| Datos insuficientes para IA | Media | Alta | Usar dataset de sprints |
| Complejidad en configuración de OKE y ATP | Alta | Media | Dedicar tiempo inicial a infraestructura |
| Respuestas imprecisas de IA | Media | Alta | Validar con casos de prueba anteriores |
| Cambios de requerimientos | Alta | Media | Mantener alcance en los primeros dos sprints |
| Baja adopción del chatbot | Baja | Media | Hacer comandos simples y capacitar al usuario |

---

## 9. Cronograma de Alto Nivel

| Fase | Semana |
|---|---|
| Definición y validación del problema | 1–3 |
| Diseño de solución | 4–5 |
| Desarrollo del prototipo | 6–11 |
| Validación con sponsor | 12–13 |
| Presentación final | 14–15 |

---

## 10. Aprobación

**Firma del Equipo:** ______________________________

**Firma del Sponsor:** _____________________________

**Fecha de Aprobación:** ___________________________

---

## Declaración Final

Este Project Charter autoriza formalmente el inicio del proyecto y establece las bases estratégicas, alcance y criterios de éxito que guiarán el desarrollo del sistema de gestión de proyectos con portal web y ChatBot en Oracle Cloud Infrastructure.
