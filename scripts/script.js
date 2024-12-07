document.getElementById('add-btn').addEventListener('click', addTask);
document.addEventListener('DOMContentLoaded', loadTasksFromServer);

function addTask() {
    const taskInput = document.getElementById('new-task');
    const taskText = taskInput.value.trim();
    if (taskText !== "") {
        const userId = localStorage.getItem('userId');
        sendTaskToServer(taskText, userId);
        taskInput.value = '';
    }
}

function createTaskElement(taskText, taskId, status) {
    const newTask = document.createElement('li');
    newTask.setAttribute('data-id', taskId);
    newTask.setAttribute('draggable', 'true');
    newTask.addEventListener('dragstart', handleDragStart);
    newTask.addEventListener('dragend', handleDragEnd);

    const taskTextElement = document.createElement('span');
    taskTextElement.classList.add('task-text');
    taskTextElement.textContent = taskText;

    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Delete';
    deleteButton.addEventListener('click', function () {
        newTask.remove();
        deleteTaskOnServer(taskId);
    });

    newTask.appendChild(taskTextElement);
    newTask.appendChild(deleteButton);

    return newTask;
}

function handleDragStart(event) {
    event.target.classList.add('dragging');
    event.dataTransfer.setData('text/plain', event.target.dataset.id);
}

function handleDragEnd(event) {
    event.target.classList.remove('dragging');
    document.querySelectorAll('.drag-over').forEach(list => {
        list.classList.remove('drag-over');
    });
}

function handleDragOver(event) {
    event.preventDefault();
    event.currentTarget.classList.add('drag-over');
}

function handleDragEnter(event) {
    event.preventDefault();
    event.currentTarget.classList.add('drag-over');
}

function handleDragLeave(event) {
    event.currentTarget.classList.remove('drag-over');
}

function handleDrop(event) {
    event.preventDefault();
    const draggedId = event.dataTransfer.getData('text/plain');
    const draggedElement = document.querySelector(`[data-id="${draggedId}"]`);
    const newStatus = event.currentTarget.id === 'todo-list' ? 'TODO' :
        event.currentTarget.id === 'in-process-list' ? 'IN_PROGRESS' : 'COMPLETED';

    if (draggedElement) {
        event.currentTarget.appendChild(draggedElement);
        updateTaskStatusOnServer(draggedId, newStatus);

        if (newStatus === 'COMPLETED') {
            draggedElement.classList.add('completed-animation');

            draggedElement.addEventListener('animationend', () => {
                draggedElement.classList.remove('completed-animation');
            }, { once: true });
        }
    }

    event.currentTarget.classList.remove('drag-over');
}


function sendTaskToServer(taskText, userId) {
    fetch(`http://142.93.98.27:4447/addTask/${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: taskText })
    })
        .then(response => response.json())
        .then(result => {
            const newTask = createTaskElement(result.text, result.id, 'TODO');
            moveTaskToList(newTask, 'TODO');
        })
        .catch(console.error);
}

function updateTaskStatusOnServer(taskId, newStatus) {
    const userId = localStorage.getItem('userId');
    fetch(`http://142.93.98.27:4447/moveToStatus/${userId}/${taskId}/${newStatus}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
    }).catch(console.error);
}

function loadTasksFromServer() {
    const userId = localStorage.getItem('userId');
    fetch(`http://142.93.98.27:4447/allTask/${userId}`)
        .then(response => response.json())
        .then(tasks => {
            tasks.forEach(task => {
                const newTask = createTaskElement(task.text, task.id, task.status);
                moveTaskToList(newTask, task.status);
            });
        })
        .catch(console.error);
}

function moveTaskToList(taskElement, status) {
    const targetList = status === 'TODO' ? document.getElementById('todo-list') :
        status === 'IN_PROGRESS' ? document.getElementById('in-process-list') :
            document.getElementById('completed-list');
    targetList.appendChild(taskElement);
}

document.querySelectorAll('.column ul').forEach(list => {
    list.addEventListener('dragover', handleDragOver);
    list.addEventListener('dragenter', handleDragEnter); 
    list.addEventListener('dragleave', handleDragLeave);
    list.addEventListener('drop', handleDrop);
});
