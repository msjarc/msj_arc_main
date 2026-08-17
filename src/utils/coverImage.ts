import type { ImageMetadata } from 'astro'
import defaultCover from '@assets/images/posts/post-image-1.png'

export type CoverFocus = {
  x?: number
  y?: number
}

export type CoverData = {
  cover?: ImageMetadata
  coverAlt?: string
  coverFocus?: CoverFocus
}

const CARD_IMAGE_WIDTH = 640

export function getCoverPosition(focus?: CoverFocus): string {
  return `${focus?.x ?? 50}% ${focus?.y ?? 50}%`
}

/**
 * Card image props that preserve the source aspect ratio so Sharp does not
 * bake a center crop. CSS object-fit + --cover-position frames the subject.
 */
export function getCoverProps(data: CoverData) {
  const src = data.cover ?? defaultCover

  return {
    src,
    alt: data.coverAlt ?? '',
    width: CARD_IMAGE_WIDTH,
    height: Math.round((CARD_IMAGE_WIDTH * src.height) / src.width),
    style: `--cover-position: ${getCoverPosition(data.coverFocus)}`,
  }
}

export { defaultCover }
