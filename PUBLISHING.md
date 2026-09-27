# One-time publishing setup

The workflows and package metadata are configured in this repository. The following account settings need an owner or npm organization administrator:

1. Push the repository to its `main` branch and confirm the `@gratise` npm organization can publish the public package `@gratise/i18n`. The public npm registry currently returns 404 for this package, so its name and scope permissions must be verified before the first release.
2. If the package has not been created yet, publish its first version interactively from the repository after reviewing `npm pack --dry-run`. Then open the package settings on npmjs.com and add a GitHub Actions trusted publisher with organization `gratise`, repository `i18n`, workflow filename `release.yml`, and direct `npm publish` permission enabled. The release workflow uses OIDC and does not need a long-lived npm token.
3. In GitHub repository settings, set **Pages → Build and deployment → Source** to **GitHub Actions**. The docs workflow then deploys `apps/docs` on changes to `main`.

After this setup, merge a Changesets version pull request to publish a package release. npm trusted publishing needs npm CLI 11.5.1 or newer and Node 22.14 or newer; the workflow uses Node 26. See [npm's trusted publishing guide](https://docs.npmjs.com/trusted-publishers/) for the current account UI and requirements.
