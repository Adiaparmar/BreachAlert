async function sha1(message) {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest("SHA-1", msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return hashHex;
}

function createPasswordIndicator(field) {
  const indicator = document.createElement("div");
  indicator.style.display = "none";
  indicator.style.position = "absolute";
  indicator.style.padding = "8px 12px";
  indicator.style.borderRadius = "4px";
  indicator.style.fontSize = "12px";
  indicator.style.marginTop = "5px";
  indicator.style.boxShadow = "0 2px 4px rgba(0,0,0,0.1)";
  indicator.style.zIndex = "1000";
  indicator.style.maxWidth = "250px";
  indicator.style.wordWrap = "break-word";

  // Position the indicator below the password field
  const fieldRect = field.getBoundingClientRect();
  indicator.style.left = "0";
  indicator.style.top = "100%";

  return indicator;
}

async function checkPassword(field, indicator) {
  const password = field.value;
  if (password.length < 1) return;

  indicator.style.display = "block";
  indicator.style.backgroundColor = "#FFF3CD";
  indicator.style.color = "#856404";
  indicator.textContent = "Checking password security...";

  try {
    const hashedPassword = await sha1(password);
    const response = await new Promise((resolve) => {
      chrome.runtime.sendMessage(
        { type: "checkPassword", payload: hashedPassword },
        resolve
      );
    });

    if (response.success) {
      const hashSuffix = hashedPassword.slice(5).toUpperCase();
      const breachData = response.data.split("\n");
      const breach = breachData.find((line) => line.startsWith(hashSuffix));

      if (breach) {
        const occurrences = parseInt(breach.split(":")[1]);
        indicator.style.backgroundColor = "#F8D7DA";
        indicator.style.color = "#721C24";
        indicator.textContent = `⚠️ This password has been found in ${occurrences.toLocaleString()} data breaches. Please change it.`;
      } else {
        indicator.style.backgroundColor = "#D4EDDA";
        indicator.style.color = "#155724";
        indicator.textContent =
          "✅ Password not found in any known data breaches";
        setTimeout(() => {
          indicator.style.display = "none";
        }, 3000);
      }
    }
  } catch (error) {
    console.error("Error checking password:", error);
    indicator.style.backgroundColor = "#F8D7DA";
    indicator.style.color = "#721C24";
    indicator.textContent =
      "Unable to check password security. Please try again later.";
  }
}

function initializePasswordField(field) {
  if (field.dataset.breachCheckInitialized) return;

  const wrapper = document.createElement("div");
  wrapper.style.position = "relative";
  field.parentNode.insertBefore(wrapper, field);
  wrapper.appendChild(field);

  const indicator = createPasswordIndicator(field);
  wrapper.appendChild(indicator);

  field.addEventListener("blur", () => checkPassword(field, indicator));
  field.dataset.breachCheckInitialized = "true";
}

// Initialize existing password fields
document
  .querySelectorAll('input[type="password"]')
  .forEach(initializePasswordField);

// Watch for dynamically added password fields
const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    mutation.addedNodes.forEach((node) => {
      if (node.querySelectorAll) {
        const passwordFields = node.querySelectorAll(
          'input[type="password"]:not([data-breach-check-initialized])'
        );
        passwordFields.forEach(initializePasswordField);
      }
    });
  });
});

observer.observe(document.body, {
  childList: true,
  subtree: true,
});
