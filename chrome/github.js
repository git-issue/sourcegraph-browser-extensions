function main() {
  var page = new GitHubPage(window.location.href, document);
  if (page.isValid()) {
    console.log('Valid GitHub page:', page.info);
    page.inject();
  } else {
    console.log('Not a valid GitHub page:', window.location.href);
  }
}

main();

// Monitor URL bar for changes so that we catch PJAX navigations. Otherwise, if you go to a repo
// page, click Issues, then click back to Code, you won't see our iframe.
var lastURL = window.location.href;
window.setInterval(function() {
  var url = window.location.href;
  if (url !== lastURL) {
    main();
    lastURL = url;
  }
}, 1000);

function GitHubPage(url, doc) {
  this.isValid = function() {
    return this.isRepoPage || this.isFilePage;
  };

  // Ensure it's a public repo.
  if (!doc.querySelector('body.vis-public')) return;

  this.url = url;
  this.info = parseURL(this.url);
  if (!this.info) return;

  this.doc = doc;
  this.postPanelElem = doc.querySelector('div.file-navigation.in-mid-page');
  if (this.postPanelElem) {
    this.isRepoPage = true;
  }

  this.codeElem = doc.querySelector('table.file-code');
  if (this.codeElem) {
    this.isFilePage = true;
  }

  this.inject = function() {
    if (doc.__sg_injected) return;
    doc.__sg_injected = true;

    if (this.isRepoPage) {
      this.injectPanel();
    }
    if (this.isFilePage) {
      this.injectAnnotations();
    }
  };

  this.injectPanel = function() {
    var div = document.createElement('div');
    div.id = 'sg-container';
    var iframe = document.createElement('iframe');
    iframe.id = 'sg';
    iframe.src = '<%= url %>/_ext/chrome-ext/repos/' + this.info.repoid;
    div.appendChild(iframe);
    this.postPanelElem.insertBefore(div);

    window.addEventListener('message', function(e) {
      var height = e.data.height;
      iframe.style.height = height + 'px';
      if (height > 20) {
        iframe.style.opacity = '1.0';
      }
    }, false);
  };

  this.injectAnnotations = function() {
    var codeContainer = this.codeElem.querySelector('pre');
    var codeHTML = codeContainer.innerHTML;
    var reqBody = JSON.stringify({
      // 'lang': 'python',
      // 'repos': ['github.com/mitsuhiko/flask'],

      'file': this.info.path,
      'repo': this.info.repoid,
      'snippets': [codeHTML],
    });

    var req = new XMLHttpRequest();
    req.onload = function() {
      // TODO: too slow
      codeContainer.innerHTML = this.response.snippets[0];
    };
    req.open('post', 'http://localhost:3000/api/snippet', true);
    req.responseType = 'json';
    req.send(reqBody);
  };

  function parseURL(url) {
    var m = url.match(/^https:\/\/github\.com\/([^\/]+)\/([^\/]+)(?:\/blob\/([^\/]+)\/(.+))?/);

    if (m) {
      var owner = m[1], name = m[2], branch = m[3], path = m[4];
      return {
        repoid: 'github.com/' + owner + '/' + name,
        owner: owner,
        name: name,
        branch: branch,
        path: path,
      };
    }
  }
}
