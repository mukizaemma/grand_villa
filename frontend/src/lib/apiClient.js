/**
 * API CLIENT
 * ─────────────────────────────────────────────────────────────
 * Single Axios instance for all Payload CMS requests. Any failed
 * request (network down, 4xx/5xx) surfaces a toast automatically —
 * individual hooks don't need to handle that themselves.
 * ─────────────────────────────────────────────────────────────
 */
import axios from 'axios'
import { toast } from 'sonner'

export const CMS_URL = import.meta.env.VITE_CMS_URL || 'http://localhost:3000'

export const apiClient = axios.create({
  baseURL: CMS_URL,
  timeout: 10000,
})

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    toast.error('Could not reach the CMS — some content may be out of date.')
    return Promise.reject(error)
  }
)
