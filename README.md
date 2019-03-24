[![Build Status](https://travis-ci.com/gomplate/gomplate-npm.svg?branch=master)](https://travis-ci.com/gomplate/gomplate-npm)

# gomplate (npm port)

This library is just a port of [gomplate](https://github.com/hairyhenderson/gomplate) go package using [go-npm](https://github.com/sanathkr/go-npm).

## Publishing

### Single version

Update `version` field in `package.json` with the latest release of `gomplate`. Then:

```
npm publish
```

### Batch publish new/previous versions

In case we want to publish all existing versions of `gomplate`, we will first need a
GitHub API token (any token with read access should work) available in variable `GITHUB_API_KEY`.

You can either set this token as an env variable or write it down to a `.env` file at
the root of this project.

Then, follow these steps:

1. Download all/new releases

    ```
    npm run releases:publish
    ```

    This command will create a `releases` directory and as many version subdirectories as versions downloaded.

    Each version directory has a copy of `package.json` with `version` field updated to match the version.
    Every run of this command will overwrite them to make sure all properties from parent `package.json`
    are the same.

1. Publish releases

    ```
    npm run releases:publish
    ```

    This command will read version directories from `releases` directory and attempt to publish
    them with [safe-publish](https://github.com/adidas/safe-publish), this tool will try to publish a package and skip it without
    error if it already exists hence, only unpublished versions will be created.
