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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useWatch } from 'react-hook-form';
import { useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useCredentialsByType } from '@/app/features/credentials/hooks/useCredentials';
import { CredentialType } from '@/generated/prisma/enums';
import Image from 'next/image';

export const AVAILABLE_MODELS = [
    "gemini-3.5-flash",
    "gemini-3.1-pro-preview",
    "gemini-3-pro-preview",
    "gemini-3-flash-preview",
    "gemini-2.5-pro",
    "gemini-2.5-flash",
    "gemini-2.0-flash"
] as const;


const formSchema = z.object({
    variableName: z
        .string()
        .min(1, { message: "Variable name is required" })
        .regex(/^[A-Za-z_$][A-Za-z0-9_$]*$/, {
            message: "Variable name should start with a letter or underscore and contains only letter, number, and underscore."
        }),
    credentialId: z.string().min(1, "Credential is required"),
    model: z.string().min(1, "Model is required"),
    systemPrompt: z.string().optional(),
    userPrompt: z.string().min(1, "User propmt is required")
})

export type GeminiFormValues = z.infer<typeof formSchema>;

interface props {
    open: boolean;
    onOpenChange: (open: boolean) => void
    onSubmit: (values: GeminiFormValues) => void;
    defaultValues?: Partial<GeminiFormValues>;
}

export const GeminiDialog = (
    {
        open,
        onOpenChange,
        onSubmit,
        defaultValues = {},
    }: props) => {

    const {
        data: credentials,
        isLoading: isLoadingCredentials,
    } = useCredentialsByType(CredentialType.GEMINI);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            variableName: defaultValues.variableName,
            credentialId: defaultValues.credentialId,
            model: defaultValues.model || AVAILABLE_MODELS[0],
            systemPrompt: defaultValues.systemPrompt || "",
            userPrompt: defaultValues.userPrompt || "",
        }

    })

    useEffect(() => {
        if (open) {
            form.reset({
                variableName: defaultValues.variableName,
                credentialId: defaultValues.credentialId,
                model: defaultValues.model || AVAILABLE_MODELS[0],
                systemPrompt: defaultValues.systemPrompt || "",
                userPrompt: defaultValues.userPrompt || "",

            })
        }
    }, [open, defaultValues, form])

    const watchVariableName = useWatch({
        control: form.control,
        name: 'variableName'
    }) || "myGemini";

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
                    <DialogTitle>Gemini Configurations</DialogTitle>
                    <DialogDescription>
                        Configure the AI model and prompts for this node.
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
                                            placeholder="myGemini"
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
                                    <FormLabel>Credential ID</FormLabel>
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
                                                            src="/logos/gemini.svg"
                                                            alt="GEMINI"
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
                            name='model'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Model</FormLabel>
                                    <Select
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                    >
                                        <FormControl>
                                            <SelectTrigger className='w-full'>
                                                <SelectValue placeholder="Select a model" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {AVAILABLE_MODELS.map((model) => (
                                                <SelectItem key={model} value={model}>
                                                    {model}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>

                                    </Select>
                                    <FormDescription>
                                        The Google gemini model to use for completion.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name='systemPrompt'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>System Prompt (Optional)</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="You are a helpfull assistant."
                                            className="min-h-[80px] font-mono text-sm"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        Sets the behaviour of the assistance. Use {"{{variables}}"} for simple values or {"{{json variable}}"} to stringify objects.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name='userPrompt'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>User Prompt</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Summarize the text: {{json httpResponse.data}}}"
                                            className="min-h-[120px] font-mono text-sm"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        The propmt to send to the AI. Use {"{{variables}}"} for simple values or {"{{json variable}}"} to stringify objects.
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