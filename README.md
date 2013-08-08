Sourcegraph Chrome extension
============================

To build, run `grunt`. Then go to `chrome:extensions` in Chrome and use *Load Unpacked Extension* to
load the `sourcegraph/app/chrome-ext/build` extension directory.

To reload the Chrome extension when you change files, install [Extensions 
Reloader](https://chrome.google.com/webstore/detail/fimgfedafeadlieiabdeeaodndnlbhid) and run `grunt watch`.

To inject content from http://localhost:3000 instead of from https://sourcegraph.com, set the env
var `DEV=1` on the `grunt` command.

To package a .zip file for publishing to the Chrome Web Store, run `grunt publish`.

