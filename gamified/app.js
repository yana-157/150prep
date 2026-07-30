(function () {
  "use strict";

  const STORAGE_KEY = "150prep-state-v1";
  const modules = window.COURSE_MODULES || [];
  const practices = modules.flatMap(module =>
    module.practice.map(item => ({ ...item, moduleId: module.id, moduleTitle: module.title }))
  );
  const config = window.PREP_CONFIG || {};
  const backendEnabled = Boolean(
    config.supabaseUrl &&
    config.supabaseAnonKey &&
    window.supabase &&
    window.supabase.createClient
  );
  const client = backendEnabled
    ? window.supabase.createClient(config.supabaseUrl, config.supabaseAnonKey)
    : null;

  let state = loadState();
  let session = null;
  let remoteProfile = null;
  let authMode = "signup";
  let leaderboardRows = [];
  let toastTimer = null;

  const view = document.querySelector("#app-view");
  const accountDialog = document.querySelector("#account-dialog");
  const accountForm = document.querySelector("#account-form");

  function defaultState() {
    return {
      version: 1,
      profile: { username: "" },
      xp: 0,
      completedStages: {},
      attempts: {},
      drafts: {},
      practiceResults: {},
      dashboardFilter: "All",
      streak: { count: 1, lastDate: "" }
    };
  }

  function loadState() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
      return { ...defaultState(), ...(saved || {}) };
    } catch (_error) {
      return defaultState();
    }
  }

  function saveState(sync = true) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    updateChrome();
    if (sync && session) syncProgress();
  }

  function updateStreak() {
    const now = new Date();
    const today = localDateKey(now);
    if (state.streak.lastDate === today) return;

    if (!state.streak.lastDate) {
      state.streak = { count: 1, lastDate: today };
    } else {
      const prior = new Date(`${state.streak.lastDate}T12:00:00`);
      const difference = Math.round((now - prior) / 86400000);
      state.streak = {
        count: difference === 1 ? state.streak.count + 1 : 1,
        lastDate: today
      };
    }
    saveState(false);
  }

  function localDateKey(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  function escapeHTML(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function icon(name) {
    return `<i data-lucide="${name}" aria-hidden="true"></i>`;
  }

  function refreshIcons() {
    if (window.lucide) window.lucide.createIcons();
  }

  function completedFor(moduleId) {
    return Array.from(new Set(state.completedStages[moduleId] || [])).sort();
  }

  function isModuleComplete(module) {
    return completedFor(module.id).length >= module.stages.length;
  }

  function stats() {
    const completedStages = modules.reduce(
      (sum, module) => sum + Math.min(completedFor(module.id).length, module.stages.length),
      0
    );
    const totalStages = modules.reduce((sum, module) => sum + module.stages.length, 0);
    const completedModules = modules.filter(isModuleComplete).map(module => module.id);
    const percent = totalStages ? Math.round((completedStages / totalStages) * 100) : 0;
    return { completedStages, totalStages, completedModules, percent };
  }

  function currentModule() {
    return modules.find(module => !isModuleComplete(module)) || modules[modules.length - 1];
  }

  function updateChrome() {
    const courseStats = stats();
    const username = remoteProfile?.username || state.profile.username;
    document.querySelector("#sidebar-percent").textContent = `${courseStats.percent}%`;
    document.querySelector("#sidebar-progress").style.width = `${courseStats.percent}%`;
    document.querySelector("#sidebar-xp").textContent = `${state.xp} XP earned`;
    document.querySelector("#streak-count").textContent = state.streak.count;
    document.querySelector("#account-name").textContent = username || "Create profile";
    document.querySelector("#avatar").textContent = (username || "Y").slice(0, 1).toUpperCase();
    document.querySelector("#backend-label").textContent = backendEnabled ? "Community sync" : "Solo mode";
    document.querySelector("#backend-dot").classList.toggle("is-online", backendEnabled);
  }

  function setHeader(eyebrow, title) {
    document.querySelector("#page-eyebrow").textContent = eyebrow;
    document.querySelector("#page-title").textContent = title;
  }

  function setActiveNav(route) {
    document.querySelectorAll("[data-route]").forEach(item => {
      const target = item.dataset.route;
      const active =
        (route === "dashboard" || route === "module") && target === "dashboard" ||
        route === target;
      item.classList.toggle("is-active", active);
    });
  }

  function parseRoute() {
    const raw = location.hash.replace(/^#/, "") || "dashboard";
    const [name, first, second] = raw.split("/");
    return { name, first, second };
  }

  function navigate(path) {
    if (location.hash === `#${path}`) {
      renderRoute();
    } else {
      location.hash = path;
    }
  }

  function renderRoute() {
    const route = parseRoute();
    setActiveNav(route.name);

    if (route.name === "module") {
      renderModule(route.first, Number(route.second || 0));
    } else if (route.name === "practice") {
      renderPractice(route.first);
    } else if (route.name === "leaderboard") {
      renderLeaderboard();
    } else if (route.name === "profile") {
      renderProfile();
    } else {
      renderDashboard();
    }

    view.focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: "auto" });
    refreshIcons();
  }

  function renderDashboard() {
    setHeader("15-150 Summer 2026", "Your learning path");
    const courseStats = stats();
    const next = currentModule();
    const nextCompleted = completedFor(next.id).length;
    const filter = state.dashboardFilter;
    const visibleModules = modules.filter(module =>
      filter === "All" ? true :
      filter === "Foundations" ? ["Foundations", "Core", "Abstraction"].includes(module.phase) :
      filter === "Control" ? module.phase === "Control" :
      ["Systems", "Parallel", "Effects"].includes(module.phase)
    );
    const practiceCount = Object.keys(state.practiceResults)
      .filter(key => !key.endsWith(":xp")).length;

    view.innerHTML = `
      <section class="summary-band">
        <div class="continue-panel">
          <p class="eyebrow">Continue learning</p>
          <h2>${escapeHTML(next.title)}</h2>
          <p>${escapeHTML(next.summary)}</p>
          <button class="primary-button light" type="button"
            data-open-module="${escapeHTML(next.id)}" data-stage="${Math.min(nextCompleted, next.stages.length - 1)}">
            ${icon("play")} Continue
          </button>
        </div>
        <div class="metric">
          ${icon("zap")}
          <strong>${state.xp}</strong>
          <span>Total XP</span>
        </div>
        <div class="metric">
          ${icon("circle-check-big")}
          <strong>${courseStats.completedModules.length}/${modules.length}</strong>
          <span>Modules complete</span>
        </div>
        <div class="metric">
          ${icon("terminal")}
          <strong>${practiceCount}</strong>
          <span>Practices reviewed</span>
        </div>
      </section>

      <section>
        <div class="section-heading">
          <div>
            <h2>Course modules</h2>
            <p>Lecture-sized ideas, two-panel checkpoints, and homework-level practice.</p>
          </div>
          <div class="filter-tabs" role="tablist" aria-label="Module filters">
            ${["All", "Foundations", "Control", "Final"].map(item => `
              <button class="filter-tab ${filter === item ? "is-active" : ""}"
                type="button" data-filter="${item}">${item}</button>
            `).join("")}
          </div>
        </div>

        <div class="module-path">
          ${visibleModules.map((module, index) => renderModuleRow(module, index)).join("")}
        </div>
      </section>
    `;
  }

  function renderModuleRow(module, visibleIndex) {
    const completed = completedFor(module.id).length;
    const percent = Math.round((completed / module.stages.length) * 100);
    const className = isModuleComplete(module)
      ? "is-complete"
      : module.id === currentModule().id ? "is-current" : "";
    const statusContent = isModuleComplete(module) ? icon("check") : String(modules.indexOf(module) + 1);

    return `
      <article class="module-row ${className}" data-open-module="${escapeHTML(module.id)}"
        data-stage="${Math.min(completed, module.stages.length - 1)}" tabindex="0">
        <div class="module-number">${statusContent}</div>
        <div class="module-copy">
          <h3>${escapeHTML(module.title)}</h3>
          <div class="module-meta">
            <span class="module-tag">${escapeHTML(module.phase)}</span>
            <span>${escapeHTML(module.lectures)}</span>
            <span>${module.stages.length} checkpoints</span>
            <span>${module.practice.length} practices</span>
          </div>
        </div>
        <div class="module-progress">
          <span>${completed}/${module.stages.length} complete</span>
          <div class="mini-track"><span style="width:${percent}%"></span></div>
        </div>
        <div class="module-arrow">${icon("chevron-right")}</div>
      </article>
    `;
  }

  function renderModule(moduleId, requestedStage) {
    const module = modules.find(item => item.id === moduleId) || modules[0];
    const stageIndex = Math.max(0, Math.min(requestedStage, module.stages.length - 1));
    const stage = module.stages[stageIndex];
    const completed = completedFor(module.id);
    const checkpointDone = completed.includes(stageIndex);
    const attemptKey = `${module.id}:${stageIndex}`;
    const attempts = state.attempts[attemptKey] || 0;

    setHeader(module.phase, module.title);

    view.innerHTML = `
      <div class="lesson-shell">
        <div class="lesson-main">
          <button class="back-button" type="button" data-route="dashboard">
            ${icon("arrow-left")} Course map
          </button>

          <div class="lesson-intro">
            <p class="eyebrow">${escapeHTML(module.lectures)}</p>
            <h2>${escapeHTML(module.title)}</h2>
            <p>${escapeHTML(module.summary)}</p>
          </div>

          <div class="checkpoint-label">
            <span>Checkpoint ${stageIndex + 1} of ${module.stages.length}</span>
            <span>+25 XP ${stageIndex === module.stages.length - 1 ? "+ 50 module bonus" : ""}</span>
          </div>

          <div class="slide-pair">
            ${stage.slides.map(slide => `
              <article class="lesson-card">
                <p class="eyebrow">${escapeHTML(slide.label)}</p>
                <h3>${escapeHTML(slide.title)}</h3>
                <p>${escapeHTML(slide.body)}</p>
                <ul>${slide.bullets.map(bullet => `<li>${escapeHTML(bullet)}</li>`).join("")}</ul>
                ${slide.code ? `<pre><code>${escapeHTML(slide.code)}</code></pre>` : ""}
              </article>
            `).join("")}
          </div>

          <section class="knowledge-check" id="knowledge-check">
            <p class="eyebrow">${checkpointDone ? "Checkpoint complete" : "Knowledge check"}</p>
            <h3>${escapeHTML(stage.check.prompt)}</h3>
            ${checkpointDone ? renderCompletedCheck(module, stageIndex, stage) : `
              <div class="answer-options">
                ${stage.check.options.map((option, index) => `
                  <label class="answer-option">
                    <input type="radio" name="checkpoint-answer" value="${index}">
                    <span>${escapeHTML(option)}</span>
                  </label>
                `).join("")}
              </div>
              <button class="primary-button" type="button"
                data-submit-check="${escapeHTML(module.id)}" data-stage="${stageIndex}">
                Check answer
              </button>
              <div class="feedback ${attempts ? "is-visible is-wrong" : ""}" id="check-feedback">
                ${attempts ? "Try again. Use the two panels above to identify the rule each option would require." : ""}
              </div>
            `}
          </section>
        </div>

        <aside class="lesson-sidebar">
          <h3>Module checkpoints</h3>
          <div class="stage-list">
            ${module.stages.map((item, index) => `
              <button class="stage-button ${index === stageIndex ? "is-active" : ""}
                ${completed.includes(index) ? "is-complete" : ""}"
                type="button" data-open-module="${escapeHTML(module.id)}" data-stage="${index}">
                <span class="stage-status">${completed.includes(index) ? icon("check") : index + 1}</span>
                <span>${escapeHTML(item.title)}</span>
              </button>
            `).join("")}
          </div>
          <p class="lesson-source"><strong>Based on:</strong><br>${escapeHTML(module.source)}</p>
          <button class="secondary-button full-width" type="button"
            data-open-practice="${escapeHTML(module.practice[0].id)}">
            ${icon("code-2")} Practice this topic
          </button>
        </aside>
      </div>
    `;
  }

  function renderCompletedCheck(module, stageIndex, stage) {
    const nextStage = stageIndex + 1;
    const nextModuleIndex = modules.indexOf(module) + 1;
    const nextAction = nextStage < module.stages.length
      ? `<button class="primary-button" type="button" data-open-module="${module.id}" data-stage="${nextStage}">
           Next checkpoint ${icon("arrow-right")}
         </button>`
      : nextModuleIndex < modules.length
        ? `<button class="primary-button" type="button" data-open-module="${modules[nextModuleIndex].id}" data-stage="0">
             Next module ${icon("arrow-right")}
           </button>`
        : `<button class="primary-button" type="button" data-route="dashboard">Return to course map</button>`;

    return `
      <div class="feedback is-visible is-correct">
        <strong>Correct.</strong> ${escapeHTML(stage.check.explanation)}
      </div>
      <div class="button-row" style="margin-top:14px">
        ${nextAction}
        <button class="secondary-button" type="button"
          data-open-practice="${escapeHTML(module.practice[0].id)}">
          Practice
        </button>
      </div>
    `;
  }

  function submitCheckpoint(moduleId, stageIndex) {
    const module = modules.find(item => item.id === moduleId);
    const stage = module?.stages[stageIndex];
    const selected = document.querySelector('input[name="checkpoint-answer"]:checked');
    const feedback = document.querySelector("#check-feedback");
    if (!module || !stage || !selected) {
      showToast("Choose an answer first.");
      return;
    }

    const key = `${moduleId}:${stageIndex}`;
    state.attempts[key] = (state.attempts[key] || 0) + 1;
    const correct = Number(selected.value) === stage.check.answer;

    if (!correct) {
      saveState(false);
      feedback.className = "feedback is-visible is-wrong";
      feedback.textContent = "Not quite. Re-read the rule in the two panels, then try again.";
      return;
    }

    const completed = completedFor(moduleId);
    if (!completed.includes(stageIndex)) {
      state.completedStages[moduleId] = [...completed, stageIndex].sort();
      state.xp += 25;
      if (state.completedStages[moduleId].length === module.stages.length) state.xp += 50;
      saveState();
      showToast(isModuleComplete(module) ? "Module complete. +75 XP" : "Checkpoint complete. +25 XP");
    }
    renderModule(moduleId, stageIndex);
    refreshIcons();
  }

  function renderPractice(practiceId) {
    const selected = practices.find(item => item.id === practiceId) || practices[0];
    if (!selected) return;
    setHeader("Homework-level practice", "Coding studio");

    const savedDraft = state.drafts[selected.id] ?? selected.starter;
    const priorResult = state.practiceResults[selected.id];

    view.innerHTML = `
      ${!backendEnabled ? `
        <div class="mode-banner">
          ${icon("wifi-off")}
          <p><strong>Solo grading mode.</strong> Your draft and worked answer keys are available now. Secure AI feedback turns on when community sync is connected.</p>
        </div>
      ` : ""}

      <div class="practice-layout">
        <aside class="practice-list" aria-label="Practice questions">
          ${practices.map((item, index) => `
            <button class="practice-item ${item.id === selected.id ? "is-active" : ""}"
              type="button" data-open-practice="${escapeHTML(item.id)}">
              <span class="difficulty-dot">${String(index + 1).padStart(2, "0")}</span>
              <span>
                <strong>${escapeHTML(item.title)}</strong>
                <span>${escapeHTML(item.moduleTitle)} - ${escapeHTML(item.difficulty)}</span>
              </span>
            </button>
          `).join("")}
        </aside>

        <section class="practice-workspace">
          <header class="workspace-header">
            <p class="eyebrow">${escapeHTML(selected.moduleTitle)} - ${escapeHTML(selected.difficulty)}</p>
            <h2>${escapeHTML(selected.title)}</h2>
            <p>${escapeHTML(modules.find(module => module.id === selected.moduleId)?.source || "")}</p>
          </header>
          <div class="workspace-body">
            <div class="prompt-box">${escapeHTML(selected.prompt)}</div>
            <textarea class="code-editor" id="practice-answer" spellcheck="false"
              aria-label="Your answer">${escapeHTML(savedDraft)}</textarea>
            <div class="workspace-actions">
              <span class="save-state" id="draft-state">Saved on this device</span>
              <div class="button-row">
                <button class="secondary-button" type="button" data-show-answer-key="${escapeHTML(selected.id)}">
                  ${icon("key-round")} View answer key
                </button>
                <button class="primary-button" type="button" data-grade="${escapeHTML(selected.id)}">
                  ${icon(backendEnabled ? "sparkles" : "clipboard-check")}
                  ${backendEnabled ? "Grade with AI" : "Check answer"}
                </button>
              </div>
            </div>

            <div class="answer-key-panel" id="answer-key-panel" hidden>
              <h3>Worked answer key</h3>
              <pre><code>${escapeHTML(selected.answerKey)}</code></pre>
            </div>

            <div id="grading-output">
              ${priorResult ? renderGradingResult(priorResult) : ""}
            </div>
          </div>
        </section>
      </div>
    `;
  }

  function renderGradingResult(result) {
    const score = Number(result.score || 0);
    return `
      <section class="grading-result">
        <span class="grading-score">${score}/100</span>
        <h3>${escapeHTML(result.verdict || "Feedback")}</h3>
        ${result.strengths?.length ? `
          <p><strong>Working well</strong></p>
          <ul>${result.strengths.map(item => `<li>${escapeHTML(item)}</li>`).join("")}</ul>
        ` : ""}
        ${result.improvements?.length ? `
          <p><strong>Revise next</strong></p>
          <ul>${result.improvements.map(item => `<li>${escapeHTML(item)}</li>`).join("")}</ul>
        ` : ""}
        ${result.next_step ? `<p><strong>Next step:</strong> ${escapeHTML(result.next_step)}</p>` : ""}
      </section>
    `;
  }

  function saveDraft() {
    const route = parseRoute();
    if (route.name !== "practice" || !route.first) return;
    const answer = document.querySelector("#practice-answer");
    if (!answer) return;
    state.drafts[route.first] = answer.value;
    saveState(false);
    const marker = document.querySelector("#draft-state");
    if (marker) marker.textContent = "Saved just now";
  }

  async function gradePractice(practiceId) {
    const practice = practices.find(item => item.id === practiceId);
    const answer = document.querySelector("#practice-answer")?.value.trim();
    if (!practice || !answer) {
      showToast("Write an answer before grading.");
      return;
    }
    saveDraft();

    if (!backendEnabled) {
      document.querySelector("#answer-key-panel").hidden = false;
      document.querySelector("#grading-output").innerHTML = `
        <section class="grading-result">
          <h3>Answer key opened</h3>
          <p>Compare the behavior, type, and reasoning in your draft with the worked answer above. Equivalent correct implementations may use different names or syntax.</p>
        </section>
      `;
      showToast("Answer key opened.");
      return;
    }

    if (!session) {
      openAccountDialog();
      showToast("Sign in to use AI grading.");
      return;
    }

    const button = document.querySelector(`[data-grade="${practiceId}"]`);
    const original = button.innerHTML;
    button.disabled = true;
    button.textContent = "Grading...";

    try {
      const { data, error } = await client.functions.invoke(config.gradingFunction || "grade-answer", {
        body: {
          question_id: practice.id,
          module: practice.moduleTitle,
          prompt: practice.prompt,
          starter: practice.starter,
          rubric: practice.rubric,
          answer_key: practice.answerKey,
          answer
        }
      });
      if (error) throw error;

      state.practiceResults[practiceId] = data;
      if (Number(data.score) >= 70 && !state.practiceResults[`${practiceId}:xp`]) {
        state.practiceResults[`${practiceId}:xp`] = true;
        state.xp += 30;
        showToast("Practice passed. +30 XP");
      }
      saveState();
      document.querySelector("#grading-output").innerHTML = renderGradingResult(data);
    } catch (error) {
      showToast(error.message || "Grading is temporarily unavailable.");
    } finally {
      button.disabled = false;
      button.innerHTML = original;
      refreshIcons();
    }
  }

  async function renderLeaderboard() {
    setHeader("Community", "Public leaderboard");
    const localStats = stats();

    if (backendEnabled) {
      view.innerHTML = `
        <div class="leaderboard-table">
          <div class="leaderboard-row"><span>Loading rankings...</span></div>
        </div>
      `;
      try {
        const { data, error } = await client
          .from("leaderboard")
          .select("username,total_xp,completed_modules")
          .order("total_xp", { ascending: false })
          .limit(50);
        if (error) throw error;
        leaderboardRows = data || [];
      } catch (error) {
        view.innerHTML = `<div class="mode-banner">${icon("triangle-alert")}<p>${escapeHTML(error.message)}</p></div>`;
        refreshIcons();
        return;
      }
    } else {
      const localName = state.profile.username || "Your local profile";
      leaderboardRows = [
        ...window.DEMO_LEADERBOARD,
        { username: localName, xp: state.xp, completed_modules: localStats.completedModules.length, isLocal: true }
      ].sort((a, b) => (b.total_xp ?? b.xp) - (a.total_xp ?? a.xp));
    }

    view.innerHTML = `
      ${!backendEnabled ? `
        <div class="mode-banner">
          ${icon("users")}
          <p><strong>Community preview.</strong> Your row is device-local until the account backend is connected; the other names are sample competitors.</p>
        </div>
      ` : ""}

      <div class="section-heading">
        <div>
          <h2>Course standings</h2>
          <p>Ranked by checkpoint and practice XP.</p>
        </div>
      </div>

      <div class="leaderboard-table">
        <div class="leaderboard-row header">
          <span>Rank</span><span>Student</span><span>Modules</span><span>XP</span>
        </div>
        ${leaderboardRows.map((row, index) => {
          const xp = row.total_xp ?? row.xp ?? 0;
          return `
            <div class="leaderboard-row">
              <span class="rank">${index + 1}</span>
              <span class="leader-user">
                <span class="leader-avatar">${escapeHTML(row.username.slice(0, 1).toUpperCase())}</span>
                ${escapeHTML(row.username)} ${row.isLocal ? "(you)" : ""}
              </span>
              <span>${row.completed_modules ?? 0}/${modules.length}</span>
              <strong>${xp}</strong>
            </div>
          `;
        }).join("")}
      </div>
    `;
    refreshIcons();
  }

  function renderProfile() {
    setHeader("Progress and account", "Your profile");
    const courseStats = stats();
    const username = remoteProfile?.username || state.profile.username || "Student";
    const badgeStats = {
      completedStages: courseStats.completedStages,
      completedModules: courseStats.completedModules
    };

    view.innerHTML = `
      <div class="profile-grid">
        <section class="panel">
          <p class="eyebrow">Study identity</p>
          <h2>${escapeHTML(username)}</h2>
          <div class="stat-grid">
            <div class="stat-cell"><strong>${state.xp}</strong><span>Total XP</span></div>
            <div class="stat-cell"><strong>${courseStats.percent}%</strong><span>Course complete</span></div>
            <div class="stat-cell"><strong>${state.streak.count}</strong><span>Day streak</span></div>
          </div>

          <div class="section-heading">
            <div><h3>Badges</h3></div>
          </div>
          <div class="badge-grid">
            ${window.PREP_BADGES.map(badge => {
              const earned = badge.test(badgeStats);
              return `
                <div class="badge ${earned ? "is-earned" : ""}">
                  ${icon(badge.icon)}
                  <strong>${escapeHTML(badge.title)}</strong>
                  <span>${escapeHTML(badge.detail)}</span>
                </div>
              `;
            }).join("")}
          </div>
        </section>

        <aside class="panel">
          <h3>${backendEnabled ? "Community account" : "Solo profile"}</h3>
          <p>${backendEnabled
            ? session
              ? `Signed in as ${escapeHTML(session.user.email || username)}. Progress is eligible for community sync.`
              : "Sign in to sync progress, appear on the public leaderboard, and use AI grading."
            : "Progress is saved in this browser. The backend setup is included with the project but still needs service credentials."
          }</p>
          <div class="button-row">
            ${backendEnabled && session
              ? `<button class="secondary-button" type="button" data-signout>${icon("log-out")} Sign out</button>`
              : `<button class="primary-button" type="button" data-open-account>${icon("user-plus")} ${state.profile.username ? "Edit profile" : "Create profile"}</button>`
            }
            <button class="danger-button" type="button" data-reset-progress>${icon("rotate-ccw")} Reset progress</button>
          </div>
        </aside>
      </div>
    `;
  }

  function openAccountDialog() {
    document.querySelector("#solo-account-fields").hidden = backendEnabled;
    document.querySelector("#online-account-fields").hidden = !backendEnabled;
    document.querySelector("#account-error").textContent = "";
    document.querySelector("#dialog-title").textContent = backendEnabled ? "Join the community" : "Create your profile";
    document.querySelector("#account-submit").textContent = backendEnabled
      ? authMode === "signup" ? "Create account" : "Sign in"
      : state.profile.username ? "Update profile" : "Create profile";
    document.querySelector("#solo-username").value = state.profile.username || "";
    accountDialog.showModal();
  }

  async function submitAccount(event) {
    event.preventDefault();
    const errorNode = document.querySelector("#account-error");
    errorNode.textContent = "";

    if (!backendEnabled) {
      const username = document.querySelector("#solo-username").value.trim();
      if (username.length < 2) {
        errorNode.textContent = "Use at least two characters.";
        return;
      }
      state.profile.username = username.slice(0, 24);
      saveState(false);
      accountDialog.close();
      showToast("Profile saved.");
      renderRoute();
      return;
    }

    const username = document.querySelector("#auth-username").value.trim();
    const email = document.querySelector("#auth-email").value.trim();
    const password = document.querySelector("#auth-password").value;
    const submit = document.querySelector("#account-submit");
    submit.disabled = true;
    submit.textContent = authMode === "signup" ? "Creating..." : "Signing in...";

    try {
      if (authMode === "signup") {
        if (username.length < 2) throw new Error("Use at least two characters for your display name.");
        const { data, error } = await client.auth.signUp({
          email,
          password,
          options: { data: { username: username.slice(0, 24) } }
        });
        if (error) throw error;
        if (!data.session) {
          errorNode.style.color = "var(--success)";
          errorNode.textContent = "Check your email to confirm the account, then sign in.";
          return;
        }
      } else {
        const { error } = await client.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
      accountDialog.close();
      showToast("Account connected.");
    } catch (error) {
      errorNode.textContent = error.message || "Account request failed.";
    } finally {
      submit.disabled = false;
      submit.textContent = authMode === "signup" ? "Create account" : "Sign in";
    }
  }

  async function hydrateRemoteState() {
    if (!session) return;
    const userId = session.user.id;
    const [profileResult, progressResult] = await Promise.all([
      client.from("profiles").select("username,total_xp").eq("id", userId).maybeSingle(),
      client.from("module_progress").select("module_id,completed_stages").eq("user_id", userId)
    ]);

    if (profileResult.data) {
      remoteProfile = profileResult.data;
      state.xp = Math.max(state.xp, Number(profileResult.data.total_xp || 0));
    }
    for (const row of progressResult.data || []) {
      const module = modules.find(item => item.id === row.module_id);
      if (!module) continue;
      const remoteCompleted = Array.from(
        { length: Math.min(row.completed_stages, module.stages.length) },
        (_unused, index) => index
      );
      state.completedStages[module.id] = Array.from(
        new Set([...(state.completedStages[module.id] || []), ...remoteCompleted])
      ).sort();
    }
    saveState(false);
  }

  async function syncProgress() {
    if (!session || !backendEnabled) return;
    const courseStats = stats();
    const username = remoteProfile?.username || state.profile.username || session.user.user_metadata?.username || "Student";

    await client.from("profiles").upsert({
      id: session.user.id,
      username,
      total_xp: state.xp,
      completed_modules: courseStats.completedModules.length,
      updated_at: new Date().toISOString()
    });

    const rows = modules.map(module => ({
      user_id: session.user.id,
      module_id: module.id,
      completed_stages: completedFor(module.id).length,
      updated_at: new Date().toISOString()
    }));
    await client.from("module_progress").upsert(rows, { onConflict: "user_id,module_id" });
  }

  async function signOut() {
    if (client) await client.auth.signOut();
    session = null;
    remoteProfile = null;
    showToast("Signed out.");
    renderProfile();
    refreshIcons();
  }

  function showToast(message) {
    const toast = document.querySelector("#toast");
    toast.textContent = message;
    toast.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("is-visible"), 2600);
  }

  function bindEvents() {
    document.addEventListener("click", event => {
      const routeTarget = event.target.closest("[data-route]");
      if (routeTarget) {
        navigate(routeTarget.dataset.route);
        return;
      }

      const moduleTarget = event.target.closest("[data-open-module]");
      if (moduleTarget) {
        navigate(`module/${moduleTarget.dataset.openModule}/${moduleTarget.dataset.stage || 0}`);
        return;
      }

      const practiceTarget = event.target.closest("[data-open-practice]");
      if (practiceTarget) {
        navigate(`practice/${practiceTarget.dataset.openPractice}`);
        return;
      }

      const checkTarget = event.target.closest("[data-submit-check]");
      if (checkTarget) {
        submitCheckpoint(checkTarget.dataset.submitCheck, Number(checkTarget.dataset.stage));
        return;
      }

      const filterTarget = event.target.closest("[data-filter]");
      if (filterTarget) {
        state.dashboardFilter = filterTarget.dataset.filter;
        saveState(false);
        renderDashboard();
        refreshIcons();
        return;
      }

      const answerKeyTarget = event.target.closest("[data-show-answer-key]");
      if (answerKeyTarget) {
        const answerKey = document.querySelector("#answer-key-panel");
        answerKey.hidden = !answerKey.hidden;
        return;
      }

      const gradeTarget = event.target.closest("[data-grade]");
      if (gradeTarget) {
        gradePractice(gradeTarget.dataset.grade);
        return;
      }

      if (event.target.closest("[data-open-account]")) {
        openAccountDialog();
        return;
      }

      if (event.target.closest("[data-signout]")) {
        signOut();
        return;
      }

      if (event.target.closest("[data-reset-progress]")) {
        if (confirm("Reset all local 150prep progress and drafts?")) {
          const username = state.profile.username;
          state = defaultState();
          state.profile.username = username;
          updateStreak();
          saveState();
          showToast("Progress reset.");
          renderProfile();
          refreshIcons();
        }
      }
    });

    document.addEventListener("keydown", event => {
      const moduleTarget = event.target.closest(".module-row");
      if (moduleTarget && (event.key === "Enter" || event.key === " ")) {
        event.preventDefault();
        navigate(`module/${moduleTarget.dataset.openModule}/${moduleTarget.dataset.stage || 0}`);
      }
    });

    document.addEventListener("input", event => {
      if (event.target.matches("#practice-answer")) saveDraft();
    });

    document.querySelector("#account-button").addEventListener("click", () => {
      if (state.profile.username || session) navigate("profile");
      else openAccountDialog();
    });
    document.querySelector("#close-dialog").addEventListener("click", () => accountDialog.close());
    accountForm.addEventListener("submit", submitAccount);

    document.querySelectorAll("[data-auth-mode]").forEach(button => {
      button.addEventListener("click", () => {
        authMode = button.dataset.authMode;
        document.querySelectorAll("[data-auth-mode]").forEach(item =>
          item.classList.toggle("is-active", item === button)
        );
        document.querySelector("#username-field").hidden = authMode === "signin";
        document.querySelector("#account-submit").textContent = authMode === "signup" ? "Create account" : "Sign in";
        document.querySelector("#auth-password").autocomplete =
          authMode === "signup" ? "new-password" : "current-password";
      });
    });

    window.addEventListener("hashchange", renderRoute);
  }

  async function initBackend() {
    if (!backendEnabled) return;
    const { data } = await client.auth.getSession();
    session = data.session;
    if (session) await hydrateRemoteState();

    client.auth.onAuthStateChange(async (_event, nextSession) => {
      session = nextSession;
      if (session) await hydrateRemoteState();
      else remoteProfile = null;
      updateChrome();
      renderRoute();
    });
  }

  async function init() {
    updateStreak();
    updateChrome();
    bindEvents();
    await initBackend();
    renderRoute();
    refreshIcons();
  }

  init();
})();
