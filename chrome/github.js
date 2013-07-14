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

function GitHubPage(url, doc) {
  this.url = url;
  this.repo = parseURL(this.url);
  if (!this.repo) return;

  this.doc = doc;
  this.precedingElem = doc.querySelector('div.bubble.files-bubble');
  if (!this.precedingElem) return;

  this.valid = true;

  this.inject = function() {
    this.precedingElem.insertAdjacentHTML('beforeBegin', '<div id="sg-container"><iframe seamless id="sg" src="http://localhost:3000/_elem/repos/' + this.repo.id + '/examples"></iframe></div>');
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
