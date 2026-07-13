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
import { useCredentialsByType } from '@/app/features/credentials/hooks/useCredentials';
import { CredentialType } from '@/generated/prisma/enums';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Image from 'next/image';

const formSchema = z.object({
    variableName: z
        .string()
        .min(1, { message: "Variable name is required" })
        .regex(/^[A-Za-z_$][A-Za-z0-9_$]*$/, {
            message:
                "Variable name should start with a letter or underscore and contain only letters, numbers, and underscores.",
        }),

    credentialId: z.string().min(1, "Credential is required"),
    to: z
        .string()
        .min(1, "Recipient email is required"),

    subject: z
        .string()
        .min(1, "Subject is required"),

    cc: z
        .string()
        .optional(),

    body: z
        .string()
        .min(1, "Email body is required"),
});

export type GmailFormValues = z.infer<typeof formSchema>;

interface props {
    open: boolean;
    onOpenChange: (open: boolean) => void
    onSubmit: (values: GmailFormValues) => void;
    defaultValues?: Partial<GmailFormValues>;
}

export const GmailDialog = (
    {
        open,
        onOpenChange,
        onSubmit,
        defaultValues = {},
    }: props) => {

    const {
        data: credentials,
        isLoading: isLoadingCredentials,
    } = useCredentialsByType(CredentialType.GMAIL)

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            variableName: defaultValues.variableName || "",
            credentialId: defaultValues.credentialId,
            to: defaultValues.to || " ",
            cc: defaultValues.cc || " ",
            subject: defaultValues.subject || "",
            body: defaultValues.body || "",
        }

    })

    useEffect(() => {
        if (open) {
            form.reset({
                variableName: defaultValues.variableName || "",
                credentialId: defaultValues.credentialId,
                to: defaultValues.to || "",
                cc: defaultValues.cc || "",
                subject: defaultValues.subject || "",
                body: defaultValues.body || "",
            })
        }
    }, [open, defaultValues, form])

    const watchVariableName = useWatch({
        control: form.control,
        name: 'variableName'
    }) || "myResult";

    const handleSubmit = (values: z.infer<typeof formSchema>) => {
        onSubmit(values);
        onOpenChange(false);
    }

    const connectGoogle = async () => {
        window.location.href = "/api/auth/gmail";
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className='max-h-[90vh] overflow-y-auto'
                style={{
                    scrollbarWidth: "none",
                    msOverflowStyle: "none",
                }}
            >                <DialogHeader>
                    <DialogTitle>Gmail Configurations</DialogTitle>
                    <DialogDescription>
                        Connect your Gmail account to send automated emails, alerts, and system notifications dynamically using workflow variables.
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
                                            placeholder="MyResult"
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
                            name='credentialId'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Credential</FormLabel>
                                    {credentials?.length ? (
                                        <Select
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                            disabled={isLoadingCredentials || !credentials?.length}
                                        >
                                            <FormControl>
                                                <SelectTrigger className='w-full'>
                                                    <SelectValue placeholder="Select a Credential" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {credentials?.map((credential) => (
                                                    <SelectItem key={credential.id} value={credential.id}>
                                                        <div className="flex items-center gap-2">
                                                            <Image
                                                                src="/logos/gmail.svg"
                                                                alt="GMAIL"
                                                                width={16}
                                                                height={16}
                                                            />
                                                            {credential.name}
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>)
                                        : (
                                            <div className="rounded-md border p-4 space-y-3">
                                                <p className="text-sm text-muted-foreground">
                                                    No Gmail account connected.
                                                </p>

                                                <Button
                                                    type="button"
                                                    onClick={connectGoogle}
                                                >
                                                    Connect Gmail
                                                </Button>
                                            </div>
                                        )}
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name='to'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>To</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Enter recepient emails or {{variable_name}}"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name='cc'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Cc</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Enter comma-separated emails or {{variable_name}}"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name='subject'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Subject</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder='Enter subject line... Use {{variable}} for dynamic text'
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name='body'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Body</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder='Write your email body here... Type {{variable}} to insert dynamic variables.'
                                            className="min-h-[120px] font-mono text-sm"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        Enter the email content. Supports plain text, HTML, and dynamic workflow variables
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter className='mt-4'>
                            <Button type='submit'>Save</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )

}