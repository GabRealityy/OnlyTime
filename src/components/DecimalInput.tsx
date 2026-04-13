import { useState } from 'react'

type Props = {
  value: number
  onChange: (next: number) => void
  placeholder?: string
  className?: string
}

function format(value: number): string {
  return value === 0 ? '' : String(value)
}

export function DecimalInput({ value, onChange, placeholder, className }: Props) {
  const [raw, setRaw] = useState(() => format(value))
  const [lastValue, setLastValue] = useState(value)

  if (value !== lastValue) {
    setLastValue(value)
    const parsed = Number(raw.replace(',', '.'))
    if (!Number.isFinite(parsed) || parsed !== value) {
      setRaw(format(value))
    }
  }

  return (
    <input
      inputMode="decimal"
      placeholder={placeholder}
      className={className}
      value={raw}
      onChange={(e) => {
        const next = e.target.value
        setRaw(next)
        if (next === '') {
          setLastValue(0)
          onChange(0)
          return
        }
        const parsed = Number(next.replace(',', '.'))
        if (Number.isFinite(parsed)) {
          setLastValue(parsed)
          onChange(parsed)
        }
      }}
    />
  )
}
