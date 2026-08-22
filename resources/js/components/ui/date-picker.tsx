import * as React from "react"
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay, isBefore, isAfter, addMonths, isToday } from "date-fns"
import { ChevronLeft, ChevronRight, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"]
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

function YearGrid({ year, onSelect }: { year: number; onSelect: (y: number) => void }) {
  const start = year - 6
  const years = Array.from({ length: 12 }, (_, i) => start + i)

  return (
    <div className="w-64 p-3">
      <div className="grid grid-cols-3 gap-1">
        {years.map((y) => (
          <button
            key={y}
            type="button"
            onClick={() => onSelect(y)}
            className={cn(
              "h-8 rounded-md text-sm transition-colors",
              y === year && "bg-primary text-primary-foreground font-medium",
              y !== year && "hover:bg-accent hover:text-accent-foreground"
            )}
          >
            {y}
          </button>
        ))}
      </div>
    </div>
  )
}

function MonthGrid({ month, onSelect }: { month: number; onSelect: (m: number) => void }) {
  return (
    <div className="w-64 p-3">
      <div className="grid grid-cols-3 gap-1">
        {MONTHS.map((m, i) => (
          <button
            key={m}
            type="button"
            onClick={() => onSelect(i)}
            className={cn(
              "h-8 rounded-md text-sm transition-colors",
              i === month && "bg-primary text-primary-foreground font-medium",
              i !== month && "hover:bg-accent hover:text-accent-foreground"
            )}
          >
            {m}
          </button>
        ))}
      </div>
    </div>
  )
}

function CompactCalendar({
  selected,
  onSelect,
  min,
  max,
}: {
  selected?: Date
  onSelect: (date: Date) => void
  min?: Date
  max?: Date
}) {
  const [viewMonth, setViewMonth] = React.useState(
    selected ? new Date(selected.getFullYear(), selected.getMonth(), 1) : startOfMonth(new Date())
  )
  const [openPicker, setOpenPicker] = React.useState<"year" | "month" | null>(null)
  const today = new Date()
  const monthStart = startOfMonth(viewMonth)
  const monthEnd = endOfMonth(viewMonth)
  const gridStart = startOfWeek(monthStart)
  const gridEnd = endOfWeek(monthEnd)

  const days: Date[] = []
  let cursor = gridStart
  while (cursor <= gridEnd) {
    days.push(cursor)
    cursor = addDays(cursor, 1)
  }

  const currentYear = viewMonth.getFullYear()
  const currentMonth = viewMonth.getMonth()

  if (openPicker === "year") {
    return (
      <div className="w-64 p-3">
        <div className="mb-2 flex items-center justify-between">
          <Button type="button" variant="ghost" size="sm" className="size-7 p-0" onClick={() => setOpenPicker(null)}>
            <ChevronLeft className="size-4" />
          </Button>
          <span className="text-sm font-medium">{currentYear - 6} – {currentYear + 5}</span>
          <div className="size-7" />
        </div>
        <YearGrid
          year={currentYear}
          onSelect={(y) => {
            setViewMonth(new Date(y, currentMonth, 1))
            setOpenPicker(null)
          }}
        />
      </div>
    )
  }

  if (openPicker === "month") {
    return (
      <div className="w-64 p-3">
        <div className="mb-2 flex items-center justify-between">
          <Button type="button" variant="ghost" size="sm" className="size-7 p-0" onClick={() => setOpenPicker(null)}>
            <ChevronLeft className="size-4" />
          </Button>
          <span className="text-sm font-medium">{currentYear}</span>
          <div className="size-7" />
        </div>
        <MonthGrid
          month={currentMonth}
          onSelect={(m) => {
            setViewMonth(new Date(currentYear, m, 1))
            setOpenPicker(null)
          }}
        />
      </div>
    )
  }

  return (
    <div className="w-64 p-3">
      <div className="mb-2 flex items-center justify-between">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="size-7 touch-manipulation p-0"
          onClick={() => setViewMonth(addMonths(viewMonth, -1))}
        >
          <ChevronLeft className="size-4" />
        </Button>
        <div className="flex items-center gap-1">
          <button
            type="button"
            className="rounded-md px-1.5 py-0.5 text-sm font-medium capitalize hover:bg-accent"
            onClick={() => setOpenPicker("month")}
          >
            {format(viewMonth, "MMMM")}
          </button>
          <button
            type="button"
            className="rounded-md px-1.5 py-0.5 text-sm font-medium hover:bg-accent"
            onClick={() => setOpenPicker("year")}
          >
            {format(viewMonth, "yyyy")}
          </button>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="size-7 touch-manipulation p-0"
          onClick={() => setViewMonth(addMonths(viewMonth, 1))}
        >
          <ChevronRight className="size-4" />
        </Button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center">
        {WEEKDAYS.map((day) => (
          <div
            key={day}
            className="text-xs font-medium text-muted-foreground"
          >
            {day}
          </div>
        ))}
        {days.map((day) => {
          const isSelected = selected ? isSameDay(day, selected) : false
          const isOutside = !isSameMonth(day, viewMonth)
          const isDisabled =
            isBefore(day, new Date(1900, 0, 1)) ||
            isAfter(day, new Date(2100, 11, 31)) ||
            (min && isBefore(day, min) && !isSameDay(day, min)) ||
            (max && isAfter(day, max) && !isSameDay(day, max))
          return (
            <button
              key={day.toISOString()}
              type="button"
              onClick={() => onSelect(day)}
              disabled={isDisabled}
              className={cn(
                "flex h-8 w-8 touch-manipulation items-center justify-center rounded-md text-sm font-normal transition-colors",
                isToday(day) && !isSelected && "bg-accent text-accent-foreground",
                isSelected && "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
                isOutside && "text-muted-foreground opacity-50",
                !isSelected && !isToday(day) && "hover:bg-accent hover:text-accent-foreground",
                isDisabled && "text-muted-foreground opacity-30 cursor-not-allowed hover:bg-transparent"
              )}
            >
              {format(day, "d")}
            </button>
          )
        })}
      </div>
    </div>
  )
}

type DatePickerProps = {
  value?: string | null
  onValueChange: (value: string) => void
  placeholder?: string
  className?: string
  min?: string
  max?: string
}

export function DatePicker({
  value,
  onValueChange,
  placeholder = "Pick a date",
  className,
  min,
  max,
}: DatePickerProps) {
  const selected = value ? new Date(value + "T00:00:00") : undefined
  const minDate = min ? new Date(min + "T00:00:00") : undefined
  const maxDate = max ? new Date(max + "T00:00:00") : undefined

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className={cn(
            "h-9 w-full justify-start text-left font-normal",
            !value && "text-muted-foreground",
            className
          )}
        >
          {value ? format(selected!, "dd MMM yyyy") : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start" sideOffset={4}>
        <CompactCalendar
          selected={selected}
          onSelect={(date) => onValueChange(format(date, "yyyy-MM-dd"))}
          min={minDate}
          max={maxDate}
        />
      </PopoverContent>
    </Popover>
  )
}