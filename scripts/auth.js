function checkAuthentication() {
    const isAuthenticated = localStorage.getItem('isAuthenticated'); 
    if (!isAuthenticated && window.location.pathname !== '/register.html') {
        window.location.href = 'register.html';
    }
}
checkAuthentication();
