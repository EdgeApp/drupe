# drupe

> Tiny helper that lets you run [Mango selectors](https://docs.couchdb.org/en/stable/api/database/find.html#selector-syntax) anywhere you need a JavaScript predicate.

`drupe` is inspired by the ergonomics of [`sift`](https://github.com/crcn/sift.js) but speaks Mango—the JSON-based query language used by CouchDB and PouchDB. Pass a Mango selector in and get back a function that tests plain JavaScript objects, arrays, or any iterable source.

## Why drupe?

- Reuse the same Mango selectors you ship to CouchDB/PouchDB on the client or in tests.
- Drop into `Array.prototype.filter`, `find`, or any higher-order utility—no extra plumbing required.
- Ships as a single function that delegates to PouchDB’s battle-tested `matchesSelector` implementation.
- Zero configuration, fully typed, and framework/runtime agnostic.

## Installation

Install from JSR:

```bash
# npm, bun, and older versions of yarn or pnpm
npx jsr add @holmes/drupe
```

## Quick start

```ts
import { drupe } from 'drupe'

const isPublishedTechArticle = drupe({
  type: 'article',
  publishedAt: { $exists: true },
  tags: { $in: ['databases', 'javascript'] }
})

const articles = [
  { type: 'article', slug: 'mango-101', tags: ['databases'], publishedAt: '2024-05-02' },
  { type: 'article', slug: 'draft-post', tags: ['javascript'] },
  { type: 'note', slug: 'retro' }
]

const published = articles.filter(isPublishedTechArticle)
// -> [{ type: 'article', slug: 'mango-101', tags: ['databases'], publishedAt: '2024-05-02' }]
```

The same selector you use in a `db.find()` call now works as an in-memory predicate.

## More examples

All Mango selector operators are supported because `drupe` simply forwards to PouchDB’s selector engine. For a full reference, see the PouchDB guide on [Mango queries](https://pouchdb.com/guides/mango-queries.html) and the CouchDB documentation linked above.

```ts
import { drupe } from 'drupe'

const isHighValueCustomer = drupe({
  $and: [
    { spend: { $gte: 1000 } },
    { status: { $in: ['gold', 'platinum'] } }
  ]
})

const customers = [
  { name: 'Ada', spend: 3200, status: 'platinum' },
  { name: 'Lin', spend: 840, status: 'gold' },
  { name: 'Edsger', spend: 1500, status: 'silver' }
]

customers.filter(isHighValueCustomer)
// -> [{ name: 'Ada', spend: 3200, status: 'platinum' }]
```

You can also use `$not`, `$regex`, `$size`, `$elemMatch`, and any other Mango operator:

```ts
const containsLargeAttachment = drupe({
  attachments: {
    $elemMatch: {
      content_type: { $regex: '^image/' },
      length: { $gt: 1_000_000 }
    }
  }
})

docs.filter(containsLargeAttachment)
```

## API

```ts
const predicate = drupe(selector)
predicate(document) // -> boolean
```

- `selector` – Any valid Mango selector object.
- Returns a predicate function that can be reused across collections, iterables, or bespoke logic.

TypeScript: The exported signature is intentionally loose—`(selector: any) => (subject: unknown) => boolean`—so you can refine the shape that makes sense for your app.

## How it works

`drupe` is intentionally tiny:

```ts
import { matchesSelector } from 'pouchdb-selector-core'

export const drupe = (selector: any) => (subject: unknown) => {
  return matchesSelector(subject, selector)
}
```

When you call `drupe(selector)`, it defers entirely to `matchesSelector`, the same function PouchDB uses internally to evaluate Mango selectors. That means:

- Behaviour matches CouchDB/PouchDB exactly (including quirks and edge cases).
- New Mango features arrive as soon as they land in `pouchdb-selector-core`.
- There is no custom query engine to maintain.

## Related resources

- CouchDB Mango selector reference: <https://docs.couchdb.org/en/stable/api/database/find.html>
- PouchDB Mango query guide: <https://pouchdb.com/guides/mango-queries.html>
- Inspiration: `sift` lets you filter arrays with MongoDB selectors—check it out at <https://github.com/crcn/sift.js>

## License

MIT © Sam Holmes
