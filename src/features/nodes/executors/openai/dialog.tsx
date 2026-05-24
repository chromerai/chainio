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

import { Textarea } from "@/components/ui/textarea";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { getOpenAIModels } from "./actions";
import { OPENAI_FALLBACK_MODELS } from "@/config/constants";
import * as Sentry from "@sentry/nextjs";
import { useCredentialsByType } from "@/features/credentials/hooks/use-credentials";
import { CredentialType } from "@/generated/prisma/enums";
import Image from "next/image";


const formSchema = z.object({
    variableName: z
        .string()
        .min(1, { message: "Variable Name is required"})
        .regex(/^[A-Za-z_$][A-Za-z0-9_$]*$/, {
            message: "Variable name must start with a letter or underscore and can contain only letters, numbers and underscores"
        }),
    credentialId: z.string().min(1, "Credential is required"),
    model: z.string().min(1, "Please select a model"),
    systemPrompt: z.string().optional(),
    userPrompt: z.string().min(1, "User prompt is required")
})

export type OpenAiFormValues = z.infer<typeof formSchema>;

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (values: z.infer<typeof formSchema>) => void;
    defaultValues?: Partial<OpenAiFormValues>;
};

interface ModelList {
    name: string;
    value: string;
}

export const OpenAiDialog = ({
    open,
    onOpenChange,
    onSubmit,
    defaultValues = {},
}: Props) => {
    
    const { 
        data: credentials,
        isLoading: isLoadingCredentials,
     } = useCredentialsByType(CredentialType.OPENAI)
    const [models, setModels] = useState<ModelList[]>([]);
    const [isLoadingModels, setIsLoadingModels] = useState(false);

    const form  = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            variableName: defaultValues.variableName || "",
            credentialId: defaultValues.credentialId || "",
            model: defaultValues.model || "",
            systemPrompt: defaultValues.systemPrompt || "",
            userPrompt: defaultValues.userPrompt || "",
        },
    });

    useEffect(() => {
        if (open)  {
            form.reset({
                variableName: defaultValues.variableName || "",
                credentialId: defaultValues.credentialId || "",
                model: defaultValues.model || "",
                systemPrompt: defaultValues.systemPrompt || "",
                userPrompt: defaultValues.userPrompt || "",
            });
        }
    }, [open, defaultValues, form]);

    const watchVariableName = form.watch("variableName") || "myOpenAi";
    const watchCredentialId = form.watch("credentialId") || "";

    useEffect(() => {
        if(isLoadingCredentials) return;

        if(!watchCredentialId) return;

        const selectedCredential = credentials?.find(c => c.id === watchCredentialId)
        if(!selectedCredential) {
            setModels(OPENAI_FALLBACK_MODELS)
            Sentry.captureMessage(`Credential ${watchCredentialId} not found`, {
                extra: { credentials: credentials?.map(c => c.id) }
            });
            return;
        }

        form.setValue("model", "");
        setModels([]);
        setIsLoadingModels(true);
        const fetchModels = async () => {
            try {
                const res = await getOpenAIModels(selectedCredential.id);
                setModels(res);
            } catch (error) {
                setModels(OPENAI_FALLBACK_MODELS)
                Sentry.captureException(error, {
                    extra: { context: "OpenAi Dialog - fetchModels" }
                });
            } finally {
                setIsLoadingModels(false);
            }
        }

        fetchModels()
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
                        OpenAI Configuration
                    </DialogTitle>
                    <DialogDescription>
                        Configure the AI model and prompts for this node.
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
                                            placeholder="myOpenAi"
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
                                    <FormLabel>OpenAI Credential</FormLabel>
                                    <Select
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                        disabled={isLoadingCredentials || !credentials?.length || isLoadingModels }
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
                                                            src="/logos/openai.svg"
                                                            alt="OpenAI"
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
                            name="model"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Model</FormLabel>
                                    <Select
                                        onValueChange={field.onChange}
                                        value={field.value}
                                        disabled={!watchCredentialId || isLoadingModels}
                                    >
                                        <FormControl>
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder={
                                                    !watchCredentialId
                                                            ? "Select a credential first"
                                                            : isLoadingModels
                                                                ? "Loading models..."
                                                                : "Select a model"
                                                } />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {models.map((model) => (
                                                <SelectItem key={model.value} value={model.value}>
                                                    {model.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormDescription>
                                        The OpenAI Model to use for completion.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="systemPrompt"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>System Prompt (optional)</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="You are a helpful assistant"
                                            className="h-[120px] resize-none overflow-y-auto font-mono text-sm"
                                            {...field} 
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        Sets the behavior of the assistant. Use {"{{variables}}"} for simple values or {"{{json variable}}"} to stringify objects.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="userPrompt"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>User Prompt </FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Summarise this text: {{json httpResponse.data}}"
                                            className="h-[120px] resize-none overflow-y-auto font-mono text-sm"
                                            {...field} 
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        The prompt to send to the AI. Use {"{{variables}}"} for simple values or {"{{json variable}}"} to stringify objects.
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