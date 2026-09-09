import { z } from "zod";

export const projectInput = z.object({
  name: z.string().trim().min(1).max(120),
  slug: z.string().trim().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(120),
  description: z.string().trim().min(1).max(2000),
  problem: z.string().trim().max(5000).optional(),
  solution: z.string().trim().max(5000).optional(),
  features: z.string().trim().max(10000).optional(),
  contribution: z.string().trim().max(5000).optional(),
  impact: z.string().trim().max(5000).optional(),
  challenges: z.string().trim().max(5000).optional(),
  lessons: z.string().trim().max(5000).optional(),
  githubUrl: z.string().url().max(500).optional().or(z.literal("")),
  liveUrl: z.string().url().max(500).optional().or(z.literal("")),
  featured: z.boolean().default(false),
});

export const contactInput = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.string().email().max(320),
  company: z.string().trim().max(150).optional(),
  role: z.string().trim().max(150).optional(),
  message: z.string().trim().min(10).max(5000),
});
