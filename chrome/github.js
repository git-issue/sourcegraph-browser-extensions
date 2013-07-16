function main() {
  var page = new GitHubPage(window.location.href, document);
  if (page.valid) {
    console.log('Valid GitHub page:', page.repo);
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
  this.url = url;
  this.repo = parseURL(this.url);
  if (!this.repo) return;

  this.doc = doc;
  this.precedesElem = doc.querySelector('div.file-navigation.in-mid-page');
  if (!this.precedesElem) return;

  this.valid = true;

  this.inject = function() {
    var div = document.createElement('div');
    div.id = 'sg-container';
    var iframe = document.createElement('iframe');
    iframe.id = 'sg';
    iframe.src = '<%= url %>/_ext/chrome-ext/repos/' + this.repo.id;
    div.appendChild(iframe);
    this.precedesElem.insertBefore(div);

    window.addEventListener('message', function(e) {
      var height = e.data.height;
      iframe.style.height = height + 'px';
      if (height > 20) {
        iframe.style.opacity = '1.0';
      }
    }, false);
  };

  function parseURL(url) {
    var m = url.match(/^https:\/\/github\.com\/([^/]+)\/([^/]+)/);
    if (m) {
      var owner = m[1], name = m[2];
      return {
        id: 'github.com/' + owner + '/' + name,
        owner: owner,
        name: name,
      };
    }
  }
}
