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

import { Textarea } from "@/components/ui/textarea";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Kbd } from "@/components/ui/kbd";
import { ChevronDown, PlusSquareIcon, SettingsIcon, Zap } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";


const formSchema = z.object({
    variableName: z
        .string()
        .min(1, { message: "Variable Name is required"})
        .regex(/^[A-Za-z_$][A-Za-z0-9_$]*$/, {
            message: "Variable name must start with a letter or underscore and can contain only letters, numbers and underscores"
        }),
    content: z
        .string()
        .min(1, "Content is required"),
    webhookUrl: z.string().min(1, "Webhook URL is required")
})

export type SlackFormValues = z.infer<typeof formSchema>;

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (values: z.infer<typeof formSchema>) => void;
    defaultValues?: Partial<SlackFormValues>;
};

export const SlackDialog = ({
    open,
    onOpenChange,
    onSubmit,
    defaultValues = {},
}: Props) => {
    const form  = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            variableName: defaultValues.variableName || "",
            content: defaultValues.content || "",
            webhookUrl: defaultValues.webhookUrl || "",
        },
    });

    useEffect(() => {
        if (open)  {
            form.reset({
                variableName: defaultValues.variableName || "",
                content: defaultValues.content || "",
                webhookUrl: defaultValues.webhookUrl || "",
            });
        }
    }, [open, defaultValues, form]);

    const watchVariableName = form.watch("variableName") || "mySlack";
    
    const handleSubmit = (values: z.infer<typeof formSchema>) => {
        onSubmit(values),
        onOpenChange(false);
    };


    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        Slack Configuration
                    </DialogTitle>
                    <DialogDescription>
                        Configure the Slack webhook settings for this node.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(handleSubmit)}
                        className="space-y-8 mt-4"
                    >
                        <FormField
                            control={form.control}
                            name="variableName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Variable Name</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="mySlack"
                                            {...field} 
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        Use this name to reference the results in other nodes:{" "}
                                        {`{{${watchVariableName}.text}}`}
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name="webhookUrl"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Webhook URL</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="https://hooks.slack.com/api/services/..."
                                            {...field} 
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        <span className="relative block">
                                            <Popover>
                                            <PopoverTrigger asChild>
                                                <button className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
                                                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="#E01E5A">
                                                    <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zm1.271 0a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zm0 1.271a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zm10.122 2.521a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zm-1.268 0a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zm-2.523 10.122a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zm0-1.268a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z"/>
                                                </svg>
                                                How to get your Slack Webhook URL
                                                <ChevronDown className="w-3 h-3" />
                                                </button>
                                            </PopoverTrigger>

                                            <PopoverContent
                                                className="w-96 p-4 space-y-3"
                                                align="center"
                                                side="right"
                                                sideOffset={4}
                                                avoidCollisions={false}
                                                onOpenAutoFocus={(e) => e.preventDefault()}
                                            >
                                                <span className="font-medium text-sm text-foreground flex items-center gap-1.5">
                                                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="#E01E5A">
                                                    <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zm1.271 0a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zm0 1.271a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zm10.122 2.521a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zm-1.268 0a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zm-2.523 10.122a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zm0-1.268a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z"/>
                                                </svg>
                                                Slack Webhook Setup
                                                </span>

                                                <ol className="space-y-3 list-none text-sm text-muted-foreground">
                                                    <li className="flex gap-2">
                                                        <span className="font-bold text-foreground shrink-0">1.</span>
                                                        <span>In the Slack sidebar, click <Kbd className="inline-flex items-center gap-1 px-1.5 py-0.5 text-xs font-sans font-medium">···</Kbd> <strong className="text-foreground">More</strong> <span className="text-muted-foreground/50">&rarr;</span> <strong className="text-foreground">Tools</strong> <span className="text-muted-foreground/50">&rarr;</span> <strong className="text-foreground">Workflows</strong></span>
                                                    </li>
                                                    <li className="flex gap-2">
                                                        <span className="font-bold text-foreground shrink-0">2.</span>
                                                        <span>Click <strong className="text-foreground">New</strong> <span className="text-muted-foreground/50">&rarr;</span> <Kbd className="inline-flex items-center gap-1 px-1.5 py-0.5 text-xs font-sans font-medium"><Zap className="w-3 h-3" /> Build Workflow</Kbd></span>
                                                    </li>
                                                    <li className="flex gap-2">
                                                        <span className="font-bold text-foreground shrink-0">3.</span>
                                                        <span>Click <strong className="text-foreground">Choose an event</strong> <span className="text-muted-foreground/50">&rarr;</span> select <strong className="text-foreground">From a webhook</strong></span>
                                                    </li>
                                                    <li className="flex gap-2">
                                                        <span className="font-bold text-foreground shrink-0">4.</span>
                                                        <span>Add a variable — set Key as <code className="text-primary">content</code>, Datatype as <strong className="text-foreground">Text</strong> <span className="text-muted-foreground/50">&rarr;</span> click <strong className="text-foreground">Continue</strong></span>
                                                    </li>
                                                    <li className="flex gap-2">
                                                        <span className="font-bold text-foreground shrink-0">5.</span>
                                                        <span>Click <Kbd className="inline-flex items-center gap-1 px-1.5 py-0.5 text-xs font-sans font-medium"><PlusSquareIcon className="w-3 h-3" /> Add steps</Kbd> <span className="text-muted-foreground/50">&rarr;</span> select <strong className="text-foreground">Send a message to a channel</strong> <span className="text-muted-foreground/50">&rarr;</span> pick your channel (e.g. <code className="text-primary">#general</code>)</span>
                                                    </li>
                                                    <li className="flex gap-2">
                                                        <span className="font-bold text-foreground shrink-0">6.</span>
                                                        <span>In <strong className="text-foreground">Add a message</strong> → click <strong className="text-foreground">Insert a variable</strong> <span className="text-muted-foreground/50">&rarr;</span> choose <code className="text-primary">content</code> from the dropdown <span className="text-muted-foreground/50">&rarr;</span> click <strong className="text-foreground">Save</strong></span>
                                                    </li>
                                                    <li className="flex gap-2">
                                                        <span className="font-bold text-foreground shrink-0">7.</span>
                                                        <span>Click <strong className="text-foreground">Finish up</strong> → give your workflow a name <span className="text-muted-foreground/50">&rarr;</span> <strong className="text-foreground">Publish</strong></span>
                                                    </li>
                                                    <li className="bg-muted/30 p-3 rounded-lg border border-dashed">
                                                        <span className="block mb-2 font-semibold text-foreground">8. Copy your Webhook URL</span>
                                                        <ul className="grid grid-cols-1 gap-1 text-xs pl-4 list-disc">
                                                        <li>Go to <strong className="text-foreground">Tools</strong> → find your workflow under <strong className="text-foreground">Recently added</strong></li>
                                                        <li>Click it <span className="text-muted-foreground/50">&rarr;</span> select <strong className="text-foreground">Start with a webhook</strong></li>
                                                        <li>Scroll down → copy the URL and paste it in the field above</li>
                                                        </ul>
                                                    </li>
                                                </ol>
                                            </PopoverContent>
                                            </Popover>
                                        </span>
                                        </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="content"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Message Content</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Summary: {{mySlack.text}}"
                                            className="min-h-[80px] font-mono text-sm"
                                            {...field} 
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        The message to send. Use {"{{variables}}"} for simple values or {"{{json variable}}"} to stringify objects.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <DialogFooter className="mt-4">
                            <Button type="submit">
                                Save
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}