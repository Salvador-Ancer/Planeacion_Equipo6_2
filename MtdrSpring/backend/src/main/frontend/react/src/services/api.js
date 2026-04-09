//Base Configuration
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'

//HTTP Client 
async function request(method, path, body = null) {
  const token = localStorage.getItem('opm_token')

  const headers = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const config = { method, headers }
  if (body) config.body = JSON.stringify(body)

  const res = await fetch(`${BASE_URL}${path}`, config)

  if (res.status === 401) {
    localStorage.removeItem('opm_token')
    localStorage.removeItem('opm_user')
    window.location.href = '/login'
    return
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Error del servidor' }))
    throw new Error(err.message || `HTTP ${res.status}`)
  }

  if (res.status === 204) return null
  return res.json()
}

const get = (path) => request('GET', path)
const post = (path, body) => request('POST', path, body)
const put = (path, body) => request('PUT', path, body)
const del = (path) => request('DELETE', path)

//Auth 
export const authApi = {
  login: (email, password) => post('/auth/login', { email, password }),
  logout: () => post('/auth/logout'),
  me: () => get('/auth/me'),
}

//Projects
export const projectsApi = {
  getAll: () => get('/projects'),
  getById: (id) => get(`/projects/${id}`),
  create: (data) => post('/projects', data),
  update: (id, data) => put(`/projects/${id}`, data),
  delete: (id) => del(`/projects/${id}`),
}

//Tasks 
export const tasksApi = {
  getAll: (params = {}) => {
    const q = new URLSearchParams(params).toString()
    return get(`/tasks${q ? '?' + q : ''}`)
  },
  getById: (id) => get(`/tasks/${id}`),
  create: (data) => post('/tasks', data),
  update: (id, data) => put(`/tasks/${id}`, data),
  updateStatus: (id, status) => put(`/tasks/${id}/status`, { status }),
  delete: (id) => del(`/tasks/${id}`),
}

//Sprints 
export const sprintsApi = {
  getActive: () => get('/sprints/active'),
  getAll: () => get('/sprints'),
  getById: (id) => get(`/sprints/${id}`),
  create: (data) => post('/sprints', data),
  update: (id, data) => put(`/sprints/${id}`, data),
}

//KPIs
export const kpisApi = {
  getDashboard: () => get('/kpis/dashboard'),
  getByProject: (projectId) => get(`/kpis/project/${projectId}`),
  getBySprint: (sprintId) => get(`/kpis/sprint/${sprintId}`),
  getTeam: () => get('/kpis/team'),
}

//Reports 
export const reportsApi = {
  getSummary: (params) => {
    const q = new URLSearchParams(params).toString()
    return get(`/reports/summary${q ? '?' + q : ''}`)
  },
  getVelocity: () => get('/reports/velocity'),
  getBurndown: (sprintId) => get(`/reports/burndown/${sprintId}`),
}

//Users / Team
export const usersApi = {
  getAll: () => get('/users'),
  getById: (id) => get(`/users/${id}`),
  getMe: () => get('/users/me'),
}

export default { authApi, projectsApi, tasksApi, sprintsApi, kpisApi, reportsApi, usersApi }