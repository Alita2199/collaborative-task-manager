const taskForm = document.getElementById('task-form');
const taskList = document.getElementById('task-list');
const messageDiv = document.getElementById('message'); // Message area for feedback

taskForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const title = document.getElementById('task-title').value;
    const description = document.getElementById('task-description').value;
    const assignedTo = document.getElementById('assigned-to').value;

    try {
        const response = await fetch('/api/tasks', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, description, assignedTo }),
        });

        if (!response.ok) throw new Error('Failed to add task');

        const task = await response.json();
        const li = document.createElement('li');
        li.textContent = `${task.title} - ${task.description} (Assigned to: ${task.assignedTo})`;
        taskList.appendChild(li);
        taskForm.reset();

        // Show success message
        messageDiv.textContent = 'Task added successfully!'; // Show success message
        messageDiv.style.color = 'green'; // Set color for success
    } catch (error) {
        console.error(error);
        
        // Show error message
        messageDiv.textContent = 'Error adding task. Please try again.'; // Show error message
        messageDiv.style.color = 'red'; // Set color for error
    }
});

// Fetch tasks when the page loads
async function fetchTasks() {
    try {
        const response = await fetch('/api/tasks');
        const tasks = await response.json();
        tasks.forEach(task => {
            const li = document.createElement('li');
            li.textContent = `${task.title} - ${task.description} (Assigned to: ${task.assignedTo})`;
            taskList.appendChild(li);
        });
    } catch (error) {
        console.error('Error fetching tasks:', error);
    }
}

fetchTasks();
