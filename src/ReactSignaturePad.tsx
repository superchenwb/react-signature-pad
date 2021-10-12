import React, { useRef, useEffect, useCallback } from 'react'
import SignaturePad, { Options } from 'signature_pad'

export interface ILuckysheetProps extends Options {
  className?: string
  style?: React.CSSProperties
  defaultValue?: string
  width?: number
  height?: number
  type?: string
  onChange?: (data: any, event: MouseEvent | Touch) => void
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
  const canvas = useRef<HTMLCanvasElement>(null)
  const sigPad = useRef<SignaturePad>(null)
  const dataProps = pickDataProps(props)
  const resizeCanvas = useCallback(() => {
    const ratio = Math.max(window.devicePixelRatio || 1, 1)
    if (canvas.current) {
      canvas.current.width = canvas.current.offsetWidth * ratio
      canvas.current.height = canvas.current.offsetHeight * ratio
      canvas.current.getContext('2d').scale(ratio, ratio)
    }

    sigPad.current?.clear() // otherwise isEmpty() might return incorrect value
  }, [canvas.current, sigPad.current])
  useEffect(() => {
    if (canvas.current) {
      sigPad.current = new SignaturePad(canvas.current, props)
      if (defaultValue) {
        sigPad.current.fromDataURL(defaultValue)
      }
      if (onChange) {
        sigPad.current.onEnd = (event: MouseEvent | Touch) => {
          onChange(sigPad.current.toDataURL(type), event)
        }
      }
      window.addEventListener('resize', resizeCanvas)
    }

    return () => {
      window.removeEventListener('resize', resizeCanvas)
    }
  }, [type, props, resizeCanvas])

  useEffect(() => {
    resizeCanvas()
  }, [width, height])

  return (
    <div
      className={className ? `${className} go-signature-pad` : 'go-signature-pad'}
      style={{ display: 'inline-block', ...style }}
      {...dataProps}
    >
      <canvas ref={canvas} width={width} height={height} />
    </div>
  )
}
