"use client"

import * as React from "react";
import {
    Clock,
    CalendarCheck,
    CalendarClock,
    CalendarCog,
    ChevronLeftIcon,
    ChevronRightIcon,
    ChevronDownIcon,
} from "lucide-react";
import {
    DayPicker,
    getDefaultClassNames,
    useDayPicker,
    type DayButton,
} from "react-day-picker"

import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "../ui/button";
import { format } from "date-fns";
import { TimePickerInput } from "./time-picker-input";

export type DateTimePickerProps = Omit<
    React.ComponentProps<typeof DayPicker>,
    "mode" | "onSelect" | "required" | "selected"
> & {
    selected?: Date,
    setDate: (date: Date) => void;
} & {
  buttonVariant?: React.ComponentProps<typeof Button>["variant"]
};

function DateTimePicker({
    className,
    classNames,
    showOutsideDays = true,
    captionLayout = "label",
    buttonVariant = "ghost",
    formatters,
    components,
    setDate: setGlobalDate,
    ...props
}: DateTimePickerProps) {
    const minuteRef = React.useRef<HTMLInputElement>(null);
    const hourRef = React.useRef<HTMLInputElement>(null);

    const defaultClassNames = getDefaultClassNames()
    const { selected: selectedDate } = props as { selected: Date};
    const setDate = (dateInput: Date) => {
        const date = new Date(selectedDate);
        date.setDate(dateInput.getDate());
        date.setMonth(dateInput.getMonth());
        date.setFullYear(dateInput.getFullYear());
        setGlobalDate(date);
    };

    const setTime = (dateInput: Date | undefined) => {
        if (!dateInput) return;
        const time = new Date(selectedDate);
        time.setHours(dateInput.getHours());
        time.setMinutes(dateInput.getMinutes());
        setGlobalDate(time);
    };

    return (
        <>
            <DayPicker
                {...props}
                mode="single"
                selected={selectedDate}
                onSelect={setDate as any}
                showOutsideDays={showOutsideDays}
                className={cn(
                        "group/calendar bg-background p-3 [--cell-size:--spacing(8)] [[data-slot=card-content]_&]:bg-transparent [[data-slot=popover-content]_&]:bg-transparent",
                        String.raw`rtl:**:[.rdp-button\_next>svg]:rotate-180`,
                        String.raw`rtl:**:[.rdp-button\_previous>svg]:rotate-180`,
                        className
                      )}
                      captionLayout={captionLayout}
                      formatters={{
                        formatMonthDropdown: (date) =>
                          date.toLocaleString("default", { month: "short" }),
                        ...formatters,
                      }}
                classNames={{
                    root: cn("w-fit", defaultClassNames.root),
                    months: cn(
                              "relative flex flex-col gap-4 md:flex-row",
                              defaultClassNames.months
                            ),
                    month: cn("flex w-full flex-col gap-4", defaultClassNames.month),
                    nav: cn(
                        "absolute inset-x-0 top-0 flex w-full items-center justify-between gap-1",
                        defaultClassNames.nav
                    ),
                    button_previous: cn(
                        buttonVariants({ variant: buttonVariant }),
                        "size-(--cell-size) p-0 select-none aria-disabled:opacity-50",
                        defaultClassNames.button_previous
                    ),
                    button_next: cn(
                        buttonVariants({ variant: buttonVariant }),
                        "size-(--cell-size) p-0 select-none aria-disabled:opacity-50",
                        defaultClassNames.button_next
                    ),
                    month_caption: cn(
                        "flex h-(--cell-size) w-full items-center justify-center px-(--cell-size)",
                        defaultClassNames.month_caption
                    ),
                    dropdowns: cn(
                        "flex h-(--cell-size) w-full items-center justify-center gap-1.5 text-sm font-medium",
                        defaultClassNames.dropdowns
                    ),
                    dropdown_root: cn(
                        "relative rounded-md border border-input shadow-xs has-focus:border-ring has-focus:ring-[3px] has-focus:ring-ring/50",
                        defaultClassNames.dropdown_root
                    ),
                    dropdown: cn(
                        "absolute inset-0 bg-popover opacity-0",
                        defaultClassNames.dropdown
                    ),
                    caption_label: cn(
                        "font-medium select-none",
                        captionLayout === "label"
                        ? "text-sm"
                        : "flex h-8 items-center gap-1 rounded-md pr-1 pl-2 text-sm [&>svg]:size-3.5 [&>svg]:text-muted-foreground",
                        defaultClassNames.caption_label
                    ),
                    table: "w-full border-collapse",
                    weekdays: cn("flex", defaultClassNames.weekdays),
                    weekday: cn(
                        "flex-1 rounded-md text-[0.8rem] font-normal text-muted-foreground select-none",
                        defaultClassNames.weekday
                    ),
                    week: cn("mt-2 flex w-full", defaultClassNames.week),
                    week_number_header: cn(
                        "w-(--cell-size) select-none",
                        defaultClassNames.week_number_header
                    ),
                    week_number: cn(
                        "text-[0.8rem] text-muted-foreground select-none",
                        defaultClassNames.week_number
                    ),
                    day: cn(
                        "group/day relative aspect-square h-full w-full p-0 text-center select-none [&:last-child[data-selected=true]_button]:rounded-r-md",
                        props.showWeekNumber
                        ? "[&:nth-child(2)[data-selected=true]_button]:rounded-l-md"
                        : "[&:first-child[data-selected=true]_button]:rounded-l-md",
                        defaultClassNames.day
                    ),
                    range_start: cn(
                        "rounded-l-md bg-accent",
                        defaultClassNames.range_start
                    ),
                    range_middle: cn("rounded-none", defaultClassNames.range_middle),
                    range_end: cn("rounded-r-md bg-accent", defaultClassNames.range_end),
                    today: cn(
                        "rounded-md bg-accent text-accent-foreground data-[selected=true]:rounded-none",
                        defaultClassNames.today
                    ),
                    outside: cn(
                        "text-muted-foreground aria-selected:text-muted-foreground",
                        defaultClassNames.outside
                    ),
                    disabled: cn(
                        "text-muted-foreground opacity-50",
                        defaultClassNames.disabled
                    ),
                    hidden: cn("invisible", defaultClassNames.hidden),
                    ...classNames,
                }}
                components={{
                    Root: ({ className, rootRef, ...props }) => {
                              return (
                                <div
                                  data-slot="calendar"
                                  ref={rootRef}
                                  className={cn(className)}
                                  {...props}
                                />
                              )
                    },
                    Footer: () => {
                        const { goToMonth } = useDayPicker();
                        return (
                            <div>
                                <hr className="mt-2" />
                                <div className="mt-2 -ml-2 -mr-2">
                                <div>
                                    <Button
                                    variant="ghost"
                                    className="w-full justify-between text-gray-700"
                                    onClick={() => {
                                        const chosenDate = new Date();
                                        goToMonth(chosenDate);
                                        setDate(chosenDate);
                                    }}
                                    >
                                    <div className="flex">
                                        <CalendarCheck className="h-5 w-5 mr-2" />
                                        Today
                                    </div>
                                    <p className="text-sm text-gray-400 font-normal">
                                        {format(new Date(), "PPP")}
                                    </p>
                                    </Button>
                                </div>
                                <div>
                                    <Button
                                    variant="ghost"
                                    className="w-full justify-between text-gray-700"
                                    onClick={() => {
                                        const chosenDate = new Date();
                                        chosenDate.setDate(chosenDate.getDate() + 1);
                                        goToMonth(chosenDate);
                                        setDate(chosenDate);
                                    }}
                                    >
                                    <div className="flex">
                                        <CalendarCog className="h-5 w-5 mr-2" />
                                        Tomorrow
                                    </div>
                                    <p className="text-sm text-gray-400 font-normal">
                                        {format(
                                        new Date(new Date().getTime() + 24 * 60 * 60 * 1000),
                                        "PPP"
                                        )}
                                    </p>
                                    </Button>
                                </div>
                                <div>
                                    <div>
                                    <Button
                                        variant="ghost"
                                        className="w-full justify-between text-gray-700"
                                        onClick={() => {
                                        const chosenDate = new Date();
                                        chosenDate.setDate(chosenDate.getDate() + 7);
                                        goToMonth(chosenDate);
                                        setDate(chosenDate);
                                        }}
                                    >
                                        <div className="flex">
                                        <CalendarClock className="h-5 w-5 mr-2" />
                                        Next week
                                        </div>
                                        <p className="text-sm text-gray-400 font-normal">
                                        {format(
                                            new Date(
                                            new Date().getTime() + 7 * 24 * 60 * 60 * 1000
                                            ),
                                            "PPP"
                                        )}
                                        </p>
                                    </Button>
                                    </div>
                                </div>
                                </div>
                            </div>
                        );
                    },
                    Chevron: ({ className, orientation, ...props }) => {
                        if (orientation === "left") {
                            return (
                            <ChevronLeftIcon className={cn("size-4", className)} {...props} />
                            )
                        }

                        if (orientation === "right") {
                            return (
                            <ChevronRightIcon
                                className={cn("size-4", className)}
                                {...props}
                            />
                            )
                        }

                        return (
                            <ChevronDownIcon className={cn("size-4", className)} {...props} />
                        )
                    },
                    DayButton: CalendarDayButton,
                    WeekNumber: ({ children, ...props }) => {
                        return (
                        <td {...props}>
                            <div className="flex size-(--cell-size) items-center justify-center text-center">
                            {children}
                            </div>
                        </td>
                        )
                    },
                    ...components,
                }}
            />
            <hr className="my-0" />
            <div className="px-2 mt-4 flex justify-between">
                <div className="flex gap-2 items-center text-gray-700">
                    <Clock className="h-5 w-5" />
                    <p className="text-sm font-medium">Time</p>
                </div>
                <div className="font-medium">
                    <div className="flex items-center gap-2">
                        <TimePickerInput
                        picker="hours"
                        date={selectedDate}
                        setDate={setTime}
                        ref={hourRef}
                        onRightFocus={() => minuteRef.current?.focus()}
                        />
                        <span>:</span>
                        <TimePickerInput
                        picker="minutes"
                        date={selectedDate}
                        setDate={setTime}
                        ref={minuteRef}
                        onLeftFocus={() => hourRef.current?.focus()}
                        />
                    </div>
                </div>
            </div>
        </>
    );
}

