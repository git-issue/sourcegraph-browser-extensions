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
    console.log('Sourcegraph extension running (page is publicly visible):', page.info);
    page.inject();
  }
}

function GitHubPage(url, doc) {
  if (!doc.querySelector('body.vis-public')) return;

  this.url = url;
  this.doc = doc;
  this.info = parseURL(this.url);
  if (!this.info) return;
  var info = this.info;

  // If we reach here, it's some sort of GitHub page
  this.isValidGitHubPage = true;

  var codeElem = doc.querySelector('table.file-code .code-body');
  if (codeElem && info.repoid && info.branch && info.path) {
    this.isCodePage = true;
  }
  var buttonHeader = doc.querySelector('ul.pagehead-actions');

  this.inject = function() {
    // inject header button if appropriate
    if (buttonHeader) {
      getRepositoryBuilds(info.repoid, function(builds, status) { // only show search button if repository has been built
        if (status !== 200 || !builds || builds.length == 0) {
          return;
        }

        var sgButtonURL = urlToRepoSearch(info.repoid, '');
        var sgButton = buttonHeader.querySelector('#sg-search-button-container');
        if (!sgButton) {
          sgButton = doc.createElement('li');
          sgButton.id = 'sg-search-button-container';
          buttonHeader.insertBefore(sgButton, buttonHeader.firstChild);
        }
        sgButton.innerHTML = '<a id="sg-search-button" class="minibutton sg-button" target="_blank" href="'+sgButtonURL+'">&#x2731; Search code</a>';
      });
    }

    // inject code element if appropriate
    if (this.isCodePage) {
      getAnnotatedCode(info, codeElem, function(fileInfo, status) {
        // If no references are present, don't modify the view
        if (status !== 200 || !fileInfo.FormatResult || fileInfo.FormatResult.NumRefs === 0) {
          // Show button to access most-recently processed build
          getRepositoryBuilds(info.repoid, function(builds, status) {
            if (status === 200 && builds && builds.length > 0) {
              // TODO(bliu): this is "commit most recently processed", but it really should be "last processed commit in history"
              var lastAvailableCommit = builds[0].CommitID;

              // If valid builds are present, link to them
              var codeWrapper = doc.querySelector('.blob-wrapper');
              var explain = doc.createElement('div')
              explain.id = "sg-alert";
              explain.innerHTML = '&#x2731; Sourcegraph has not yet processed this file revision. View the <span class="sg-inline-button"><a target="_blank" href="'+urlToFile(info.repoid, lastAvailableCommit, info.path)+'">Last processed revision</a></span>';
              codeWrapper.insertBefore(explain, codeWrapper.firstChild);
            }
          });
          return;
        }

        // Replace unlinked code with linked code
        var sgContainer = doc.createElement('pre');
        sgContainer.id = "sg-container";
        sgContainer.innerHTML = fileInfo.ContentsString;
        var refs = sgContainer.querySelectorAll('a.ref')
        for (var i = 0; i < refs.length; i++) {
          refs[i].href = '<%= url %>' + refs[i].getAttribute('href');
          refs[i].target = '_blank';
        }
        // TODO(sqs): some code pages seem to need a margin-top:-17px on the
        // codeElem.
        sgContainer.classList.add('active');
        codeElem.appendChild(sgContainer);
        while (codeElem.firstChild && codeElem.firstChild.id != 'sg-container') {
          codeElem.removeChild(codeElem.firstChild);
        }
      });
    }
  };

  function getAnnotatedCode(info, codeElem, callback) {
    var url = '<%= url %>/api/repos/' + info.repoid + '@' + info.branch + '/.tree/' + info.path + '?Formatted=true&ContentsAsString=true';
    get(url, callback);
  }

  function getRepositoryBuilds(repo_id, callback) {
    var url = '<%= url %>/api/repos/'+repo_id+'/.builds?Sort=updated_at&Direction=desc&PerPage=5&Succeeded=true';
    get(url, callback);
  }

  function urlToRepoSearch(repo_id, query) {
    return '<%= url %>/'+escape(repo_id)+'/.search?q='+escape(query);
  }

  function urlToRepoCommit(repo_id, commit_id) {
    return '<%= url %>/'+escape(repo_id)+'@'+escape(commit_id);
  }

  function urlToFile(repo_id, commit_id, path) {
    return urlToRepoCommit(repo_id, commit_id) + '/.tree/' + escape(path);
  }

  function get(url, callback) {
    var req = new  XMLHttpRequest();
    req.onload = function() {
      callback(this.response, this.status);
    }
    req.open('get', url, true);
    req.responseType = 'json';
    req.send();
  }

  function parseURL(url) {
    var m = url.match(/^https:\/\/github\.com\/([^\/#]+)\/([^\/#]+)(?:\/blob\/([^\/#]+)\/([^#]+))?(?:#[^\/]*)?/);
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

main();
