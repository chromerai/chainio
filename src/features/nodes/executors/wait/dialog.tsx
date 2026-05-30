"use client"

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";

import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { DateTimePicker } from "@/components/time-picker/datetime-picker";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

// const MAX_DURATION: Record<string, number> = {
//     seconds: 3600,
//     minutes: 60 * 24 * 30,
//     hours: 24 * 30,          
//     days: 30,              
// };

const formSchema = z.object({
    mode: z.enum(["After Time Interval", "At Specific Time"]),
    duration: z
        .number({ error: "Duration must be a number" })
        .positive("Duration must be greater than zero")
        .multipleOf(0.01, "Maximum of 2 decimal places ")
        .refine((val) => Math.round(val * 100) / 100 === val, {
            message: "Maximum of 2 decimal places"
        })
        .optional(),
    unit: z.enum(["seconds", "minutes", "hours", "days"]).optional(),
    datetime: z.string().optional(),
})
.superRefine(
    (val, ctx) => {
        if(val.mode === "After Time Interval") {
            if(!val.duration) {
                ctx.addIssue({
                    code: "custom",
                    message: "duration is required",
                    path: ["duration"],
                })
                return z.NEVER;
            }

            if(!val.unit) {
                ctx.addIssue({
                    code: "custom",
                    message: "unit is required",
                    path: ["unit"],
                })
                return z.NEVER;
            }

            if (val.unit === 'seconds' && (!Number.isInteger(val.duration) || val.duration < 1)){
                ctx.addIssue({
                    code: "custom",
                    message: "Seconds must be an integer ( eg: 5, not 5.23 )",
                    path: ["duration"],
                })
                return z.NEVER;
            }
        }

        if(val.mode === "At Specific Time") {
            if(!val.datetime) {
                ctx.addIssue({
                    code: "custom",
                    message: "Date and Time is required",
                    path: ["duration"],
                })
                return z.NEVER;
            }

            if (new Date(val.datetime) <= new Date()) {
                ctx.addIssue({
                    code: "custom",
                    message: "Date and time must be in the future",
                    path: ["datetime"],
                });
                return z.NEVER;
            }
        }
        
    },
)


export type WaitFormValues = z.infer<typeof formSchema>;

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (values: z.infer<typeof formSchema>) => void;
    defaultValues?: Partial<WaitFormValues>;
};

