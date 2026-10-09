// ============================================================
// Todo Life Dashboard — app.js
// ============================================================

// ============================================================
// Storage Helpers
// ============================================================

function loadFromStorage(key) {
  try {
    var result = localStorage.getItem(key);
    return result === null ? null : JSON.parse(result);
  } catch (e) {
    return null;
  }
}

function saveToStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    showToast("Could not save.");
  }
}

// ============================================================
// Error Toast
// ============================================================

function showToast(msg) {
  var toast = document.getElementById("error-toast");
  if (!toast) return;
  toast.textContent = msg;
  toast.hidden = false;
  setTimeout(function () {
    toast.hidden = true;
  }, 4000);
}

// ============================================================
// Clock Module
// ============================================================

var clock = (function () {
  var clockEl, dateEl;

  function formatTime(d) {
    return [d.getHours(), d.getMinutes(), d.getSeconds()]
      .map(function (n) { return String(n).padStart(2, "0"); })
      .join(":");
  }

  function formatDate(d) {
    return d.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  }

  function tick() {
    var now = new Date();
    if (clockEl) clockEl.textContent = formatTime(now);
    if (dateEl) dateEl.textContent = formatDate(now);
  }

  function init() {
    clockEl = document.getElementById("clock");
    dateEl = document.getElementById("date");
    tick();
    setInterval(tick, 1000);
    document.addEventListener("visibilitychange", function () {
      if (document.visibilityState === "visible") tick();
    });
  }

  return { init: init, tick: tick };
})();

// ============================================================
// Theme Module
// ============================================================

var theme = (function () {
  function apply(t) {
    document.documentElement.setAttribute("data-theme", t);
    var btn = document.getElementById("theme-toggle");
    if (btn) btn.textContent = t === "dark" ? "☀️" : "🌙";
  }

  function init() {
    apply(loadFromStorage("theme") || "light");
    document.getElementById("theme-toggle").addEventListener("click", function () {
      var current = document.documentElement.getAttribute("data-theme");
      var next = current === "dark" ? "light" : "dark";
      saveToStorage("theme", next);
      apply(next);
    });
  }

  return { init: init };
})();

// ============================================================
// Display Name Module
// ============================================================

var displayName = (function () {
  function getEffectiveName() {
    var stored = loadFromStorage("displayName");
    return (stored && stored.trim()) ? stored.trim() : "Friend";
  }

  function init() {
    var input   = document.getElementById("name-input");
    var saveBtn = document.getElementById("name-save-btn");
    var errEl   = document.getElementById("name-error");
    var okEl    = document.getElementById("name-confirm");
    var saved   = loadFromStorage("displayName");

    if (saved && saved.trim()) input.value = saved.trim();

    function save() {
      var value = input.value.trim();
      errEl.hidden = true;
      okEl.hidden = true;

      if (!value) {
        errEl.textContent = "Name cannot be empty.";
        errEl.hidden = false;
        return;
      }

      saveToStorage("displayName", value);
      okEl.hidden = false;
      setTimeout(function () { okEl.hidden = true; }, 2000);
      greeting.render(value);
    }

    saveBtn.addEventListener("click", save);
    input.addEventListener("keydown", function (e) {
      if (e.key === "Enter") save();
    });
  }

  return { getEffectiveName: getEffectiveName, init: init };
})();

// ============================================================
// Greeting Module
// ============================================================

var greeting = (function () {
  var prefix = "";

  function getPrefix(hour) {
    if (hour >= 5  && hour < 12) return "Good morning";
    if (hour >= 12 && hour < 17) return "Good afternoon";
    if (hour >= 17 && hour < 21) return "Good evening";
    return "Good night";
  }

  function render(name) {
    var el = document.getElementById("greeting");
    if (el) el.textContent = prefix + ", " + name + "!";
  }

  function init() {
    prefix = getPrefix(new Date().getHours());
    render(displayName.getEffectiveName());
  }

  return { getPrefix: getPrefix, render: render, init: init };
})();

