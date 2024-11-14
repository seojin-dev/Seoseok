document.addEventListener("DOMContentLoaded", () => {
  // 스크롤 애니메이션
  const observerOptions = {
    threshold: 0.1,
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // 애니메이션이 필요한 요소들 관찰
  document
    .querySelectorAll(
      ".animate-fade-in, .animate-slide-up, .animate-fade-in-delay"
    )
    .forEach((el) => {
      observer.observe(el);
    });

  // 스크롤 부드럽게 처리
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault();
      document.querySelector(this.getAttribute("href")).scrollIntoView({
        behavior: "smooth",
      });
    });
  });
});
