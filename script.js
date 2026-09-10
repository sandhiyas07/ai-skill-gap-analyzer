/* ==========================================================================
   AI SKILL GAP ANALYZER — SCRIPT.JS
   All logic runs on the client. No backend, no external API, no API key.
   ========================================================================== */

/* ----------------------------------------------------------------------
   1. DATA: skill list, job roles & their required skills, projects
   ---------------------------------------------------------------------- */

// Master list of skills shown as checkboxes on the form
const ALL_SKILLS = [
  "Python", "Java", "C++", "HTML", "CSS", "JavaScript",
  "React.js", "Node.js", "SQL", "MongoDB", "Git", "GitHub",
  "Excel", "Pandas", "NumPy", "Machine Learning", "Data Visualization"
];

// Skills required for each job role
const ROLE_REQUIREMENTS = {
  "Software Developer": ["Java", "C++", "Python", "Git", "GitHub", "SQL"],
  "Frontend Developer": ["HTML", "CSS", "JavaScript", "React.js", "Git", "GitHub"],
  "Backend Developer": ["Node.js", "SQL", "MongoDB", "Git", "GitHub", "Python"],
  "Data Analyst": ["Excel", "SQL", "Pandas", "Data Visualization", "Python"],
  "Data Scientist": ["Python", "Pandas", "NumPy", "Machine Learning", "Data Visualization", "SQL"],
  "AI/ML Engineer": ["Python", "Machine Learning", "NumPy", "Pandas", "Git", "GitHub"],
  "Full Stack Developer": ["HTML", "CSS", "JavaScript", "React.js", "Node.js", "SQL", "Git"]
};

// Recommended beginner-to-intermediate projects per role
const ROLE_PROJECTS = {
  "Software Developer": [
    "Command-line To-Do List Manager",
    "Library Management System (OOP based)",
    "Simple Banking System Simulation"
  ],
  "Frontend Developer": [
    "Personal Portfolio Website",
    "Weather App using a public API",
    "Responsive E-commerce Landing Page"
  ],
  "Backend Developer": [
    "REST API for a Blog Application",
    "User Authentication System",
    "Inventory Management API"
  ],
  "Data Analyst": [
    "Sales Data Dashboard in Excel/Power BI",
    "COVID-19 Data Analysis using Pandas",
    "Customer Churn Analysis Report"
  ],
  "Data Scientist": [
    "House Price Prediction Model",
    "Customer Segmentation using Clustering",
    "Sentiment Analysis on Twitter Data"
  ],
  "AI/ML Engineer": [
    "Image Classification with a CNN",
    "Spam Email Detector",
    "Chatbot using NLP basics"
  ],
  "Full Stack Developer": [
    "Full Stack Blog Platform (MERN)",
    "Online Bookstore Application",
    "Task Manager App with Login System"
  ]
};

const STORAGE_KEY = "aiSkillGapAnalyzer_lastResult";

/* ----------------------------------------------------------------------
   2. BUILD THE CHECKBOX GRID (done in JS so the skill list stays in one place)
   ---------------------------------------------------------------------- */

const skillsGrid = document.getElementById("skillsGrid");

function renderSkillCheckboxes() {
  skillsGrid.innerHTML = "";
  ALL_SKILLS.forEach((skill, index) => {
    const id = "skill_" + index;

    const wrapper = document.createElement("label");
    wrapper.className = "skill-checkbox";
    wrapper.setAttribute("for", id);

    wrapper.innerHTML = `
      <input type="checkbox" id="${id}" value="${skill}" />
      <span>${skill}</span>
    `;

    // Highlight the box visually when checked
    const checkbox = wrapper.querySelector("input");
    checkbox.addEventListener("change", () => {
      wrapper.classList.toggle("checked", checkbox.checked);
    });

    skillsGrid.appendChild(wrapper);
  });
}

renderSkillCheckboxes();

/* ----------------------------------------------------------------------
   3. FORM ELEMENTS
   ---------------------------------------------------------------------- */

const form = document.getElementById("skillForm");
const nameInput = document.getElementById("userName");
const roleSelect = document.getElementById("jobRole");
const resetBtn = document.getElementById("resetBtn");
const analyzeAgainBtn = document.getElementById("analyzeAgainBtn");

