console.log("popup");
window.onload = function () {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    var url = new URL(tabs[0].url);
    var host = url.hostname;
    chrome.storage.local.get(["serverHost"], function (result) {
      var serverHost = result.serverHost;
      console.log("serverHost:", serverHost);
      fetch(`${serverHost}/fetch_state?host=${encodeURIComponent(host)}`)
        .then((response) => response.json())
        .then((data) => {
          var accountsList = document.getElementById("accounts");
          accountsList.innerHTML = ""; // Clear the list

          data.forEach((item) => {
            if (item.content) {
              var info = item.content.split(" ");
              var account = info[0];
              var password = info[1];

              // Create a new list item
              var li = document.createElement("li");

              // Create a div for the account
              var accountDiv = createDivWithButton(
                "Account: " + account,
                "copy",
                function () {
                  navigator.clipboard.writeText(account);
                },
              );
              li.appendChild(accountDiv);

              // Create a div for the password
              var passwordDiv = createDivWithButton(
                "Password: ********",
                "copy",
                function () {
                  navigator.clipboard.writeText(password);
                },
              );
              li.appendChild(passwordDiv);

              // Append the list item to the list
              accountsList.appendChild(li);
            }
          });
        })
        .catch((error) => console.log("Error:", error));
    });
  });
};

function createDivWithButton(text, buttonText, buttonClickCallback) {
  var div = document.createElement("div");
  div.textContent = text;

  var button = document.createElement("button");
  button.textContent = buttonText;
  button.addEventListener("click", function () {
    buttonClickCallback();
    this.style.backgroundColor = "#FF7F3E"; // Change the color of the button to #536626
    setTimeout(() => (this.style.backgroundColor = ""), 500); // Change it back after 2 seconds
  });
  div.appendChild(button);

  return div;
}
