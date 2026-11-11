/**
 * Lets the site-wide stay bar advance the /book steps. That bar lives
 * outside BookingProvider, so the booking page publishes the current
 * step and whether Continue is allowed.
 */
import { useSyncExternalStore } from 'react'

const idle = {
  active: false,
  step: 1,
  canContinue: false,
  continue() {},
}

let chrome = idle
const listeners = new Set()

function emit() {
  listeners.forEach((listener) => listener())
}

export function setBookingChrome(next) {
  chrome = next
  emit()
}

export function clearBookingChrome() {
  chrome = idle
  emit()
}

export function subscribeBookingChrome(listener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function getBookingChrome() {
  return chrome
}

export function useBookingChrome() {
  return useSyncExternalStore(subscribeBookingChrome, getBookingChrome, getBookingChrome)
}
