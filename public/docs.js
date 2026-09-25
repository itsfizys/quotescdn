const origin = window.location.origin;
const baseUrl = document.querySelector("#base-url");
if (baseUrl) baseUrl.textContent = origin;
const baseUrlCommand = document.querySelector("#base-url-command");
if (baseUrlCommand) baseUrlCommand.textContent = origin;

async function copy(text, button, original) {
  try {
    await navigator.clipboard.writeText(text);
    button.textContent = "Copied";
    setTimeout(() => { button.textContent = original; }, 1200);
  } catch {
    button.textContent = "Select manually";
  }
}

document.querySelectorAll(".copy-route").forEach((button) => {
  button.addEventListener("click", () => copy(origin + button.dataset.route, button, "Copy"));
});
document.querySelectorAll(".try-route").forEach((button) => {
  button.addEventListener("click", () => { window.open(origin + button.dataset.route, "_blank", "noopener,noreferrer"); });
});
document.querySelector(".copy-button[data-copy-text='base']")?.addEventListener("click", (event) => {
  copy(origin, event.currentTarget, "Copy");
});