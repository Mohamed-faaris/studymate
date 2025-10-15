import { useLayoutEffect, useRef } from "react"

interface UseAutosizeTextAreaProps {
  ref: React.RefObject<HTMLTextAreaElement>
  maxHeight?: number
  minHeight?: number
  borderWidth?: number
  dependencies: React.DependencyList
}

export function useAutosizeTextArea({
  ref,
  maxHeight = Number.MAX_SAFE_INTEGER,
  minHeight,
  borderWidth = 0,
  dependencies,
}: UseAutosizeTextAreaProps) {
  const originalHeight = useRef<number | null>(null)

  useLayoutEffect(() => {
    if (!ref.current) return

    const currentRef = ref.current
    const borderAdjustment = borderWidth * 2

    if (originalHeight.current === null) {
      // Use minHeight if provided, otherwise use the current scrollHeight
      originalHeight.current = minHeight ? minHeight + borderAdjustment : currentRef.scrollHeight - borderAdjustment
    }

    currentRef.style.removeProperty("height")
    const scrollHeight = currentRef.scrollHeight

    // Make sure we don't go over maxHeight
    const clampedToMax = Math.min(scrollHeight, maxHeight)
    // Make sure we don't go less than the original height
    const clampedToMin = Math.max(clampedToMax, originalHeight.current)

    currentRef.style.height = `${clampedToMin + borderAdjustment}px`
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [maxHeight, minHeight, ref, ...dependencies])
}
