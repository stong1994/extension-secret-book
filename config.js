document.getElementById("save").addEventListener("click", function () {
  var serverHost = document.getElementById("serverHost").value;

  var timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error("Request timed out")), 1000),
  );

  Promise.race([
    fetch(`${serverHost}/ping`).then((response) => response.text()),
    timeoutPromise,
  ])
    .then((data) => {
      if (data != "PONG") {
        console.error("Invalid server host, expected got PONG, got: " + data);
        notify("Error", "Invalid server host");
      } else {
        chrome.storage.local.set({ serverHost: serverHost }, function () {
          console.log("Server host saved");
          window.close(); // Close the configuration page
        });
      }
    })
    .catch((error) => {
      console.error("ping server failed, error: ", error);
      notify("Error", error.message);
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
