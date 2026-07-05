// ======================================
// DASHBOARD PAGE
// ======================================

// ===============================
// DASHBOARD MENU
// ===============================

document.querySelectorAll(".dash-nav li").forEach(item => {

    item.addEventListener("click", () => {

        document.querySelectorAll(".dash-nav li").forEach(nav => {
            nav.classList.remove("active");
        });

        item.classList.add("active");

    });

});

// ===============================
// CHART BUTTONS
// ===============================

document.querySelectorAll(".chart-head .opts button").forEach(btn => {

    btn.addEventListener("click", () => {

        btn.parentElement.querySelectorAll("button").forEach(b => {

            b.classList.remove("active");

        });

        btn.classList.add("active");

    });

});

// ===============================
// CHART BAR ANIMATION
// ===============================

window.addEventListener("load", () => {

    document.querySelectorAll(".chart-bar").forEach((bar,index)=>{

        const height=bar.dataset.height || bar.style.height;

        bar.style.height="0";

        setTimeout(()=>{

            bar.style.transition="height 1s ease";

            bar.style.height=height;

        },index*150);

    });

});

// ===============================
// COUNTER ANIMATION
// ===============================

document.querySelectorAll("[data-count]").forEach(counter=>{

    const target=Number(counter.dataset.count);

    let current=0;

    const speed=Math.ceil(target/80);

    const timer=setInterval(()=>{

        current+=speed;

        if(current>=target){

            current=target;

            clearInterval(timer);

        }

        counter.textContent=current;

    },20);

});

// ===============================
// PROGRESS RINGS
// ===============================

document.querySelectorAll(".progress-circle").forEach(circle=>{

    const value=circle.dataset.progress || 0;

    circle.style.setProperty("--progress",value+"%");

});

// ===============================
// DASHBOARD CARDS
// ===============================

document.querySelectorAll(".dash-card").forEach(card=>{

    card.addEventListener("mousemove",(e)=>{

        const rect=card.getBoundingClientRect();

        const x=e.clientX-rect.left;

        const y=e.clientY-rect.top;

        const rx=((y-rect.height/2)/(rect.height/2))*-5;

        const ry=((x-rect.width/2)/(rect.width/2))*5;

        card.style.transform=`
        perspective(1000px)
        rotateX(${rx}deg)
        rotateY(${ry}deg)
        translateY(-8px)
        `;

    });

    card.addEventListener("mouseleave",()=>{

        card.style.transform=`
        perspective(1000px)
        rotateX(0deg)
        rotateY(0deg)
        translateY(0px)
        `;

    });

});

// ===============================
// TOAST
// ===============================

function showToast(title,message){

    const toast=document.getElementById("toast");

    if(!toast) return;

    document.getElementById("toastTitle").textContent=title;

    document.getElementById("toastMsg").textContent=message;

    toast.classList.add("show");

    setTimeout(()=>{

        toast.classList.remove("show");

    },3000);

}

window.showToast=showToast;