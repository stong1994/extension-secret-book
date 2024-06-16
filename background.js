chrome.runtime.onInstalled.addListener(() => {});

chrome.action.onClicked.addListener(async (tab) => {
  // Get the URL of the current tab
  const url = new URL(tab.url);

  // Get the password for this URL from the server
  fetch(
    `http://192.168.110.168:12345/fetch_state?host=${encodeURIComponent(url.hostname)}`,
  )
    .then((response) => {
      console.log("response:", response);
      return response.json();
    })
    // .then((response) => response.json())
    .then((data) => {
      if (data[0].content) {
        console.log("data:", data);
        var info = data[0].content.split(" ");
        var account = info[0];
        var password = info[1];
        // If a password exists, copy it to the clipboard
        // navigator.clipboard.writeText(data.password);
        // notify(
        //   "Password copied to clipboard",
        //   "Your password has been copied to the clipboard.",
        // );
        console.log("account:", account);
        console.log("Password:", password);
      } else {
        // If no password exists, notify the user
        notify("No password found", "No password found for this URL.");
      }
    })
    .catch((error) => {
      console.log("Error:", error);
      notify(
        "Error",
        "An error occurred while fetching the password." + error.message,
      );
    });
});

function notify(title, message) {
  chrome.notifications.create({
    type: "basic",
    iconUrl: "icons/icon32.png", // Replace with your extension's icon
    title: title,
    message: message,
    priority: 1,
  });
}
