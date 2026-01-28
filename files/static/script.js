//Terry
document.addEventListener('DOMContentLoaded', () => {
    const loginModal = document.getElementById("loginModal");

// If login modal has flashes, open it
    if (loginModal?.querySelector(".modalFlashes")?.children.length > 0) {
        loginModal.style.display = "flex";
    }

    // ===== Theme toggle =====
    const toggle = document.getElementById("themeToggle");
    toggle?.addEventListener("click", () => document.body.classList.toggle("dark"));
  
    // ===== Scroll up button =====
    const scrollUpBtn = document.getElementById("scrollUpBtn");
    if (scrollUpBtn) {
        window.addEventListener("scroll", () => {
            scrollUpBtn.style.display = window.scrollY > 300 ? "block" : "none";
        });
        scrollUpBtn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
    }
  
    // ===== Open login modal =====
    const loginBtn = document.getElementById("logInBtn");
    loginBtn?.addEventListener("click", e => {
        e.preventDefault();
        const loginModal = document.getElementById("loginModal");
        if (loginModal) loginModal.style.display = "flex";
    });
  
    // ===== Open signup modal =====
    const signUpBtn = document.getElementById("signUpBtn");
    signUpBtn?.addEventListener("click", e => {
        e.preventDefault();
        const signupModal = document.getElementById("signupModal");
        if (signupModal) signupModal.style.display = "flex";
    });

//Khang
    // ===== "Create one" link inside login opens signup =====
    const openSignupLink = document.getElementById("openSignupLink");
    openSignupLink?.addEventListener("click", e => {
        e.preventDefault();
        const loginModal = document.getElementById("loginModal");
        const signupModal = document.getElementById("signupModal");
        if (loginModal) loginModal.style.display = "none";
        if (signupModal) signupModal.style.display = "flex";
    });
  
    // ===== Close modals =====
    document.querySelectorAll(".modal .close").forEach(btn => {
        btn.addEventListener("click", e => {
            const modal = e.target.closest(".modal");
            if (modal) modal.style.display = "none";
        });
    });
  
    // ===== Close modals when clicking outside =====
    document.querySelectorAll(".modal").forEach(modal => {
        modal.addEventListener("click", e => {
            if (e.target === modal) modal.style.display = "none";
        });
    });
  
    // ===== Logout button =====
    const logOutBtn = document.getElementById("logOutBtn");
    logOutBtn?.addEventListener("click", () => window.location.href = "/logout");
  
  });
  