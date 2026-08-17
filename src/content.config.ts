// 1. Import utilities from `astro:content`
import { defineCollection, reference, z } from 'astro:content'

// 2. Import loader(s)
import { glob } from 'astro/loaders'

const coverFocus = z
  .object({
    x: z.number().min(0).max(100).default(50),
    y: z.number().min(0).max(100).default(50),
  })
  .nullish()
  .transform((value) => value ?? { x: 50, y: 50 })

// 3. Define your collection(s)
const authors = defineCollection({
  loader: glob({ base: './src/data/authors', pattern: '**/*.json' }),
  schema: z.object({
    title: z.string(),
    bio: z.string().optional(),
    image: z.string().optional(),
  }),
})

const blog = defineCollection({
  loader: glob({ base: './src/content/blog', pattern: '**/*.{md,mdx}' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      author: reference('authors'),
      description: z.string(),
      pubDate: z.coerce.date(),
      tags: z.array(z.string()).default([]),
      cover: image().optional(),
      coverAlt: z.string().optional(),
      coverFocus,
    }),
})

const activities = defineCollection({
  loader: glob({ base: './src/content/activities', pattern: '**/*.{md,mdx}' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      author: reference('authors'),
      description: z.string(),
      tags: z.array(z.string()).default([]),
      cover: image().optional(),
      coverAlt: z.string().optional(),
      coverFocus,
    }),
})

// 4. Export a single `collections` object to register your collection(s)
export const collections = { authors, blog, activities }
