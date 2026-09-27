# One-time publishing setup

The workflows and package metadata are configured in this repository. The following account settings need an owner or npm organization administrator:

1. Publish the first version of `@gratise/i18n` from `packages/i18n` after reviewing `pnpm --filter @gratise/i18n pack --dry-run`: `npm publish --access public --provenance=false`. npm may require the account owner's one-time password for this initial publish.
2. After the first release creates the package, open its settings on npmjs.com and add a GitHub Actions trusted publisher with organization `gratise`, repository `i18n`, workflow filename `release.yml`, and direct `npm publish` permission enabled. The release workflow uses OIDC and does not need a long-lived npm token.
3. In GitHub repository settings, set **Pages → Build and deployment → Source** to **GitHub Actions**. This repository is already configured to deploy `apps/docs` on documentation or library source changes on `main`.

Changesets entries merged to `main` are versioned and published by the release workflow. npm trusted publishing needs npm CLI 11.5.1 or newer and Node 22.14 or newer; the workflow uses Node 26. See [npm's trusted publishing guide](https://docs.npmjs.com/trusted-publishers/) for the current account UI and requirements.
