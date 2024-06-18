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
              switch (item.data_type) {
                case "account":
                  createAccount(item, accountsList);
                  break;
                case "token":
                  createToken(item, accountsList);
                  break;
                case "google_auth":
                  createGoogleAuth(item, accountsList);
                  break;
                default:
                  console.log("invalid data type: " + item.data_type);
              }
            }
          });
        })
        .catch((error) => console.log("Error:", error));
    });
  });
};

function createAccount(item, accountsList) {
  var info = item.content.split(" ");
  var account = info[0];
  var password = info[1];

  // Create a new list item
  var li = document.createElement("li");
  var titleDiv = createDivWithButton("Title: " + item.name, "", null);
  li.appendChild(titleDiv);
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

  var commentDiv = createDivWithButton("Comment: " + item.desc, "", null);
  li.appendChild(commentDiv);
  // Append the list item to the list
  accountsList.appendChild(li);
}

function createToken(item, accountsList) {
  // Create a new list item
  var li = document.createElement("li");
  var titleDiv = createDivWithButton("Title: " + item.name, "", null);
  li.appendChild(titleDiv);
  // Create a div for the account
  var tokenDiv = createDivWithButton(
    "Token: " + item.content,
    "copy",
    function () {
      navigator.clipboard.writeText(item.content);
    },
  );
  li.appendChild(tokenDiv);

  var commentDiv = createDivWithButton("Comment: " + item.desc, "", null);
  li.appendChild(commentDiv);

  // Append the list item to the list
  accountsList.appendChild(li);
}

function createGoogleAuth(item, accountsList) {
  // Create a new list item
  var li = document.createElement("li");
  var titleDiv = createDivWithButton("Title: " + item.name, "", null);
  li.appendChild(titleDiv);
  // totp
  var totp = new jsOTP.totp();
  let [code, leftTime] = totp.getOtp(item.content);

  // Create a div for the Google Authenticator code
  var googleAuthDiv = createGoogleAuthDiv(code, leftTime);
  li.appendChild(googleAuthDiv);

  var commentDiv = createDivWithButton("Comment: " + item.desc, "", null);
  li.appendChild(commentDiv);
  // Append the list item to the list
  accountsList.appendChild(li);
}

function createDivWithButton(text, buttonText, buttonClickCallback) {
  var div = document.createElement("div");
  div.textContent = text;

  if (buttonText != "") {
    var button = document.createElement("button");
    button.textContent = buttonText;
    button.addEventListener("click", function () {
      buttonClickCallback();
      this.style.backgroundColor = "#FF7F3E";
      setTimeout(() => (this.style.backgroundColor = ""), 300);
    });
    div.appendChild(button);
  }

  return div;
}

function googleAuthText(codeSpan) {
  return function (leftTime) {
    return `Google Auth Code: ${codeSpan}, ${leftTime}s`;
  };
}

function createGoogleAuthDiv(code, leftTime) {
  var div = document.createElement("div");

  var codeSpan = document.createElement("span");
  codeSpan.textContent = code;
  codeSpan.style.color = "green";
  codeSpan.style.fontWeight = "bold";
  codeSpan.style.fontSize = "20px";

  var textSpan = document.createElement("span");
  var textFn = googleAuthText(codeSpan.outerHTML);
  textSpan.innerHTML = textFn(leftTime);
  div.appendChild(textSpan);

  var button = document.createElement("button");
  button.textContent = "Copy";
  button.addEventListener("click", function () {
    navigator.clipboard.writeText(code.toString());
    this.style.backgroundColor = "#FF7F3E";
    setTimeout(() => (this.style.backgroundColor = ""), 300);
  });
  div.appendChild(button);

  startCountdown(textSpan, leftTime, textFn, button);
  return div;
}

function startCountdown(textSpan, seconds, textFn, button) {
  let counter = seconds;

  // Update the count down every 1 second
  var interval = setInterval(function () {
    counter--;

    textSpan.innerHTML = textFn(counter);

    // If the count down is over, clear the interval
    if (counter < 0) {
      clearInterval(interval);
      textSpan.innerHTML = "EXPIRED";
      textSpan.style.color = "red";
      button.style.display = "none";
    }
  }, 1000);
}
