"use client"

import * as React from "react"
import { format, parse } from "date-fns"
import { CalendarIcon, X } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface DatePickerProps {
  value?: string               // YYYY-MM-DD string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  disabled?: boolean
  required?: boolean
  id?: string
  "aria-label"?: string
}

function DatePicker({
  value,
  onChange,
  placeholder = "Pick a date",
  className,
  disabled,
  ...props
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false)

  const dateValue = React.useMemo(() => {
    if (!value) return undefined
    try {
      return parse(value, "yyyy-MM-dd", new Date())
    } catch {
      return undefined
    }
  }, [value])

  const handleSelect = (date: Date | undefined) => {
    if (date) {
      onChange(format(date, "yyyy-MM-dd"))
    } else {
      onChange("")
    }
    setOpen(false)
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange("")
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          className={cn(
            "w-full justify-start text-left font-normal h-10 px-3",
            "border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800",
            "hover:bg-gray-50 dark:hover:bg-slate-700",
            "focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500",
            !value && "text-muted-foreground",
            className
          )}
          {...props}
        >
          <CalendarIcon className="mr-2 h-4 w-4 text-gray-400 shrink-0" />
          {dateValue ? (
            <span className="text-sm text-gray-900 dark:text-white truncate">
              {format(dateValue, "MMM dd, yyyy")}
            </span>
          ) : (
            <span className="text-sm text-gray-400">{placeholder}</span>
          )}
          {value && (
            <X
              className="ml-auto h-3.5 w-3.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 shrink-0 cursor-pointer"
              onClick={handleClear}
            />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={dateValue}
          onSelect={handleSelect}
          defaultMonth={dateValue}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  )
}

export { DatePicker }
