import prisma from "@/lib/db";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import z from "zod/v3";
import { PAGINATION } from "@/config/constants";
import { CredentialType } from "@/generated/prisma/enums";

export const credentialsRouter = createTRPCRouter({
    create: protectedProcedure.input
        (z.object({
            name: z.string().min(1, "Name is required"),
            value: z.string().min(1, "Value is required"),
            type: z.nativeEnum(CredentialType)
        })).mutation(({ ctx, input }) => {
            const { name, value, type } = input;
            return prisma.credential.create({
                data: {
                    name,
                    userId: ctx.auth.user.id,
                    type,
                    value, //TODO: Encrypt values in production
                }
            });
        }),
    remove: protectedProcedure.input(z.object({ id: z.string() })).mutation(({ ctx, input }) => {
        return prisma.credential.delete({
            where: {
                id: input.id,
                userId: ctx.auth.user.id
            }
        });
    }),
    update: protectedProcedure
        .input(z.object({
            id: z.string(),
            name: z.string().min(1, "Name is required"),
            type: z.nativeEnum(CredentialType),
            value: z.string().min(1, "Value is required"),
        })).mutation(async ({ ctx, input }) => {
            const { id, name, type, value } = input;
            return prisma.credential.update({
                where: { id, userId: ctx.auth.user.id },
                data: {
                    name,
                    type,
                    value, //TODO: Encrypt values in production
                }
            })
        }),
    getOne: protectedProcedure.input(z.object({ id: z.string() })).query(async ({ ctx, input }) => {
        return prisma.credential.findUniqueOrThrow({
            where: { id: input.id, userId: ctx.auth.user.id },
        })

    }),
    getMany: protectedProcedure.input(
        z.object({
            page: z.number().default(PAGINATION.DEFAULT_PAGE),
            pageSize: z.number().min(PAGINATION.MIN_PAGE_SIZE).max(PAGINATION.MAX_PAGE_SIZE).default(PAGINATION.DEFAULT_PAGE_SIZE),
            search: z.string().default(""),
        })
    ).query(async ({ ctx, input }) => {
        const { page, pageSize, search } = input;
        const [items, totalCount] = await Promise.all([prisma.credential.findMany({
            skip: (page - 1) * pageSize,
            take: pageSize,
            where: {
                userId: ctx.auth.user.id,
                name: {
                    contains: search,
                    mode: "insensitive"
                },
            },
            orderBy: {
                updatedAt: "desc"
            },
        }),
        prisma.credential.count({
            where: {
                userId: ctx.auth.user.id,
                name: {
                    contains: search,
                    mode: "insensitive"
                },
            }
        })
        ]);

        const totalPages = Math.ceil(totalCount / pageSize);
        const hasNextPage = page < totalPages;
        const hasPreviousPage = page > 1;
        return {
            items,
            page,
            pageSize,
            totalPages,
            totalCount,
            hasNextPage,
            hasPreviousPage,
        }
    }),
    getByType: protectedProcedure.input(z.object({ type: z.nativeEnum(CredentialType) })).query(async ({ ctx, input }) => {
        return prisma.credential.findMany({
            where: {
                userId: ctx.auth.user.id,
                type: input.type,
            },
            orderBy: {
                updatedAt: "desc"
            }
        });
    }),

})