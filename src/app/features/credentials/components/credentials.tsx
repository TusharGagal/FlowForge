"use client"
import { EmptyView, EntityContainer, EntityHeader, EntityList, EntityListItem, EntityPagination, EntitySearch, ErrorView, LoadingView } from "@/components/entity-components";
import { useRouter } from "next/navigation";
import { useRemoveCredential, useSuspenseCredentials } from "../hooks/useCredentials";
import { useEntitySearch } from "@/hooks/use-entity-search";
import { Credential } from "@/generated/prisma/client"
import type { CredentialType } from "@/generated/prisma/client";
import { formatDistanceToNow } from 'date-fns';
import { useCredentialsParams } from "../hooks/useCredentials-params";
import Image from "next/image";

export const CredentialsSearch = () => {
    const [params, setParams] = useCredentialsParams();
    const { searchValue, onSearchChange } = useEntitySearch({ params, setParams });
    return (
        <EntitySearch
            value={searchValue}
            onChange={onSearchChange}
            placeholder="Search Credentials"
        />
    )
}

export const CredentialsList = () => {
    const credentials = useSuspenseCredentials();
    return (
        <EntityList
            items={credentials.data.items}
            getKey={(credential) => credential.id}
            renderItems={(credential) => <CredentialItem data={credential} />}
            emptyView={<CredentialsEmpty />}
        />

    )
}

export const CredentialsHeader = ({ disabled }: { disabled?: boolean }) => {

    return (
        <EntityHeader
            title="Credentials"
            description="Create and manage your Credentials"
            newButtonLabel="New Credential"
            newButtonHref="/credentials/new"
            disabled={disabled}
        />
    )
}

export const CredentialsPagination = () => {
    const credentials = useSuspenseCredentials();
    const [params, setParams] = useCredentialsParams();
    return (
        <EntityPagination
            disabled={credentials.isFetching}
            totalPages={credentials.data.totalPages}
            page={credentials.data.page}
            onPageChange={(page) => setParams({ ...params, page })}
        />
    )
}

export const CredentialsContainer = ({ children }: { children: React.ReactNode }) => {
    return (
        <EntityContainer
            header={<CredentialsHeader />}
            search={<CredentialsSearch />}
            pagination={<CredentialsPagination />}
        >
            {children}
        </EntityContainer>
    )
}

export const CredentialsLoading = () => {
    return (
        <LoadingView message="Loading Credential..." />
    )
}

export const CredentialsError = () => {
    return (
        <ErrorView message="Error while loading Credential!!" />
    )
}

export const CredentialsEmpty = () => {
    const router = useRouter();
    const handleCreate = () => {
        router.push(`/credentials/new`)
    }
    return (

        <EmptyView
            message="No Credentials found. Create a new credential or adjust your search to get started."
            onNew={handleCreate}
        />

    )
}

const credentialLogos: Record<CredentialType, string> = {
    OPENAI: "/logos/openai.svg",
    ANTHROPIC: "/logos/anthropic.svg",
    GEMINI: "/logos/gemini.svg",
};

export const CredentialItem = ({ data }: { data: Credential }) => {
    const removeCredential = useRemoveCredential();
    const handleRemove = () => {
        removeCredential.mutate({ id: data.id });
    }

    const logo = credentialLogos[data.type] || "/logos/openai.svg";
    return (
        <EntityListItem
            href={`/credentials/${data.id}`}
            title={data.name}
            subtitle={
                <>
                    updated {formatDistanceToNow(data.updatedAt, { addSuffix: true })}{" "}
                    ~ Created {formatDistanceToNow(data.createdAt, { addSuffix: true })}{" "}
                </>
            }
            image={<div className="size-8 flex items-center justify-center">
                <Image src={logo} alt={data.type} width={20} height={20} />
            </div>}
            onRemove={handleRemove}
            isRemoving={removeCredential.isPending}
        />
    )
}