chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "checkPassword") {
    const hashedPassword = message.payload;
    const apiUrl = `https://api.pwnedpasswords.com/range/${hashedPassword.slice(
      0,
      5
    )}`;

    fetch(apiUrl)
      .then((response) => response.text())
      .then((data) => {
        // Update stats
        chrome.storage.local.get(
          ["passwordsChecked", "breachesFound"],
          (result) => {
            const passwordsChecked = (result.passwordsChecked || 0) + 1;
            const breachesFound =
              (result.breachesFound || 0) +
              (data.includes(hashedPassword.slice(5).toUpperCase()) ? 1 : 0);

            chrome.storage.local.set({ passwordsChecked, breachesFound });
          }
        );

        sendResponse({ success: true, data });
      })
      .catch((error) => {
        console.error("API request failed:", error);
        sendResponse({ success: false, error: error.message });
      });
    return true; // Indicates asynchronous response
  }
});
