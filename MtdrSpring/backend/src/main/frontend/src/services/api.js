// Base URL — CORS is open on backend, so we call Spring Boot directly in dev.
// In production set VITE_API_URL to the deployed backend origin.
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'

async function request(method, path, body = null) {
  const headers = { 'Content-Type': 'application/json' }

  const config = { method, headers }
  if (body) config.body = JSON.stringify(body)

  const res = await fetch(`${BASE_URL}${path}`, config)

  if (res.status === 401 && !path.startsWith('/auth/')) {
    localStorage.removeItem('opm_user')
    window.location.href = '/login'
    return
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ mensaje: 'Error del servidor' }))
    throw new Error(err.mensaje || `HTTP ${res.status}`)
  }

  if (res.status === 204) return null
  return res.json()
}

const get  = (path)        => request('GET',    path)
const post = (path, body)  => request('POST',   path, body)
const put  = (path, body)  => request('PUT',    path, body)
const del  = (path)        => request('DELETE', path)

// Auth — response fields: { mensaje, exito, userId, email, rol, fullName }
export const authApi = {
  login:    (email, password) => post('/auth/login',    { email, password }),
  register: (data)            => post('/auth/register', data),
}

// Proyectos — fields: { id, nombre, fechaInicio, fechaFin, estatus, descripcion }
// estatus values: 'Planeado' | 'En Progreso' | 'Completado' | 'Cancelado'
export const proyectosApi = {
  getAll:   ()         => get('/proyectos'),
  getById:  (id)       => get(`/proyectos/${id}`),
  create:   (data)     => post('/proyectos', data),
  update:   (id, data) => put(`/proyectos/${id}`, data),
  delete:   (id)       => del(`/proyectos/${id}`),
}

// Tareas — fields: { id, nombre, prioridad, estatus, descripcion, horasEstimadas,
//                    horasReales, storyPoints, sprintId, proyectoId, asignadoA, creadoPor }
// estatus values: 'Backlog' | 'En Progreso' | 'Completado' | 'Bloqueado'
// prioridad values: 'Alta' | 'Media' | 'Baja'
export const tareasApi = {
  getAll:        ()           => get('/tareas'),
  getById:       (id)         => get(`/tareas/${id}`),
  getByAsignado: (userId)     => get(`/tareas/asignado/${userId}`),
  getBySprint:   (sprintId)   => get(`/tareas/sprint/${sprintId}`),
  getByProyecto: (proyectoId) => get(`/tareas/proyecto/${proyectoId}`),
  getByEstatus:  (estatus)    => get(`/tareas/estatus/${encodeURIComponent(estatus)}`),
  create:        (data)       => post('/tareas', data),
  update:        (id, data)   => put(`/tareas/${id}`, data),
  delete:        (id)         => del(`/tareas/${id}`),
}

// Sprints — fields: { id, nombre, fechaInicio, fechaFin, estatus, objetivo, proyectoId }
// estatus values: 'Activo' | 'Pendiente' | 'Cerrado'
export const sprintsApi = {
  getAll:        ()           => get('/sprints'),
  getById:       (id)         => get(`/sprints/${id}`),
  getActivos:    ()           => get('/sprints/activos'),
  getByProyecto: (proyectoId) => get(`/sprints/proyecto/${proyectoId}`),
  create:        (data)       => post('/sprints', data),
  update:        (id, data)   => put(`/sprints/${id}`, data),
  delete:        (id)         => del(`/sprints/${id}`),
}

// KPIs
export const kpisApi = {
  getAll:        ()           => get('/kpis'),
  getById:       (id)         => get(`/kpis/${id}`),
  getByProyecto: (proyectoId) => get(`/kpis/proyecto/${proyectoId}`),
  getBySprint:   (sprintId)   => get(`/kpis/sprint/${sprintId}`),
  getByUsuario:  (userId)     => get(`/kpis/usuario/${userId}`),
  create:        (data)       => post('/kpis', data),
  update:        (id, data)   => put(`/kpis/${id}`, data),
  delete:        (id)         => del(`/kpis/${id}`),
}

// Usuarios
export const usuariosApi = {
  getAll:   ()         => get('/usuarios'),
  getById:  (id)       => get(`/usuarios/${id}`),
  create:   (data)     => post('/usuarios', data),
  update:   (id, data) => put(`/usuarios/${id}`, data),
  delete:   (id)       => del(`/usuarios/${id}`),
}

// AI Chat — proxied through backend to keep Anthropic key server-side
export const aiApi = {
  chat: (messages, system) => post('/ai/chat', { messages, system }),
}

export default { authApi, proyectosApi, tareasApi, sprintsApi, kpisApi, usuariosApi, aiApi }
