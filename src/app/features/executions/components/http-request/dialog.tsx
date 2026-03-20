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


const formSchema = z.object({
    endpoint: z.url({ message: "Please enter the valid url." }),
    method: z.enum(['GET', 'POST', 'PUT', 'PATCH', 'DELETE']),
    body: z.string().optional()
})

export type FormType = z.infer<typeof formSchema>;

interface props {
    open: boolean;
    onOpenChange: (open: boolean) => void
    onSubmit: (values: FormType) => void;
    defaultEndpoint?: string;
    defaultMethod?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    defaultBody?: string;
}

export const HttpRequestDialog = (
    {
        open,
        onOpenChange,
        onSubmit,
        defaultEndpoint = "",
        defaultMethod = "GET",
        defaultBody = ""
    }: props) => {

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            endpoint: defaultEndpoint,
            method: defaultMethod,
            body: defaultBody,
        }

    })

    useEffect(() => {
        if (open) {
            form.reset({
                endpoint: defaultEndpoint,
                method: defaultMethod,
                body: defaultBody,  // TODO: bug if i am updaing the method type from post to get then body is not updating in the databse.
            })
        }
    }, [open, defaultEndpoint, defaultBody, defaultMethod, form])

    const watchMethod = useWatch({
        control: form.control,
        name: 'method',
    });
    const showBodyField = ['POST', 'PUT', 'PATCH'].includes(watchMethod);

    const handleSubmit = (values: z.infer<typeof formSchema>) => {
        onSubmit(values);
        onOpenChange(false);
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>HTTP Request</DialogTitle>
                    <DialogDescription>
                        Configure the setting for HTTP Request node.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(handleSubmit)}
                        className='space-y-8 mt-4'
                    >
                        <FormField
                            control={form.control}
                            name='method'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Method</FormLabel>
                                    <Select
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                    >
                                        <FormControl>
                                            <SelectTrigger className='w-full'>
                                                <SelectValue placeholder="Select a method" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value='GET'>GET</SelectItem>
                                            <SelectItem value='POST'>POST</SelectItem>
                                            <SelectItem value='PUT'>PUT</SelectItem>
                                            <SelectItem value='PATCH'>PATCH</SelectItem>
                                            <SelectItem value='DELETE'>DELETE</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormDescription>
                                        The HTTP method to use for this request.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name='endpoint'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Endpoint URL</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="https://api/example.com/users/{{httpResponse.data.id}}"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        Static URL or use {"{{variables}}"} for simple values or {"{{json variable}}"} to stringify objects.
                                    </FormDescription>
                                </FormItem>
                            )}
                        />
                        {showBodyField && (
                            <FormField
                                control={form.control}
                                name='body'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Request Body</FormLabel>
                                        <Textarea
                                            placeholder={
                                                `{\n "userId":"{{httpsResponse.data.id}}", \n "name":"{{httpsResponse.data.name}}",\n "items":"{{httpResponse.data.items}}"\n}`
                                            }
                                            className="min-h-[120px] font-mono text-sm"
                                            {...field}
                                        />
                                        <FormDescription>
                                            JSON with template variables. Use {"{{variables}}"} for simple values or {"{{json variable}}"} to stringify objects.
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}
                        <DialogFooter className='mt-4'>
                            <Button type='submit'>Save</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )

}