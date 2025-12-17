import * as React from "react";

type Options = {
  delay?: number;          // ms to trigger long press
  moveThreshold?: number;  // px threshold to cancel when moving
};

export function useLongPress<T extends HTMLElement = HTMLElement>(
  onLongPress: (ev: PointerEvent) => void,
  { delay = 400, moveThreshold = 8 }: Options = {}
) {
  const timerRef = React.useRef<number | null>(null);
  const startPosRef = React.useRef<{ x: number; y: number } | null>(null);
  const targetRef = React.useRef<T | null>(null);

  const clearTimer = React.useCallback(() => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const onPointerDown = React.useCallback((ev: React.PointerEvent<T>) => {
    // Chỉ track chuột trái hoặc cảm ứng/pen
    if (ev.button !== 0 && ev.pointerType === "mouse") return;
    targetRef.current = ev.currentTarget;
    startPosRef.current = { x: ev.clientX, y: ev.clientY };
    clearTimer();
    // Đặt capture để nhận pointerup kể cả khi trượt ra ngoài
    ev.currentTarget.setPointerCapture(ev.pointerId);

    timerRef.current = window.setTimeout(() => {
      // ts-expect-error: we pass native event for consumer convenience
      onLongPress(ev.nativeEvent as PointerEvent);
      clearTimer();
    }, delay);
  }, [delay, onLongPress, clearTimer]);

  const onPointerMove = React.useCallback((ev: React.PointerEvent<T>) => {
    if (!startPosRef.current) return;
    const dx = Math.abs(ev.clientX - startPosRef.current.x);
    const dy = Math.abs(ev.clientY - startPosRef.current.y);
    if (dx > moveThreshold || dy > moveThreshold) {
      clearTimer();
    }
  }, [moveThreshold, clearTimer]);

  const onPointerUp = React.useCallback((ev: React.PointerEvent<T>) => {
    clearTimer();
    try {
      ev.currentTarget.releasePointerCapture(ev.pointerId);
    } catch {}
    startPosRef.current = null;
  }, [clearTimer]);

  const onPointerLeave = React.useCallback(() => {
    clearTimer();
    startPosRef.current = null;
  }, [clearTimer]);

  return {
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onPointerLeave,
  };
}