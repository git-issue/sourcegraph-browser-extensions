function main() {
  // Run on first page load
  maybeAnnotatePage();

  // Run on push-state
  //
  // (Hack: we need to listen to GitHub jquery-pjax events using the same instance of jQuery that fires the events)
  var pageScript = document.createElement('script');
  pageScript.innerHTML = '$(document).on("pjax:success", function () { var evt = new Event("PJAX_PUSH_STATE_0923"); document.dispatchEvent(evt); });';
  document.querySelector('body').appendChild(pageScript);
  document.addEventListener('PJAX_PUSH_STATE_0923', function() {
    maybeAnnotatePage();
  });
}

function maybeAnnotatePage() {
  var page = new GitHubPage(window.location.href, document);
  if (page.isValidGitHubPage) {
    console.log('Valid public GitHub page:', page.info);
    page.inject();
  } else {
    console.log('Not a valid public GitHub page:', window.location.href);
  }
}

function GitHubPage(url, doc) {
  if (!doc.querySelector('body.vis-public')) return;

  this.url = url;
  this.doc = doc;
  this.info = parseURL(this.url);
  if (!this.info) return;

  // If we reach here, it's some sort of GitHub page
  this.isValidGitHubPage = true;

  var codeElem = doc.querySelector('table.file-code .code-body');
  if (codeElem) {
    this.isFilePage = true;
  }

  this.inject = function() {
    if (this.isFilePage) {
      getAnnotatedCode(this.info, codeElem, function(fileInfo) {
        codeElem.innerHTML = '';

        var sgContainer = doc.createElement('div');
        sgContainer.id = "sg-container";
        sgContainer.innerHTML = '<pre>' + fileInfo.ContentsString + '</pre>';
        var refs = sgContainer.querySelectorAll('a.ref')
        for (var i = 0; i < refs.length; i++) {
          refs[i].href = '<%= url %>' + refs[i].getAttribute('href');
        }
        codeElem.appendChild(sgContainer);
        window.setTimeout(function() {
          sgContainer.classList.add('active');
          codeElem.style.backgroundColor = 'black';
        }, 0);
      });
    }
  };

  function getAnnotatedCode(info, codeElem, callback) {
    var req = new XMLHttpRequest();
    req.onload = function() {
      callback(this.response);
    }
    req.open('get', '<%= url %>/api/repos/' + info.repoid + '@' + info.branch + '/.tree/' + info.path + '?Formatted=true&ContentsAsString=true', true);
    req.responseType = 'json';
    req.send();
  }

  function parseURL(url) {
    var m = url.match(/^https:\/\/github\.com\/([^\/#]+)\/([^\/#]+)(?:\/blob\/([^\/#]+)\/([^\/#]+))?(?:#[^\/]*)?/);
    if (m) {
      var owner = m[1], name = m[2], branch = m[3], path = m[4];
      console.log(path);
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

main();
