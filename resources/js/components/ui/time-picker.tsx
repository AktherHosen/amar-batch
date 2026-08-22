import * as React from "react"
import { Clock, ChevronUp, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

function clamp(val: number, min: number, max: number) {
  return Math.max(min, Math.min(max, val))
}

function Spinner({
  value,
  onChange,
  min,
  max,
  label,
}: {
  value: number
  onChange: (v: number) => void
  min: number
  max: number
  label: string
}) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="size-7 p-0"
        onClick={() => onChange(clamp(value + 1, min, max))}
      >
        <ChevronUp className="size-3.5" />
      </Button>
      <span className="w-10 text-center text-sm font-medium tabular-nums">
        {String(value).padStart(2, "0")}
      </span>
      <span className="text-[10px] text-muted-foreground">{label}</span>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="size-7 p-0"
        onClick={() => onChange(clamp(value - 1, min, max))}
      >
        <ChevronDown className="size-3.5" />
      </Button>
    </div>
  )
}

type TimePickerProps = {
  value?: string
  onValueChange: (value: string) => void
  placeholder?: string
  className?: string
}

export function TimePicker({
  value,
  onValueChange,
  placeholder = "Pick time",
  className,
}: TimePickerProps) {
  const [open, setOpen] = React.useState(false)

  const parsed = React.useMemo(() => {
    if (!value) return { hour: 9, minute: 0 }
    const [h, m] = value.split(":").map(Number)
    return { hour: isNaN(h) ? 9 : h, minute: isNaN(m) ? 0 : m }
  }, [value])

  const [draft, setDraft] = React.useState(parsed)

  React.useEffect(() => {
    if (open) setDraft(parsed)
  }, [open, parsed])

  const display = value
    ? `${String(parsed.hour).padStart(2, "0")}:${String(parsed.minute).padStart(2, "0")}`
    : ""

  const applyTime = () => {
    onValueChange(`${String(draft.hour).padStart(2, "0")}:${String(draft.minute).padStart(2, "0")}`)
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className={cn(
            "h-9 w-full justify-start text-left font-normal",
            !value && "text-muted-foreground",
            className,
          )}
        >
          <Clock className="mr-2 size-4 shrink-0" />
          {display || placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-3" align="start" sideOffset={4}>
        <div className="flex items-center gap-3">
          <Spinner
            value={draft.hour}
            onChange={(h) => setDraft({ ...draft, hour: h })}
            min={0}
            max={23}
            label="HH"
          />
          <span className="text-lg font-bold text-muted-foreground">:</span>
          <Spinner
            value={draft.minute}
            onChange={(m) => setDraft({ ...draft, minute: m })}
            min={0}
            max={59}
            label="MM"
          />
        </div>
        <div className="mt-3 flex justify-end">
          <Button type="button" size="sm" onClick={applyTime}>
            OK
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
