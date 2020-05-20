# Template Instructions

Do these steps as soon as you have created your GitHub repo from this template repo.

## Package.json

Make these changes to [package.json](package.json):

1. Edit the package name
2. Edit the package repo name
3. Edit the contributor name

Then, from a shell:

```bash
npm install
npm upgrade
git add package.json package-lock.json
git commit -m 'Initial commit'
```

## GitHub Actions

If you want to auto-publish packages, do this:

1. Go to the GitHub page for this repo, and create the `npm_token` secret.

otherwise, do this:

1. `rm github/workflows/npmpublish.yml'

Then, do this:

```shell
git mv github .github
git commit -m 'Tools: initial GitHub Action workflow(s)'
```

## README

The included README-EXAMPLE is taken from our [ts-uuid-parser library](https://github.com/ganbarodigital/ts-uuid-parser).

```shell
git mv README-EXAMPLE.md README.md
```

Edit the contents to match your new library.

```shell
git add README.md
git commit -m 'Docs: initial README'
```

## Finally

All that's left to do is to clean up these instructions, and get everything setup for using Gitflow / HubFlow:

```shell
git rm TEMPLATE-INSTRUCTIONS.md
git commit -m 'Docs: remove template repo instructions'
git push
git hf init
```

Then, go to the repo's GitHub page, and change the default branch to be `develop`.