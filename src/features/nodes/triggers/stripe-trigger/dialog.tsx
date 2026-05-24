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

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

export const StripeTriggerDialog = ({
    open,
    onOpenChange
}: Props) => {

    const params = useParams();
    const workflowId = params.workflowId as string;

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
    const webhookUrl = `${baseUrl}/api/webhooks/stripe?workflowId=${workflowId}`;

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
                        Stripe Trigger Configuration
                    </DialogTitle>
                    <DialogDescription>
                        Configure this webhook URL in your Stripe Dashboard to trigger this workflow on payment events.
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
                                Open your <strong>Stripe Dashboard</strong>
                            </li>
                            <li className="flex gap-2">
                                <span className="font-bold text-foreground">2.</span> 
                                Go To <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-square-terminal-icon lucide-square-terminal"><path d="m7 11 2-2-2-2"/><path d="M11 13h4"/><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/></svg>Dashboard<span className="text-muted-foreground/60">→</span> <strong>Webhooks</strong>
                            </li>
                            <li className="flex gap-2">
                                <span className="font-bold text-foreground">3.</span> 
                                Click "Add destination"
                            </li>
                            <li className="flex gap-2">
                                <span className="font-bold text-foreground">4.</span> 
                                Select events to listen for ( e.g.,payment_intent.succeeded )
                            </li>
                            <li className="flex gap-2">
                                <span className="font-bold text-foreground">5.</span> 
                                Finally select <strong>WebHook Endpoint</strong> 
                            </li>
                            <li className="flex gap-2">
                                <span className="font-bold text-foreground">6.</span> 
                                Paste the webhook url above and optionally give it a name and description. 
                            </li>
                            
                            <li className="flex gap-2">
                                <span className="font-bold text-foreground">7.</span> 
                                Click<strong>Create Destination</strong>
                            </li>
                            <li className="flex gap-2">
                                <span className="font-bold text-foreground">8.</span> 
                                Save and copy the signing secret.
                            </li>
                        </ol>
                    </div>
                    <div className="rounded-lg bg-muted p-4 space-y-2">
                        <h4 className="font-medium text-sm">Available Variables</h4>
                        <ul className="text-sm text-muted-foreground space-y-1">
                            <li className="gap-2">
                                <code className="bg-background px-1 py-0.5 rounded">
                                    {"{{stripe.amount}}"}
                                </code>
                                <span className="font-semibold text-foreground"> - Payment Amount</span>
                            </li>
                            <li className="gap-2">
                                <code className="bg-background px-1 py-0.5 rounded">
                                    {"{{stripe.currency}}"}
                                </code>
                                <span className="font-semibold text-foreground"> - Currency Code</span>
                            </li>
                            <li className="gap-2">
                                <code className="bg-background px-1 py-0.5 rounded">
                                    {"{{stripe.customerId}}"}
                                </code>
                                <span className="font-semibold text-foreground"> - Customer ID</span>
                            </li>
                            <li className="gap-2">
                                <code className="bg-background px-1 py-0.5 rounded">
                                    {"{{stripe.eventType}}"}
                                </code>
                                <span className="font-semibold text-foreground"> - Event Type(e.g., payment_intent.succeeded)</span>
                            </li>
                            <li className="gap-2">
                                <code className="bg-background px-1 py-0.5 rounded">
                                    {"{{json stripe}}"}
                                </code>
                                <span className="font-semibold text-foreground"> - Full event data as JSON</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}