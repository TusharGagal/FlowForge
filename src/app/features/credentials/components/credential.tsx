"use client";

import { CredentialType } from "@/generated/prisma/enums";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
    useCreateCredential,
    useUpdateCredential,
    useSuspenseCredential,
} from "../hooks/useCredentials";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";

import {
    Form,
    FormControl,
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

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Link from "next/link";
import { useState } from "react";

const formSchema = z.object({
    name: z.string().min(1, "Name is required"),
    type: z.enum(CredentialType),
    apiKey: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const credentialTypeOptions = [
    {
        value: CredentialType.OPENAI,
        label: "OpenAI",
        logo: "/logos/openai.svg",
    },
    {
        value: CredentialType.ANTHROPIC,
        label: "Anthropic",
        logo: "/logos/anthropic.svg",
    },
    {
        value: CredentialType.GEMINI,
        label: "Gemini",
        logo: "/logos/gemini.svg",
    },
    {
        value: CredentialType.GMAIL,
        label: "Gmail",
        logo: "/logos/gmail.svg",
    },
];

export const credentialConfig = {
    [CredentialType.OPENAI]: {
        authType: "API_KEY",
        label: "API Key",
    },
    [CredentialType.ANTHROPIC]: {
        authType: "API_KEY",
        label: "API Key",
    },
    [CredentialType.GEMINI]: {
        authType: "API_KEY",
        label: "API Key",
    },
    [CredentialType.GMAIL]: {
        authType: "OAUTH",
        provider: "Google",
    },
};

interface CredentialFormProps {
    initialData?: {
        id?: string;
        name: string;
        type: CredentialType;
        apiKey?: string;
        email?: string;
    };
}

export const CredentialForm = ({
    initialData,
}: CredentialFormProps) => {
    const router = useRouter();

    const createCredential = useCreateCredential();
    const updateCredential = useUpdateCredential();

    const isEdit = !!initialData?.id;

    // Controls whether the user wants to replace the existing API key.
    const [isChangingApiKey, setIsChangingApiKey] = useState(false);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: initialData || {
            name: "",
            type: CredentialType.OPENAI,
            apiKey: "",
        },
    });

    const selectedType = useWatch({
        control: form.control,
        name: "type",
    });

    const config = credentialConfig[selectedType];

    const onSubmit = async (values: FormValues) => {
        /*
         * API keys are required only when creating an API_KEY credential.
         *
         * Gmail uses OAuth, so it does not need an API key.
         */
        if (
            !isEdit &&
            config.authType === "API_KEY" &&
            !values.apiKey?.trim()
        ) {
            form.setError("apiKey", {
                type: "manual",
                message: "API Key is required",
            });

            return;
        }

        /*
         * EDIT
         */
        if (isEdit && initialData?.id) {
            /*
             * If the user is not changing the API key,
             * send an empty string.
             *
             * The backend should then preserve the existing
             * encrypted value in config.
             */
            const updateValues = {
                id: initialData.id,
                name: values.name,
                type: values.type,
                apiKey: isChangingApiKey
                    ? values.apiKey?.trim() ?? ""
                    : "",
            };

            /*
             * If the user clicked "Change API Key", make sure
             * they actually entered a new key.
             */
            if (
                config.authType === "API_KEY" &&
                isChangingApiKey &&
                !updateValues.apiKey
            ) {
                form.setError("apiKey", {
                    type: "manual",
                    message: "New API Key is required",
                });

                return;
            }

            await updateCredential.mutateAsync(
                updateValues,
                {
                    onSuccess: () => {
                        router.push("/credentials");
                    },
                    onError: () => {
                        toast.error(
                            "Error occurred while updating credential. Please try again later."
                        );
                    },
                }
            );

            return;
        }

        /*
         * CREATE
         *
         * Your existing create mutation expects apiKey to be a string,
         * so convert undefined to an empty string.
         *
         * For API_KEY credentials, the validation above guarantees
         * that this won't be empty.
         */
        await createCredential.mutateAsync(
            {
                name: values.name,
                type: values.type,
                apiKey: values.apiKey?.trim() ?? "",
            },
            {
                onSuccess: () => {
                    router.push("/credentials");
                },
                onError: () => {
                    toast.error(
                        "Error occurred while creating credential. Please try again later."
                    );
                },
            }
        );
    };

    return (
        <Card className="shadow-none">
            <CardHeader>
                <CardTitle>
                    {isEdit ? "Edit Credential" : "Create Credential"}
                </CardTitle>

                <CardDescription>
                    {isEdit
                        ? "Update your credential details or replace the stored API key."
                        : "Add a new API Key or credential to your account."}
                </CardDescription>
            </CardHeader>

            <CardContent>
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="space-y-6"
                    >
                        {/* NAME */}
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Name</FormLabel>

                                    <FormControl>
                                        <Input
                                            placeholder="My API key"
                                            {...field}
                                        />
                                    </FormControl>

                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* TYPE */}
                        <FormField
                            control={form.control}
                            name="type"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Type</FormLabel>

                                    <Select
                                        disabled={isEdit}
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                    >
                                        <FormControl>
                                            <SelectTrigger className="w-full">
                                                <SelectValue />
                                            </SelectTrigger>
                                        </FormControl>

                                        <SelectContent>
                                            {credentialTypeOptions.map(
                                                (option) => (
                                                    <SelectItem
                                                        key={option.value}
                                                        value={option.value}
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            <Image
                                                                src={option.logo}
                                                                alt={option.label}
                                                                width={16}
                                                                height={16}
                                                            />

                                                            {option.label}
                                                        </div>
                                                    </SelectItem>
                                                )
                                            )}
                                        </SelectContent>
                                    </Select>

                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* API KEY CREDENTIAL */}
                        {config.authType === "API_KEY" && (
                            <>
                                {isEdit && !isChangingApiKey ? (
                                    /*
                                     * EXISTING API KEY
                                     *
                                     * We intentionally DO NOT put the encrypted
                                     * database value into the form.
                                     *
                                     * This is only a visual representation.
                                     */
                                    <div className="space-y-3">
                                        <div className="space-y-2">
                                            <FormLabel>API Key</FormLabel>

                                            <Input
                                                type="password"
                                                value="••••••••••••••••••••"
                                                readOnly
                                            />
                                        </div>

                                        <p className="text-xs text-muted-foreground">
                                            🔒 Your API key is securely encrypted
                                            and stored in the database. It is
                                            not displayed for security reasons.
                                        </p>

                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => {
                                                setIsChangingApiKey(true);

                                                form.setValue(
                                                    "apiKey",
                                                    ""
                                                );

                                                form.clearErrors("apiKey");
                                            }}
                                        >
                                            Change API Key
                                        </Button>
                                    </div>
                                ) : (
                                    /*
                                     * CREATE / CHANGE API KEY
                                     */
                                    <FormField
                                        control={form.control}
                                        name="apiKey"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    {isEdit
                                                        ? "New API Key"
                                                        : "API Key"}
                                                </FormLabel>

                                                <FormControl>
                                                    <Input
                                                        type="password"
                                                        placeholder={
                                                            isEdit
                                                                ? "Enter your new API key"
                                                                : "sk-..."
                                                        }
                                                        autoComplete="new-password"
                                                        {...field}
                                                    />
                                                </FormControl>

                                                {isEdit && (
                                                    <p className="text-xs text-muted-foreground">
                                                        Your new API key will be
                                                        encrypted before being
                                                        stored in the database.
                                                    </p>
                                                )}

                                                <FormMessage />

                                                {isEdit && (
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => {
                                                            setIsChangingApiKey(
                                                                false
                                                            );

                                                            form.setValue(
                                                                "apiKey",
                                                                ""
                                                            );

                                                            form.clearErrors(
                                                                "apiKey"
                                                            );
                                                        }}
                                                    >
                                                        Cancel API Key Change
                                                    </Button>
                                                )}
                                            </FormItem>
                                        )}
                                    />
                                )}
                            </>
                        )}

                        {/* OAUTH CREDENTIAL */}
                        {config.authType === "OAUTH" && (
                            <div className="space-y-3">
                                <div className="space-y-2">
                                    <FormLabel>
                                        Connected Account
                                    </FormLabel>

                                    <Input
                                        disabled
                                        value={
                                            initialData?.email ??
                                            "Connected account"
                                        }
                                    />
                                </div>

                                <p className="text-sm text-muted-foreground">
                                    This credential uses OAuth authentication.
                                    Your OAuth tokens are securely stored and
                                    are not displayed.
                                </p>
                            </div>
                        )}

                        {/* ACTIONS */}
                        <div className="flex gap-4">
                            <Button
                                type="submit"
                                disabled={
                                    createCredential.isPending ||
                                    updateCredential.isPending
                                }
                            >
                                {isEdit ? "Update" : "Create"}
                            </Button>

                            <Button
                                type="button"
                                disabled={
                                    createCredential.isPending ||
                                    updateCredential.isPending
                                }
                                asChild
                            >
                                <Link
                                    href="/credentials"
                                    prefetch
                                >
                                    Cancel
                                </Link>
                            </Button>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
};

export const CredentialView = ({
    credentialId,
}: {
    credentialId: string;
}) => {
    const { data: credential } =
        useSuspenseCredential(credentialId);

    const config = credential.config as {
        email?: string;
    };

    return (
        <CredentialForm
            initialData={{
                id: credential.id,
                name: credential.name,
                type: credential.type,
                apiKey: "",
                email: config.email,
            }}
        />
    );
};