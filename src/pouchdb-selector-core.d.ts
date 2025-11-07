declare module 'pouchdb-selector-core' {
  export function matchesSelector(
    subject: unknown,
    selector: import('./types').MangoSelector
  ): boolean
}
