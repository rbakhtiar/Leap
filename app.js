"use strict";

/* =========================================================
   LEAP — APPLICATION CORE
   Version: 1.0.0
   Storage: Browser localStorage
   ========================================================= */

const Leap = (() => {
  const STORAGE_KEY = "leap-platform-v1";

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

  const escapeHTML = value =>
    String(value ?? "").replace(/[&<>"']/g, char => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    })[char]);

  const uid = () =>
    globalThis.crypto?.randomUUID?.() ??
    `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;

  const timeAgo = timestamp => {
    const seconds = Math.max(0, Math.floor((Date.now() - timestamp) / 1000));
    if (seconds < 60) return "just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return new Date(timestamp).toLocaleDateString();
  };

  const initialState = () => {
    const now = Date.now();

    return {
      version: 1,
      profile: {
        name: "Rahim Bakhtiar",
        username: "rbakhtiar",
        bio: "Developer. Builder. Creator.",
        location: "Pakistan"
      },

      theme: "dark",

      repositories: [
        {
          id: uid(),
          name: "Leap",
          description: "A developer platform built around Git repositories.",
          language: "JavaScript",
          visibility: "public",
          stars: 12,
          forkCount: 0,
          updatedAt: now - 3600000,
          createdAt: now - 86400000,
          defaultBranch: "main",
          files: [
            { name: "index.html", type: "file", message: "Create application shell" },
            { name: "styles.css", type: "file", message: "Add design system" },
            { name: "app.js", type: "file", message: "Build application core" },
            { name: "README.md", type: "file", message: "Add project documentation" },
            { name: "src", type: "folder", message: "Application source" }
          ],
          branches: ["main"],
          commits: [
            { id: "a1b2c3d", message: "Create application shell", author: "rbakhtiar", timestamp: now - 3600000 }
          ],
          readme: "# Leap\n\nA home for your code.\n\nLeap is a developer platform designed to bring source code hosting and collaboration into one workspace.\n\n## Features\n\n- Repository management\n- Issue tracking\n- Pull request workflows\n- Developer profiles\n\n## Getting started\n\nClone the repository and start building."
        },
        {
          id: uid(),
          name: "GitWork",
          description: "A workspace for managing software development projects.",
          language: "TypeScript",
          visibility: "public",
          stars: 8,
          forkCount: 1,
          updatedAt: now - 86400000,
          createdAt: now - 172800000,
          defaultBranch: "main",
          files: [
            { name: "README.md", type: "file", message: "Document project" },
            { name: "src", type: "folder", message: "Add source directory" },
            { name: "package.json", type: "file", message: "Initialize project" }
          ],
          branches: ["main", "development"],
          commits: [
            { id: "e4f5g6h", message: "Initialize project", author: "rbakhtiar", timestamp: now - 86400000 }
          ],
          readme: "# GitWork\n\nA dedicated workspace for software development."
        },
        {
          id: uid(),
          name: "Clamme",
          description: "A unified workspace for documents, spreadsheets, and presentations.",
          language: "HTML",
          visibility: "public",
          stars: 19,
          forkCount: 2,
          updatedAt: now - 172800000,
          createdAt: now - 604800000,
          defaultBranch: "main",
          files: [
            { name: "index.html", type: "file", message: "Build application" },
            { name: "manifest.json", type: "file", message: "Configure PWA" },
            { name: "sw.js", type: "file", message: "Add service worker" }
          ],
          branches: ["main"],
          commits: [
            { id: "i7j8k9l", message: "Build application", author: "rbakhtiar", timestamp: now - 172800000 }
          ],
          readme: "# Clamme\n\nA quieter way to create."
        }
      ],

      issues: [
        {
          id: uid(),
          number: 1,
          title: "Improve repository search",
          description: "Add more search filters to the repository explorer.",
          repository: "Leap",
          status: "open",
          labels: ["enhancement"],
          author: "rbakhtiar",
          createdAt: now - 3600000
        }
      ],

      pulls: [
        {
          id: uid(),
          number: 1,
          title: "Add initial application interface",
          description: "Introduce the first Leap interface.",
          repository: "Leap",
          status: "open",
          source: "feature/interface",
          target: "main",
          author: "rbakhtiar",
          createdAt: now - 7200000
        }
      ],

      discussions: [
        {
          id: uid(),
          title: "Welcome to Leap",
          description: "Use this space to discuss ideas and project direction.",
          category: "Announcements",
          author: "rbakhtiar",
          createdAt: now - 86400000
        }
      ],

      notifications: [],

      activity: [
        {
          id: uid(),
          type: "repository",
          message: "Created the Leap repository",
          repository: "Leap",
          timestamp: now - 3600000
        },
        {
          id: uid(),
          type: "repository",
          message: "Created the GitWork repository",
          repository: "GitWork",
          timestamp: now - 86400000
        }
      ]
    };
  };

  let state = loadState();
  let currentPage = "dashboard";
  let currentRepository = null;
  let currentRepoTab = "code";
  let currentSettingsTab = "general";
  let modalAction = null;

  function loadState() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return initialState();

      const parsed = JSON.parse(saved);

      if (
        !parsed ||
        parsed.version !== 1 ||
        !Array.isArray(parsed.repositories) ||
        !parsed.profile
      ) {
        return initialState();
      }

      return {
        ...initialState(),
        ...parsed,
        profile: { ...initialState().profile, ...parsed.profile }
      };
    } catch (error) {
      console.error("Leap storage could not be loaded:", error);
      return initialState();
    }
  }

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.error("Leap storage could not be saved:", error);
      toast("Unable to save. Browser storage may be full.", "error");
    }
  }

  function toast(message, type = "success") {
    const container = $("#toastContainer");
    const element = document.createElement("div");

    element.className = `toast ${type === "error" ? "error" : ""}`;
    element.textContent = message;
    container.appendChild(element);

    setTimeout(() => element.remove(), 3200);
  }

  function recordActivity(message, repository = "") {
    state.activity.unshift({
      id: uid(),
      type: "activity",
      message,
      repository,
      timestamp: Date.now()
    });

    state.activity = state.activity.slice(0, 100);
    saveState();
  }

  function addNotification(title, description = "") {
    state.notifications.unshift({
      id: uid(),
      title,
      description,
      read: false,
      timestamp: Date.now()
    });

    state.notifications = state.notifications.slice(0, 100);
    saveState();
  }

  function getRepository(name) {
    return state.repositories.find(repo => repo.name === name);
  }

  function getOpenIssues() {
    return state.issues.filter(issue => issue.status === "open");
  }

  function getOpenPulls() {
    return state.pulls.filter(pull => pull.status === "open");
  }

  function getStars() {
    return state.repositories.reduce((sum, repo) => sum + repo.stars, 0);
  }

  function navigate(page) {
    if (page === "repository") {
      currentPage = page;
    } else {
      const target = $(`#page-${page}`);
      if (!target) return;
      currentPage = page;
    }

    $$(".page").forEach(section => section.classList.remove("active"));

    const selected = $(`#page-${page}`);
    if (selected) selected.classList.add("active");

    $$(".nav-item").forEach(item => {
      item.classList.toggle("active", item.dataset.page === page);
    });

    $("#sidebar").classList.remove("open");

    if (page === "dashboard") renderDashboard();
    if (page === "repositories") renderRepositories();
    if (page === "issues") renderIssues();
    if (page === "pulls") renderPulls();
    if (page === "discussions") renderDiscussions();
    if (page === "activity") renderActivity();
    if (page === "explore") renderExplore();
    if (page === "notifications") renderNotifications();
    if (page === "profile") renderProfile();
    if (page === "settings") renderSettings();

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function updateCounters() {
    $("#repoCount").textContent = state.repositories.length;
    $("#issueCount").textContent = getOpenIssues().length;
    $("#pullCount").textContent = getOpenPulls().length;
  }

  function repositoryHTML(repo) {
    return `
      <div class="repo-row">
        <div class="repo-symbol">▤</div>
        <div class="repo-main">
          <a class="repo-name" href="#" data-open-repo="${escapeHTML(repo.name)}">
            ${escapeHTML(repo.name)}
          </a>
          <p class="repo-description">${escapeHTML(repo.description || "No description provided.")}</p>
        </div>
        <div class="repo-meta">
          <span><i class="language-dot"></i>${escapeHTML(repo.language)}</span>
          <span>☆ ${repo.stars}</span>
          <span class="visibility-label">${escapeHTML(repo.visibility)}</span>
          <span>${timeAgo(repo.updatedAt)}</span>
        </div>
      </div>
    `;
  }

  function emptyState(title, description, action = "") {
    return `
      <div class="empty-state">
        <h3>${escapeHTML(title)}</h3>
        <p>${escapeHTML(description)}</p>
        ${action}
      </div>
    `;
  }

  function renderDashboard() {
    updateCounters();

    $("#dashboardRepos").textContent = state.repositories.length;
    $("#dashboardIssues").textContent = getOpenIssues().length;
    $("#dashboardPulls").textContent = getOpenPulls().length;
    $("#dashboardStars").textContent = getStars();

    const recent = [...state.repositories]
      .sort((a, b) => b.updatedAt - a.updatedAt)
      .slice(0, 5);

    $("#recentRepositories").innerHTML = recent.length
      ? recent.map(repositoryHTML).join("")
      : emptyState("No repositories yet", "Create your first repository.");

    $("#dashboardActivity").innerHTML = state.activity.length
      ? state.activity.slice(0, 5).map(activityHTML).join("")
      : emptyState("No activity yet", "Your workspace events will appear here.");
  }

  function renderRepositories() {
    updateCounters();

    const filter = ($("#repoFilter")?.value || "").toLowerCase();
    const visibility = $("#repoVisibility")?.value || "all";
    const sort = $("#repoSort")?.value || "updated";

    let repos = state.repositories.filter(repo => {
      const matchesText =
        repo.name.toLowerCase().includes(filter) ||
        repo.description.toLowerCase().includes(filter);

      const matchesVisibility =
        visibility === "all" || repo.visibility === visibility;

      return matchesText && matchesVisibility;
    });

    if (sort === "name") {
      repos.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sort === "stars") {
      repos.sort((a, b) => b.stars - a.stars);
    } else {
      repos.sort((a, b) => b.updatedAt - a.updatedAt);
    }

    $("#allRepositories").innerHTML = repos.length
      ? repos.map(repositoryHTML).join("")
      : emptyState("No repositories found", "Try another search or create a repository.");
  }

  function openRepository(name) {
    const repo = getRepository(name);
    if (!repo) return;

    currentRepository = repo.id;
    currentRepoTab = "code";

    $$(".page").forEach(page => page.classList.remove("active"));
    $("#page-repository").classList.add("active");

    currentPage = "repository";
    renderRepositoryDetail();

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function activeRepository() {
    return state.repositories.find(repo => repo.id === currentRepository);
  }

  function renderRepositoryDetail() {
    const repo = activeRepository();
    if (!repo) {
      navigate("repositories");
      return;
    }

    $("#repoDetailName").textContent = repo.name;
    $("#repoDetailDescription").textContent = repo.description;
    $("#repoStarButton").textContent = `☆ Star · ${repo.stars}`;

    $$(".repo-tab").forEach(tab => {
      tab.classList.toggle("active", tab.dataset.repotab === currentRepoTab);
    });

    const container = $("#repoTabContent");

    if (currentRepoTab === "code") {
      renderCodeTab(repo, container);
    } else if (currentRepoTab === "issues") {
      const issues = state.issues.filter(issue => issue.repository === repo.name);
      container.innerHTML = issues.length
        ? `<div class="panel data-panel">${issues.map(issueHTML).join("")}</div>`
        : emptyState("No repository issues", "This repository has no issues.");
    } else if (currentRepoTab === "pulls") {
      const pulls = state.pulls.filter(pull => pull.repository === repo.name);
      container.innerHTML = pulls.length
        ? `<div class="panel data-panel">${pulls.map(pullHTML).join("")}</div>`
        : emptyState("No pull requests", "This repository has no pull requests.");
    } else {
      const events = state.activity.filter(event => event.repository === repo.name);
      container.innerHTML = `<div class="panel activity-list">${events.length
        ? events.map(activityHTML).join("")
        : emptyState("No repository activity", "Activity will appear here.")}</div>`;
    }
  }

  function renderCodeTab(repo, container) {
    const files = repo.files || [];

    container.innerHTML = `
      <div class="code-toolbar">
        <select class="field branch-select" id="branchSelect">
          ${(repo.branches || ["main"]).map(branch =>
            `<option value="${escapeHTML(branch)}">${escapeHTML(branch)}</option>`
          ).join("")}
        </select>
        <span class="repo-meta">${repo.commits.length} recorded commits</span>
      </div>

      <div class="code-table">
        ${files.map(file => `
          <div class="code-file-row" data-file="${escapeHTML(file.name)}">
            <span class="file-icon">${file.type === "folder" ? "▰" : "▤"}</span>
            <span class="file-name">${escapeHTML(file.name)}</span>
            <span class="file-message">${escapeHTML(file.message || "No commit message")}</span>
            <span class="file-date">${timeAgo(repo.updatedAt)}</span>
          </div>
        `).join("")}
      </div>

      <article class="readme">
        <h2>README.md</h2>
        <div class="readme-content">${renderMarkdown(repo.readme || `# ${repo.name}\n\nNo README provided.`)}</div>
      </article>

      <section class="panel" style="margin-top:16px">
        <div class="panel-heading">
          <div><h3>Recent commits</h3><p>Locally recorded project history</p></div>
        </div>
        ${repo.commits.slice(0, 8).map(commit => `
          <div class="data-row">
            <div class="data-row-main">
              <div class="data-row-title">${escapeHTML(commit.message)}</div>
              <div class="data-row-description">
                ${escapeHTML(commit.author)} · ${timeAgo(commit.timestamp)}
              </div>
            </div>
            <code>${escapeHTML(commit.id)}</code>
          </div>
        `).join("")}
      </section>
    `;

    $("#branchSelect").addEventListener("change", event => {
      toast(`Selected branch: ${event.target.value}. Branch switching requires Git backend integration.`);
    });
  }

  function renderMarkdown(markdown) {
    const safe = escapeHTML(markdown);

    return safe
      .replace(/^### (.+)$/gm, "<h3>$1</h3>")
      .replace(/^## (.+)$/gm, "<h2>$1</h2>")
      .replace(/^# (.+)$/gm, "<h1>$1</h1>")
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      .replace(/`([^`]+)`/g, "<code>$1</code>")
      .replace(/^- (.+)$/gm, "<li>$1</li>")
      .replace(/(?:\r\n|\r|\n){2,}/g, "</p><p>")
      .replace(/^(?!<[hlu])/gm, "")
      .replace(/\n/g, "<br>");
  }

  function issueHTML(issue) {
    return `
      <div class="data-row">
        <div class="activity-marker"></div>
        <div class="data-row-main">
          <div class="data-row-title">${escapeHTML(issue.title)}</div>
          <div class="data-row-description">
            #${issue.number} · ${escapeHTML(issue.repository)} · ${escapeHTML(issue.author)}
          </div>
        </div>
        <span class="status-pill ${issue.status === "closed" ? "closed" : ""}">
          ${escapeHTML(issue.status)}
        </span>
        <button class="data-action" data-toggle-issue="${issue.id}">
          ${issue.status === "open" ? "Close" : "Reopen"}
        </button>
      </div>
    `;
  }

  function pullHTML(pull) {
    return `
      <div class="data-row">
        <div class="activity-marker"></div>
        <div class="data-row-main">
          <div class="data-row-title">${escapeHTML(pull.title)}</div>
          <div class="data-row-description">
            #${pull.number} · ${escapeHTML(pull.repository)}
            · ${escapeHTML(pull.source)} → ${escapeHTML(pull.target)}
          </div>
        </div>
        <span class="status-pill ${escapeHTML(pull.status)}">${escapeHTML(pull.status)}</span>
        ${pull.status === "open"
          ? `<button class="data-action" data-merge-pull="${pull.id}">Merge</button>`
          : ""}
      </div>
    `;
  }

  function renderIssues() {
    const filter = ($("#issueFilter")?.value || "").toLowerCase();
    const status = $("#issueStatus")?.value || "all";

    const issues = state.issues.filter(issue => {
      const textMatch =
        issue.title.toLowerCase().includes(filter) ||
        issue.repository.toLowerCase().includes(filter);

      return textMatch && (status === "all" || issue.status === status);
    });

    $("#issuesList").innerHTML = issues.length
      ? issues.map(issueHTML).join("")
      : emptyState("No issues found", "Create an issue to start tracking work.");
  }

  function renderPulls() {
    const filter = ($("#pullFilter")?.value || "").toLowerCase();
    const status = $("#pullStatus")?.value || "all";

    const pulls = state.pulls.filter(pull => {
      const textMatch =
        pull.title.toLowerCase().includes(filter) ||
        pull.repository.toLowerCase().includes(filter);

      return textMatch && (status === "all" || pull.status === status);
    });

    $("#pullsList").innerHTML = pulls.length
      ? pulls.map(pullHTML).join("")
      : emptyState("No pull requests found", "Create a pull request to propose changes.");
  }

  function renderDiscussions() {
    $("#discussionsList").innerHTML = state.discussions.length
      ? state.discussions.map(discussion => `
          <div class="data-row">
            <div class="repo-symbol">▤</div>
            <div class="data-row-main">
              <div class="data-row-title">${escapeHTML(discussion.title)}</div>
              <div class="data-row-description">
                ${escapeHTML(discussion.description)}
              </div>
              <div class="data-row-description">
                ${escapeHTML(discussion.category)} · ${escapeHTML(discussion.author)}
                · ${timeAgo(discussion.createdAt)}
              </div>
            </div>
          </div>
        `).join("")
      : emptyState("No discussions yet", "Start a conversation with your community.");
  }

  function activityHTML(event) {
    return `
      <div class="activity-row">
        <span class="activity-marker"></span>
        <div class="activity-text">
          <strong>${escapeHTML(state.profile.username)}</strong>
          ${escapeHTML(event.message)}
          ${event.repository ? `in <strong>${escapeHTML(event.repository)}</strong>` : ""}
        </div>
        <span class="activity-time">${timeAgo(event.timestamp)}</span>
      </div>
    `;
  }

  function renderActivity() {
    $("#fullActivity").innerHTML = state.activity.length
      ? state.activity.map(activityHTML).join("")
      : emptyState("No activity yet", "Your workspace history will appear here.");
  }

  function renderExplore() {
    $("#exploreRepositories").innerHTML = state.repositories.length
      ? state.repositories.map(repo => `
          <article class="explore-card">
            <div class="eyebrow">PUBLIC REPOSITORY</div>
            <h3>
              <a href="#" data-open-repo="${escapeHTML(repo.name)}">${escapeHTML(repo.name)}</a>
            </h3>
            <p>${escapeHTML(repo.description)}</p>
            <div class="explore-card-footer">
              <span><i class="language-dot"></i>${escapeHTML(repo.language)}</span>
              <span>☆ ${repo.stars}</span>
              <span>${escapeHTML(repo.visibility)}</span>
            </div>
          </article>
        `).join("")
      : emptyState("Nothing to explore", "Create your first repository.");
  }

  function renderNotifications() {
    $("#notificationsList").innerHTML = state.notifications.length
      ? state.notifications.map(notification => `
          <div class="data-row">
            <div class="activity-marker" style="${notification.read ? "opacity:.25" : ""}"></div>
            <div class="data-row-main">
              <div class="data-row-title">${escapeHTML(notification.title)}</div>
              <div class="data-row-description">
                ${escapeHTML(notification.description)} · ${timeAgo(notification.timestamp)}
              </div>
            </div>
            ${notification.read ? "" : `<span class="status-pill">New</span>`}
          </div>
        `).join("")
      : emptyState("You're all caught up", "New workspace notifications will appear here.");
  }

  function renderProfile() {
    const profile = state.profile;

    $("#profileName").textContent = profile.name;
    $("#profileUsername").textContent = `@${profile.username}`;
    $("#profileBio").textContent = profile.bio;

    $("#profileRepos").textContent = state.repositories.length;
    $("#profileStars").textContent = getStars();
    $("#profileIssues").textContent = state.issues.length;
    $("#profilePulls").textContent = state.pulls.length;

    $("#profileRepositories").innerHTML = [...state.repositories]
      .sort((a, b) => b.stars - a.stars)
      .slice(0, 5)
      .map(repositoryHTML)
      .join("");
  }

  function renderSettings() {
    const content = $("#settingsContent");

    if (currentSettingsTab === "general") {
      content.innerHTML = `
        <h3>General settings</h3>
        <p>Manage your account preferences.</p>

        <div class="setting-row">
          <div>
            <strong>Display name</strong>
            <small>${escapeHTML(state.profile.name)}</small>
          </div>
          <button class="secondary-button" data-action="edit-profile">Edit</button>
        </div>

        <div class="setting-row">
          <div>
            <strong>Username</strong>
            <small>@${escapeHTML(state.profile.username)}</small>
          </div>
        </div>

        <div class="setting-row">
          <div>
            <strong>Default repository visibility</strong>
            <small>Visibility for newly created repositories.</small>
          </div>
          <select class="field" id="defaultVisibility">
            <option value="public">Public</option>
            <option value="private">Private</option>
          </select>
        </div>
      `;

      $("#defaultVisibility").value =
        localStorage.getItem("leap-default-visibility") || "public";

      $("#defaultVisibility").addEventListener("change", event => {
        localStorage.setItem("leap-default-visibility", event.target.value);
        toast("Default visibility updated.");
      });

    } else if (currentSettingsTab === "appearance") {
      content.innerHTML = `
        <h3>Appearance</h3>
        <p>Choose how Leap looks on your device.</p>

        <div class="setting-row">
          <div><strong>Dark theme</strong><small>Deep forest green surfaces.</small></div>
          <button class="toggle ${state.theme === "dark" ? "on" : ""}" data-toggle-theme aria-label="Toggle dark theme"></button>
        </div>

        <div class="setting-row">
          <div><strong>Light theme</strong><small>Clean light workspace.</small></div>
          <button class="secondary-button" data-theme-choice="light">Use light</button>
        </div>

        <div class="setting-row">
          <div><strong>Dark theme</strong><small>Emerald developer workspace.</small></div>
          <button class="secondary-button" data-theme-choice="dark">Use dark</button>
        </div>
      `;

    } else {
      content.innerHTML = `
        <h3>Data and privacy</h3>
        <p>Your current Leap demo data is stored in this browser.</p>

        <div class="setting-row">
          <div>
            <strong>Export workspace</strong>
            <small>Download a JSON backup of your local data.</small>
          </div>
          <button class="secondary-button" data-action="export">Export</button>
        </div>

        <div class="setting-row">
          <div>
            <strong>Import workspace</strong>
            <small>Restore a previously exported JSON backup.</small>
          </div>
          <button class="secondary-button" data-action="import">Import</button>
        </div>

        <div class="setting-row">
          <div>
            <strong>Reset local workspace</strong>
            <small>Delete locally stored Leap data and restore the sample workspace.</small>
          </div>
          <button class="secondary-button" data-action="reset">Reset</button>
        </div>

        <input type="file" id="importFile" accept="application/json" hidden>
      `;
    }
  }

  function setTheme(theme) {
    if (!["dark", "light"].includes(theme)) return;

    state.theme = theme;
    document.documentElement.dataset.theme = theme;
    $("#themeIcon").textContent = theme === "dark" ? "◐" : "☼";

    saveState();
  }

  function showModal(title, fields, submitLabel, action) {
    modalAction = action;

    $("#modalTitle").textContent = title;
    $("#modalSubmit").textContent = submitLabel;
    $("#modalFields").innerHTML = fields;
    $("#modalError").classList.add("hidden");
    $("#modalBackdrop").classList.remove("hidden");

    const firstInput = $("#modalFields input, #modalFields textarea, #modalFields select");
    if (firstInput) setTimeout(() => firstInput.focus(), 50);
  }

  function closeModal() {
    $("#modalBackdrop").classList.add("hidden");
    $("#modalForm").reset();
    modalAction = null;
  }

  function field(name, label, options = {}) {
    const {
      type = "text",
      placeholder = "",
      required = true,
      value = "",
      help = "",
      choices = [],
      multiline = false
    } = options;

    let control;

    if (choices.length) {
      control = `
        <select class="form-control" name="${name}" ${required ? "required" : ""}>
          ${choices.map(choice => `
            <option value="${escapeHTML(choice.value)}" ${choice.value === value ? "selected" : ""}>
              ${escapeHTML(choice.label)}
            </option>
          `).join("")}
        </select>
      `;
    } else if (multiline) {
      control = `
        <textarea class="form-control" name="${name}"
          placeholder="${escapeHTML(placeholder)}"
          ${required ? "required" : ""}>${escapeHTML(value)}</textarea>
      `;
    } else {
      control = `
        <input class="form-control" name="${name}" type="${type}"
          placeholder="${escapeHTML(placeholder)}"
          value="${escapeHTML(value)}"
          ${required ? "required" : ""}>
      `;
    }

    return `
      <div class="form-group">
        <label for="field-${name}">${escapeHTML(label)}</label>
        ${control}
        ${help ? `<small>${escapeHTML(help)}</small>` : ""}
      </div>
    `;
  }

  function formValues(event) {
    return Object.fromEntries(new FormData(event.currentTarget).entries());
  }

  function openNewRepository() {
    showModal(
      "Create a repository",
      field("name", "Repository name", {
        placeholder: "my-awesome-project",
        help: "Use a short, descriptive name."
      }) +
      field("description", "Description", {
        required: false,
        placeholder: "What are you building?"
      }) +
      field("language", "Primary language", {
        choices: [
          { value: "JavaScript", label: "JavaScript" },
          { value: "TypeScript", label: "TypeScript" },
          { value: "HTML", label: "HTML" },
          { value: "CSS", label: "CSS" },
          { value: "Python", label: "Python" },
          { value: "C", label: "C" },
          { value: "C++", label: "C++" },
          { value: "Rust", label: "Rust" },
          { value: "Java", label: "Java" },
          { value: "Other", label: "Other" }
        ]
      }) +
      field("visibility", "Visibility", {
        choices: [
          { value: "public", label: "Public" },
          { value: "private", label: "Private" }
        ],
        value: localStorage.getItem("leap-default-visibility") || "public"
      }) +
      field("readme", "README", {
        multiline: true,
        required: false,
        value: "# Project\n\nDescribe your project here."
      }),
      "Create repository",
      values => {
        const name = values.name.trim();

        if (!/^[a-zA-Z0-9._-]+$/.test(name)) {
          throw new Error("Use only letters, numbers, dots, underscores, and hyphens.");
        }

        if (getRepository(name)) {
          throw new Error("A repository with that name already exists.");
        }

        const now = Date.now();

        const repo = {
          id: uid(),
          name,
          description: values.description.trim(),
          language: values.language,
          visibility: values.visibility,
          stars: 0,
          forkCount: 0,
          updatedAt: now,
          createdAt: now,
          defaultBranch: "main",
          branches: ["main"],
          files: [
            { name: "README.md", type: "file", message: "Initial commit" }
          ],
          commits: [
            {
              id: uid().slice(0, 7),
              message: "Initial commit",
              author: state.profile.username,
              timestamp: now
            }
          ],
          readme: values.readme || `# ${name}\n\n${values.description}`
        };

        state.repositories.unshift(repo);
        recordActivity(`Created the ${name} repository`, name);
        addNotification("Repository created", `${name} is now in your workspace.`);

        saveState();
        closeModal();
        renderDashboard();
        toast("Repository created.");
        navigate("repositories");
      }
    );
  }

  function openNewIssue() {
    if (!state.repositories.length) {
      toast("Create a repository first.", "error");
      return;
    }

    showModal(
      "Create an issue",
      field("title", "Issue title", { placeholder: "Describe the issue" }) +
      field("description", "Description", {
        multiline: true,
        required: false,
        placeholder: "Add more details..."
      }) +
      field("repository", "Repository", {
        choices: state.repositories.map(repo => ({
          value: repo.name,
          label: repo.name
        }))
      }) +
      field("labels", "Labels", {
        required: false,
        placeholder: "bug, enhancement"
      }),
      "Create issue",
      values => {
        const issue = {
          id: uid(),
          number: Math.max(0, ...state.issues.map(item => item.number)) + 1,
          title: values.title.trim(),
          description: values.description.trim(),
          repository: values.repository,
          status: "open",
          labels: values.labels.split(",").map(label => label.trim()).filter(Boolean),
          author: state.profile.username,
          createdAt: Date.now()
        };

        state.issues.unshift(issue);
        recordActivity(`Opened issue #${issue.number}: ${issue.title}`, issue.repository);
        addNotification("New issue created", issue.title);

        saveState();
        closeModal();
        renderIssues();
        renderDashboard();
        toast("Issue created.");
      }
    );
  }

  function openNewPull() {
    if (!state.repositories.length) {
      toast("Create a repository first.", "error");
      return;
    }

    showModal(
      "Create a pull request",
      field("title", "Title", { placeholder: "Describe your changes" }) +
      field("description", "Description", {
        multiline: true,
        required: false,
        placeholder: "Explain what changed..."
      }) +
      field("repository", "Repository", {
        choices: state.repositories.map(repo => ({
          value: repo.name,
          label: repo.name
        }))
      }) +
      field("source", "Source branch", { value: "feature/new-work" }) +
      field("target", "Target branch", { value: "main" }),
      "Create pull request",
      values => {
        const pull = {
          id: uid(),
          number: Math.max(0, ...state.pulls.map(item => item.number)) + 1,
          title: values.title.trim(),
          description: values.description.trim(),
          repository: values.repository,
          status: "open",
          source: values.source.trim(),
          target: values.target.trim(),
          author: state.profile.username,
          createdAt: Date.now()
        };

        state.pulls.unshift(pull);
        recordActivity(`Opened pull request #${pull.number}: ${pull.title}`, pull.repository);
        addNotification("Pull request created", pull.title);

        saveState();
        closeModal();
        renderPulls();
        renderDashboard();
        toast("Pull request created.");
      }
    );
  }

  function openNewDiscussion() {
    showModal(
      "Start a discussion",
      field("title", "Discussion title", { placeholder: "What would you like to discuss?" }) +
      field("description", "Message", {
        multiline: true,
        placeholder: "Write your message..."
      }) +
      field("category", "Category", {
        choices: [
          { value: "Announcements", label: "Announcements" },
          { value: "Ideas", label: "Ideas" },
          { value: "Questions", label: "Questions" },
          { value: "General", label: "General" }
        ]
      }),
      "Publish discussion",
      values => {
        state.discussions.unshift({
          id: uid(),
          title: values.title.trim(),
          description: values.description.trim(),
          category: values.category,
          author: state.profile.username,
          createdAt: Date.now()
        });

        recordActivity(`Started a discussion: ${values.title}`);
        saveState();
        closeModal();
        renderDiscussions();
        toast("Discussion published.");
      }
    );
  }

  function editProfile() {
    showModal(
      "Edit your profile",
      field("name", "Display name", { value: state.profile.name }) +
      field("username", "Username", { value: state.profile.username }) +
      field("bio", "Bio", {
        value: state.profile.bio,
        multiline: true,
        required: false
      }) +
      field("location", "Location", {
        value: state.profile.location,
        required: false
      }),
      "Save profile",
      values => {
        const username = values.username.trim();

        if (!/^[a-zA-Z0-9-]+$/.test(username)) {
          throw new Error("Username can contain letters, numbers, and hyphens.");
        }

        state.profile = {
          name: values.name.trim(),
          username,
          bio: values.bio.trim(),
          location: values.location.trim()
        };

        saveState();
        closeModal();
        renderProfile();
        toast("Profile updated.");
      }
    );
  }

  function exportData() {
    const content = JSON.stringify(state, null, 2);
    const blob = new Blob([content], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");

    anchor.href = url;
    anchor.download = "leap-workspace-backup.json";
    anchor.click();

    URL.revokeObjectURL(url);
    toast("Workspace backup exported.");
  }

  function importData() {
    $("#importFile").click();
  }

  function processImport(file) {
    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {
      try {
        const imported = JSON.parse(reader.result);

        if (
          imported.version !== 1 ||
          !Array.isArray(imported.repositories) ||
          !Array.isArray(imported.issues) ||
          !Array.isArray(imported.pulls) ||
          !imported.profile
        ) {
          throw new Error("This is not a valid Leap workspace backup.");
        }

        if (!confirm("Import this backup and replace your current workspace?")) return;

        state = {
          ...initialState(),
          ...imported
        };

        saveState();
        setTheme(state.theme);
        renderDashboard();
        navigate("dashboard");
        toast("Workspace imported.");
      } catch (error) {
        toast(error.message || "Unable to import backup.", "error");
      }
    };

    reader.onerror = () => toast("Unable to read the backup file.", "error");
    reader.readAsText(file);
  }

  function resetWorkspace() {
    if (!confirm("Reset your local Leap workspace? This cannot be undone.")) return;

    state = initialState();
    saveState();
    setTheme(state.theme);
    renderDashboard();
    navigate("dashboard");
    toast("Workspace reset.");
  }

  function handleModalSubmit(event) {
    event.preventDefault();
    if (!modalAction) return;

    try {
      const values = formValues(event);
      modalAction(values);
    } catch (error) {
      $("#modalError").textContent = error.message;
      $("#modalError").classList.remove("hidden");
    }
  }

  function toggleIssue(id) {
    const issue = state.issues.find(item => item.id === id);
    if (!issue) return;

    issue.status = issue.status === "open" ? "closed" : "open";
    recordActivity(`${issue.status === "closed" ? "Closed" : "Reopened"} issue #${issue.number}`, issue.repository);

    saveState();
    renderIssues();
    renderDashboard();

    if (currentPage === "repository") renderRepositoryDetail();
    toast(`Issue ${issue.status}.`);
  }

  function mergePull(id) {
    const pull = state.pulls.find(item => item.id === id);
    if (!pull || pull.status !== "open") return;

    if (!confirm(`Merge pull request #${pull.number}?`)) return;

    pull.status = "merged";

    const repo = getRepository(pull.repository);
    if (repo) {
      repo.commits.unshift({
        id: uid().slice(0, 7),
        message: `Merge pull request #${pull.number}: ${pull.title}`,
        author: state.profile.username,
        timestamp: Date.now()
      });

      repo.updatedAt = Date.now();
    }

    recordActivity(`Merged pull request #${pull.number}`, pull.repository);
    addNotification("Pull request merged", pull.title);

    saveState();
    renderPulls();
    renderDashboard();

    if (currentPage === "repository") renderRepositoryDetail();

    toast("Pull request marked as merged.");
  }

  function starRepository() {
    const repo = activeRepository();
    if (!repo) return;

    repo.stars += 1;
    repo.updatedAt = Date.now();

    recordActivity(`Starred the ${repo.name} repository`, repo.name);
    saveState();

    $("#repoStarButton").textContent = `☆ Star · ${repo.stars}`;
    renderDashboard();
    toast("Repository starred locally.");
  }

  function editRepository() {
    const repo = activeRepository();
    if (!repo) return;

    showModal(
      "Edit repository",
      field("description", "Description", {
        value: repo.description,
        required: false
      }) +
      field("visibility", "Visibility", {
        choices: [
          { value: "public", label: "Public" },
          { value: "private", label: "Private" }
        ],
        value: repo.visibility
      }),
      "Save changes",
      values => {
        repo.description = values.description.trim();
        repo.visibility = values.visibility;
        repo.updatedAt = Date.now();

        recordActivity(`Updated repository settings`, repo.name);
        saveState();
        closeModal();
        renderRepositoryDetail();
        renderRepositories();
        toast("Repository updated.");
      }
    );
  }

  function globalSearch(query) {
    const resultsElement = $("#searchResults");
    const normalized = query.trim().toLowerCase();

    if (!normalized) {
      resultsElement.classList.add("hidden");
      return;
    }

    const results = [];

    state.repositories.forEach(repo => {
      if (
        repo.name.toLowerCase().includes(normalized) ||
        repo.description.toLowerCase().includes(normalized)
      ) {
        results.push({
          title: repo.name,
          detail: "Repository",
          action: () => openRepository(repo.name)
        });
      }
    });

    state.issues.forEach(issue => {
      if (issue.title.toLowerCase().includes(normalized)) {
        results.push({
          title: issue.title,
          detail: `Issue #${issue.number}`,
          action: () => navigate("issues")
        });
      }
    });

    state.pulls.forEach(pull => {
      if (pull.title.toLowerCase().includes(normalized)) {
        results.push({
          title: pull.title,
          detail: `Pull request #${pull.number}`,
          action: () => navigate("pulls")
        });
      }
    });

    resultsElement.innerHTML = results.length
      ? results.slice(0, 8).map((result, index) => `
          <button class="search-result" data-search-result="${index}">
            <span>⌕</span>
            <span>${escapeHTML(result.title)}</span>
            <small>${escapeHTML(result.detail)}</small>
          </button>
        `).join("")
      : `<div class="search-result">No matching results</div>`;

    resultsElement.classList.remove("hidden");

    $$("[data-search-result]", resultsElement).forEach(button => {
      button.addEventListener("click", () => {
        results[Number(button.dataset.searchResult)].action();
        resultsElement.classList.add("hidden");
        $("#globalSearch").value = "";
      });
    });
  }

  function handleAction(action) {
    switch (action) {
      case "new-repo":
        openNewRepository();
        break;
      case "new-issue":
        openNewIssue();
        break;
      case "new-pull":
        openNewPull();
        break;
      case "new-discussion":
        openNewDiscussion();
        break;
      case "edit-profile":
        editProfile();
        break;
      case "export":
        exportData();
        break;
      case "import":
        importData();
        break;
      case "reset":
        resetWorkspace();
        break;
    }
  }

  function bindEvents() {
    document.addEventListener("click", event => {
      const pageButton = event.target.closest("[data-page]");
      if (pageButton) {
        event.preventDefault();
        navigate(pageButton.dataset.page);
        return;
      }

      const actionButton = event.target.closest("[data-action]");
      if (actionButton) {
        handleAction(actionButton.dataset.action);
        return;
      }

      const repoLink = event.target.closest("[data-open-repo]");
      if (repoLink) {
        event.preventDefault();
        openRepository(repoLink.dataset.openRepo);
        return;
      }

      const repoTab = event.target.closest("[data-repotab]");
      if (repoTab) {
        currentRepoTab = repoTab.dataset.repotab;
        renderRepositoryDetail();
        return;
      }

      const issueButton = event.target.closest("[data-toggle-issue]");
      if (issueButton) {
        toggleIssue(issueButton.dataset.toggleIssue);
        return;
      }

      const mergeButton = event.target.closest("[data-merge-pull]");
      if (mergeButton) {
        mergePull(mergeButton.dataset.mergePull);
        return;
      }

      const settingTab = event.target.closest("[data-setting]");
      if (settingTab) {
        currentSettingsTab = settingTab.dataset.setting;

        $$(".settings-tab").forEach(tab => {
          tab.classList.toggle("active", tab === settingTab);
        });

        renderSettings();
        return;
      }

      const themeChoice = event.target.closest("[data-theme-choice]");
      if (themeChoice) {
        setTheme(themeChoice.dataset.themeChoice);
        renderSettings();
        return;
      }

      const themeToggle = event.target.closest("[data-toggle-theme]");
      if (themeToggle) {
        setTheme(state.theme === "dark" ? "light" : "dark");
        renderSettings();
      }
    });

    $("#themeToggle").addEventListener("click", () => {
      setTheme(state.theme === "dark" ? "light" : "dark");
    });

    $("#mobileMenu").addEventListener("click", () => {
      $("#sidebar").classList.toggle("open");
    });

    $("#createButton").addEventListener("click", openNewRepository);

    $("#profileButton").addEventListener("click", () => navigate("profile"));

    $("#modalClose").addEventListener("click", closeModal);
    $("#modalCancel").addEventListener("click", closeModal);

    $("#modalBackdrop").addEventListener("click", event => {
      if (event.target === $("#modalBackdrop")) closeModal();
    });

    $("#modalForm").addEventListener("submit", handleModalSubmit);

    $("#repoStarButton").addEventListener("click", starRepository);
    $("#repoEditButton").addEventListener("click", editRepository);

    $("#repoFilter").addEventListener("input", renderRepositories);
    $("#repoSort").addEventListener("change", renderRepositories);
    $("#repoVisibility").addEventListener("change", renderRepositories);

    $("#issueFilter").addEventListener("input", renderIssues);
    $("#issueStatus").addEventListener("change", renderIssues);

    $("#pullFilter").addEventListener("input", renderPulls);
    $("#pullStatus").addEventListener("change", renderPulls);

    $("#globalSearch").addEventListener("input", event => {
      globalSearch(event.target.value);
    });

    $("#globalSearch").addEventListener("keydown", event => {
      if (event.key === "Escape") {
        $("#searchResults").classList.add("hidden");
        event.target.value = "";
      }
    });

    document.addEventListener("click", event => {
      if (!event.target.closest(".topbar-search")) {
        $("#searchResults").classList.add("hidden");
      }
    });

    document.addEventListener("keydown", event => {
      if (
        event.key === "/" &&
        !["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement.tagName)
      ) {
        event.preventDefault();
        $("#globalSearch").focus();
      }

      if (event.key === "Escape") closeModal();
    });

    $("#markReadButton").addEventListener("click", () => {
      state.notifications.forEach(notification => {
        notification.read = true;
      });

      saveState();
      renderNotifications();
      toast("Notifications marked as read.");
    });

    $("#importFile").addEventListener("change", event => {
      processImport(event.target.files[0]);
      event.target.value = "";
    });
  }

  function init() {
    setTheme(state.theme);
    bindEvents();
    renderDashboard();
    updateCounters();

    console.info("Leap initialized.");
  }

  return {
    init,
    navigate,
    openRepository,
    getState: () => structuredClone(state)
  };
})();

document.addEventListener("DOMContentLoaded", Leap.init);
