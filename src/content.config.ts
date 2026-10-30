import { defineCollection } from 'astro:content';
import { docsLoader } from '@astrojs/starlight/loaders';
import { docsSchema } from '@astrojs/starlight/schema';
import { z } from 'astro/zod';
import { journeyIds } from './data/journeys';
import { moduleIds } from './data/modules';

const version = z.string().regex(/^v\d+\.\d+\.\d+$/, 'must be a release tag like v0.13.0');

const wordCount = (s: string) => s.trim().split(/\s+/).filter(Boolean).length;

export const docs = defineCollection({
  loader: docsLoader(),
  schema: docsSchema({
    extend: z.object({
      description: z
        .string({ error: 'description is required' })
        .min(1, 'description is required')
        .max(160, 'description must be at most 160 characters'),
      pageType: z.enum(['tutorial', 'how-to', 'reference', 'explanation']),
      audience: z.enum(['user', 'admin', 'developer', 'all']),
      modules: z.array(z.enum(moduleIds)).default([]),
      roles: z.array(z.string()).default([]),
      journey: z.enum(journeyIds).optional(),
      since: version.optional(),
      verifiedAgainst: version.optional(),
      term: z.string().optional(),
      short: z
        .string()
        .refine((s) => wordCount(s) <= 30, 'short must be at most 30 words')
        .optional(),
      aliases: z.array(z.string()).default([]),
      related: z.array(z.string()).default([]),
    }),
  }),
});

export const collections = { docs };
