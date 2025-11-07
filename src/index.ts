import { matchesSelector } from 'pouchdb-selector-core'
import type { MangoSelector } from './types'

export const drupe = (selector: MangoSelector) => (subject: unknown): boolean => {
  return matchesSelector(subject, selector)
}

export type { MangoSelector } from './types'

