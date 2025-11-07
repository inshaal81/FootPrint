// ===== Scroll up button =====
const scrollUpBtn = document.getElementById("scrollUpBtn");
window.addEventListener("scroll", () => {
  scrollUpBtn.style.display = window.scrollY > 300 ? "block" : "none";
});
scrollUpBtn.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});

// ===== Theme toggle =====
const toggle = document.getElementById("themeToggle");
toggle.addEventListener("click", () => {
  document.body.classList.toggle("dark");
});

// ===== Smooth anchors =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener("click", (e) => {
    e.preventDefault();
    const target = document.querySelector(anchor.getAttribute("href"));
    if (target) target.scrollIntoView({ behavior: "smooth" });
  });
});

const popupContainer = document.getElementById("popupContainer");

// Helper: inject HTML, wire close, return the modal element
function injectModal(html, modalId) {
  popupContainer.innerHTML = html;
  const modal = document.getElementById(modalId);
  const closeBtn = modal ? modal.querySelector(".close") : null;
  if (!modal || !closeBtn) return null;

  closeBtn.addEventListener("click", () => (modal.style.display = "none"));
  modal.addEventListener("click", (e) => {
    if (e.target === modal) modal.style.display = "none";
  });
  return modal;
}

// ===== Open LOGIN modal every time button is clicked (refetch fresh) =====
const loginBtn = document.getElementById("logInBtn");
if (loginBtn && popupContainer) {
  loginBtn.addEventListener("click", (e) => {
    e.preventDefault();
    fetch("login.html")
      .then(r => r.text())
      .then(html => {
        const modal = injectModal(html, "loginModal"); 
        if (modal) modal.style.display = "flex";
      })
      .catch(err => console.error("Failed to load login popup:", err));
  });
}

// ===== Open SIGNUP modal from the bottom CTA button =====
const signUpBtn = document.getElementById("signUpBtn");
if (signUpBtn && popupContainer) {
  signUpBtn.addEventListener("click", (e) => {
    e.preventDefault();
    fetch("signup.html")
      .then(r => r.text())
      .then(html => {
        const modal = injectModal(html, "signupModal"); // signup.html must have id="signupModal"
        if (modal) modal.style.display = "flex";
      })
      .catch(err => console.error("Failed to load signup popup:", err));
  });
}

// ===== Delegate: "Create one" link inside LOGIN modal opens SIGNUP modal =====
document.addEventListener("click", (e) => {
  if (e.target && e.target.id === "openSignupLink") {
    e.preventDefault();
    const loginModal = document.getElementById("loginModal");
    if (loginModal) loginModal.style.display = "none";
    fetch("signup.html")
      .then(r => r.text())
      .then(html => {
        const modal = injectModal(html, "signupModal");
        if (modal) modal.style.display = "flex";
      })
      .catch(err => console.error("Failed to load signup popup:", err));
  }
});
