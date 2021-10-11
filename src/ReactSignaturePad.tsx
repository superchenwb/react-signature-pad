import React, { useRef, useEffect, useCallback } from 'react'
import SignaturePad, { Options } from 'signature_pad'

export interface ILuckysheetProps extends Options {
  className?: string
  style?: React.CSSProperties
  defaultValue?: string
  width?: number
  height?: number
  type?: string
  onChange?: (data: any, event: MouseEvent) => void
}

const pickDataProps = (props: any = {}) => {
  return Object.keys(props).reduce((buf, key) => {
    if (key.includes('data-')) {
      buf[key] = props[key]
    }
    return buf
  }, {})
}

export const ReactSignaturePad = ({
  className,
  style,
  width = 100,
  height = 50,
  defaultValue,
  type,
  onChange,
  ...props
}: ILuckysheetProps) => {
  const canvas = useRef<HTMLCanvasElement>()
  const sigPad = useRef<any>(null)
  const dataProps = pickDataProps(props)
  const resizeCanvas = useCallback(() => {
    const ratio = Math.max(window.devicePixelRatio || 1, 1)
    canvas.current.width = canvas.current.offsetWidth * ratio
    canvas.current.height = canvas.current.offsetHeight * ratio
    canvas.current.getContext('2d').scale(ratio, ratio)
    sigPad.current.clear() // otherwise isEmpty() might return incorrect value
  }, [])
  useEffect(() => {
    sigPad.current = new SignaturePad(canvas.current, props)
    if (defaultValue) {
      sigPad.current.fromDataURL(defaultValue)
    }
    sigPad.current.on()
    if (onChange) {
      sigPad.current.onEnd((event) => onChange(sigPad.current.toDataURL(type), event))
    }
    window.addEventListener('resize', resizeCanvas)
    return () => {
      sigPad.current.off()
      window.removeEventListener('resize', resizeCanvas)
    }
  }, [type, props, resizeCanvas])

  useEffect(() => {
    resizeCanvas()
  }, [width, height])

  return (
    <div
      className={className ? `${className} go-signature-pad` : 'go-signature-pad'}
      style={{ height: '100%', ...style }}
      {...dataProps}
    >
      <canvas ref={canvas} width={width} height={height} />
    </div>
  )
}
