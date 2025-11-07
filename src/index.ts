import { matchesSelector } from 'pouchdb-selector-core'
import type { Drupe } from './types'

export const drupe: Drupe = (selector)=> (subject)=> {
  return matchesSelector(subject, selector)
}

export type { MangoSelector } from './types'

