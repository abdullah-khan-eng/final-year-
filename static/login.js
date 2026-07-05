// Show / Hide Password

const eye = document.querySelector(".eye-btn");

const password = document.getElementById("password");

if (eye) {

    eye.addEventListener("click", () => {

        const icon = eye.querySelector("i");

        if (password.type === "password") {

            password.type = "text";

            icon.classList.remove("fa-eye");
            icon.classList.add("fa-eye-slash");

        } else {

            password.type = "password";

            icon.classList.remove("fa-eye-slash");
            icon.classList.add("fa-eye");

        }

    });

}