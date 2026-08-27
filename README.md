# @dnbhq/secretlint-config

Shared Secretlint configuration and CLI wrapper for DNBHQ projects.

This package gives projects one maintained baseline for secret scanning. It installs Secretlint, the recommended Secretlint preset, and a small `dnb-secretlint` command that runs Secretlint with the bundled configuration unless a project supplies its own config.

## Installation

```bash
npm install --save-dev @dnbhq/secretlint-config
```

Consumers do not need to install `secretlint` or `@secretlint/secretlint-rule-preset-recommend` separately. They are direct dependencies of this package.

## Requirements

* Node.js 22 or newer.
* npm.
* ESM when a local `.secretlintrc.js` imports this package.

## Quick start

Most projects should use the wrapper with no local Secretlint config file:

```json
{
  "scripts": {
    "lint:secrets": "dnb-secretlint \"**/*\""
  }
}
```

Then run:

```bash
npm run lint:secrets
```

The wrapper injects the configuration from this package and passes all other arguments to Secretlint.

## Available entry points

| Entry point | Type | Purpose |
| --- | --- | --- |
| `@dnbhq/secretlint-config` | ESM export | Imports the shared Secretlint config object for code-level composition. |
| `@dnbhq/secretlint-config/config` | ESM export | Alias for the shared config object. |
| `@dnbhq/secretlint-config/secretlintrc.json` | JSON config | Secretlint rc file used by the CLI wrapper. |
| `@dnbhq/secretlint-config/secretlintrc` | JSON config | Alias for the Secretlint rc file. |
| `dnb-secretlint` | CLI command | Runs Secretlint with the shared config by default. |

## Shared configuration

The current shared config enables Secretlint's recommended preset:

```js
export default {
  rules: [
    {
      id: "@secretlint/secretlint-rule-preset-recommend"
    }
  ]
};
```

Add centrally required rules in `config/index.js` and add their packages to `dependencies` in `package.json`. Keep consumer-only development tools in `devDependencies`.

## CLI wrapper behaviour

`dnb-secretlint` forwards its arguments to Secretlint. When no explicit config argument is present, it prepends this package's bundled config with Secretlint's `--secretlintrc` flag.

These commands are equivalent in a consuming project:

```bash
dnb-secretlint "**/*"
secretlint --secretlintrc ./node_modules/@dnbhq/secretlint-config/config/secretlintrc.json "**/*"
```

The wrapper leaves project-supplied config arguments untouched. These options take precedence over the bundled config:

| Argument | Behaviour |
| --- | --- |
| `--secretlintrc .secretlintrc.js` | Uses the named Secretlint config file. |
| `--secretlintrc=.secretlintrc.js` | Uses the named Secretlint config file. |
| `--secretlintrcJSON '{...}'` | Uses inline Secretlint JSON config. |
| `--secretlintrcJSON={...}` | Uses inline Secretlint JSON config. |

Other Secretlint options are passed through unchanged, for example:

```bash
dnb-secretlint --format compact "src/**/*"
dnb-secretlint --no-glob README.md package.json
dnb-secretlint --maskSecrets "**/*"
```

## Local configuration

Use a local config only when a repository needs to differ from the shared defaults.

For static configuration, use JSON:

```json
{
  "rules": [
    {
      "id": "@secretlint/secretlint-rule-preset-recommend"
    }
  ]
}
```

For code-level composition, import the package from an ESM file and export the final descriptor your own tooling will pass to Secretlint:

```js
import baseConfig from "@dnbhq/secretlint-config";

export default {
  ...baseConfig,
  rules: [
    ...baseConfig.rules
    // Add project-specific rules here.
  ]
};
```

Then either run Secretlint directly with the JSON file:

```json
{
  "scripts": {
    "lint:secrets": "secretlint --secretlintrc .secretlintrc.json \"**/*\""
  }
}
```

Or keep the wrapper and point it at the local file:

```json
{
  "scripts": {
    "lint:secrets": "dnb-secretlint --secretlintrc .secretlintrc.json \"**/*\""
  }
}
```

