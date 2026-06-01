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
import { 
    Select, 
    SelectContent, 
    SelectItem, 
    SelectTrigger, 
    SelectValue 
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";

import { Textarea } from "@/components/ui/textarea";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import * as Sentry from "@sentry/nextjs";
import { useCredentialsByType } from "@/features/credentials/hooks/use-credentials";
import { CredentialType } from "@/generated/prisma/enums";
import { toast } from "sonner";
import Image from "next/image";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ChevronDown } from "lucide-react";
import sanitizeHtml from "sanitize-html";
import { marked } from "marked";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";


const TELEGRAM_ALLOWED_TAGS = ["b", "strong", "i", "em", "code", "pre", "a", "br", "p"];
const TELEGRAM_ALLOWED_ATTRS = { a: ["href"] };
 
const getPreviewHtml = (content: string, parseMode: string): string => {
    if (!content) return "";
 
    if (parseMode === "Markdown") {
        return sanitizeHtml(marked.parse(content) as string, {
            allowedTags: TELEGRAM_ALLOWED_TAGS,
            allowedAttributes: TELEGRAM_ALLOWED_ATTRS,
        });
    }
 
    if (parseMode === "HTML") {
        return sanitizeHtml(content.replace(/\n/g, "<br />"), {
            allowedTags: TELEGRAM_ALLOWED_TAGS,
            allowedAttributes: TELEGRAM_ALLOWED_ATTRS,
        });
    }
 
    return content
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\n/g, "<br />");
};


const formSchema = z.object({
    variableName: z
        .string()
        .min(1, { message: "Variable Name is required"})
        .regex(/^[A-Za-z_$][A-Za-z0-9_$]*$/, {
            message: "Variable name must start with a letter or underscore and can contain only letters, numbers and underscores"
        }),
    chatId: z.string().min(1, "channelId is required"),
    credentialId: z.string().min(1, "Credential is required"),
    content: z
        .string()
        .min(1, "Content is required")
        .max(4096, "Telegram messages cannot exceed 4096 characters"),
    parseMode: z.enum(["none", "HTML", "Markdown"]),
})

export type TelegramFormValues = z.infer<typeof formSchema>;

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (values: z.infer<typeof formSchema>) => void;
    defaultValues?: Partial<TelegramFormValues>;
};

