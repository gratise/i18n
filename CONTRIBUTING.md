# Contributing

## Commits and changesets

Use Conventional Commits: `feat: add locale fallback`, `fix: isolate SSR locale state`, `docs: explain ICU messages`, or `chore: update Rspack`. Local Git hooks validate commit messages and run Prettier/ESLint on staged files.

Add a Changeset for every user-visible package change:

```sh
pnpm changeset
```

Choose patch for fixes, minor for backward-compatible features, and major for breaking API changes. Documentation-only edits do not need a package changeset.

## Before opening a pull request

Run `pnpm format:check`, `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build`, `pnpm --filter @gratise/i18n-docs build`, and `pnpm --filter @gratise/example-ssr example`. Add or update tests for behavioral changes. GitHub Actions repeats these checks on Node 24 and 26.

## Releases and documentation

Merging a pull request with a Changeset lets the release workflow open a version pull request. Merging that version pull request publishes the package. Pushes to `main` build and deploy `apps/docs` to GitHub Pages.
