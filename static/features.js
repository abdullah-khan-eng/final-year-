// ===============================
// FEATURES PAGE
// ===============================

// Reveal Animation
const observer = new IntersectionObserver((entries) => {

    entries.forEach(entry => {

        if (entry.isIntersecting) {

            entry.target.classList.add("in");

            observer.unobserve(entry.target);

        }

    });

}, {
    threshold: 0.15
});

document.querySelectorAll(".reveal").forEach(item => {
    observer.observe(item);
});


// ===============================
// 3D CARD TILT EFFECT
// ===============================

document.querySelectorAll(".feature-card").forEach(card => {

    card.addEventListener("mousemove", (e) => {

        const rect = card.getBoundingClientRect();

        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = ((y - centerY) / centerY) * -6;
        const rotateY = ((x - centerX) / centerX) * 6;

        card.style.transform =
            `perspective(1000px)
             rotateX(${rotateX}deg)
             rotateY(${rotateY}deg)
             translateY(-8px)`;

    });

    card.addEventListener("mouseleave", () => {

        card.style.transform =
            "perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)";

    });

});


// ===============================
// FEATURE CARD HOVER GLOW
// ===============================

document.querySelectorAll(".feature-card").forEach(card => {

    card.addEventListener("mouseenter", () => {

        card.style.transition = "0.4s";

        card.style.boxShadow =
            "0 20px 45px rgba(139,92,246,.35)";

    });

    card.addEventListener("mouseleave", () => {

        card.style.boxShadow = "";

    });

});