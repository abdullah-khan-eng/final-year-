// =====================================
// REGISTER PAGE JAVASCRIPT
// =====================================

// Password Fields
const password = document.getElementById("password");
const confirmPassword = document.getElementById("confirm");

const eyeButtons = document.querySelectorAll(".eye-btn");

const strengthBar = document.getElementById("strengthBar");

const form = document.querySelector(".register-form");


// =====================================
// SHOW / HIDE PASSWORD
// =====================================

eyeButtons.forEach((btn) => {

    btn.addEventListener("click", () => {

        const input = btn.parentElement.querySelector("input");

        const icon = btn.querySelector("i");

        if (input.type === "password") {

            input.type = "text";

            icon.classList.remove("fa-eye");
            icon.classList.add("fa-eye-slash");

        } else {

            input.type = "password";

            icon.classList.remove("fa-eye-slash");
            icon.classList.add("fa-eye");

        }

    });

});


// =====================================
// PASSWORD STRENGTH
// =====================================

password.addEventListener("keyup", () => {

    const value = password.value;

    let strength = 0;

    if (value.length >= 8) strength++;

    if (/[A-Z]/.test(value)) strength++;

    if (/[a-z]/.test(value)) strength++;

    if (/[0-9]/.test(value)) strength++;

    if (/[^A-Za-z0-9]/.test(value)) strength++;

    switch (strength) {

        case 0:
        case 1:
            strengthBar.style.width = "20%";
            strengthBar.style.background = "#ef4444";
            break;

        case 2:
            strengthBar.style.width = "40%";
            strengthBar.style.background = "#f59e0b";
            break;

        case 3:
            strengthBar.style.width = "60%";
            strengthBar.style.background = "#eab308";
            break;

        case 4:
            strengthBar.style.width = "80%";
            strengthBar.style.background = "#22c55e";
            break;

        case 5:
            strengthBar.style.width = "100%";
            strengthBar.style.background = "#10b981";
            break;

    }

});


// =====================================
// PASSWORD MATCH
// =====================================

confirmPassword.addEventListener("keyup", () => {

    if (confirmPassword.value === "") {

        confirmPassword.style.borderColor = "";

        return;

    }

    if (password.value === confirmPassword.value) {

        confirmPassword.style.borderColor = "#22c55e";

    } else {

        confirmPassword.style.borderColor = "#ef4444";

    }

});


// =====================================
// FORM VALIDATION
// =====================================

form.addEventListener("submit", function (e) {

    if (password.value.length < 8) {

        e.preventDefault();

        alert("Password must be at least 8 characters.");

        return;

    }

    if (password.value !== confirmPassword.value) {

        e.preventDefault();

        alert("Passwords do not match.");

        return;

    }

});


// =====================================
// INPUT ANIMATION
// =====================================

document.querySelectorAll("input, select").forEach((input) => {

    input.addEventListener("focus", () => {

        input.parentElement.classList.add("active");

    });

    input.addEventListener("blur", () => {

        input.parentElement.classList.remove("active");

    });

});