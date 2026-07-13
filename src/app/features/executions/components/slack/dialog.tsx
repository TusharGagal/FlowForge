"use client";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'

import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'

import { Textarea } from '@/components/ui/textarea';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useWatch } from 'react-hook-form';
import { useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';


const formSchema = z.object({
    variableName: z
        .string()
        .min(1, { message: "Variable name is required" })
        .regex(/^[A-Za-z_$][A-Za-z0-9_$]*$/, {
            message: "Variable name should start with a letter or underscore and contains only letter, number, and underscore."
        }),
    content: z
        .string()
        .min(1, "Message content is required"),
    webhookUrl: z.string().min(1, "Webhook URL is required."),
    payloadKey: z.string().min(1),

})

export type SlackFormValues = z.infer<typeof formSchema>;

interface props {
    open: boolean;
    onOpenChange: (open: boolean) => void
    onSubmit: (values: SlackFormValues) => void;
    defaultValues?: Partial<SlackFormValues>;
}

export const SlackDialog = (
    {
        open,
        onOpenChange,
        onSubmit,
        defaultValues = {},
    }: props) => {


    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            variableName: defaultValues.variableName || "",
            content: defaultValues.content || "",
            webhookUrl: defaultValues.webhookUrl || "",
            payloadKey: defaultValues.payloadKey || "",
        }

    })

    useEffect(() => {
        if (open) {
            form.reset({
                variableName: defaultValues.variableName || "",
                content: defaultValues.content || "",
                webhookUrl: defaultValues.webhookUrl || "",
                payloadKey: defaultValues.payloadKey || "",

            })
        }
    }, [open, defaultValues, form])

    const watchVariableName = useWatch({
        control: form.control,
        name: 'variableName'
    }) || "mySlack";

    const handleSubmit = (values: z.infer<typeof formSchema>) => {
        onSubmit(values);
        onOpenChange(false);
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className='max-h-[90vh] overflow-y-auto'
                style={{
                    scrollbarWidth: "none",
                    msOverflowStyle: "none",
                }}
            >                <DialogHeader>
                    <DialogTitle>Slack Configurations</DialogTitle>
                    <DialogDescription>
                        Configure the Slack Webhook settings for this node.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(handleSubmit)}
                        className='space-y-8 mt-4'
                    >
                        <FormField
                            control={form.control}
                            name='variableName'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Variable Name</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="MySlack"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        Use this name to refer the results in other nodes:{" "}
                                        {`{{${watchVariableName}.text}}`}
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name='webhookUrl'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Webhook URL</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder='https://hooks.slack.com/triggers...'
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        Get this from Slack: Workspace settings → workflows → webhooks
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name='payloadKey'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Payload Key</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder='text'
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        Enter the webhook variable name configured in your Slack Workflow Trigger. The content of this node will be sent using this key.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name='content'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Content</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Summary: {{myDiscord.text}}}"
                                            className="min-h-[120px] font-mono text-sm"
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
                        {/* <FormField
                            control={form.control}
                            name='username'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Bot Username (Optional)</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder='Workflow Bot'
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        Override the webhook&apos;s default username
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        /> */}
                        <DialogFooter className='mt-4'>
                            <Button type='submit'>Save</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )

}