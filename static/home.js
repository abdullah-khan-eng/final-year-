// ===============================
// HOME PAGE - PART 1
// Hero 3D Animation
// ===============================

const canvas = document.getElementById("hero-canvas");

if (canvas) {

const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true,
    antialias: true
});

renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));
renderer.setSize(window.innerWidth,window.innerHeight);

const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x04030f,8,25);

const camera = new THREE.PerspectiveCamera(
60,
window.innerWidth/window.innerHeight,
0.1,
100
);

camera.position.set(0,0,12);

// ================= LIGHTS =================

const ambient = new THREE.AmbientLight(0x4a3a8c,0.4);
scene.add(ambient);

const point1 = new THREE.PointLight(0x8b5cf6,2,30);
point1.position.set(5,5,5);
scene.add(point1);

const point2 = new THREE.PointLight(0x22d3ee,1.5,30);
point2.position.set(-5,-3,4);
scene.add(point2);

const point3 = new THREE.PointLight(0xf472b6,1,25);
point3.position.set(0,4,-5);
scene.add(point3);

// ================= SHAPES =================

const shapes=[];

const geometries=[
new THREE.IcosahedronGeometry(1,0),
new THREE.OctahedronGeometry(0.9,0),
new THREE.DodecahedronGeometry(0.85,0),
new THREE.TetrahedronGeometry(1,0),
new THREE.TorusGeometry(0.7,0.25,16,32),
new THREE.TorusKnotGeometry(0.5,0.18,64,8)
];

const colors=[
0x8b5cf6,
0x22d3ee,
0xf472b6,
0x34d399,
0xfbbf24
];

for(let i=0;i<14;i++){

const geo=geometries[i%geometries.length];
const color=colors[i%colors.length];

const wireMat=new THREE.MeshBasicMaterial({
color:color,
wireframe:true,
transparent:true,
opacity:0.6
});

const solidMat=new THREE.MeshPhongMaterial({
color:color,
transparent:true,
opacity:0.12,
flatShading:true,
shininess:80
});

const wireMesh=new THREE.Mesh(geo,wireMat);
const solidMesh=new THREE.Mesh(geo,solidMat);

const group=new THREE.Group();

group.add(wireMesh);
group.add(solidMesh);

const radius=6+Math.random()*6;
const theta=Math.random()*Math.PI*2;
const phi=(Math.random()-0.5)*Math.PI*0.8;

group.position.set(
radius*Math.cos(theta)*Math.cos(phi),
radius*Math.sin(phi)*1.2,
(Math.random()-0.5)*14-4
);

const scale=0.4+Math.random()*0.8;
group.scale.setScalar(scale);

group.userData={
rotSpeed:{
x:(Math.random()-0.5)*0.008,
y:(Math.random()-0.5)*0.008,
z:(Math.random()-0.5)*0.005
},
floatSpeed:0.3+Math.random()*0.5,
floatOffset:Math.random()*Math.PI*2,
origY:group.position.y
};

scene.add(group);
shapes.push(group);

// ================= PARTICLES =================

const particleCount = 800;

const particleGeo = new THREE.BufferGeometry();

const positions = new Float32Array(particleCount * 3);
const pColors = new Float32Array(particleCount * 3);

for (let i = 0; i < particleCount; i++) {

    positions[i * 3] = (Math.random() - 0.5) * 40;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 25;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 30;

    const c = new THREE.Color(
        colors[Math.floor(Math.random() * colors.length)]
    );

    pColors[i * 3] = c.r;
    pColors[i * 3 + 1] = c.g;
    pColors[i * 3 + 2] = c.b;

}

particleGeo.setAttribute(
    "position",
    new THREE.BufferAttribute(positions,3)
);

particleGeo.setAttribute(
    "color",
    new THREE.BufferAttribute(pColors,3)
);

const particleMat = new THREE.PointsMaterial({

    size:0.08,
    vertexColors:true,
    transparent:true,
    opacity:0.8,
    blending:THREE.AdditiveBlending,
    depthWrite:false

});

const particles = new THREE.Points(
    particleGeo,
    particleMat
);

scene.add(particles);

// ================= MOUSE =================

const mouse={
    x:0,
    y:0,
    tx:0,
    ty:0
};

window.addEventListener("mousemove",(e)=>{

mouse.tx=(e.clientX/window.innerWidth-0.5)*2;

mouse.ty=(e.clientY/window.innerHeight-0.5)*2;

});

// ================= RESIZE =================

window.addEventListener("resize",()=>{

camera.aspect=window.innerWidth/window.innerHeight;

camera.updateProjectionMatrix();

renderer.setSize(
window.innerWidth,
window.innerHeight
);

});

// ================= ANIMATION =================

const clock=new THREE.Clock();

function animate(){

requestAnimationFrame(animate);

const t=clock.getElapsedTime();

mouse.x+=(mouse.tx-mouse.x)*0.04;
mouse.y+=(mouse.ty-mouse.y)*0.04;

camera.position.x=mouse.x*1.5;
camera.position.y=-mouse.y;

camera.lookAt(0,0,0);

shapes.forEach((shape)=>{

shape.rotation.x+=shape.userData.rotSpeed.x;

shape.rotation.y+=shape.userData.rotSpeed.y;

shape.rotation.z+=shape.userData.rotSpeed.z;

shape.position.y=
shape.userData.origY+
Math.sin(
t*shape.userData.floatSpeed+
shape.userData.floatOffset
)*0.5;

});

particles.rotation.y=t*0.03;
particles.rotation.x=t*0.015;

renderer.render(scene,camera);

}

animate();

}

}
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

// const nav = document.getElementById("nav");

// if (nav) {

//     window.addEventListener("scroll", () => {

//         if (window.scrollY > 50) {

//             nav.classList.add("scrolled");

//         } else {

//             nav.classList.remove("scrolled");

//         }

//     });

// }

// ===============================
// COUNTER ANIMATION
// ===============================

function animateCounters() {

    document.querySelectorAll("[data-count]").forEach(counter => {

        const target = Number(counter.dataset.count);

        const duration = 2000;

        const startTime = performance.now();

        function update(currentTime) {

            const progress = Math.min((currentTime - startTime) / duration, 1);

            const value = Math.floor(progress * target);

            counter.textContent = value;

            if (progress < 1) {

                requestAnimationFrame(update);

            } else {

                counter.textContent = target;

            }

        }

        requestAnimationFrame(update);

    });

}

setTimeout(animateCounters, 1000);

// ===============================
// REVEAL ANIMATION
// ===============================

// const observer = new IntersectionObserver((entries) => {

//     entries.forEach(entry => {

//         if (entry.isIntersecting) {

//             entry.target.classList.add("in");

//             observer.unobserve(entry.target);

//         }

//     });

// }, {

//     threshold: 0.15

// });

// document.querySelectorAll(".reveal").forEach(item => {

//     observer.observe(item);

// });