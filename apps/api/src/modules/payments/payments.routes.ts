import { Router, type Router as RouterType } from 'express';
import { z } from 'zod';
import { prisma } from '@oryn/database';
import { AppError, asStr, asyncHandler, sendData } from '../../common/http.js';
import { requireAuth, type AuthRequest } from '../../middleware/auth.js';

export const paymentsRouter: RouterType = Router();
paymentsRouter.use(requireAuth);

// POST /payments/:orderId/mock - Process a mock payment
paymentsRouter.post(
    '/:orderId/mock',
    asyncHandler(async (req, res) => {
        const input = z.object({
            outcome: z.enum(['success', 'failure']).default('success')
        }).parse(req.body);

        const order = await prisma.order.findFirst({
            where: {
                id: asStr(req.params.orderId),
                userId: (req as AuthRequest).user!.id
            },
            include: { payment: true }
        });

        if (!order?.payment) {
            throw new AppError(404, 'PAYMENT_NOT_FOUND', 'Payment not found.');
        }

        // If already paid and success, return early
        if (order.payment.status === 'PAID' && input.outcome === 'success') {
            sendData(res, order.payment);
            return;
        }

        const status = input.outcome === 'success' ? 'PAID' : 'FAILED';

        const updated = await prisma.$transaction(async (tx) => {
            // Update payment status
            const payment = await tx.payment.update({
                where: { id: order.payment!.id },
                data: { status }
            });

            // Create transaction record
            await tx.paymentTransaction.create({
                data: {
                    paymentId: payment.id,
                    providerReference: `mock_${Date.now()}`,
                    status,
                    amount: payment.amount,
                    metadata: { mode: 'mock' }
                }
            });

            // Handle success or failure
            if (status === 'PAID') {
                // Update order status
                await tx.order.update({
                    where: { id: order.id },
                    data: {
                        paymentStatus: 'PAID',
                        status: 'CONFIRMED'
                    }
                });

                // Create order status history
                await tx.orderStatusHistory.create({
                    data: {
                        orderId: order.id,
                        status: 'CONFIRMED',
                        note: 'Mock payment accepted; order confirmed.'
                    }
                });

                // Send success notification
                await tx.notification.create({
                    data: {
                        userId: order.userId,
                        type: 'ORDER_UPDATE',
                        title: 'Order confirmed',
                        body: 'Your payment was accepted and your order is confirmed.',
                        deepLink: `/orders/${order.id}`
                    }
                });
            } else {
                // Send failure notification
                await tx.notification.create({
                    data: {
                        userId: order.userId,
                        type: 'ORDER_UPDATE',
                        title: 'Payment failed',
                        body: 'Your payment could not be completed. Please try again.',
                        deepLink: `/orders/${order.id}`
                    }
                });
            }

            return payment;
        });

        sendData(res, updated);
    })
);