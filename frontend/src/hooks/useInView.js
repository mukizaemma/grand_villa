import { useRef, useState, useCallback } from 'react'

/**
 * Returns a [ref, inView] tuple.
 * inView becomes true once the element enters the viewport
 * and stays true (fires only once — ideal for count-up animations).
 *
 * Uses a CALLBACK ref rather than a plain ref + effect. This matters:
 * a plain ref only gets read once, inside a useEffect that runs on
 * mount — if the observed element is behind a loading condition
 * (e.g. `{data && <div ref={sectionRef}>}`), it doesn't exist yet when
 * that effect runs, so the observer attaches to null and never
 * retries. A callback ref, by contrast, is invoked by React every
 * time the underlying DOM node actually changes — whether that's on
 * first render or after data finishes loading — so the observer
 * always attaches to a real element the moment one exists.
 *
 * @param {number|Object} thresholdOrOptions - How much of the element must be visible (0–1), or an options object.
 */
export function useInView(thresholdOrOptions = 0.3) {
  const threshold =
    typeof thresholdOrOptions === 'number'
      ? thresholdOrOptions
      : thresholdOrOptions?.threshold ?? 0.3

  const [inView, setInView] = useState(false)
  const observerRef = useRef(null)

  const ref = useCallback(
    (node) => {
      // Disconnect any previous observer before (re)attaching —
      // handles the element changing or unmounting.
      if (observerRef.current) {
        observerRef.current.disconnect()
        observerRef.current = null
      }

      if (!node) return // element was removed — nothing to observe

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setInView(true)
            observer.disconnect() // fire once, then stop observing
          }
        },
        { threshold }
      )

      observer.observe(node)
      observerRef.current = observer
    },
    [threshold]
  )

  return [ref, inView]
}