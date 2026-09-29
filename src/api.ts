import type { SubmissionRequest } from './data/types'

const API_PATH = '/api/esra/personal'
const HOST = (import.meta.env.VITE_API_HOST ?? '').replace(/\/+$/, '')

export const SUBMIT_URL = `${HOST}${API_PATH}`

export type SubmitResult =
  | { ok: true; reportId: string; message: string }
  | { ok: false; message: string; errors: string[] }

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function readString(value: unknown): string | null {
  return typeof value === 'string' && value.trim() !== '' ? value : null
}

function readErrors(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value.filter((item): item is string => typeof item === 'string')
}

function parseBody(body: Record<string, unknown>): SubmitResult {
  if (body.status === true) {
    const data = isRecord(body.data) ? body.data : {}
    return {
      ok: true,
      reportId: readString(data.report_id) ?? '',
      message: readString(data.message) ?? 'Report submitted successfully.',
    }
  }

  const error = isRecord(body.error) ? body.error : {}
  return {
    ok: false,
    message: readString(error.message) ?? 'The report could not be submitted.',
    errors: readErrors(error.errors),
  }
}

export async function submitReport(payload: SubmissionRequest): Promise<SubmitResult> {
  if (!HOST) {
    return { ok: false, message: 'VITE_API_HOST is not set.', errors: [] }
  }

  let response: Response
  try {
    response = await fetch(SUBMIT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(payload),
    })
  } catch {
    return { ok: false, message: 'Could not reach the server.', errors: [] }
  }

  let body: unknown
  try {
    body = await response.json()
  } catch {
    body = null
  }

  if (isRecord(body) && typeof body.status === 'boolean') return parseBody(body)

  return { ok: false, message: `The server responded with ${response.status}.`, errors: [] }
}