## Extending rules

Secretlint config uses a `rules` array. To add a project-specific rule, install the rule package in the consuming project and append it after the base rules:

```js
import baseConfig from "@dnbhq/secretlint-config";

export default {
  ...baseConfig,
  rules: [
    ...baseConfig.rules,
    {
      id: "@secretlint/secretlint-rule-example",
      options: {
        example: true
      }
    }
  ]
};
```

To replace the central rule set completely, omit `...baseConfig.rules`. Do that only when the project intentionally opts out of the DNBHQ baseline.

## Ignoring files

Secretlint supports its normal ignore behaviour. Prefer a project-local ignore file when generated files, lock files, fixtures, or vendored content cause noise.

Example:

```bash
dnb-secretlint --secretlintignore .secretlintignore "**/*"
```

For lint-staged, pass staged file names directly and disable glob expansion:

```json
{
  "lint-staged": {
    "*.{js,json,md,yml,yaml,txt}": "dnb-secretlint --no-glob"
  }
}
```

## Repository scripts

This repository uses the same maintenance shape as the other DNBHQ shared config packages:

| Script | Purpose |
| --- | --- |
| `npm run lint` | Runs code, Markdown, and secret linting. |
| `npm run lint:code` | Runs Biome with the shared DNBHQ Biome config. |
| `npm run lint:code:fix` | Runs Biome in write mode. |
| `npm run lint:markdown` | Checks Markdown with `@dnbhq/markdownlint-config`. |
| `npm run lint:markdown:fix` | Fixes Markdown where markdownlint can safely fix it. |
| `npm run lint:secrets` | Runs this package's CLI wrapper against repository source files. |
| `npm run lint:staged` | Runs lint-staged for staged files. |
| `npm test` | Runs the Node.js test suite. |
| `npm run check` | Runs all linting, tests, and a dry npm pack. |
| `npm run release:dry` | Runs release-it without publishing, tagging, or pushing. |
| `npm run release` | Creates the release commit and tag through release-it. |

## Commit checks

The repository uses `simple-git-hooks` and `lint-staged`.

Install dependencies to activate the hook:

```bash
npm install
```

The pre-commit hook runs:

```bash
npx lint-staged --allow-empty
```

Staged JavaScript, JSON, YAML, Markdown, and text-like files are checked with Biome, markdownlint, and this package's Secretlint wrapper as applicable.

## Continuous integration

`.github/workflows/pr.yml` runs `npm run check` on push and pull request events with Node.js 22, 24, and 26.

`.github/workflows/publish.yml` runs when a `v*` tag is pushed. It checks out the tag, installs dependencies with `npm ci`, verifies that the tag matches `package.json` `version`, runs `npm run check`, and publishes the package to npm with provenance.

## Release

Releases use `release-it` and `@dnbhq/release-config`.

Dry run:

```bash
npm run release:dry
```

Release from `main`:

```bash
npm run release
```

The release command:

* determines the version bump from Conventional Commits,
* updates `CHANGELOG.md` when release-it creates the release commit,
* creates a `chore(release): v${version}` commit,
* creates a `v${version}` tag,
* pushes the commit and tag, and
* creates the GitHub release.

The local release configuration does not publish to npm. npm publishing is handled by the GitHub Actions publish workflow after the release tag is pushed.

The release config uses `GITHUB_DNBHQ_TOKEN_ADMIN_PRIVATE` for GitHub release access.

## Npm package contents

The package publishes:

* `bin/` - the `dnb-secretlint` executable.
* `config/index.js` - the ESM config export.
* `config/secretlintrc.json` - the Secretlint rc file used by the wrapper.
* `README.md` - package documentation.
* `CHANGELOG.md` - generated release history, when present.
* `LICENSE.md` - MIT licence.

Check package contents locally with:

```bash
npm pack --dry-run
```

## Development

Install dependencies:

```bash
npm install
```

Run the full check:

```bash
npm run check
```

Run only the test suite:

```bash
npm test
```
