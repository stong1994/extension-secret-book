window.onload = function () {
  document.getElementById("save").addEventListener("click", function () {
    var serverHost = document.getElementById("serverHost").value;
    chrome.storage.local.set({ serverHost: serverHost }, function () {
      console.log("Server host saved");
      window.close(); // Close the configuration page
    });
  });
};
