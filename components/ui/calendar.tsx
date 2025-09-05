"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-6", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "flex justify-center pt-1 relative items-center",
        caption_label: "text-lg font-semibold text-gray-900 dark:text-white",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-10 w-10 bg-transparent p-0 opacity-50 hover:opacity-100 rounded-2xl"
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-y-1",
        head_row: "flex",
        head_cell:
          "text-gray-600 dark:text-gray-400 rounded-2xl w-12 font-medium text-sm",
        row: "flex w-full mt-2",
        cell: "h-12 w-12 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-2xl [&:has([aria-selected].day-outside)]:bg-gray-100/50 dark:[&:has([aria-selected].day-outside)]:bg-gray-800/50 [&:has([aria-selected])]:bg-blue-50 dark:[&:has([aria-selected])]:bg-blue-900/20 first:[&:has([aria-selected])]:rounded-l-2xl last:[&:has([aria-selected])]:rounded-r-2xl focus-within:relative focus-within:z-20",
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-12 w-12 p-0 font-normal aria-selected:opacity-100 rounded-2xl hover:bg-gray-100/50 dark:hover:bg-gray-800/50 transition-all duration-200"
        ),
        day_range_end: "day-range-end",
        day_selected:
          "bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 text-white hover:from-blue-600 hover:via-indigo-600 hover:to-purple-700 focus:from-blue-600 focus:via-indigo-600 focus:to-purple-700 shadow-lg",
        day_today: "bg-blue-100/50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-semibold border-2 border-blue-300 dark:border-blue-600",
        day_outside:
          "day-outside text-gray-400 dark:text-gray-500 aria-selected:bg-gray-100/50 dark:aria-selected:bg-gray-800/50 aria-selected:text-gray-400 dark:aria-selected:text-gray-500",
        day_disabled: "text-gray-400 dark:text-gray-500 opacity-50",
        day_range_middle:
          "aria-selected:bg-blue-50/50 dark:aria-selected:bg-blue-900/20 aria-selected:text-blue-700 dark:aria-selected:text-blue-300",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ ...props }) => <ChevronLeft className="h-5 w-5" />,
        IconRight: ({ ...props }) => <ChevronRight className="h-5 w-5" />,
      }}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }
