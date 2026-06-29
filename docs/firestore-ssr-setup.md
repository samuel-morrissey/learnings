# Firestore + SSR — setup (tracer bullet)

This is the manual, one-time cloud setup that the tracer-bullet slice (issue #22)
depends on but cannot provision itself. It realizes [ADR 0005](./adr/0005-aulas-no-firestore-com-astro-ssr.md).
The code is already in place; these steps wire it to a real Firebase project.

The slice proves a single end-to-end path: one Lesson, hand-seeded into Firestore,
rendered at `/live/<course>/<lesson>` by Astro SSR — content from the database,
not from a file or the build.

## 1. Firebase project (Blaze plan)

App Hosting runs on Cloud Run, so it needs the **Blaze** (pay-as-you-go) plan.

1. Create (or pick) a Firebase project in the console.
2. Upgrade billing to **Blaze**.
3. Enable **Firestore** (Native mode) and create the database.

## 2. Two service accounts, by role (ADR 0005 / 0006)

The web surface is **read-only**; the only writer is the local MCP server.

| Role | Used by | Permission |
| --- | --- | --- |
| Read-only | SSR (this app) | `roles/datastore.viewer` |
| Read/write | MCP server + seed script | `roles/datastore.user` |

For each, create a service account in Google Cloud IAM, grant the role above, and
download a JSON key. Keep both under `secrets/` (git-ignored).

In production, **App Hosting injects the runtime service account** via Application
Default Credentials — no key file is shipped. Grant `roles/datastore.viewer` to the
App Hosting runtime service account and leave `FIRESTORE_SA_KEY` unset there.

## 3. Lock the client out with Security Rules

Only the Admin SDK (server side) should ever touch Firestore. Deny all client
access:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} { allow read, write: if false; }
  }
}
```

## 4. Seed one Lesson

With the **read/write** key:

```sh
FIRESTORE_ADMIN_KEY=./secrets/admin.sa.json npm run seed:firestore
```

This writes `courses/demo` and `courses/demo/lessons/0001-bala-tracadora`
(Frontmatter as fields, body as `mdx`, `esbocos: []`).

## 5. Run the SSR app locally

With the **read-only** key:

```sh
npm run build
FIRESTORE_SA_KEY=./secrets/readonly.sa.json node ./dist/server/entry.mjs
# visit http://localhost:4321/live/demo/0001-bala-tracadora
```

`astro dev` works the same way once `FIRESTORE_SA_KEY` is exported. The Lesson
renders with the ported **Callout** Component — proof the circuit is closed.

## 6. Deploy to Firebase App Hosting

1. `firebase init apphosting` (or create a backend in the console) pointed at this
   repo / branch.
2. Ensure the backend's runtime service account has `roles/datastore.viewer`.
3. Push — App Hosting builds Astro (Node adapter, standalone) and serves it on
   Cloud Run. The Lesson URL is public, no login.

## Scope of this slice

Happy path only. **Not** yet here (later slices of PRD #21): zod validation +
per-block fallback, the Esboço binding (`esbocos[]` → bundled map), the full
Preact Catalog, Firestore-backed listings, the MCP write server, and the
one-shot migration of the existing `.mdx` Lessons. The existing static pages
still prerender from the filesystem (`export const prerender = true`).
