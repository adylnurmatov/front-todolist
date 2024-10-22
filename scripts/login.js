document.getElementById('login-btn').addEventListener('click', loginUser);

function loginUser() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    if (username.trim() === "" || password.trim() === "") {
        alert("Please fill in all fields.");
        return;
    }

    fetch('http://142.93.98.27:4447/login', {
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
        alert('Login successful!');
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('userId', result.id);
        window.location.href = 'index.html'; 
    })
    .catch(error => {
        console.error('Error logging in:', error);
        alert('Login failed. Please check your credentials.');
    });
}