// dashboardScripts.js
document.addEventListener('DOMContentLoaded', () => {

    // ===== Theme toggle =====
    const toggle = document.getElementById("themeToggle");
    if (toggle) {
        toggle.addEventListener("click", () => {
            document.body.classList.toggle("dark");
        });
    }

    // ===== Logout button =====
    const logOutBtn = document.getElementById("logOutBtn");
    if (logOutBtn) {
        logOutBtn.addEventListener("click", () => {
            window.location.href = "/logout";
        });
    }

});
