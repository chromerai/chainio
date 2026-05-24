"use client"

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CopyIcon } from "lucide-react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { generateGoogleFormScript } from "./utils";

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

export const GoogleFormTriggerDialog = ({
    open,
    onOpenChange
}: Props) => {

    const params = useParams();
    const workflowId = params.workflowId as string;

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
    const webhookUrl = `${baseUrl}/api/webhooks/google-form?workflowId=${workflowId}`;

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(webhookUrl);
            toast.success("Webhook URL copied to clipboard");
        } catch {
            toast.error('Failed to copy URL')
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        Google Form Trigger Configuration
                    </DialogTitle>
                    <DialogDescription>
                        Use this webhook URL in your Google Form's App Script to trigger this workflow when a form is submitted. 
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                    <div className="space-x-2">
                        <Label htmlFor="webhook-url">
                            Webhook URL
                        </Label>
                        <div className="flex gap-2">
                            <Input
                                id="webhook-url"
                                value={webhookUrl}
                                readOnly
                                className="text-sm font-mono"
                            />
                            <Button
                                type="button"
                                size="icon"
                                variant="outline"
                                onClick={copyToClipboard}
                            >
                                <CopyIcon className="size-4"/>
                            </Button>
                        </div>
                    </div>

                    <div className="rounded-lg bg-muted p-4 space-y-2">
                        <h4 className="font-medium text-sm">
                            Setup Instructions:
                        </h4>
                        <ol className="text-sm text-muted-foreground space-y-3 list-none">
                            <li className="flex gap-2">
                                <span className="font-bold text-foreground">1.</span> 
                                Open your <strong>Google Form</strong>
                            </li>
                            <li className="flex gap-2">
                                <span className="font-bold text-foreground">2.</span> 
                                Click <kbd className="border px-1 rounded">&#8942;</kbd> <span className="text-muted-foreground/60">→</span> <strong>Apps Script</strong>
                            </li>
                            <li className="flex gap-2">
                                <span className="font-bold text-foreground">3.</span> 
                                Copy and paste the script provided below.
                            </li>
                            <li className="flex gap-2">
                                <span className="font-bold text-foreground">4.</span> 
                                Save and click <strong>Triggers</strong> (side panel) <span className="text-muted-foreground/60">→</span> <strong>Add Trigger</strong>
                            </li>
                            <li className="bg-muted/30 p-3 rounded-lg border border-dashed">
                                <span className="block mb-2 font-semibold text-foreground">5. Configure Trigger:</span>
                                <ul className="grid grid-cols-1 gap-1 text-xs pl-4 list-disc">
                                    <li><strong>Event Source:</strong> From form</li>
                                    <li><strong>Function:</strong> <code className="text-primary">onFormSubmit</code></li>
                                    <li><strong>Event Type:</strong> On form submit</li>
                                </ul>
                            </li>
                        </ol>
                    </div>
                    <div className="rounded-lg bg-muted p-4 space-y-4">
                        <h4 className="font-medium text-sm">Google Apps Script:</h4>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={async () => {
                                const script = generateGoogleFormScript(webhookUrl);
                                try {
                                    await navigator.clipboard.writeText(script);
                                    toast.success("Script copied to clipboard");
                                } catch {
                                    toast.error("Failed to copy Script to clipboard");
                                }
                            }}
                        >
                            <CopyIcon className="size-4 mr-2"/>
                            Copy Google Apps Script
                        </Button>
                        <p>
                            This script includes your webhook URL and handles form submissions
                        </p>
                    </div>
                    <div className="rounded-lg bg-muted p-4 space-y-2">
                        <h4 className="font-medium text-sm">Available Variables</h4>
                        <ul className="text-sm text-muted-foreground space-y-1">
                            <li className="gap-2">
                                <code className="bg-background px-1 py-0.5 rounded">
                                    {"{{googleForm.respondentEmail}}"}
                                </code>
                                <span className="font-semibold text-foreground">- Respondent's Email</span>
                            </li>
                            <li className="gap-2">
                                <code className="bg-background px-1 py-0.5 rounded">
                                    {"{{googleForm.responses['Question Name']}}"}
                                </code>
                                <span className="font-semibold text-foreground">- Specific Answer</span>
                            </li>
                            <li className="gap-2">
                                <code className="bg-background px-1 py-0.5 rounded">
                                    {"{{json googleForm.responses}}"}
                                </code>{" "}
                                <span className="font-semibold text-foreground">- All responses as JSON</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}