// Navigation JS
const navItems = document.querySelectorAll("#nav-list li a");

navItems.forEach((link) => {
  link.addEventListener("click", (e) => {
    navItems.forEach((l) => l.classList.remove("current"));
    link.classList.add("current");
  });
});
// Smooth Scroll for Navigation Links
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute("href"));
    if (target) {
      target.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  });
});
