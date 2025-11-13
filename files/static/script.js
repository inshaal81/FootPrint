document.addEventListener('DOMContentLoaded', () => {
  const popupContainer = document.getElementById("popupContainer");

  // ===== Theme toggle =====
  const toggle = document.getElementById("themeToggle");
  if (toggle) {
      toggle.addEventListener("click", () => {
          document.body.classList.toggle("dark");
      });
  }

  // ===== Scroll up button =====
  const scrollUpBtn = document.getElementById("scrollUpBtn");
  if (scrollUpBtn) {
      window.addEventListener("scroll", () => {
          scrollUpBtn.style.display = window.scrollY > 300 ? "block" : "none";
      });
      scrollUpBtn.addEventListener("click", () => {
          window.scrollTo({ top: 0, behavior: "smooth" });
      });
  }

  // ===== Inject modal helper =====
  function injectModal(html, modalId) {
      if (!popupContainer) return null;
      popupContainer.innerHTML = html;
      const modal = document.getElementById(modalId);
      const closeBtn = modal?.querySelector(".close");
      if (!modal || !closeBtn) return null;

      closeBtn.addEventListener("click", () => (modal.style.display = "none"));
      modal.addEventListener("click", e => {
          if (e.target === modal) modal.style.display = "none";
      });
      return modal;
  }

  // ===== Open login modal =====
  const loginBtn = document.getElementById("logInBtn");
  if (loginBtn) {
      loginBtn.addEventListener("click", e => {
          e.preventDefault();
          fetch("/login_modal") // Flask route serving login.html
              .then(r => r.text())
              .then(html => {
                  const modal = injectModal(html, "loginModal");
                  if (modal) modal.style.display = "flex";
              })
              .catch(err => console.error("Failed to load login popup:", err));
      });
  }

  // ===== Open signup modal =====
  const signUpBtn = document.getElementById("signUpBtn");
  if (signUpBtn) {
      signUpBtn.addEventListener("click", e => {
          e.preventDefault();
          fetch("/signup_modal") // Flask route serving signup.html
              .then(r => r.text())
              .then(html => {
                  const modal = injectModal(html, "signupModal");
                  if (modal) modal.style.display = "flex";
              })
              .catch(err => console.error("Failed to load signup popup:", err));
      });
  }

  // ===== Delegate: "Create one" link inside LOGIN opens SIGNUP =====
  document.addEventListener("click", e => {
      if (e.target?.id === "openSignupLink") {
          e.preventDefault();
          const loginModal = document.getElementById("loginModal");
          if (loginModal) loginModal.style.display = "none";

          fetch("/signup_modal")
              .then(r => r.text())
              .then(html => {
                  const modal = injectModal(html, "signupModal");
                  if (modal) modal.style.display = "flex";
              })
              .catch(err => console.error("Failed to load signup popup:", err));
      }
  });

  // ===== Logout button =====
  const logOutBtn = document.getElementById("logOutBtn");
  if (logOutBtn) {
      logOutBtn.addEventListener("click", () => {
          window.location.href = "/logout";
      });
  }
});
