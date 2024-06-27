var usernameSelectors = [
  'input[type="email"]',
  'input[name="account"]',
  'input[name="email"]',
  'input[placeholder="账号"]',
  'input[placeholder="邮箱"]',
  'input[placeholder="email"]',
  'input[placeholder="mobile"]',
  'input[name="username"]',
  'input[placeholder="用户名"]',
];

var googleAuthSelectors = ['input[name="otp_code"', 'input[name="code"'];

function autofill() {
  var usernameFieldSelector = usernameSelectors.find((selector) =>
    document.querySelector(selector),
  );
  var usernameField = usernameFieldSelector
    ? document.querySelector(usernameFieldSelector)
    : null;
  var passwordField = document.querySelector('input[type="password"]');

  var codeFieldSelector = googleAuthSelectors.find((selector) =>
    document.querySelector(selector),
  );
  var codeField = codeFieldSelector
    ? document.querySelector(codeFieldSelector)
    : null;
  var tokenField = document.querySelector('input[name="token"]');

  if (!usernameField && !passwordField && !codeField && !tokenField) {
    return;
  }

  var filled = false;

  chrome.runtime.sendMessage({ type: "getTabId" }, function (response) {
    console.log("get response " + response);
    if (chrome.runtime.lastError) {
      // There was an error, don't try to use the tabId
      console.log(chrome.runtime.lastError.message);
      return;
    }
    var tabId = response.tabId;
    chrome.storage.local.get(tabId.toString(), function (result) {
      console.log("get data ");
      console.log(result);
      var data = result[tabId.toString()];
      if (!data) {
        return;
      }
      data.forEach((item) => {
        if (filled) {
          return;
        }
        if (item.content) {
          switch (item.data_type) {
            case "account":
              var info = item.content.split(" ");
              var account = info[0];
              var password = info[1];
              if (usernameField && usernameField.value === "") {
                usernameField.value = account;
                filled = true;
              }
              if (passwordField && passwordField.value === "") {
                passwordField.value = password;
                filled = true;
              }
              break;
            case "token":
              if (tokenField && tokenField.value === "") {
                tokenField.value = item.content;
                filled = true;
              }
              break;
            case "google_auth":
              if (codeField && codeField.value === "") {
                var totp = new jsOTP.totp();
                let [code, _] = totp.getOtp(item.content);
                codeField.value = code;
                filled = true;
              }
              break;
            default:
              console.log("invalid data type: " + item.data_type);
          }
        }
      });
    });
  });
}

// Create a new observer
var observer = new MutationObserver(function () {
  autofill();
});

// Start observing the document with the configured parameters
observer.observe(document, { childList: true, subtree: true });
