chrome.runtime.onInstalled.addListener(function () {
  chrome.tabs.create({ url: "config.html" });
});

// Listen for tab updates
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" && tab.active && tab.url) {
    var url = new URL(tab.url);
    var host = url.hostname;
    if (host === "extensions") {
      return;
    }
    var timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Request timed out")), 1000),
    );
    chrome.storage.local.get(["serverHost"], function (result) {
      var serverHost = result.serverHost;
      if (!serverHost) {
        return;
      }
      Promise.race([
        fetch(
          `${serverHost}/fetch_state?host=${encodeURIComponent(host)}`,
        ).then((response) => response.json()),
        timeoutPromise,
      ])
        .then((account) => {
          console.log("got accounts", account);
          // Store account info in local storage
          chrome.storage.local.set(
            { [tabId.toString()]: account },
            function () {
              console.log("Account info saved");
            },
          );
        })
        .catch((error) => console.log("Error:", error));
    });
  }
});

// Listen for tab close
chrome.tabs.onRemoved.addListener((tabId, removeInfo) => {
  // Remove account info from local storage
  chrome.storage.local.remove([tabId.toString()], function () {});
});

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.type === "getTabId") {
    sendResponse({ tabId: sender.tab.id });
  }
});
