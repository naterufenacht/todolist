const API = "/api/tasks";

let selectedTaskId = null;
let currentFilter = "all";

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

async function loadTasks() {
    const res = await fetch(API);
    let tasks = await res.json();

    const searchText = document.getElementById("searchInput").value.toLowerCase();

    // Search filtering
    if (searchText) {
        tasks = tasks.filter(t =>
            t.text.toLowerCase().includes(searchText)
        );
    }

    // Priority filtering
    if (currentFilter !== "all") {
        tasks = tasks.filter(t => t.priority === currentFilter);
    }

    // Sort by priority
    tasks = sortByPriority(tasks);

    const list = document.getElementById("taskList");
    const emptyState = document.getElementById("emptyState");

    list.innerHTML = "";

    // Empty state logic
    if (tasks.length === 0) {
        emptyState.style.display = "block";
        return;
    } else {
        emptyState.style.display = "none";
    }

    for (let i = 0; i < tasks.length; i++) {
        const task = tasks[i];

        const li = document.createElement("li");
        li.classList.add("task-item", task.priority);

        if (task.id === selectedTaskId) {
            li.classList.add("selected");
        }

        // Task text (click to edit)
        const textSpan = document.createElement("span");
        textSpan.className = "task-text";
        textSpan.innerText = task.text;
        textSpan.setAttribute("tabindex", "0");

        textSpan.onclick = () => enterEditMode(task);

        textSpan.onkeypress = (e) => {
            if (e.key === "Enter") {
                enterEditMode(task);
            }
        };

        // Priority tag
        const priorityTag = document.createElement("span");
        priorityTag.className = `priority-tag ${task.priority}`;
        priorityTag.innerText = task.priority.toUpperCase();

        // Delete button (per assignment transcript)
        const deleteBtn = document.createElement("button");
        deleteBtn.className = "delete-btn";
        deleteBtn.innerText = "Delete";
        deleteBtn.onclick = () => deleteTask(task.id);

        li.appendChild(textSpan);
        li.appendChild(priorityTag);
        li.appendChild(deleteBtn);

        list.appendChild(li);
    }
}

function enterEditMode(task) {
    selectedTaskId = task.id;
    document.getElementById("taskText").value = task.text;
    document.getElementById("taskPriority").value = task.priority;
    document.getElementById("updateBtn").disabled = false;
    showMessage("Editing task — press Update to save");
    loadTasks();
}

async function addTask() {
    const text = document.getElementById("taskText").value.trim();
    const priority = document.getElementById("taskPriority").value;

    if (!text) {
        showMessage("Task text cannot be empty", "error");
        return;
    }

    const res = await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, priority })
    });

    if (res.status === 201) {
        showMessage("Task Created");
        clearFields();
        loadTasks();
    } else {
        showMessage("Failed to create task", "error");
    }
}

async function updateTask() {
    const text = document.getElementById("taskText").value.trim();
    const priority = document.getElementById("taskPriority").value;

    if (!selectedTaskId) {
        showMessage("Select a task to update", "error");
        return;
    }

    const res = await fetch(`${API}/${selectedTaskId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, priority })
    });

    if (res.status === 200) {
        showMessage("Task Updated");
        clearFields();
        loadTasks();
    } else {
        showMessage("Update failed", "error");
    }
}

async function deleteTask(id) {
    const res = await fetch(`${API}/${id}`, {
        method: "DELETE"
    });

    if (res.status === 200) {
        showMessage("DELETED");
        loadTasks();
    } else {
        showMessage("Delete failed", "error");
    }
}

function clearFields() {
    selectedTaskId = null;
    document.getElementById("taskText").value = "";
    document.getElementById("taskPriority").value = "low";
    document.getElementById("updateBtn").disabled = true;
    showMessage("Fields Cleared");
}

loadTasks();
