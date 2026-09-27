# Publishing

The public package [`@gratise/i18n`](https://www.npmjs.com/package/@gratise/i18n) is published on npm. The npm Trusted Publisher is configured for GitHub Actions in `gratise/i18n`, workflow `release.yml`, with direct `npm publish` permission. Releases use OIDC provenance and do not need a long-lived npm token.

To prepare a release, add a Changesets entry with `pnpm changeset` and merge it to `main`. The release workflow runs the quality checks, applies package versions and changelogs, commits the version update, and publishes the package. Changesets prerelease mode is also available.

GitHub Pages uses **GitHub Actions** as its source and deploys the docs app from `apps/docs`.