export const WaitDialog = ({
    open,
    onOpenChange,
    onSubmit,
    defaultValues = {},
}: Props) => {
    const form  = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            mode: defaultValues.mode || "After Time Interval",
            duration: defaultValues.duration || 1,
            unit: defaultValues.unit || "seconds",
            datetime: defaultValues.datetime || "",
        },
    });

    useEffect(() => {
        if (open)  {
            form.reset({
                mode: defaultValues.mode || "After Time Interval",
                duration: defaultValues.duration || 1,
                unit: defaultValues.unit || "seconds",
                datetime: defaultValues.datetime || "",
            });
        }
    }, [open, defaultValues, form]);

    const watchDuration = form.watch("duration") ?? 1;
    const watchUnit = form.watch("unit") ?? "seconds";
    const watchMode = form.watch("mode");

    useEffect(() => {
    form.trigger("duration");
}, [watchUnit]);

    const handleSubmit = (values: z.infer<typeof formSchema>) => {
        onSubmit(values),
        onOpenChange(false);
    };


    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        Wait / Delay
                    </DialogTitle>
                    <DialogDescription>
                        Pause the workflow for a set duration before continuing to the next
                        node.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(handleSubmit)}
                        className="space-y-6 mt-2"
                    >
                        <FormField
                            control={form.control}
                            name="mode"
                            render={({ field }) => (
                                <FormItem className="flex-1">
                                    <FormLabel>Mode</FormLabel>
                                    <Select
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                            value={field.value}
                                        >
                                        <FormControl>
                                            <SelectTrigger>
                                                    <SelectValue />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                                <SelectItem value="After Time Interval">After Time Interval</SelectItem>
                                                <SelectItem value="At Specific Time">At Specific Time</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormDescription>
                                        <span className="block mt-2 text-sm text-muted-foreground rounded-md border border-dashed px-3 py-2 font-mono">
                                            Choose how you wish to apply the delay. Right now we offer two modes:
                                            
                                            {/* Simulating list items via breaking spans */}
                                            <span className="block pl-4 mt-1">
                                                • <span className="font-bold">After Time Interval:</span> You set a duration and choose a unit of time and node will execute after that time
                                            </span>
                                            <span className="block pl-4 mt-0.5">
                                                • <span className="font-bold">At Specific Time:</span> you provide a date & time and the node will execute at that specific time.
                                            </span>
                                            
                                            <span className="block text-xs text-primary font-medium mt-2">
                                                * Note: Chainio's server time is always used regardless of the timezone setting.
                                            </span>
                                        </span>

                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        {/* Duration + Unit side by side */}
                        {watchMode === "After Time Interval" && (
                            <>
                                <div className="flex gap-3 items-start">
                                    <FormField
                                        control={form.control}
                                        name="duration"
                                        render={({ field }) => (
                                            <FormItem className="flex-1">
                                                <FormLabel>Duration</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        placeholder="1"
                                                        onKeyDown={(e) => e.key === "Enter" && e.preventDefault()}
                                                        {...field}
                                                        onChange={(e) =>
                                                            field.onChange(
                                                                e.target.value === ""
                                                                    ? ""
                                                                    : Number(e.target.value),
                                                            )
                                                        }
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="unit"
                                        render={({ field }) => (
                                            <FormItem className="w-32">
                                                <FormLabel>Unit</FormLabel>
                                                <Select
                                                    onValueChange={field.onChange}
                                                    defaultValue={field.value}
                                                    value={field.value}
                                                >
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="seconds">Seconds</SelectItem>
                                                        <SelectItem value="minutes">Minutes</SelectItem>
                                                        <SelectItem value="hours">Hours</SelectItem>
                                                        <SelectItem value="days">Days</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
    
                                {/* Live preview */}
                                {((watchUnit === "seconds" && watchDuration >= 1 ) || (watchDuration > 0 && ["hours", "minutes", "days"].includes(watchUnit))) && (
                                    <p className="text-sm text-muted-foreground rounded-md border border-dashed px-3 py-2">
                                        The workflow will pause for{" "}
                                        <span className="font-medium text-foreground">
                                            {watchDuration} {watchDuration > 1 ? watchUnit: watchUnit.substring(0, watchUnit.length-1)}
                                        </span>{" "}
                                        before running the next node. 
                                    </p>
                                )}
                            </>
                        )}
                        {watchMode === "At Specific Time" && (
                            <FormField
                                control={form.control}
                                name="datetime"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col gap-1">
                                        <FormLabel>Specify Date & Time</FormLabel>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <FormControl>
                                                    <Button
                                                        variant="outline"
                                                        className={cn(
                                                            "w-full justify-start text-left font-normal",
                                                            !field.value && "text-muted-foreground"
                                                        )}
                                                    >
                                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                                        {field.value
                                                            ? format(new Date(field.value), "PPP HH:mm")
                                                            : "Pick a date and time"}
                                                    </Button>
                                                </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent
                                                align="start"
                                                side="top"
                                                sideOffset={4}
                                                avoidCollisions={false}
                                                onOpenAutoFocus={(e) => e.preventDefault()}
                                            >
                                                <DateTimePicker 
                                                    initialFocus
                                                    selected={field.value ? new Date(field.value) : new Date()}
                                                    setDate={(date) => field.onChange(date.toISOString())}
                                                    disabled={(date) => {
                                                        const today = new Date();
                                                        today.setHours(0,0,0,0);
                                                        return date < today;
                                                    }}
                                                />
                                            </PopoverContent>
                                        </Popover>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}

 
                        <DialogFooter>
                            <Button type="submit">Save</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};