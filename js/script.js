let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

window.addEventListener('DOMContentLoaded', () => {
  if (tasks.length === 0) {
    tasks = [
      {
        id: Date.now(),
        name: "Contoh",
        npm: "1234567890",
        course: "Mata Kuliah Kamu",
        taskType: "Tugas 1",
        deadline: new Date().toISOString().slice(0, 10),
        done: false
      }
    ];
    saveTasks();
  }

  const quotes = [
    "Ingat, tugas dikerjakan, bukan disimpan 😤",
    "Sedikit demi sedikit, lama-lama jadi tugas numpuk!",
    "Tugas bukan untuk ditunda, tapi diselesaikan 😎",
    "Belajar bukan karena harus, tapi karena butuh!",
    "Kamu bisa, kalau mau ✊"
  ];
  document.getElementById("quoteBox").innerText =
    quotes[Math.floor(Math.random() * quotes.length)];

  renderTasks();
  playDeadlineSoundIfToday();

  document.getElementById("npm").addEventListener("input", function () {
    this.value = this.value.replace(/[^\d]/g, '').slice(0, 10);
  });
});

function playDeadlineSoundIfToday() {
  const today = new Date().toLocaleDateString('sv-SE');
  const todayTasks = tasks.filter(t => t.deadline === today);
  if (todayTasks.length > 0) {
    const bell = document.getElementById("notifSound");
    if (bell && typeof bell.play === "function") bell.play().catch(() => {});
    setTimeout(() => {
      alert(`⚠️ Ada ${todayTasks.length} tugas yang deadline-nya HARI INI bro!`);
    }, 100);
  }
}

function addTask() {
  const name = document.getElementById("name").value;
  const npm = document.getElementById("npm").value;
  const course = document.getElementById("course").value;
  const taskType = document.getElementById("taskType").value;
  const deadline = document.getElementById("deadline").value;
  if (!name || !npm || !course || !taskType || !deadline) {
    return alert("Isi semua data dong 🙄");
  }

  const task = {
    id: Date.now(),
    name,
    npm,
    course,
    taskType,
    deadline,
    done: false
  };
  tasks.push(task);
  saveTasks();
  renderTasks();
  resetForm(false);
}

function renderTasks() {
  const list = document.getElementById("taskList");
  if (!list) return;
  const filter = document.getElementById("filterCourse").value;
  const sortBy = document.getElementById("sortSelect").value;
  list.innerHTML = "";

  let filtered = [...tasks];
  if (filter) filtered = filtered.filter(t => t.course === filter);
  if (sortBy === "deadline") filtered.sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
  if (sortBy === "course") filtered.sort((a, b) => a.course.localeCompare(b.course));

  filtered.forEach(task => {
    const li = document.createElement("li");
    const info = document.createElement("div");
    info.className = "task-info";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = task.done;
    checkbox.onchange = () => {
      task.done = checkbox.checked;
      saveTasks();
      renderTasks();
    };

    const label = document.createElement("label");
    label.innerText = `${task.name} - ${task.npm} | ${task.course} | ${task.taskType} | Deadline: ${task.deadline}`;
    if (task.done) label.style.textDecoration = "line-through";

    info.appendChild(checkbox);
    info.appendChild(label);

    const actions = document.createElement("div");
    actions.className = "task-actions";

    const editBtn = document.createElement("button");
    editBtn.innerText = "Edit";
    editBtn.className = "edit";
    editBtn.onclick = () => editTask(task.id);

    const delBtn = document.createElement("button");
    delBtn.innerText = "Hapus";
    delBtn.onclick = () => deleteTask(task.id);

    actions.appendChild(editBtn);
    actions.appendChild(delBtn);

    li.appendChild(info);
    li.appendChild(actions);
    list.appendChild(li);
  });

  const total = tasks.length;
  const done = tasks.filter(t => t.done).length;
  const stats = document.getElementById("taskStats");
  if (stats) stats.innerText = `🎯 ${done} dari ${total} tugas sudah diselesaikan. Tetap semangat!`;
}

function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function deleteTask(id) {
  tasks = tasks.filter(task => task.id !== id);
  saveTasks();
  renderTasks();
}

function clearAllTasks() {
  if (tasks.length === 0) return alert("Belum ada tugas yang bisa dihapus.");
  const konfirmasi = confirm("Apakah Anda yakin ingin menghapus SEMUA tugas?");
  if (konfirmasi) {
    tasks = [];
    saveTasks();
    renderTasks();
    alert("Semua tugas berhasil dihapus.");
  }
}

function editTask(id) {
  const task = tasks.find(t => t.id === id);
  document.getElementById("name").value = task.name;
  document.getElementById("npm").value = task.npm;
  document.getElementById("course").value = task.course;
  document.getElementById("taskType").value = task.taskType;
  document.getElementById("deadline").value = task.deadline;
  deleteTask(id);
}

function resetForm(clear = true) {
  if (clear) {
    document.getElementById("name").value = "";
    document.getElementById("npm").value = "";
  }
  document.getElementById("course").value = "";
  document.getElementById("taskType").value = "";
  document.getElementById("deadline").value = "";
}

function toggleTheme() {
  const isDark = document.documentElement.getAttribute("data-theme") === "dark";
  document.documentElement.setAttribute("data-theme", isDark ? "light" : "dark");
  const icon = document.getElementById("themeIcon");
  icon.innerHTML = isDark
    ? '<path d="M12 3a9 9 0 0 0 0 18c4.97 0 9-4.03 9-9s-4.03-9-9-9z"/>'
    : '<path d="M21.64 13.11a9 9 0 1 1-10.75-10.75 7 7 0 1 0 10.75 10.75z"/>';
}

function downloadTasks() {
  if (tasks.length === 0) return alert("Belum ada tugas yang bisa diunduh!");

  const today = new Date().toLocaleDateString("id-ID");
  const name = document.getElementById("name").value || "(Belum diisi)";
  const npm = document.getElementById("npm").value || "(Belum diisi)";
  let content = `📄 Ini nih semua tugas kamu.\nGua cuma ngingetin 😤\n\nNama: ${name}\nNPM: ${npm}\nTanggal: ${today}\n\n`;

  tasks.forEach((t, i) => {
    const status = t.done ? "✔ Selesai" : "❌ Belum";
    content += `${i + 1}. ${t.course.padEnd(30)} | ${t.taskType.padEnd(20)} | Deadline: ${t.deadline} | Status: ${status}\n`;
  });

  const blob = new Blob([content], { type: "text/plain" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "Ini_nih_semua_tugas_kamu.txt";
  link.click();
}