// 1. Import utilities from `astro:content`
import { defineCollection, reference, z } from 'astro:content'

// 2. Import loader(s)
import { glob } from 'astro/loaders'

// 3. Define your collection(s)
const authors = defineCollection({
  loader: glob({ base: './src/data/authors', pattern: '**/*.json' }),
  schema: z.object({
    title: z.string(),
    bio: z.string().optional(),
    image: z.string().optional(),
  })

})

const blog = defineCollection({
  loader: glob({ base: './src/content/blog', pattern: '**/*.{md,mdx}' }),
  schema: z.object({
    title: z.string(),
    author: reference('authors'),
    description: z.string(),
    pubDate: z.coerce.date(),
    // updatedDate: z.coerce.date().optional(),
    tags: z.array(z.string()).default([]),
  })
})

const activities = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/activities' }),
  schema: z.object({
    title: z.string(),
    author: reference('authors'),
    description: z.string(),
    tags: z.array(z.string()).default([]),
  }),
})

// 4. Export a single `collections` object to register you collection(s)
export const collections = { authors, blog, activities }
