function GoDocOrgMain() {
  maybeAnnotateGoDocOrgPage();
}

function maybeAnnotateGoDocOrgPage() {
  var page = new GoDocOrgPage(document);
  if (page.isValidGodocOrgPage) {
    console.log("Sourcegraph extension running (page is publicly visible):", page.info);
    page.inject();
  }
}

function GoDocOrgPage(doc) {
  // info has .repoid and .path.
  var info = parseURL(getURLPath(doc.URL));
  if (!info) return;
  this.info = info;

  this.isValidGodocOrgPage = true;
  
  this.inject = function() {
    // TODO(samer): add button?
    // The container @ index 1 is the one in the middle with all the
    // defs.
    var container = doc.querySelectorAll(".container")[1];
    if (!container) {
      // TODO(samer): add logging
      return;
    }
    // note for sqs: 3 hours is pretty spot on....
    var defTags = [container.querySelectorAll("h4"), container.querySelectorAll("h3")];
    for (var i = 0; i < defTags.length; i++) {
      for (var j = 0; j < defTags[i].length; j++) {
        var def = defTags[i][j];
        var id = def.getAttribute("id");
        if (id === "pkg-index" || id === "pkg-files") {
          continue;
        }
        def.innerHTML += " " + createDefURL(info.repoid, info.fullPath, id);
      }
    }
  };

  // repoid and fullPath must be in format: [^/].*[^/]
  function createDefURL(repoid, fullPath, id) {
    // Convert id to the correct format
    // (e.g., 'Assign.String' -> 'Assign/String')
    id = id.replace(".", "/");
    var href = "https://sourcegraph.com/" + repoid + "@master/.GoPackage/" + fullPath + "/.def/" + id;
    return "<a href='" + href + "' title='Find usage examples on Sourcegraph'>Show examples ✱</a>";
  }        

  function getURLPath(url) {
    var m = url.match(/^([^?]*)\?.*/);
    if (m) {
      url = m[1];
    }
    var m = url.match(/^([^#]*)#.*/);
    if (m) {
      url = m[1];
    }
    return url;
  }

  // trimForwardSlashes trims forward slashes on both sides of input.
  // todo(samer): do this with regexp?
  function trimForwardSlashes(input) {
    while (input[0] === "/") {
      input = input.slice(1);
    }
    while (input[input.length-1] === "/") {
      input = input.slice(0, input.length-1);
    }
    return input
  }
  
  function parseURL(url) {
    var godocURL = "https://godoc.org/";
    var i = url.indexOf(godocURL);
    if (i !== 0) {
      godocURL = "http://godoc.org/";
      i = url.indexOf(godocURL);
      if (i !== 0) {
        return;
      }
    }
    fullPath = url.slice(godocURL.length);
    var supportedURLs = [
      // base must end with a forward slash.
      {type: "sourcegraph", base: "sourcegraph.com/sourcegraph/"},
      {type: "github", base: "github.com/"},
      {type: "googlecode", base: "code.google.com/p/"},
    ];
    for (var i = 0; i < supportedURLs.length; i++) {
      var base = supportedURLs[i].base;
      switch (supportedURLs[i].type) {
      case "sourcegraph": // fallthrough
      case "googlecode":
        if (fullPath.indexOf(base) !== 0) {
          continue;
        }
        var name = fullPath.slice(base.length).split("/", 1)[0];
        if (!name) {
          return;
        }
        return {
          repoid:   trimForwardSlashes(base) + "/" + trimForwardSlashes(name),
          fullPath: trimForwardSlashes(fullPath)
        };
      case "github":
        if (fullPath.indexOf(base) !== 0) {
          continue;
        }
        var sliced = fullPath.slice(base.length).split("/", 2);
        if (sliced.length !== 2) {
          return;
        }
        sliced.unshift(trimForwardSlashes(base)); // sliced is now [base, owner, name]
        return {
          repoid:   trimForwardSlashes(sliced.join("/")),
          fullPath: trimForwardSlashes(fullPath)
        };
      }
    };
  }
}