export const TelegramDialog = ({
    open,
    onOpenChange,
    onSubmit,
    defaultValues = {},
}: Props) => {
    const { 
            data: credentials,
            isLoading: isLoadingCredentials,
        } = useCredentialsByType(CredentialType.TELEGRAM);
        const [activeTab, setActiveTab] = useState("edit");
    
    const form  = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            variableName: defaultValues.variableName || "",
            credentialId: defaultValues.credentialId || "",
            chatId: defaultValues.chatId || "",
            content: defaultValues.content || "",
            parseMode: defaultValues.parseMode || "none",
        },
    });

    useEffect(() => {
        if (open)  {
            form.reset({
                variableName: defaultValues.variableName || "",
                credentialId: defaultValues.credentialId || "",
                chatId: defaultValues.chatId || "",
                content: defaultValues.content || "",
                parseMode: defaultValues.parseMode || "none",
            });
        }
    }, [open, defaultValues, form]);

    const watchVariableName = form.watch("variableName") || "myTele";
    const watchCredentialId = form.watch("credentialId") || "";
    const watchParseMode = form.watch("parseMode");

    useEffect(() => {
            if(isLoadingCredentials) return;
    
            if(!watchCredentialId) return;
    
            const selectedCredential = credentials?.find(c => c.id === watchCredentialId)
            if(!selectedCredential) {
                Sentry.captureMessage(`Credential ${watchCredentialId} not found`, {
                    extra: { credentials: credentials?.map(c => c.id) }
                });
                toast.error(`Credential ${watchCredentialId} not found`)
                return;
            }
        }, [watchCredentialId, isLoadingCredentials])
    
    const handleSubmit = (values: z.infer<typeof formSchema>) => {
        onSubmit(values),
        onOpenChange(false);
    };


    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        Telegram Configuration
                    </DialogTitle>
                    <DialogDescription>
                        Configure the Telegram bot settings for this node.
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
                                            placeholder="myTele"
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
                            name="credentialId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Telegram Credential</FormLabel>
                                    <Select
                                        onValueChange={field.onChange}
                                        value={field.value}
                                        disabled={isLoadingCredentials || !credentials?.length}
                                    >
                                        <FormControl>
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Select a credential"/>
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {credentials?.map((credential) => (
                                                <SelectItem
                                                    key={credential.id}
                                                    value={credential.id}
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <Image
                                                            src="/logos/telegram.svg"
                                                            alt="telegram"
                                                            width={16}
                                                            height={16} 
                                                        />
                                                        {credential.name}
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="chatId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Chat ID</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="@mychannel or -1001234567890"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormDescription className="flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
                                        <span>Use your channel username</span>
                                        <code className="rounded bg-sky-50 dark:bg-sky-950/50 px-1.5 py-0.5 font-mono text-xs font-semibold text-sky-600 dark:text-sky-400 border border-sky-100 dark:border-sky-900/50">
                                            @yourchannel
                                        </code>
                                        <span>or numeric chat ID.</span>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <button
                                                    type="button"
                                                    className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                                                >
                                                    <Image
                                                        src="/logos/telegram.svg"
                                                        alt="telegram"
                                                        width={16}
                                                        height={16} 
                                                    />
                                                    How to get your Chat ID
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
                                                    <Image
                                                        src="/logos/telegram.svg"
                                                        alt="telegram"
                                                        width={16}
                                                        height={16} 
                                                    />
                                                    Getting your Telegram Chat ID
                                                </span>
                                                <ol className="space-y-3 list-none text-sm text-muted-foreground">
                                                    <li className="flex gap-2">
                                                        <span className="font-bold text-foreground shrink-0">1.</span>
                                                        <span>
                                                            Open Telegram and search for{" "}
                                                            <code className="text-primary">@BotFather</code>{" "}
                                                            — create a new bot and copy the{" "}
                                                            <strong className="text-foreground">Bot Token</strong>
                                                        </span>
                                                    </li>
                                                    <li className="flex gap-2">
                                                        <span className="font-bold text-foreground shrink-0">2.</span>
                                                        <span>
                                                            Add your bot to your channel as an{" "}
                                                            <strong className="text-foreground">Admin</strong>{" "}
                                                            with permission to post messages
                                                        </span>
                                                    </li>
                                                    <li className="flex gap-2">
                                                        <span className="font-bold text-foreground shrink-0">3.</span>
                                                        <span>
                                                            For public channels, just use{" "}
                                                            <code className="text-primary">@channelname</code>.
                                                            For private channels, forward a message to{" "}
                                                            <code className="text-primary">@userinfobot</code>{" "}
                                                            to get the numeric ID
                                                        </span>
                                                    </li>
                                                    <li className="bg-muted/30 p-3 rounded-lg border border-dashed">
                                                        <span className="block mb-1 font-semibold text-foreground text-xs">
                                                            4. Save your Bot Token as a Telegram credential
                                                        </span>
                                                        <span className="text-xs">
                                                            Go to Credentials → Add Credential → Telegram and paste your Bot Token there.
                                                        </span>
                                                    </li>
                                                </ol>
                                            </PopoverContent>
                                        </Popover>
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="content"
                            render={({ field }) => {
                                const previewHtml = useMemo(() => {
                                    if (activeTab !== "preview") return "";
                                    return getPreviewHtml(field.value, watchParseMode);
                                }, [field.value, watchParseMode, activeTab]);

                                return <FormItem>
                                    <div className="flex items-center justify-between">
                                        <FormLabel>Message Content</FormLabel>
                                        <FormField 
                                            control={form.control}
                                            name="parseMode"
                                            render={({ field: parseModeField }) => (
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs text-muted-foreground">Format</span>
                                                    <Select
                                                        onValueChange={parseModeField.onChange}
                                                        value={parseModeField.value}
                                                    >
                                                        <SelectTrigger className="h-7 w-28 text-xs">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="none">none</SelectItem>
                                                            <SelectItem value="Markdown">markdown</SelectItem>
                                                            <SelectItem value="HTML">html</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            )}
                                        />
                                    </div>
                                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                                        <TabsList className="h-8 w-full grid grid-cols-2 mb-2">
                                            <TabsTrigger value="edit" className="text-xs">Edit</TabsTrigger>
                                            <TabsTrigger value="preview" className="text-xs">Preview</TabsTrigger>
                                        </TabsList>
                                        <TabsContent value="edit" className="mt-0">
                                            <FormControl>
                                                <Textarea
                                                    placeholder={
                                                        watchParseMode === "Markdown"
                                                            ? "*Bold title*\nSummary: {{myAI.text}}\n_Sent by chainio_"
                                                            : watchParseMode === "HTML"
                                                            ? "<b>Bold title</b>\nSummary: {{myAI.text}}"
                                                            : "Summary: {{myAI.text}}"
                                                    }
                                                    className="min-h-[120px] font-mono text-sm"
                                                    {...field}
                                                />
                                            </FormControl>
                                        </TabsContent>
                                        <TabsContent value="preview" className="mt-0">
                                            <div className="min-h-[120px] w-full rounded-md border border-input bg-muted/30 px-3 py-2 text-sm leading-relaxed">
                                                    {previewHtml ? (
                                                        <span dangerouslySetInnerHTML={{ __html: previewHtml }} />
                                                    ) : (
                                                        <span className="text-muted-foreground italic">
                                                            Nothing to preview yet — start typing in the Edit tab.
                                                        </span>
                                                    )}
                                                </div>
                                                {watchParseMode === "none" && field.value && (
                                                    <p className="mt-1.5 text-xs text-muted-foreground">
                                                        Plain text — no formatting applied. Switch to Markdown or HTML to use formatting.
                                                    </p>
                                                )}
                                                {field.value?.includes("{{") && (
                                                    <p className="mt-1.5 text-xs text-amber-600 dark:text-amber-400">
                                                        Variables like <code className="font-mono">{"{{myAI.text}}"}</code> show as-is in the preview but get replaced with real values at runtime.
                                                    </p>
                                                )}
                                        </TabsContent>
                                    </Tabs>
                                    <FormDescription className="flex items-center justify-between">
                                            <span>
                                                Use {"{{variables}}"} or {"{{json variable}}"} to embed workflow data.
                                            </span>
                                            <span className={`text-xs tabular-nums ${field.value?.length > 3800 ? "text-destructive" : "text-muted-foreground/70"}`}>
                                                {field.value?.length ?? 0} / 4096
                                            </span>
                                        </FormDescription>
                                </FormItem>
                            }}
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