document.getElementById('register-btn').addEventListener('click', registerUser);

function registerUser() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    if (username.trim() === "" || password.trim() === "") {
        alert("Please fill in all fields.");
        return;
    }

    fetch('http://142.93.98.27:4447/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userName: username, password: password })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(result => {
        alert('Registration successful! You can now log in.');
        window.location.href = 'login.html';
    })
    .catch(error => {
        console.error('Error registering user:', error);
        alert('Registration failed. Please try again..');
    });
}