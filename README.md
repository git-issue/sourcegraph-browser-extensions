Sourcegraph Chrome extension
============================

To build, run `grunt`. Then go to `chrome:extensions` in Chrome and use *Load Unpacked Extension* to
load the `sourcegraph/app/chrome-ext/build` extension directory.

To reload the Chrome extension when you change files, install [Extensions 
Reloader](https://chrome.google.com/webstore/detail/fimgfedafeadlieiabdeeaodndnlbhid) and run `grunt watch`.

## Development

When developing the Chrome extension, your dev server must be https: run `sgapp`
with the `-https-dev` flag and set `SG_URL` to `https://localhost:3000`.
Otherwise, Chrome throws mixed content errors on GitHub.com and refuses to run
our JavaScript.

To inject content from https://localhost:3000 instead of from
https://sourcegraph.com, set the env var `DEV=1` on the `grunt` command.


## Publishing

To package a .zip file for publishing to the Chrome Web Store, run `grunt publish`.

