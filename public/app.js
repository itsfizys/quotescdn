const state = { quote: null, theme: "midnight" };
const $ = (selector) => document.querySelector(selector);

async function getJson(path, options = {}) {
  const response = await fetch(path, options);
  if (!response.ok) throw new Error("Request failed");
  return response.json();
}

function renderQuote(quote) {
  state.quote = quote;
  $("#hero-quote").textContent = quote.quote;
  $("#hero-author").textContent = `— ${quote.author}`;
  $("#hero-index").textContent = `#${String(quote.index).padStart(4, "0")}`;
  $("#quote-tag").textContent = `QUOTE / ${quote._id}`;
  $("#quote-text").textContent = `“${quote.quote}”`;
  $("#quote-author").textContent = `— ${quote.author}`;
  $("#quote-author-id").textContent = quote.author_id;
  $("#quote-number").textContent = `INDEX ${String(quote.index).padStart(5, "0")}`;
  $("#card-index").value = quote.index;
  updateCard();
}

async function loadQuote(params = {}, options = {}) {
  const search = new URLSearchParams(params);
  return getJson(`/api/quote?${search.toString()}`, options);
}

async function randomQuote(message = "Fresh from the archive.") {
  $("#random-quote").disabled = true;
  try {
    renderQuote(await loadQuote({}, { cache: "no-store" }));
    $("#search-status").textContent = message;
  } catch {
    $("#search-status").textContent = "The archive is taking a beat. Try again.";
  } finally {
    $("#random-quote").disabled = false;
  }
}

function updateCard() {
  if (!state.quote) return;
  const url = `/api/card?index=${state.quote.index}&theme=${state.theme}`;
  $("#card-preview").src = url;
  $("#card-url").textContent = url;
  $("#preview-theme-label").textContent = state.theme.toUpperCase();
}

async function searchQuotes(event) {
  event.preventDefault();
  const value = $("#search-input").value.trim();
  if (!value) return randomQuote();
  try {
    const params = /^\d+$/.test(value) ? { index: value } : { search: value, seed: 0 };
    renderQuote(await loadQuote(params));
    $("#search-status").textContent = `Found a match for “${value}”.`;
    $("#quote-display").scrollIntoView({ behavior: "smooth", block: "center" });
  } catch {
    $("#search-status").textContent = "No match. Try a different author or phrase.";
  }
}

async function loadCard() {
  const index = Number.parseInt($("#card-index").value, 10);
  if (!Number.isInteger(index) || index < 1) {
    $("#card-status").textContent = "Enter an index starting at 1.";
    return;
  }
  $("#load-card").disabled = true;
  try {
    renderQuote(await loadQuote({ index }));
    $("#card-status").textContent = `Loaded quote ${index}.`;
  } catch {
    $("#card-status").textContent = "That quote index does not exist.";
  } finally {
    $("#load-card").disabled = false;
  }
}

async function copyText(text, button, original) {
  try {
    await navigator.clipboard.writeText(text);
    button.textContent = "Copied";
    setTimeout(() => { button.textContent = original; }, 1200);
  } catch {
    button.textContent = "Select manually";
  }
}

$("#hero-random").addEventListener("click", () => {
  randomQuote("Rolled a fresh quote.");
  $("#explore").scrollIntoView({ behavior: "smooth" });
});
$("#random-quote").addEventListener("click", () => randomQuote());
$("#search-form").addEventListener("submit", searchQuotes);
$("#load-card").addEventListener("click", loadCard);
$("#card-index").addEventListener("keydown", (event) => {
  if (event.key === "Enter") loadCard();
});
$("#random-card").addEventListener("click", async () => {
  try {
    renderQuote(await loadQuote({}, { cache: "no-store" }));
    $("#card-status").textContent = `Loaded random quote ${state.quote.index}.`;
  } catch {
    $("#card-status").textContent = "Could not load a random quote.";
  }
});
$("#copy-quote").addEventListener("click", () => {
  if (!state.quote) return;
  copyText(`“${state.quote.quote}” — ${state.quote.author}`, $("#copy-quote"), "⧉");
});
$("#copy-card-url").addEventListener("click", () => {
  copyText(`${location.origin}${$("#card-url").textContent}`, $("#copy-card-url"), "Copy URL ↗");
});
document.querySelectorAll(".theme-chip").forEach((button) => {
  button.addEventListener("click", () => {
    state.theme = button.dataset.theme;
    document.querySelectorAll(".theme-chip").forEach((chip) => chip.classList.remove("active"));
    button.classList.add("active");
    updateCard();
  });
});

Promise.all([
  loadQuote({ seed: 0 }).then(renderQuote),
  getJson("/api/stats").then((stats) => {
    $("#stat-quotes").textContent = stats.quotes.toLocaleString();
    $("#stat-authors").textContent = stats.authors.toLocaleString();
  })
]).catch(() => {
  $("#hero-quote").textContent = "The archive is warming up.";
  $("#quote-text").textContent = "Could not load the quote index.";
});