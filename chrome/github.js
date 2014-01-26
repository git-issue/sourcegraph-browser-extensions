function main() {
  chrome.storage.local.get(['annotate', 'repoPanel'], function(settings) {
    if (settings.repoPanel === undefined) {
      settings.repoPanel = true;
    }
    if (settings.annotate === undefined) {
      settings.annotate = true;
    }

    var page = new GitHubPage(window.location.href, document);
    if (page.isValidGitHubPage) {
      console.log('Valid GitHub page:', page.info);
      page.inject(settings);
    } else {
      console.log('Not a valid GitHub page:', window.location.href);
    }
  });
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
  // Ensure it's a public repo.
  if (!doc.querySelector('body.vis-public')) return;

  this.url = url;
  this.info = parseURL(this.url);
  if (!this.info) return;

  // If we reach here, it's some sort of GitHub page
  this.isValidGitHubPage = true;

  this.doc = doc;
  this.postPanelElem = doc.querySelector('div.file-navigation.in-mid-page');
  if (this.postPanelElem) {
    this.isRepoPage = true;
  }

  this.codeElem = doc.querySelector('table.file-code');
  if (this.codeElem) {
    this.isFilePage = true;
  }

  this.inject = function(settings) {
    if (this.isRepoPage) {
      if (settings.repoPanel) {
        this.injectPanel();
      }
      if (settings.annotate) {
        this.annotateReadme();
      }
    }
    if (settings.annotate && this.isFilePage) {
      this.annotateCodeFile();
    }
  };

  this.injectPanel = function() {
    if (doc.__sg_panel_injected) return;
    doc.__sg_panel_injected = true;

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

  this.annotateReadme = function() {
    var readmeContainer = document.querySelector('div#readme');
    if (!readmeContainer) return;

    var codeContainers = readmeContainer.querySelectorAll('pre');
    var codeHTML = [];
    for (var i = 0; i < codeContainers.length; i++) {
      codeHTML[i] = codeContainers[i].innerHTML;
    }
    requestAnnotation({
      'params': {
        'includeRepos': [this.info.repoid],
      },
      'snippets': codeHTML,
    }, function(response) {
      if (!response || !response.snippets || response.snippets.length !== codeContainers.length) {
        return;
      }
      for (var i = 0; i < codeContainers.length; i++) {
        codeContainers[i].innerHTML = response.snippets[i];
      }
      addAnnotationStyle();
    });
  };

  this.annotateCodeFile = function() {
    if (!this.CodeElem) {
      return;
    }

    var codeContainer = this.codeElem.querySelector('pre');
    if (!codeContainer) {
      return;
    }

    var codeHTML = codeContainer.innerHTML;
    requestAnnotation({
      'params': {
        'file': this.info.path,
        'repo': this.info.repoid,
      },
      'snippets': [codeHTML],
    }, function(response) {
      if (!response || !response.snippets || response.snippets.length !== 1) {
        return;
      }
      codeContainer.innerHTML = response.snippets[0];
      addAnnotationStyle();
    });
  };

  function addAnnotationStyle() {
    var style = document.createElement('style');
    style.innerHTML = 'a.sg-link[data-sg-link] { pointer-events: auto !important; color: inherit; border-radius: 2px; background: rgba(255,255,0,0.30); border: 1px solid #e5e600; }\na.sg-link[data-sg-link]:hover { cursor: pointer; background: rgba(255,255,0,1); text-decoration: none; }';
    document.getElementsByTagName('head')[0].appendChild(style);

    var links = document.querySelectorAll('a.sg-link[data-sg-link]');
    for (var i = 0; i < links.length; i++) {
      links[i].title = 'View example usages, documentation, and popularity on Sourcegraph';
    }
  }

  function requestAnnotation(params, callback) {
    var reqBody = JSON.stringify(params);
    var req = new XMLHttpRequest();
    req.onload = function() {
      callback(this.response);
    };
    req.open('post', '<%= url %>/api/snippet', true);
    req.responseType = 'json';
    req.send(reqBody);
  }

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
