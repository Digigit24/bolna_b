/**
 * All API endpoint functions.
 * Views → api/endpoints → api/client → Django backend
 */
import client from './client'

// ----- Auth -----
export const login = (data: { username: string; password: string }) =>
  client.post('/users/login/', data)

export const register = (data: Record<string, string>) =>
  client.post('/users/register/', data)

export const getProfile = () =>
  client.get('/users/profile/')

// ----- Jobs -----
export const getJobs = (params?: Record<string, string>) =>
  client.get('/jobs/', { params })

export const getJob = (id: string) =>
  client.get(`/jobs/${id}/`)

export const createJob = (data: Record<string, unknown>) =>
  client.post('/jobs/', data)

export const updateJob = (id: string, data: Record<string, unknown>) =>
  client.put(`/jobs/${id}/`, data)

export const deleteJob = (id: string) =>
  client.delete(`/jobs/${id}/`)

// ----- Candidates -----
export const getCandidates = (params?: Record<string, string>) =>
  client.get('/candidates/', { params })

export const getCandidate = (id: string) =>
  client.get(`/candidates/${id}/`)

export const createCandidate = (data: Record<string, unknown>) =>
  client.post('/candidates/', data)

export const updateCandidate = (id: string, data: Record<string, unknown>) =>
  client.put(`/candidates/${id}/`, data)

export const deleteCandidate = (id: string) =>
  client.delete(`/candidates/${id}/`)

// ----- Calls -----
export const getCalls = (params?: Record<string, string>) =>
  client.get('/calls/', { params })

export const getCall = (id: string) =>
  client.get(`/calls/${id}/`)

export const startCall = (data: { candidate_id: string; agent_config?: Record<string, unknown> }) =>
  client.post('/calls/start/', data)

export const getCallTranscript = (id: string) =>
  client.get(`/calls/${id}/transcript/`)

// ----- Interviews -----
export const getInterviews = (params?: Record<string, string>) =>
  client.get('/interviews/', { params })

export const createInterview = (data: Record<string, unknown>) =>
  client.post('/interviews/', data)

export const updateInterview = (id: string, data: Record<string, unknown>) =>
  client.put(`/interviews/${id}/`, data)

// ----- Analytics -----
export const getDashboard = () =>
  client.get('/analytics/dashboard/')

export const getCallAnalytics = (days?: number) =>
  client.get('/analytics/calls/', { params: { days } })
