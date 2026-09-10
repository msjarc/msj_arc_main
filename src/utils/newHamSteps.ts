import { getCollection } from 'astro:content'

export type NewHamStep = {
  slug: string
  href: string
  title: string
  description: string
  icon: string
}

export const newHamHubLabel = 'New Ham?'

export async function getNewHamSteps(): Promise<NewHamStep[]> {
  const entries = await getCollection('newham')

  return entries
    .sort((a, b) => a.data.order - b.data.order)
    .map((entry) => ({
      slug: entry.id,
      href: `/newham/${entry.id}`,
      title: entry.data.title,
      description: entry.data.description,
      icon: entry.data.icon,
    }))
}

export type NewHamStepContext = {
  current: NewHamStep
  index: number
  stepNumber: number
  total: number
  prev: NewHamStep | null
  next: NewHamStep | null
}

export function getNewHamStepContext(steps: NewHamStep[], slug: string): NewHamStepContext {
  const index = steps.findIndex((step) => step.slug === slug)

  if (index === -1) {
    throw new Error(`Unknown New Ham step: "${slug}"`)
  }

  return {
    current: steps[index],
    index,
    stepNumber: index + 1,
    total: steps.length,
    prev: index > 0 ? steps[index - 1] : null,
    next: index < steps.length - 1 ? steps[index + 1] : null,
  }
}

export function getNewHamBreadcrumbLabels(steps: NewHamStep[]): Record<string, string> {
  return {
    newham: newHamHubLabel,
    ...Object.fromEntries(steps.map((step) => [step.slug, step.title])),
  }
}
