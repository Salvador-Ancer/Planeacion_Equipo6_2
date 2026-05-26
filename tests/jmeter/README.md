# Pruebas de Carga JMeter — MtdrSpring API

## Prerequisitos

- Apache JMeter 5.6.3: https://archive.apache.org/dist/jmeter/binaries/apache-jmeter-5.6.3.tgz
- Java 11 o 17 en el PATH
- Instancia de la aplicación corriendo (local o desplegada en OCI)

## Estructura de Archivos

```
tests/jmeter/
├── load_test.jmx      # Plan de prueba principal
├── test_users.csv     # Credenciales de usuarios de prueba
└── README.md          # Este archivo
```

## Setup de Usuarios de Prueba

Antes de ejecutar, registrar los usuarios del CSV vía `POST /auth/register`:

```bash
HOST=<IP_o_localhost>
PORT=<80_o_8080>

for USER in admin dev1 dev2 dev3 dev4 dev5; do
  curl -s -o /dev/null -w "Register $USER@test.com: %{http_code}\n" \
    -X POST http://$HOST:$PORT/auth/register \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$USER@test.com\",\"password\":\"Test1234!\",\"fullName\":\"$USER\",\"rol\":\"Developer\"}"
done
curl -s -o /dev/null -w "Register pm@test.com: %{http_code}\n" \
  -X POST http://$HOST:$PORT/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"pm@test.com","password":"Test1234!","fullName":"PM","rol":"Manager"}'
curl -s -o /dev/null -w "Register qa@test.com: %{http_code}\n" \
  -X POST http://$HOST:$PORT/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"qa@test.com","password":"Test1234!","fullName":"QA","rol":"Developer"}'
```

## Ejecución Local (GUI — para depuración)

```bash
cd tests/jmeter
jmeter -t load_test.jmx
```

Configurar las variables `BASE_HOST` y `BASE_PORT` en el plan antes de ejecutar.

## Ejecución Local (Non-GUI — recomendado)

### Baseline — 10 usuarios concurrentes (3 min)
```bash
cd tests/jmeter
jmeter -n \
  -t load_test.jmx \
  -l results/baseline.jtl \
  -e -o results/html/baseline \
  -Jhost=localhost -Jport=8080 \
  -Jthreads=10 -Jrampup=30 -Jduration=180 \
  -Jthinktime=1000 \
  -Jemail=dev1@test.com -Jpassword=Test1234!
```

### Normal — 25 usuarios concurrentes (5 min)
```bash
jmeter -n -t load_test.jmx \
  -l results/normal.jtl -e -o results/html/normal \
  -Jhost=localhost -Jport=8080 \
  -Jthreads=25 -Jrampup=60 -Jduration=300 \
  -Jthinktime=1000 -Jemail=dev2@test.com -Jpassword=Test1234!
```

### Peak — 50 usuarios concurrentes (5 min)
```bash
jmeter -n -t load_test.jmx \
  -l results/peak.jtl -e -o results/html/peak \
  -Jhost=localhost -Jport=8080 \
  -Jthreads=50 -Jrampup=90 -Jduration=300 \
  -Jthinktime=1000 -Jemail=dev3@test.com -Jpassword=Test1234!
```

### Stress — 100 usuarios concurrentes (3 min)
```bash
jmeter -n -t load_test.jmx \
  -l results/stress.jtl -e -o results/html/stress \
  -Jhost=localhost -Jport=8080 \
  -Jthreads=100 -Jrampup=120 -Jduration=180 \
  -Jthinktime=500 -Jemail=dev4@test.com -Jpassword=Test1234!
```

## Ver Reporte HTML

```bash
open results/html/peak/index.html   # macOS
xdg-open results/html/peak/index.html   # Linux
```

## Referencia de Parámetros CLI

| Parámetro | Descripción | Default |
|-----------|-------------|---------|
| `-Jhost` | Host o IP del servidor | `localhost` |
| `-Jport` | Puerto del servidor | `8080` |
| `-Jthreads` | Usuarios virtuales concurrentes totales | `10` |
| `-Jrampup` | Segundos para llegar al total de hilos | `30` |
| `-Jduration` | Duración del test en segundos | `180` |
| `-Jthinktime` | Milisegundos de pausa entre requests por hilo | `1000` |
| `-Jemail` | Email de login para autenticación (anulado por CSV) | `admin@test.com` |
| `-Jpassword` | Contraseña de login | `Test1234!` |

## Estructura del Plan de Prueba

**Thread Group Lecturas (80% de hilos):** Ejecuta login una vez por hilo y luego en loop:
`GET /tareas` → `GET /tareas/sprint/{id}` → `GET /sprints` → `GET /sprints/activos` → `GET /proyectos` → `GET /kpis` → `GET /usuarios`

**Thread Group Escrituras (20% de hilos):** En loop:
`POST /auth/login` → `GET /tareas` (extrae IDs) → `POST /tareas` → `PUT /tareas/{id}`

> **Nota:** `PUT /tareas` dispara `recalcularPorSprint` + `recalcularPorProyecto` síncronamente — es el endpoint más costoso y el primer punto de falla bajo stress.

## Criterios de Aceptación

| Escenario | Usuarios | p90 máx | Error rate máx |
|-----------|----------|---------|----------------|
| Baseline  | 10 | 1,000 ms | < 1% |
| Normal    | 25 | 2,000 ms | < 2% |
| Peak      | 50 | 3,000 ms | < 5% |
| Stress    | 100 | Informativo | N/A |

### Por endpoint (cualquier escenario hasta Peak)

| Endpoint | Timeout de aserción |
|----------|---------------------|
| `POST /auth/login` | 2,000 ms |
| `GET /tareas` | 3,000 ms |
| `GET /sprints`, `/proyectos`, `/usuarios` | 2,000 ms |
| `GET /kpis` | 3,000 ms |
| `POST /tareas`, `PUT /tareas/{id}` | 5,000 ms |

## Notas de Arquitectura

- **Auth stateless:** Spring Security usa `STATELESS` + `permitAll()`. El login NO genera cookie de sesión — retorna JSON con `userId`. JMeter usa `JSONPathExtractor` para capturar ese valor.
- **OCI LB IP_HASH:** Todo el tráfico de JMeter desde una IP va a la misma réplica, por lo que el pool efectivo es de 30 conexiones (no 60).
- **Limpieza de datos:** Borrar tareas creadas por los tests con: `DELETE FROM tareas WHERE descripcion = 'Created by JMeter load test'`
