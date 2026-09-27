# One-time publishing setup

The workflows and package metadata are configured in this repository. The following account settings need an owner or npm organization administrator:

1. Confirm the `@gratise` npm organization can publish the public package `@gratise/i18n`.
2. After the first release creates the package, open its settings on npmjs.com and add a GitHub Actions trusted publisher with organization `gratise`, repository `i18n`, workflow filename `release.yml`, and direct `npm publish` permission enabled. The release workflow uses OIDC and does not need a long-lived npm token.
3. In GitHub repository settings, set **Pages → Build and deployment → Source** to **GitHub Actions**. This repository is already configured to deploy `apps/docs` on documentation or library source changes on `main`.

The initial Changesets version pull request publishes the first package version; later version pull requests publish updates. npm trusted publishing needs npm CLI 11.5.1 or newer and Node 22.14 or newer; the workflow uses Node 26. See [npm's trusted publishing guide](https://docs.npmjs.com/trusted-publishers/) for the current account UI and requirements.
