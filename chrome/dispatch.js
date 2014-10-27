function main() {
  var url = document.URL;
  var m = url.match(/^https?:\/\/(.*)/)
  if (!m || !m[1]) {
    console.log("something has gone wrong");
    return;
  }
  var urlSansScheme = m[1];
  if (urlSansScheme.indexOf("github.com/") === 0) {
    GitHubMain();
  } else if (urlSansScheme.indexOf("godoc.org/") === 0) {
    GoDocOrgMain();
  }
}

main();
