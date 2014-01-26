function main() {
  chrome.storage.local.get(['annotate', 'repoPanel'], function(settings) {
    if (settings.annotate === undefined) {
      settings.annotate = true;
    }
    if (settings.repoPanel === undefined) {
      settings.repoPanel = true;
    }
    chrome.storage.local.set(settings);

    var annotateElem = document.querySelector('input[type=checkbox]#annotate');
    annotateElem.checked = settings.annotate;
    annotateElem.onclick = function () {
      settings.annotate = this.checked;
      chrome.storage.local.set(settings);
    };
    var repoElem = document.querySelector('input[type=checkbox]#repoPanel');
    repoElem.checked = settings.repoPanel;
    repoElem.onclick = function() {
      settings.repoPanel = this.checked;
      chrome.storage.local.set(settings);
    };
  });
}
main();
