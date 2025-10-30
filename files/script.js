//Scroll up button
const scrollUpBtn = document.getElementById("scrollUpBtn");


window.addEventListener("scroll", () => {
  if (window.scrollY > 300) {
    scrollUpBtn.style.display = "block";
  } else {
    scrollUpBtn.style.display = "none";
  }
});

scrollUpBtn.addEventListener("click", () => {
  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
});

//Swithching light/dark mode
const toggle = document.getElementById("themeToggle");
toggle.addEventListener("click", () => {
  document.body.classList.toggle("dark");
});

//smooth scorll 
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener("click", (e) => {
      e.preventDefault();
      document.querySelector(anchor.getAttribute("href")).scrollIntoView({
        behavior: "smooth"
      });
    });
  });
  


  // POP UP LOGIN
  const popupContainer = document.getElementById("popupContainer");

  if (popupContainer) {
    fetch("login.html")
      .then(response => response.text())
      .then(html => {
        // inject the login modal html and wire up its close behavior
        injectAndSetup(html);
        setupPopup(); // Initialize click handler for Log In button
      })
      .catch(err => console.error("Failed to load login popup:", err));
  } else {
    console.warn("popupContainer not found in DOM; login popup won't be injected.");
  }

  // Helper: inject modal HTML into popupContainer and wire close behavior
  function injectAndSetup(html) {
    popupContainer.innerHTML = html;
    const modal = popupContainer.querySelector('.modal') || popupContainer.querySelector('#loginModal');
    const closeBtn = modal ? modal.querySelector('.close') : null;
    if (!modal || !closeBtn) return null;

    // Close popup when X clicked
    closeBtn.addEventListener('click', () => {
      modal.style.display = 'none';
    });

    // Close popup when clicking outside the modal content
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.style.display = 'none';
    });

    return modal;
  }

  // Initialize Log In button behavior (shows the modal that was injected)
  function setupPopup() {
    const modal = popupContainer.querySelector('#loginModal') || popupContainer.querySelector('.modal');
    const btn = document.getElementById('logInBtn');
    if (!btn) return; // nothing to wire

    btn.addEventListener('click', (e) => {
      e.preventDefault();
      // modal should already be injected on load; show it if present
      if (modal) modal.style.display = 'flex';
    });
  }

  // Sign Up button: fetch signup.html, inject modal, and show it
  const signUpBtn = document.getElementById('signUpBtn');
  if (signUpBtn && popupContainer) {
    signUpBtn.addEventListener('click', (e) => {
      e.preventDefault();
      fetch('signup.html')
        .then(res => res.text())
        .then(html => {
          const modal = injectAndSetup(html);
          if (modal) modal.style.display = 'flex';
        })
        .catch(err => console.error('Failed to load signup popup:', err));
    });
  }