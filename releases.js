const { join } = require('path');
const { writeFileSync } = require('fs');
const { mkdir, exec, ls } = require('shelljs');
const { from, EMPTY } = require('rxjs');
const { filter, map, flatMap, expand } = require('rxjs/operators');
const dotenv = require('dotenv');
const axios = require('axios');

dotenv.config();

const GITHUB_API_KEY = process.env.GITHUB_API_KEY;

function getReleasesPage(url) {
  return from(axios.get(url, {
      headers: { Authorization: `token ${ GITHUB_API_KEY }` }
    }))
    .pipe(
      map(({ data, headers }) => ({
        data,
        next: (headers.link.split(',').find((link) => link.includes('rel="next"')) || '').replace(/^.*<(.*)>.*$/, '$1')
      }))
    );
}

function downloadReleases() {
  console.log('Downloading releases...');

  const assetMatcher = /v[0-9]+\.[0-9]+\.[0-9]+\/gomplate_[a-z]+-[a-z0-9]+$/;

  getReleasesPage('https://api.github.com/repos/hairyhenderson/gomplate/releases')
  .pipe(
    expand(({ next }) => next ? getReleasesPage(next) : EMPTY),
    flatMap(({ data }) => from(data)),
    map(({ tag_name, assets }) => ({
      version: tag_name.replace(/^v/, ''),
      assets: assets.filter(({ browser_download_url }) => assetMatcher.test(browser_download_url))
    })),
    filter(({ assets }) => assets.length)
  )
  .forEach(({ version }) => {
    const pkg = require('./package.json');
    const cwd = join(__dirname, 'releases', version);

    pkg.version = version;

    mkdir('-p', cwd);
    writeFileSync(`releases/${ version }/package.json`, JSON.stringify(pkg, null, 2));
  });
}

function publishReleases(...args) {
  console.log('Publishing local releases...');

  ls(releasesDir).forEach((version) => {
    const cwd = join(__dirname, 'releases', version);

    exec('npm i', { cwd, silent: true });
    exec(`npm run safe-publish -- ${ args.join(' ') }`, { cwd });
  });
}

const command = process.argv[2];
const releasesDir = join(__dirname, 'releases');

mkdir('-p', releasesDir);

switch(command) {
  case 'p':
  case 'publish':
    publishReleases(...process.argv.slice(2));
    break;
  case 'd':
  case 'download':
  default:
    downloadReleases();
    break;
}