// ============================================================
// Focus Timer Module
// ============================================================

var timer = (function () {
  var total     = 25 * 60;
  var remaining = 25 * 60;
  var intervalId = null;
  var running   = false;

  function formatTime(seconds) {
    return String(Math.floor(seconds / 60)).padStart(2, "0") + ":" +
           String(seconds % 60).padStart(2, "0");
  }

  function updateDisplay() {
    var display = document.getElementById("timer-display");
    if (display) display.textContent = formatTime(remaining);
  }

  function tick() {
    if (remaining <= 0) {
      clearInterval(intervalId);
      intervalId = null;
      running = false;
      var complete = document.getElementById("timer-complete");
      if (complete) complete.hidden = false;
      return;
    }
    remaining--;
    updateDisplay();
  }

  function init() {
    var startBtn  = document.getElementById("timer-start");
    var stopBtn   = document.getElementById("timer-stop");
    var resetBtn  = document.getElementById("timer-reset");
    var durationInput = document.getElementById("duration-input");
    var durationErr   = document.getElementById("duration-error");
    var completeMsg   = document.getElementById("timer-complete");

    updateDisplay();

    startBtn.addEventListener("click", function () {
      if (running) return;

      // Only apply new duration when starting fresh
      if (remaining === total) {
        var value = parseInt(durationInput.value, 10);
        durationErr.hidden = true;
        if (isNaN(value) || value < 1 || value > 180) {
          durationErr.textContent = "Enter 1-180 minutes.";
          durationErr.hidden = false;
          return;
        }
        total = value * 60;
        remaining = total;
        completeMsg.hidden = true;
        updateDisplay();
      }

      running = true;
      intervalId = setInterval(tick, 1000);
    });

    stopBtn.addEventListener("click", function () {
      if (!running) return;
      clearInterval(intervalId);
      intervalId = null;
      running = false;
    });

    resetBtn.addEventListener("click", function () {
      clearInterval(intervalId);
      intervalId = null;
      running = false;
      var value = parseInt(durationInput.value, 10);
      var minutes = (!isNaN(value) && value >= 1 && value <= 180) ? value : 25;
      durationInput.value = minutes;
      total = minutes * 60;
      remaining = total;
      completeMsg.hidden = true;
      durationErr.hidden = true;
      updateDisplay();
    });
  }

  return { init: init };
})();

// ============================================================
// Tasks Module
// ============================================================

var tasksModule = (function () {
  var tasks = [];

  function save() {
    saveToStorage("tasks", tasks);
  }

  function render() {
    var list = document.getElementById("task-list");
    list.innerHTML = "";

    if (!tasks.length) {
      var placeholder = document.createElement("li");
      placeholder.className = "empty-placeholder";
      placeholder.textContent = "No tasks yet. Add one above!";
      list.appendChild(placeholder);
      return;
    }

    tasks.forEach(function (task, i) {
      var li = document.createElement("li");
      li.className = "task-item";

      // Checkbox
      var checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.className = "task-checkbox";
      checkbox.checked = task.done;
      checkbox.addEventListener("change", function () {
        tasks[i].done = checkbox.checked;
        save();
        render();
      });

      // Task text (double-click to edit)
      var span = document.createElement("span");
      span.className = "task-text" + (task.done ? " done" : "");
      span.textContent = task.text;
      span.addEventListener("dblclick", function () {
        var editInput = document.createElement("input");
        editInput.type = "text";
        editInput.className = "task-edit-input";
        editInput.value = task.text;
        editInput.maxLength = 100;
        li.replaceChild(editInput, span);
        editInput.focus();

        function commit() {
          var value = editInput.value.trim();
          if (value) tasks[i].text = value;
          save();
          render();
        }

        editInput.addEventListener("blur", commit);
        editInput.addEventListener("keydown", function (e) {
          if (e.key === "Enter")  editInput.blur();
          if (e.key === "Escape") render();
        });
      });

      // Delete button
      var deleteBtn = document.createElement("button");
      deleteBtn.className = "btn btn-danger btn-icon";
      deleteBtn.textContent = "×";
      deleteBtn.setAttribute("aria-label", "Delete task");
      deleteBtn.addEventListener("click", function () {
        tasks.splice(i, 1);
        save();
        render();
      });

      li.appendChild(checkbox);
      li.appendChild(span);
      li.appendChild(deleteBtn);
      list.appendChild(li);
    });
  }

  function init() {
    tasks = loadFromStorage("tasks") || [];
    var input  = document.getElementById("task-input");
    var addBtn = document.getElementById("task-add-btn");
    var errEl  = document.getElementById("task-error");

    render();

    function add() {
      var value = input.value.trim();
      errEl.hidden = true;
      if (!value) {
        errEl.textContent = "Task cannot be empty.";
        errEl.hidden = false;
        return;
      }
      tasks.push({ text: value, done: false });
      save();
      render();
      input.value = "";
      input.focus();
    }

    addBtn.addEventListener("click", add);
    input.addEventListener("keydown", function (e) {
      if (e.key === "Enter") add();
    });
  }

  return { init: init };
})();

