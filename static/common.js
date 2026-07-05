// ======================================
// COMMON JS
// Used on Every Page
// ======================================

// ===============================
// LOADER
// ===============================

window.addEventListener("load", () => {

    const loader = document.getElementById("loader");

    if (loader) {

        setTimeout(() => {

            loader.classList.add("hidden");

        }, 600);

    }

});

// ===============================
// NAVBAR SCROLL
// ===============================

const nav = document.getElementById("nav");

if (nav) {

    window.addEventListener("scroll", () => {

        if (window.scrollY > 50) {

            nav.classList.add("scrolled");

        } else {

            nav.classList.remove("scrolled");

        }

    });

}

// ===============================
// REVEAL ANIMATION
// ===============================

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
// SMOOTH SCROLL
// ===============================

document.querySelectorAll('a[href^="#"]').forEach(link => {

    link.addEventListener("click", function (e) {

        const href = this.getAttribute("href");

        // Ignore empty #
        if (href === "#") return;

        const target = document.querySelector(href);

        if (target) {

            e.preventDefault();

            target.scrollIntoView({
                behavior: "smooth"
            });

        }

    });

});
// ===============================
// BUTTON RIPPLE EFFECT
// ===============================

document.querySelectorAll(".btn").forEach(btn => {

    btn.addEventListener("click", function(e) {

        const circle = document.createElement("span");

        const diameter = Math.max(this.clientWidth, this.clientHeight);

        circle.style.width = circle.style.height = diameter + "px";

        circle.style.left = (e.offsetX - diameter / 2) + "px";

        circle.style.top = (e.offsetY - diameter / 2) + "px";

        circle.classList.add("ripple");

        const ripple = this.querySelector(".ripple");

        if (ripple) {

            ripple.remove();

        }

        this.appendChild(circle);

    });

});

// ===============================
// BACK TO TOP
// ===============================

const topBtn = document.getElementById("topBtn");

if (topBtn) {

    window.addEventListener("scroll", () => {

        if (window.scrollY > 300) {

            topBtn.classList.add("show");

        } else {

            topBtn.classList.remove("show");

        }

    });

    topBtn.addEventListener("click", () => {

        window.scrollTo({

            top: 0,

            behavior: "smooth"

        });

    });

}

console.log("Common.js Loaded Successfully");