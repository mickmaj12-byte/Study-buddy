const $ = (id) => document.getElementById(id);
const views = ["tutor", "notes", "quiz", "tasks"];

document.querySelectorAll(".nav-item").forEach(button => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".nav-item").forEach(item => item.classList.toggle("active", item === button));
    views.forEach(view => $("view-" + view).classList.toggle("active", view === button.dataset.view));
  });
});

function safeText(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[char]);
}

function formatAnswer(text) {
  // Render a deliberately small, safe Markdown-like subset; never inject raw HTML.
  const lines = String(text || "").split(/\r?\n/);
  let html = "", listType = null;
  const closeList = () => { if (listType) { html += `</${listType}>`; listType = null; } };
  const inline = (s) => safeText(s)
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/`([^`]+)`/g, "<code>$1</code>");
  for (const raw of lines) {
    const line = raw.trim();
    const bullet = line.match(/^[-*]\s+(.+)/);
    const numbered = line.match(/^\d+[.)]\s+(.+)/);
    if (bullet || numbered) {
      const type = bullet ? "ul" : "ol";
      if (listType !== type) { closeList(); html += `<${type}>`; listType = type; }
      html += `<li>${inline((bullet || numbered)[1])}</li>`;
    } else {
      closeList();
      if (!line) continue;
      if (/^#{1,3}\s+/.test(line)) html += `<h3>${inline(line.replace(/^#{1,3}\s+/, ""))}</h3>`;
      else html += `<p>${inline(line)}</p>`;
    }
  }
  closeList();
  return html || "<p>No answer was returned. Try again.</p>";
}

async function askAI({mode, input, subject, style, count, level}, resultId, buttonId) {
  const result = $(resultId), button = $(buttonId);
  const original = button.innerHTML;
  if (!input.trim()) {
    result.classList.remove("hidden");
    result.innerHTML = '<p class="error">Add a question, topic, or notes first.</p>';
    return;
  }
  button.disabled = true;
  button.innerHTML = "Thinking…";
  result.classList.remove("hidden");
  result.innerHTML = "<p>✦ Your study buddy is working on it…</p>";
  try {
    const response = await fetch("/api/study", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({mode, input: input.trim(), subject, style, count, level})
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || "Something went wrong. Please try again.");
    result.innerHTML = formatAnswer(data.answer);
  } catch (error) {
    const message = error.message === "Failed to fetch"
      ? "The AI server isn't connected yet. Follow the README setup steps to deploy the backend."
      : error.message;
    result.innerHTML = `<p class="error">${safeText(message)}</p>`;
  } finally {
    button.disabled = false;
    button.innerHTML = original;
  }
}

$("tutor-submit").addEventListener("click", () => askAI({
  mode: "explain", input: $("tutor-question").value, subject: $("tutor-subject").value
}, "tutor-result", "tutor-submit"));

$("notes-submit").addEventListener("click", () => askAI({
  mode: "summarize", input: $("notes-input").value, style: $("summary-style").value
}, "notes-result", "notes-submit"));

$("quiz-submit").addEventListener("click", () => askAI({
  mode: "quiz", input: $("quiz-input").value, count: Number($("quiz-count").value), level: $("quiz-level").value
}, "quiz-result", "quiz-submit"));

// Homework is stored only in this browser, not sent to the AI service.
const STORAGE_KEY = "studyBuddyTasksV1";
let tasks = [];
try { tasks = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); if (!Array.isArray(tasks)) tasks = []; } catch { tasks = []; }

function saveTasks() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks)); } catch {}
  renderTasks();
}
function renderTasks() {
  const completed = tasks.filter(task => task.done).length;
  $("task-count").textContent = `${tasks.length} assignment${tasks.length === 1 ? "" : "s"} · ${completed} completed`;
  if (!tasks.length) {
    $("task-list").innerHTML = '<div class="empty">No assignments yet. Add one above to get started ✦</div>';
    return;
  }
  $("task-list").innerHTML = tasks.map(task => `
    <div class="task-item ${task.done ? "done" : ""}">
      <input type="checkbox" aria-label="Mark ${safeText(task.title)} completed" data-check="${task.id}" ${task.done ? "checked" : ""}>
      <div class="task-copy"><div class="task-title">${safeText(task.title)}</div><div class="task-meta">${safeText(task.subject)}</div></div>
      <button class="delete-task" aria-label="Delete assignment" data-delete="${task.id}">×</button>
    </div>`).join("");
  $("task-list").querySelectorAll("[data-check]").forEach(input => input.addEventListener("change", () => {
    const task = tasks.find(item => item.id === input.dataset.check);
    if (task) task.done = input.checked;
    saveTasks();
  }));
  $("task-list").querySelectorAll("[data-delete]").forEach(button => button.addEventListener("click", () => {
    tasks = tasks.filter(item => item.id !== button.dataset.delete);
    saveTasks();
  }));
}
$("task-form").addEventListener("submit", event => {
  event.preventDefault();
  const title = $("task-name").value.trim();
  if (!title) return;
  tasks.unshift({id: `${Date.now()}-${Math.random().toString(16).slice(2)}`, title, subject: $("task-subject").value, done: false});
  $("task-name").value = "";
  saveTasks();
});
$("clear-completed").addEventListener("click", () => {
  tasks = tasks.filter(task => !task.done);
  saveTasks();
});
renderTasks();
