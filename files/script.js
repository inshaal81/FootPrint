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
  


  //POP UP LOGIN
fetch("login.html")
  .then(response => response.text())
  .then(html => {
    document.getElementById("popupContainer").innerHTML = html;
    setupPopup(); // Initialize after loading
  })
  .catch(err => console.error("Failed to load login popup:", err));

function setupPopup() {
  const modal = document.getElementById("loginModal");
  const btn = document.getElementById("loginBtn");
  const closeBtn = document.querySelector(".close");

  if (!modal || !btn || !closeBtn) return;

  // Show popup when button clicked
  btn.onclick = () => (modal.style.display = "flex");

  // Close popup when X clicked
  closeBtn.onclick = () => (modal.style.display = "none");

  // Close popup when clicking outside
  window.onclick = (e) => {
    if (e.target === modal) modal.style.display = "none";
  };
}