document.addEventListener("DOMContentLoaded", () => {
  function updateStats() {
    chrome.storage.local.get(
      ["passwordsChecked", "breachesFound"],
      (result) => {
        document.getElementById("checked-count").textContent =
          result.passwordsChecked || 0;
        document.getElementById("breach-count").textContent =
          result.breachesFound || 0;
      }
    );
  }

  // Initial stats update
  updateStats();

  // Learn more button
  document.getElementById("learn-more").addEventListener("click", () => {
    chrome.tabs.create({
      url: "https://haveibeenpwned.com/Passwords",
    });
  });

  // Reset stats button
  document.getElementById("reset-stats").addEventListener("click", () => {
    chrome.storage.local.set(
      {
        passwordsChecked: 0,
        breachesFound: 0,
      },
      () => {
        updateStats();

        // Show confirmation
        const status = document.getElementById("status");
        status.textContent = "Statistics have been reset";
        status.style.display = "block";

        setTimeout(() => {
          status.style.display = "none";
        }, 2000);
      }
    );
  });
});
