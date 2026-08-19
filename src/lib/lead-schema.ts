import { z } from "zod";

export const leadSchema = z.object({
  name: z.string().trim().min(2).max(120),
  phone: z.string().trim().min(7).max(24).regex(/^\+?[\d\s()-]{7,}$/),
  email: z.string().trim().email().max(160).optional().or(z.literal("")),
  country: z.string().trim().max(8).optional(),
  interest_level: z.enum(["associate", "bachelor", "master", "phd"]).optional(),
  desired_major: z.string().trim().max(160).optional(),
  budget_usd: z.number().int().min(0).max(200000).optional(),
  message: z.string().trim().max(2000).optional(),
  source_page: z.string().max(300).optional(),
  locale: z.string().max(5).optional(),
  // honeypot
  website: z.string().max(0).optional(),
});

export type LeadInput = z.infer<typeof leadSchema>;