function CalendarDayButton({
  className,
  day,
  modifiers,
  ...props
}: React.ComponentProps<typeof DayButton>) {
  const defaultClassNames = getDefaultClassNames()

  const ref = React.useRef<HTMLButtonElement>(null)
  React.useEffect(() => {
    if (modifiers.focused) ref.current?.focus()
  }, [modifiers.focused])

  return (
    <Button
      ref={ref}
      variant="ghost"
      size="icon"
      data-day={day.date.toLocaleDateString()}
      data-selected-single={
        modifiers.selected &&
        !modifiers.range_start &&
        !modifiers.range_end &&
        !modifiers.range_middle
      }
      data-range-start={modifiers.range_start}
      data-range-end={modifiers.range_end}
      data-range-middle={modifiers.range_middle}
      className={cn(
        "flex aspect-square size-auto w-full min-w-(--cell-size) flex-col gap-1 leading-none font-normal group-data-[focused=true]/day:relative group-data-[focused=true]/day:z-10 group-data-[focused=true]/day:border-ring group-data-[focused=true]/day:ring-[3px] group-data-[focused=true]/day:ring-ring/50 data-[range-end=true]:rounded-md data-[range-end=true]:rounded-r-md data-[range-end=true]:bg-primary data-[range-end=true]:text-primary-foreground data-[range-middle=true]:rounded-none data-[range-middle=true]:bg-accent data-[range-middle=true]:text-accent-foreground data-[range-start=true]:rounded-md data-[range-start=true]:rounded-l-md data-[range-start=true]:bg-primary data-[range-start=true]:text-primary-foreground data-[selected-single=true]:bg-primary data-[selected-single=true]:text-primary-foreground dark:hover:text-accent-foreground [&>span]:text-xs [&>span]:opacity-70",
        defaultClassNames.day,
        className
      )}
      {...props}
    />
  )
}

DateTimePicker.displayName = "DatetimePicker";

export { DateTimePicker as DateTimePicker };