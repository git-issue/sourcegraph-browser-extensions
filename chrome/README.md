# Sourcegraph Chrome extension

**[Install the Sourcegraph Chrome extension on the Chrome Web Store](https://chrome.google.com/webstore/detail/sourcegraph/dgjhfomjieaadpoljlnidmbgkdffpack?hl=en)**

[YouTube screencast of the Sourcegraph Chrome extension](https://www.youtube.com/watch?v=fxXnwhOaHuk)

This extension enhances file pages on GitHub by annotating code with links to
usage examples and documentation. It also adds a button that allows you to
search for functions, classes, and other code definitions in the repository (in
lieu of the text-based search on GitHub).

You can also browse code on Sourcegraph itself at https://sourcegraph.com.

CAVEAT: It only works on repositories that Sourcegraph has built, which includes
most popular repositories in Python, Go, and JavaScript. All other repositories
will remain untouched. To trigger a build of a repository, find it at
https://sourcegraph.com/github.com/USER/REPO, click Builds, and then click
"Build repository now".

SECURITY MATTERS: This extension never sends any information about private
repositories to Sourcegraph.

## Development

## Prerequisites

Install [Gulp](https://github.com/gulpjs/gulp/blob/master/docs/getting-started.md#getting-started) and [NodeJS](https://nodejs.org/en/download/), then install the dependencies:
```
cd chrome/
npm install
```

## Building

To build and watch the source files for changes, run `gulp`. Then go to `chrome://extensions`
in Chrome, check "Developer mode" and use *Load Unpacked Extension* to load the
`chrome/build` extension directory.

To reload the Chrome extension when you change files, install
[Extensions Reloader](https://chrome.google.com/webstore/detail/fimgfedafeadlieiabdeeaodndnlbhid)
and run `gulp watch`.

To inject content from http://localhost:3080 instead of from
https://sourcegraph.com, run `DEV=1 grunt`. GitHub is HTTPS-only, so you may
need to [allow mixed content](http://superuser.com/a/487772) temporarily.