const formSection = document.getElementById("formSection");
const resultsSection = document.getElementById("resultsSection");

/* ----------------------------------------------------------------------
   4. VALIDATION HELPERS
   ---------------------------------------------------------------------- */

function getSelectedSkills() {
  const checked = skillsGrid.querySelectorAll("input[type='checkbox']:checked");
  return Array.from(checked).map((cb) => cb.value);
}

function clearErrors() {
  document.querySelectorAll(".field-group").forEach((group) => {
    group.classList.remove("invalid");
  });
}

function validateForm(name, role, skills) {
  clearErrors();
  let isValid = true;

  if (name.trim() === "") {
    document.getElementById("userName").closest(".field-group").classList.add("invalid");
    isValid = false;
  }
  if (role === "") {
    document.getElementById("jobRole").closest(".field-group").classList.add("invalid");
    isValid = false;
  }
  if (skills.length === 0) {
    skillsGrid.closest(".field-group").classList.add("invalid");
    isValid = false;
  }
  return isValid;
}

/* ----------------------------------------------------------------------
   5. CORE ANALYSIS LOGIC
   ---------------------------------------------------------------------- */

function analyzeSkills(name, role, currentSkills) {
  const requiredSkills = ROLE_REQUIREMENTS[role];

  // Skills the user has that are relevant to this role
  const matchedSkills = requiredSkills.filter((skill) => currentSkills.includes(skill));

  // Required skills the user does not have yet
  const missingSkills = requiredSkills.filter((skill) => !currentSkills.includes(skill));

  const matchPercent = Math.round((matchedSkills.length / requiredSkills.length) * 100);

  // Decide skill level based on percentage
  let level = "Beginner";
  if (matchPercent >= 75) level = "Advanced";
  else if (matchPercent >= 40) level = "Intermediate";

  // Build a roadmap dynamically from the missing skills
  const roadmap = buildRoadmap(missingSkills);

  return {
    name,
    role,
    currentSkills,
    requiredSkills,
    matchedSkills,
    missingSkills,
    matchPercent,
    level,
    roadmap,
    generatedAt: new Date().toISOString()
  };
}

// Turns the list of missing skills into a simple 4-step style roadmap
function buildRoadmap(missingSkills) {
  const roadmap = [];

  if (missingSkills.length === 0) {
    roadmap.push("Great job — you already know every required skill!");
    roadmap.push("Sharpen your skills by contributing to open-source projects.");
    roadmap.push("Build one advanced portfolio project to stand out.");
    roadmap.push("Prepare for interviews: revise core concepts and practice mock interviews.");
    return roadmap;
  }

  missingSkills.forEach((skill) => {
    roadmap.push(`Learn the basics of ${skill} through a course or official documentation.`);
  });
  missingSkills.forEach((skill) => {
    roadmap.push(`Practice ${skill} with small daily exercises and coding challenges.`);
  });
  roadmap.push("Build a project that combines all your newly learned skills.");
  roadmap.push("Prepare for interviews: revise concepts, build a resume, and practice mock interviews.");

  return roadmap;
}

// Motivational message based on percentage
function getMotivationMessage(percent) {
  if (percent === 100) return "Outstanding! You are fully job-ready for this role.";
  if (percent >= 75) return "You're almost there — a little more practice and you're job-ready!";
  if (percent >= 40) return "Good progress! Keep learning consistently to close the gap.";
  return "Every expert was once a beginner. Start with the roadmap below and keep going!";
}

/* ----------------------------------------------------------------------
   6. RENDER RESULTS TO THE DOM
   ---------------------------------------------------------------------- */

