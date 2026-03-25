// =====================
// STORAGE HELPERS
// =====================

function getTasksFromStorage() {
    return JSON.parse(localStorage.getItem("tasks")) || [];
}

function saveTasksToStorage(tasks) {
    localStorage.setItem("tasks", JSON.stringify(tasks));
}

// =====================
// STATE
// =====================

let selectedTaskId = null;
let currentFilter = "all";

// =====================
// UI HELPERS
// =====================

function showMessage(msg, type = "success") {
    const el = document.getElementById("message");
    el.innerText = msg;
    el.className = type;
}

function setFilter(filter) {
    currentFilter = filter;

    document.querySelectorAll(".filters button").forEach(btn => {
        btn.classList.remove("active-filter");
    });

    const activeBtn = document.getElementById(`filter-${filter}`);
    if (activeBtn) {
        activeBtn.classList.add("active-filter");
    }

    loadTasks();
}

function sortByPriority(tasks) {
    const priorityOrder = { high: 1, medium: 2, low: 3 };
    return tasks.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
}

// =====================
// CORE: LOAD + RENDER
// =====================

function loadTasks() {
    let tasks = getTasksFromStorage();

    const searchInput = document.getElementById("searchInput");
    const searchText = searchInput ? searchInput.value.toLowerCase() : "";

    // Search filter
    if (searchText) {
        tasks = tasks.filter(t =>
            t.text.toLowerCase().includes(searchText)
        );
    }

    // Priority filter
    if (currentFilter !== "all") {
        tasks = tasks.filter(t => t.priority === currentFilter);
    }

    // Sort
    tasks = sortByPriority(tasks);

    const list = document.getElementById("taskList");
    const emptyState = document.getElementById("emptyState");

    if (!list) return; // safety guard

    list.innerHTML = "";

    // Empty state
    if (tasks.length === 0) {
        if (emptyState) emptyState.style.display = "block";
        return;
    } else {
        if (emptyState) emptyState.style.display = "none";
    }

    // Render tasks
    tasks.forEach(task => {
        const li = document.createElement("li");
        li.classList.add("task-item", task.priority);

        if (task.id === selectedTaskId) {
            li.classList.add("selected");
        }

        // Task text
        const textSpan = document.createElement("span");
        textSpan.className = "task-text";
        textSpan.innerText = task.text;
        textSpan.setAttribute("tabindex", "0");

        textSpan.onclick = () => enterEditMode(task);
        textSpan.onkeypress = (e) => {
            if (e.key === "Enter") enterEditMode(task);
        };

        // Priority tag
        const priorityTag = document.createElement("span");
        priorityTag.className = `priority-tag ${task.priority}`;
        priorityTag.innerText = task.priority.toUpperCase();

        // Delete button
        const deleteBtn = document.createElement("button");
        deleteBtn.className = "delete-btn";
        deleteBtn.innerText = "Delete";
        deleteBtn.onclick = () => deleteTask(task.id);

        li.appendChild(textSpan);
        li.appendChild(priorityTag);
        li.appendChild(deleteBtn);

        list.appendChild(li);
    });
}

// =====================
// TASK ACTIONS
// =====================

function enterEditMode(task) {
    selectedTaskId = task.id;

    document.getElementById("taskText").value = task.text;
    document.getElementById("taskPriority").value = task.priority;
    document.getElementById("updateBtn").disabled = false;

    showMessage("Editing task — press Update to save");
    loadTasks();
}

function addTask() {
    const text = document.getElementById("taskText").value.trim();
    const priority = document.getElementById("taskPriority").value;

    if (!text) {
        showMessage("Task text cannot be empty", "error");
        return;
    }

    const tasks = getTasksFromStorage();

    const newTask = {
        id: Date.now(),
        text,
        priority
    };

    tasks.push(newTask);
    saveTasksToStorage(tasks);

    showMessage("Task Created");
    clearFields();
    loadTasks();
}

function updateTask() {
    const text = document.getElementById("taskText").value.trim();
    const priority = document.getElementById("taskPriority").value;

    if (!selectedTaskId) {
        showMessage("Select a task to update", "error");
        return;
    }

    let tasks = getTasksFromStorage();

    tasks = tasks.map(task =>
        task.id === selectedTaskId
            ? { ...task, text, priority }
            : task
    );

    saveTasksToStorage(tasks);

    showMessage("Task Updated");
    clearFields();
    loadTasks();
}

function deleteTask(id) {
    let tasks = getTasksFromStorage();

    tasks = tasks.filter(task => task.id !== id);

    saveTasksToStorage(tasks);

    showMessage("DELETED");
    loadTasks();
}

// =====================
// UTIL
// =====================

function clearFields() {
    selectedTaskId = null;

    document.getElementById("taskText").value = "";
    document.getElementById("taskPriority").value = "low";
    document.getElementById("updateBtn").disabled = true;

    showMessage("Fields Cleared");
}

// =====================
// INIT
// =====================

document.addEventListener("DOMContentLoaded", () => {
    loadTasks();
});