// Load todos or initialize
let todos = JSON.parse(localStorage.getItem('todos')) || [];

// Render todos on page load
renderTodos();

// Listeners
document.querySelector('.btn-todo').addEventListener('click', addTodo);
document.getElementById('todo-input').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') addTodo();
});
document.getElementById('todo-date').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') addTodo();
});
document.getElementById('filter-select').addEventListener('change', () => {
  renderTodos(document.getElementById('search-input').value.toLowerCase());
});
document.getElementById('search-input').addEventListener('input', (e) => {
  renderTodos(e.target.value.toLowerCase());
});

// Date input behavior
const todoDateInput = document.getElementById('todo-date');
todoDateInput.addEventListener('focus', () => todoDateInput.type = 'date');
todoDateInput.addEventListener('click', () => todoDateInput.type = 'date');
todoDateInput.addEventListener('blur', () => {
  if (!todoDateInput.value) todoDateInput.type = 'text';
});

// Add a new todo
function addTodo() {
  const task = document.getElementById('todo-input').value.trim();
  const rawDate = document.getElementById('todo-date').value;

  if (task === '' || rawDate === '') {
    alert("Please enter both task and date.");
    return;
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(rawDate)) {
    alert("Please enter a valid date in YYYY-MM-DD format or use the calendar.");
    return;
  }

  const date = formatDate(rawDate);
  todos.push({ id: Date.now(), task, date, completed: false });

  saveTodos();
  clearInputs();
  renderTodos();
}

// Format "YYYY-MM-DD" to "Month Day, Year"
function formatDate(inputDate) {
  const date = new Date(inputDate);
  if (isNaN(date.getTime())) return inputDate;
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

// Clear inputs
function clearInputs() {
  document.getElementById('todo-input').value = '';
  document.getElementById('todo-date').value = '';
  document.getElementById('todo-date').type = 'text';
}

// Save todos to localStorage
function saveTodos() {
  localStorage.setItem('todos', JSON.stringify(todos));
}

// Render todos
function renderTodos(search = '') {
  const filter = document.getElementById('filter-select')?.value || 'all';
  const container = document.getElementById('todo-container');
  container.innerHTML = '';

  const filteredTodos = todos
    .filter(t => t.task.toLowerCase().includes(search))
    .filter(t => {
      if (filter === 'completed') return t.completed;
      if (filter === 'incomplete') return !t.completed;
      if (filter === 'today') {
        const today = formatDate(new Date().toISOString().split('T')[0]);
        return t.date === today;
      }
      return true;
    });

  filteredTodos.forEach((todo) => {
    const card = document.createElement('div');
    card.className = 'todo-card';
    if (todo.completed) card.classList.add('todo-complete');

    card.innerHTML = `
      <div class="todo-info">
        <span class="todo-text">${todo.task}</span>
        <small class="todo-date">${todo.date}</small>
      </div>
      <div class="todo-actions">
        <button class="btn-edit">Edit</button>
        <button class="btn-delete">Delete</button>
        <div class="todo-check">
          <input type="checkbox" class="todo-checkbox" ${todo.completed ? 'checked' : ''} />
        </div>
      </div>
    `;

    // ✅ Fixed Delete
    card.querySelector('.btn-delete').addEventListener('click', () => {
      todos = todos.filter(t => t.id !== todo.id);
      saveTodos();
      document.getElementById('search-input').value = ''; // clear search
      renderTodos(); // re-render all todos
    });

    // ✅ Fixed Edit (edited here)
    card.querySelector('.btn-edit').addEventListener('click', () => {
      const newTask = prompt('Edit task:', todo.task);
      const newRawDate = prompt('Edit date (YYYY-MM-DD):', convertToInputDate(todo.date));

      if (newTask && /^\d{4}-\d{2}-\d{2}$/.test(newRawDate)) {
        todo.task = newTask.trim();
        todo.date = formatDate(newRawDate);
        saveTodos();
        document.getElementById('search-input').value = ''; // Clear search input
        renderTodos(); // Full refresh
      } else {
        alert("Invalid date format.");
      }
    });

    // Complete toggle
    card.querySelector('.todo-checkbox').addEventListener('change', (e) => {
      todo.completed = e.target.checked;
      saveTodos();
      renderTodos(search);
    });

    container.appendChild(card);
  });

  updateStats();
}

// Update stats
function updateStats() {
  const total = todos.length;
  const completed = todos.filter(t => t.completed).length;
  const remaining = total - completed;

  document.getElementById('todo-stats').innerHTML = `
    <strong>Total:</strong> ${total} |
    <strong>Completed:</strong> ${completed} |
    <strong>Remaining:</strong> ${remaining}
  `;
}

// Convert "Month Day, Year" to "YYYY-MM-DD"
function convertToInputDate(dateStr) {
  const date = new Date(dateStr);
  return date.toISOString().split('T')[0];
}
