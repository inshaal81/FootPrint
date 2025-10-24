// Form validation
const form = document.getElementById("contactForm");

form.addEventListener("submit", (e) => {
  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  if (name === "" || email === "") {
    e.preventDefault();
    alert("Please fill out all fields before submitting.");
  } else {
    alert("Form submitted successfully!");
  }
});


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
  