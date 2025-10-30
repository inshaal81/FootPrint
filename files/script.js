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
// welcome alert
window.addEventListener("load", () => {
    alert("Welcome to our website! FOOTPRINT!  😊 ");
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
        popupContainer.innerHTML = html;
        setupPopup(); // Initialize after loading
      })
      .catch(err => console.error("Failed to load login popup:", err));
  } else {
    console.warn("popupContainer not found in DOM; login popup won't be injected.");
  }

  function setupPopup() {
    const modal = document.getElementById("loginModal");
    // use the existing button id from index.html
    const btn = document.getElementById("logInBtn");
    const closeBtn = modal ? modal.querySelector(".close") : null;

    if (!modal || !btn || !closeBtn) return;

    // Show popup when button clicked
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      modal.style.display = "flex";
    });

    // Close popup when X clicked
    closeBtn.addEventListener("click", () => {
      modal.style.display = "none";
    });

    // Close popup when clicking outside the modal content
    modal.addEventListener("click", (e) => {
      if (e.target === modal) modal.style.display = "none";
    });
  }