function renderResults(result) {
  document.getElementById("welcomeMsg").textContent = `Welcome, ${result.name}!`;
  document.getElementById("targetRoleMsg").textContent = `Target Role: ${result.role}`;

  document.getElementById("matchPercent").textContent = `${result.matchPercent}%`;
  document.getElementById("progressFill").style.width = `${result.matchPercent}%`;
  document.getElementById("progressFill2").style.width = `${result.matchPercent}%`;

  document.getElementById("skillLevel").textContent = `Overall Skill Level: ${result.level}`;
  document.getElementById("motivationMsg").textContent = getMotivationMessage(result.matchPercent);

  // Matched skills list
  const matchedList = document.getElementById("matchedList");
  matchedList.innerHTML = "";
  if (result.matchedSkills.length === 0) {
    matchedList.className = "skill-list empty-msg";
    matchedList.innerHTML = "<li>No matching skills yet.</li>";
  } else {
    matchedList.className = "skill-list";
    result.matchedSkills.forEach((skill) => {
      const li = document.createElement("li");
      li.textContent = skill;
      matchedList.appendChild(li);
    });
  }

  // Missing skills list
  const missingList = document.getElementById("missingList");
  missingList.innerHTML = "";
  if (result.missingSkills.length === 0) {
    missingList.className = "skill-list empty-msg";
    missingList.innerHTML = "<li>None — you're fully equipped!</li>";
  } else {
    missingList.className = "skill-list";
    result.missingSkills.forEach((skill) => {
      const li = document.createElement("li");
      li.textContent = skill;
      missingList.appendChild(li);
    });
  }

  // Simple bar chart: matched vs missing count
  renderBarChart(result.matchedSkills.length, result.missingSkills.length);

  // Roadmap
  const roadmapList = document.getElementById("roadmapList");
  roadmapList.innerHTML = "";
  result.roadmap.forEach((step) => {
    const li = document.createElement("li");
    li.textContent = step;
    roadmapList.appendChild(li);
  });

  // Recommended projects
  const projectsList = document.getElementById("projectsList");
  projectsList.innerHTML = "";
  ROLE_PROJECTS[result.role].forEach((project) => {
    const li = document.createElement("li");
    li.textContent = project;
    projectsList.appendChild(li);
  });

  // Progress section
  document.getElementById("progressCount").textContent = result.matchedSkills.length;
  document.getElementById("progressTotal").textContent = result.requiredSkills.length;

  // Reveal results, hide form
  formSection.classList.add("hidden");
  resultsSection.classList.remove("hidden");
  resultsSection.scrollIntoView({ behavior: "smooth" });
}

// Draws a two-bar chart (Matched vs Missing) using plain CSS heights — no libraries
function renderBarChart(matchedCount, missingCount) {
  const chart = document.getElementById("barChart");
  chart.innerHTML = "";

  const maxValue = Math.max(matchedCount, missingCount, 1);
  const bars = [
    { label: "Matched", value: matchedCount, cls: "matched" },
    { label: "Missing", value: missingCount, cls: "missing" }
  ];

  bars.forEach((bar) => {
    const heightPercent = (bar.value / maxValue) * 100;

    const item = document.createElement("div");
    item.className = "bar-chart-item";
    item.innerHTML = `
      <span class="bar-chart-value">${bar.value}</span>
      <div class="bar-chart-fill ${bar.cls}" style="height: ${heightPercent}%;"></div>
      <span class="bar-chart-label">${bar.label}</span>
    `;
    chart.appendChild(item);
  });
}

/* ----------------------------------------------------------------------
   7. LOCAL STORAGE HELPERS
   ---------------------------------------------------------------------- */

function saveResultToStorage(result) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(result));
  } catch (err) {
    console.warn("Could not save to LocalStorage:", err);
  }
}

function loadResultFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (err) {
    console.warn("Could not read from LocalStorage:", err);
    return null;
  }
}

/* ----------------------------------------------------------------------
   8. EVENT LISTENERS
   ---------------------------------------------------------------------- */

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const name = nameInput.value;
  const role = roleSelect.value;
  const currentSkills = getSelectedSkills();

  if (!validateForm(name, role, currentSkills)) {
    return;
  }

  const result = analyzeSkills(name.trim(), role, currentSkills);
  renderResults(result);
  saveResultToStorage(result);
});

resetBtn.addEventListener("click", () => {
  form.reset();
  clearErrors();
  skillsGrid.querySelectorAll(".skill-checkbox").forEach((box) => box.classList.remove("checked"));
});

analyzeAgainBtn.addEventListener("click", () => {
  resultsSection.classList.add("hidden");
  formSection.classList.remove("hidden");
  formSection.scrollIntoView({ behavior: "smooth" });
});

/* ----------------------------------------------------------------------
   9. INITIALISE
   ---------------------------------------------------------------------- */

// On page load, nothing needs to run automatically besides building the
// checkbox grid (already done above). We intentionally do NOT auto-restore
// the results view so the user always starts on a clean form.
