document.getElementById('add-btn').addEventListener('click', addTask);
document.addEventListener('DOMContentLoaded', loadTasksFromServer);

function addTask() {
    const taskInput = document.getElementById('new-task');
    const taskText = taskInput.value;
    if (taskText.trim() !== "") {
        const userId = localStorage.getItem('userId');
        sendTaskToServer(taskText, userId);
        taskInput.value = '';
    }
}

function createTaskElement(taskText, taskId, status) {
    const newTask = document.createElement('li');
    newTask.setAttribute('data-id', taskId);

    const taskTextElement = document.createElement('span');
    taskTextElement.classList.add('task-text');
    taskTextElement.textContent = taskText;

    const statusSelect = document.createElement('select');
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = 'Select status';
    statusSelect.appendChild(defaultOption);

    if (status !== 'TODO') {
        const todoOption = document.createElement('option');
        todoOption.value = 'TODO';
        todoOption.textContent = 'To Do';
        statusSelect.appendChild(todoOption);
    }
    if (status !== 'IN_PROGRESS') {
        const inProgressOption = document.createElement('option');
        inProgressOption.value = 'IN_PROGRESS';
        inProgressOption.textContent = 'In Progress';
        statusSelect.appendChild(inProgressOption);
    }
    if (status !== 'COMPLETED') {
        const completedOption = document.createElement('option');
        completedOption.value = 'COMPLETED';
        completedOption.textContent = 'Completed';
        statusSelect.appendChild(completedOption);
    }

    statusSelect.addEventListener('change', function () {
        const newStatus = statusSelect.value;
        updateTaskStatusOnServer(taskId, newStatus);

        if (newStatus === 'TODO') {
            moveTaskToTodoList(newTask);
        } else if (newStatus === 'IN_PROGRESS') {
            moveTaskToInProgress(newTask);
        } else if (newStatus === 'COMPLETED') {
            moveTaskToCompleted(newTask);
        }
    });

    const editButton = document.createElement('button');
    editButton.textContent = 'Edit';
    editButton.addEventListener('click', function () {
        const newText = prompt("Edit task:", taskTextElement.textContent);
        if (newText && newText.trim() !== "") {
            taskTextElement.textContent = newText;
            updateTaskOnServer(taskId, newText); 
        }
    });

    const deleteButton = document.createElement('button'); 
    deleteButton.textContent = 'Delete';
    deleteButton.addEventListener('click', function () {
        newTask.remove(); 
        deleteTaskOnServer(taskId); 
    });


    const buttonContainer = document.createElement('div');
    buttonContainer.classList.add('button-container');
    buttonContainer.appendChild(statusSelect);
    buttonContainer.appendChild(editButton);
    buttonContainer.appendChild(deleteButton);
    newTask.appendChild(buttonContainer);

    newTask.appendChild(taskTextElement);
    newTask.appendChild(buttonContainer);
    // Добавляем кнопку удаления

    return newTask;
}

function deleteTaskOnServer(taskId) {
    const userId = localStorage.getItem('userId');
    fetch(`http://142.93.98.27:4447/deleteTask/${userId}/${taskId}`, {
        method: 'DELETE',
    })
        .then(response => {
            if (response.ok) {
                console.log('Task deleted successfully');
            } else {
                console.error('Error deleting task on server');
            }
        })
        .catch(error => {
            console.error('Error deleting task on server:', error);
        });
}



function sendTaskToServer(taskText, userId) {
    fetch(`http://142.93.98.27:4447/addTask/${userId}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text: taskText })
    })
        .then(response => response.json())
        .then(result => {
            const newTask = createTaskElement(result.text, result.id, 'todo');
            moveTaskToTodoList(newTask);
        })
        .catch(error => {
            console.error('Error sending task to server:', error);
        });
}

function updateTaskStatusOnServer(taskId, newStatus) {
    const userId = localStorage.getItem('userId');
    fetch(`http://142.93.98.27:4447/moveToStatus/${userId}/${taskId}/${newStatus}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Error updating task status on server');
            }
            console.log('Task status updated successfully');
        })
        .catch(error => {
            console.error('Error updating task status on server:', error);
        });
}


function loadTasksFromServer() {
    const userId = localStorage.getItem('userId');
    fetch(`http://142.93.98.27:4447/allTask/${userId}`)
        .then(response => response.json())
        .then(tasks => {
            tasks.forEach(task => {
                const newTask = createTaskElement(task.text, task.id, task.status);

                if (task.status === 'COMPLETED') {
                    moveTaskToCompleted(newTask);
                } else if (task.status === 'IN_PROGRESS') {
                    moveTaskToInProgress(newTask);
                } else {
                    moveTaskToTodoList(newTask);
                }
            });
        })
        .catch(error => {
            console.error('Error loading tasks from server:', error);
        });
}


function editTask(taskTextElement, taskId) {
    const newText = prompt("Edit task:", taskTextElement.textContent);
    if (newText && newText.trim() !== "") {
        taskTextElement.textContent = newText;
        updateTaskOnServer(taskId, newText);
    }
}

function updateTaskOnServer(taskId, newText) {
    const userId = localStorage.getItem('userId');
    fetch(`http://142.93.98.27:4447/editTask/${userId}/${taskId}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text: newText })
    })
        .then(response => response.ok ? console.log('Task updated successfully') : console.error('Error updating task on server'))
        .catch(error => {
            console.error('Error updating task on server:', error);
        });
}

function moveTaskToTodoList(taskElement) {
    const todoList = document.getElementById('todo-list');
    todoList.appendChild(taskElement);
}

function moveTaskToInProgress(taskElement) {
    const inProgressList = document.getElementById('in-process-list');
    inProgressList.appendChild(taskElement);
}

function moveTaskToCompleted(taskElement) {
    const completedList = document.getElementById('completed-list');
    completedList.appendChild(taskElement);
}

