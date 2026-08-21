import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '@oryn/database';
import { asStr, asyncHandler, sendData } from '../../common/http.js';
import { requireAuth, type AuthRequest } from '../../middleware/auth.js';

const schema = z.object({
    label: z.string().min(1).max(40),
    firstName: z.string().min(1).max(80),
    lastName: z.string().min(1).max(80),
    line1: z.string().min(1).max(180),
    line2: z.string().max(180).optional(),
    city: z.string().min(1).max(80),
    state: z.string().max(80).optional(),
    postalCode: z.string().min(2).max(20),
    country: z.string().min(2).max(80),
    phone: z.string().min(7).max(30),
    isDefault: z.boolean().default(false),
});

export const addressesRouter = Router() as ReturnType<typeof Router>;
addressesRouter.use(requireAuth);

// GET /addresses - List all addresses for the authenticated user
addressesRouter.get(
    '/',
    asyncHandler(async (req, res) => {
        const userId = (req as AuthRequest).user!.id;
        const addresses = await prisma.address.findMany({
            where: { userId },
            orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
        });
        sendData(res, addresses);
    })
);

// POST /addresses - Create a new address
addressesRouter.post(
    '/',
    asyncHandler(async (req, res) => {
        const userId = (req as AuthRequest).user!.id;
        const input = schema.parse(req.body);

        const address = await prisma.$transaction(async (tx) => {
            if (input.isDefault) {
                await tx.address.updateMany({
                    where: { userId },
                    data: { isDefault: false },
                });
            }
            return tx.address.create({
                data: { ...input, userId },
            });
        });

        sendData(res, address, 201);
    })
);

// PATCH /addresses/:id - Update an existing address
addressesRouter.patch(
    '/:id',
    asyncHandler(async (req, res) => {
        const userId = (req as AuthRequest).user!.id;
        const input = schema.partial().parse(req.body);

        const address = await prisma.address.findFirst({
            where: { id: asStr(req.params.id), userId },
        });

        if (!address) {
            return res.status(404).json({
                error: {
                    code: 'ADDRESS_NOT_FOUND',
                    message: 'Address not found.',
                },
            });
        }

        const updated = await prisma.$transaction(async (tx) => {
            if (input.isDefault) {
                await tx.address.updateMany({
                    where: { userId },
                    data: { isDefault: false },
                });
            }
            return tx.address.update({
                where: { id: address.id },
                data: input,
            });
        });

        sendData(res, updated);
    })
);

// DELETE /addresses/:id - Remove an address
addressesRouter.delete(
    '/:id',
    asyncHandler(async (req, res) => {
        const userId = (req as AuthRequest).user!.id;
        await prisma.address.deleteMany({
            where: { id: asStr(req.params.id), userId },
        });
        res.status(204).send();
    })
);