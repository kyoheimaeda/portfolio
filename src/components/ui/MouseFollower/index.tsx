"use client"

import { frame, motion, useMotionValue } from "motion/react"
import { RefObject, useEffect, useRef, useState } from "react"

export default function MouseFollower() {
  const ref = useRef<HTMLDivElement>(null)
  const { x, y } = useFollowPointer(ref)

  const [isTextHover, setIsTextHover] = useState(false)
  const [isLinkHover, setIsLinkHover] = useState(false)
  const [fontSize, setFontSize] = useState(16)

  useEffect(() => {
    const interactiveTags = ["a", "button"] // リンク判定に追加したいタグ一覧

    const handlePointerMove = (e: PointerEvent) => {
      const target = e.target as HTMLElement | null
      if (!target) return

      // 配列内のいずれかのタグを closest で持つかチェック
      const isInteractive = interactiveTags.some(tag => target.closest(tag))

      if (isInteractive) {
        setIsLinkHover(true)
        setIsTextHover(false)
        return
      }

      // テキスト要素判定
      const textTags = ["P", "H1", "H2", "H3", "H4", "H5", "H6", "LABEL", "LI", "TD", "TH", "STRONG"]
      if (textTags.includes(target.tagName)) {
        const style = window.getComputedStyle(target)
        const fs = parseFloat(style.fontSize) || 16
        setFontSize(fs)
        setIsTextHover(true)
        setIsLinkHover(false)
      } else {
        setIsTextHover(false)
        setIsLinkHover(false)
      }
    }

    window.addEventListener("pointermove", handlePointerMove)
    return () => window.removeEventListener("pointermove", handlePointerMove)
  }, [])

  if (typeof window !== "undefined" && window.matchMedia("(max-width: 768px)").matches) {
    return null
  }

  // 状態に応じてスタイルを切り替え
  const style = isLinkHover
    ? ball
    : isTextHover
    ? line(fontSize)
    : dot

  return <motion.div ref={ref} style={{ ...style, x, y }} />
}

export function useFollowPointer(ref: RefObject<HTMLDivElement | null>) {
  const x = useMotionValue(0)
  const y = useMotionValue(0)

  useEffect(() => {
    if (!ref.current) return

    const handlePointerMove = ({ clientX, clientY }: MouseEvent) => {
      const element = ref.current
      if (!element) return

      frame.read(() => {
        x.set(clientX - element.offsetLeft - element.offsetWidth / 2)
        y.set(clientY - element.offsetTop - element.offsetHeight / 2)
      })
    }

    window.addEventListener("pointermove", handlePointerMove)
    return () => window.removeEventListener("pointermove", handlePointerMove)
  }, [ref, x, y]) // x と y を依存配列に追加

  return { x, y }
}

/**
 * ==============   Styles   ================
 */

const baseStyle = {
  position: "fixed" as const,
  pointerEvents: "none" as const,
  zIndex: 9999,
  mixBlendMode: "difference" as const,
  backgroundColor: "var(--color-white)",
  transition: "all 0.2s ease",
}

const dot = {
  ...baseStyle,
  width: 20,
  height: 20,
  borderRadius: "50%",
}

const ball = {
  ...baseStyle,
  width: 100,
  height: 100,
  borderRadius: "50%",
}

const line = (fontSize: number) => ({
  ...baseStyle,
  width: fontSize / 5,
  height: fontSize * 1.2,
  borderRadius: "0",
})