// ============================================================
// Quick Links Module
// ============================================================

var linksModule = (function () {
  var links = [];
  var COLORS = ["#4f46e5", "#0891b2", "#16a34a", "#d97706", "#db2777", "#7c3aed"];

  function save() {
    saveToStorage("quickLinks", links);
  }

  function render() {
    var container = document.getElementById("links-list");
    container.innerHTML = "";

    if (!links.length) {
      var placeholder = document.createElement("p");
      placeholder.className = "empty-placeholder";
      placeholder.textContent = "No links yet. Add one above!";
      container.appendChild(placeholder);
      return;
    }

    links.forEach(function (link, i) {
      var wrap = document.createElement("div");
      wrap.className = "link-item";

      var anchor = document.createElement("a");
      anchor.href = link.url;
      anchor.target = "_blank";
      anchor.rel = "noopener noreferrer";
      anchor.className = "link-btn";
      anchor.textContent = link.name;
      anchor.style.background = COLORS[i % COLORS.length];
      anchor.style.color = "#fff";

      var removeBtn = document.createElement("button");
      removeBtn.className = "remove-link-btn";
      removeBtn.textContent = "×";
      removeBtn.setAttribute("aria-label", "Remove " + link.name);
      removeBtn.addEventListener("click", function () {
        links.splice(i, 1);
        save();
        render();
      });

      wrap.appendChild(anchor);
      wrap.appendChild(removeBtn);
      container.appendChild(wrap);
    });
  }

  function init() {
    links = loadFromStorage("quickLinks") || [];
    var nameInput = document.getElementById("link-name-input");
    var urlInput  = document.getElementById("link-url-input");
    var addBtn    = document.getElementById("link-add-btn");
    var errEl     = document.getElementById("link-error");

    render();

    addBtn.addEventListener("click", function () {
      var name = nameInput.value.trim();
      var url  = urlInput.value.trim();
      errEl.hidden = true;

      if (!name) {
        errEl.textContent = "Display name cannot be empty.";
        errEl.hidden = false;
        return;
      }
      if (!url) {
        errEl.textContent = "URL cannot be empty.";
        errEl.hidden = false;
        return;
      }
      if (!url.startsWith("http://") && !url.startsWith("https://")) {
        errEl.textContent = "URL must start with http:// or https://";
        errEl.hidden = false;
        return;
      }

      links.push({ name: name, url: url });
      save();
      render();
      nameInput.value = "";
      urlInput.value  = "";
      nameInput.focus();
    });
  }

  return { init: init };
})();

// ============================================================
// Bootstrap — initialise all modules on DOM ready
// ============================================================

document.addEventListener("DOMContentLoaded", function () {
  theme.init();
  clock.init();
  displayName.init();
  greeting.init();
  timer.init();
  tasksModule.init();
  linksModule.init();
});
