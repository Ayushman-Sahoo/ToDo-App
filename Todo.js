// Retrieve todos from localStorage or initialize
let todos = JSON.parse(localStorage.getItem('todos')) || [];

// Render todos on page load
renderTodos();

// Add button click and Enter key support
document.querySelector('.btn-todo').addEventListener('click', addTodo);
document.getElementById('todo-input').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') addTodo();
});
document.getElementById('todo-date').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') addTodo();
});

function addTodo() {
  const textInput = document.getElementById('todo-input');
  const dateInput = document.getElementById('todo-date');
  const task = textInput.value.trim();
  const rawDate = dateInput.value.trim();

  if (task === '' || rawDate === '') {
    alert("Please fill both task and date.");
    return;
  }

  const parsedDate = parseDate(rawDate);
  if (!parsedDate) {
    alert("Invalid date format. Please enter a valid date (e.g., 2025-08-01 or August 1, 2025).");
    return;
  }

  const formattedDate = formatDate(parsedDate);

  todos.push({ task, date: formattedDate, completed: false });
  saveTodos();
  renderTodos();
  textInput.value = '';
  dateInput.value = '';
}

// Try to parse various date formats
function parseDate(input) {
  const date = new Date(input);
  return isNaN(date.getTime()) ? null : date;
}

// Format to readable style like "August 1, 2025"
function formatDate(dateObj) {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return dateObj.toLocaleDateString(undefined, options);
}

// Search functionality
document.getElementById('search-input').addEventListener('input', (e) => {
  renderTodos(e.target.value.toLowerCase());
});

// Save to localStorage
function saveTodos() {
  localStorage.setItem('todos', JSON.stringify(todos));
}

// Render todos
function renderTodos(searchTerm = '') {
  const container = document.getElementById('todo-container');
  container.innerHTML = '';

  todos
    .filter(todo => todo.task.toLowerCase().includes(searchTerm))
    .forEach((todo, index) => {
      const card = document.createElement('div');
      card.className = 'todo-card';
      if (todo.completed) card.classList.add('todo-complete');

      card.innerHTML = `
        <span>${todo.task} <br><small>${todo.date}</small></span>
        <div>
          <button class="btn-edit">Edit</button>
          <button class="btn-delete">Delete</button>
          <input type="checkbox" ${todo.completed ? 'checked' : ''}>
        </div>
      `;

      // Delete
      card.querySelector('.btn-delete').addEventListener('click', () => {
        todos.splice(index, 1);
        saveTodos();
        renderTodos(searchTerm);
      });

      // Edit
      card.querySelector('.btn-edit').addEventListener('click', () => {
        const newTask = prompt('Edit task:', todo.task);
        if (newTask !== null) {
          todo.task = newTask.trim() || todo.task;
          saveTodos();
          renderTodos(searchTerm);
        }
      });

      // Checkbox
      card.querySelector('input[type="checkbox"]').addEventListener('change', (e) => {
        todo.completed = e.target.checked;
        saveTodos();
        renderTodos(searchTerm);
      });

      container.appendChild(card);
    });
}