import { z } from "zod";

export const SubscriptionStatusSchema = z.enum([
  "active",
  "past_due",
  "canceled",
  "unpaid",
  "trialing",
]);

export const UserPayloadSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  stripeCustomerId: z.string().optional(),
});

export type SubscriptionStatus = z.infer<typeof SubscriptionStatusSchema>;
export type UserPayload = z.infer<typeof UserPayloadSchema>;