 const canvas = document.getElementById('hero-canvas');
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x04030f, 8, 25);

  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0, 0, 12);

  // Lights
  const ambient = new THREE.AmbientLight(0x4a3a8c, 0.4);
  scene.add(ambient);
  const point1 = new THREE.PointLight(0x8b5cf6, 2, 30);
  point1.position.set(5, 5, 5);
  scene.add(point1);
  const point2 = new THREE.PointLight(0x22d3ee, 1.5, 30);
  point2.position.set(-5, -3, 4);
  scene.add(point2);
  const point3 = new THREE.PointLight(0xf472b6, 1, 25);
  point3.position.set(0, 4, -5);
  scene.add(point3);

  // Floating geometric shapes
  const shapes = [];
  const geometries = [
    new THREE.IcosahedronGeometry(1, 0),
    new THREE.OctahedronGeometry(0.9, 0),
    new THREE.DodecahedronGeometry(0.85, 0),
    new THREE.TetrahedronGeometry(1, 0),
    new THREE.TorusGeometry(0.7, 0.25, 16, 32),
    new THREE.TorusKnotGeometry(0.5, 0.18, 64, 8),
  ];

  const colors = [0x8b5cf6, 0x22d3ee, 0xf472b6, 0x34d399, 0xfbbf24];

  for (let i = 0; i < 14; i++) {
    const geo = geometries[i % geometries.length];
    const color = colors[i % colors.length];

    // Wireframe
    const wireMat = new THREE.MeshBasicMaterial({
      color: color, wireframe: true, transparent: true, opacity: 0.6
    });
    const wireMesh = new THREE.Mesh(geo, wireMat);

    // Solid transparent
    const solidMat = new THREE.MeshPhongMaterial({
      color: color, transparent: true, opacity: 0.12,
      flatShading: true, shininess: 80
    });
    const solidMesh = new THREE.Mesh(geo, solidMat);

    const group = new THREE.Group();
    group.add(wireMesh);
    group.add(solidMesh);

    // Position scattered around scene
    const radius = 6 + Math.random() * 6;
    const theta = Math.random() * Math.PI * 2;
    const phi = (Math.random() - 0.5) * Math.PI * 0.8;
    group.position.set(
      radius * Math.cos(theta) * Math.cos(phi),
      radius * Math.sin(phi) * 1.2,
      (Math.random() - 0.5) * 14 - 4
    );

    const scale = 0.4 + Math.random() * 0.8;
    group.scale.setScalar(scale);

    group.userData = {
      rotSpeed: {
        x: (Math.random() - 0.5) * 0.008,
        y: (Math.random() - 0.5) * 0.008,
        z: (Math.random() - 0.5) * 0.005
      },
      floatSpeed: 0.3 + Math.random() * 0.5,
      floatOffset: Math.random() * Math.PI * 2,
      origY: group.position.y
    };

    scene.add(group);
    shapes.push(group);
  }

  // Particle field
  const particleCount = 800;
  const particleGeo = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);
  const pColors = new Float32Array(particleCount * 3);
  const pSizes = new Float32Array(particleCount);

  for (let i = 0; i < particleCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 40;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 25;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 30;

    const c = new THREE.Color(colors[Math.floor(Math.random() * colors.length)]);
    pColors[i * 3] = c.r;
    pColors[i * 3 + 1] = c.g;
    pColors[i * 3 + 2] = c.b;
    pSizes[i] = Math.random() * 0.08 + 0.02;
  }

  particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  particleGeo.setAttribute('color', new THREE.BufferAttribute(pColors, 3));
  particleGeo.setAttribute('size', new THREE.BufferAttribute(pSizes, 1));

  const particleMat = new THREE.PointsMaterial({
    size: 0.08,
    vertexColors: true,
    transparent: true,
    opacity: 0.8,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });
  const particles = new THREE.Points(particleGeo, particleMat);
  scene.add(particles);

  // Mouse parallax
  const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
  window.addEventListener('mousemove', (e) => {
    mouse.tx = (e.clientX / window.innerWidth - 0.5) * 2;
    mouse.ty = (e.clientY / window.innerHeight - 0.5) * 2;
  });

  // Resize
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  // Animate
  const clock = new THREE.Clock();
  function animate() {
    requestAnimationFrame(animate);
    const t = clock.getElapsedTime();

    mouse.x += (mouse.tx - mouse.x) * 0.04;
    mouse.y += (mouse.ty - mouse.y) * 0.04;

    camera.position.x = mouse.x * 1.5;
    camera.position.y = -mouse.y * 1;
    camera.lookAt(0, 0, 0);

    shapes.forEach((s) => {
      s.rotation.x += s.userData.rotSpeed.x;
      s.rotation.y += s.userData.rotSpeed.y;
      s.rotation.z += s.userData.rotSpeed.z;
      s.position.y = s.userData.origY + Math.sin(t * s.userData.floatSpeed + s.userData.floatOffset) * 0.5;
    });

    particles.rotation.y = t * 0.03;
    particles.rotation.x = t * 0.015;

    renderer.render(scene, camera);
  }
  animate();



  // ========== LOADER ==========
  window.addEventListener('load', () => {
    setTimeout(() => document.getElementById('loader').classList.add('hidden'), 600);
  });

  // ========== NAV SCROLL ==========
  const nav = document.getElementById('nav');
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 50);
  });

  // ========== COUNTERS ==========
  function animateCounters() {
    document.querySelectorAll('[data-count]').forEach(el => {
      const target = parseInt(el.dataset.count);
      const dur = 2000;
      const start = performance.now();
      function tick(now) {
        const p = Math.min((now - start) / dur, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.floor(eased * target);
        if (p < 1) requestAnimationFrame(tick);
        else el.textContent = target + (target >= 100 ? '' : '');
      }
      requestAnimationFrame(tick);
    });
  }
  setTimeout(animateCounters, 1200);

  // ========== REVEAL ON SCROLL ==========
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        observer.unobserve(e.target);
      }
    });
  }, { threshold: 0.1 });
  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

  // ========== COURSE FILTERS ==========
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const f = btn.dataset.filter;
      document.querySelectorAll('.course-card').forEach(card => {
        const show = f === 'all' || card.dataset.cat === f;
        card.style.display = show ? 'block' : 'none';
        if (show) {
          card.style.opacity = '0';
          card.style.transform = 'translateY(20px)';
          setTimeout(() => {
            card.style.transition = 'all .5s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
          }, 50);
        }
      });
    });
  });

  // ========== 3D TILT ON CARDS ==========
  document.querySelectorAll('.feature-card, .course-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const r = card.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;
      const cx = r.width / 2;
      const cy = r.height / 2;
      const rx = ((y - cy) / cy) * -6;
      const ry = ((x - cx) / cx) * 6;
      card.style.transform = `perspective(1000px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-8px)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });

  // ========== CHATBOT ==========
  const chatBody = document.getElementById('chatBody');
  const chatInput = document.getElementById('chatInput');

  const aiResponses = [
    "Great question! Let me break that down for you step by step. The key concept here is understanding how the underlying mechanism works in practice.",
    "I'd be happy to explain! This topic builds on fundamental principles. Think of it like building blocks — each piece connects to form the complete picture.",
    "Excellent! Here's a detailed explanation: the concept involves three main components working together. Let me illustrate with a practical example you can try.",
    "Sure! This is one of the most important topics in the course. The answer involves understanding both theory and application. Let me walk you through it.",
    "Perfect timing — this connects directly to what you learned in the previous module. The core idea is that data flows through a pipeline of transformations."
  ];

  function appendMessage(text, sender) {
    const msg = document.createElement('div');
    msg.className = `msg ${sender}`;
    msg.innerHTML = `
      <div class="msg-av"><i class="fa-solid fa-${sender === 'bot' ? 'robot' : 'user'}"></i></div>
      <div class="msg-bubble">${text}</div>
    `;
    chatBody.appendChild(msg);
    chatBody.scrollTop = chatBody.scrollHeight;
  }

  function showTyping() {
    const t = document.createElement('div');
    t.className = 'msg bot';
    t.id = 'typingMsg';
    t.innerHTML = `
      <div class="msg-av"><i class="fa-solid fa-robot"></i></div>
      <div class="msg-bubble" style="padding:0"><div class="typing"><span></span><span></span><span></span></div></div>
    `;
    chatBody.appendChild(t);
    chatBody.scrollTop = chatBody.scrollHeight;
  }
  function hideTyping() {
    const t = document.getElementById('typingMsg');
    if (t) t.remove();
  }

  window.sendChat = function() {
    const text = chatInput.value.trim();
    if (!text) return;
    appendMessage(text, 'user');
    chatInput.value = '';
    showTyping();
    setTimeout(() => {
      hideTyping();
      const reply = aiResponses[Math.floor(Math.random() * aiResponses.length)];
      appendMessage(reply, 'bot');
    }, 1400);
  };

  chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendChat();
  });

  // ========== QUIZ ==========
  const questions = [
    {
      q: "Which Python data structure is unordered, mutable, and stores key-value pairs?",
      opts: ["List", "Dictionary", "Tuple", "String"],
      correct: 1,
      hint: "Dictionaries use curly braces {}"
    },
    {
      q: "What does the SQL 'JOIN' clause do?",
      opts: ["Combines rows from multiple tables", "Deletes duplicate records", "Sorts results", "Limits query results"],
      correct: 0,
      hint: "JOIN connects related data across tables"
    },
    {
      q: "In machine learning, what is 'overfitting'?",
      opts: ["Model performs well on new data", "Model memorizes training data too closely", "Model has too few parameters", "Model trains too quickly"],
      correct: 1,
      hint: "Overfitting = poor generalization"
    },
    {
      q: "Which HTML tag is used for the largest heading?",
      opts: ["<head>", "<h6>", "<h1>", "<heading>"],
      correct: 2,
      hint: "Headings range from h1 (largest) to h6 (smallest)"
    },
    {
      q: "What is the time complexity of binary search?",
      opts: ["O(n)", "O(n²)", "O(log n)", "O(1)"],
      correct: 2,
      hint: "Binary search halves the search space each step"
    },
    {
      q: "Which Flask decorator defines a route?",
      opts: ["@app.route", "@route", "@flask.path", "@url"],
      correct: 0,
      hint: "Flask uses app.route() to map URLs"
    },
    {
      q: "What does CSS 'transform: rotateY(45deg)' do?",
      opts: ["Rotates element around X-axis", "Rotates around Y-axis in 3D", "Skews the element", "Scales element by 45%"],
      correct: 1,
      hint: "Y-axis rotation creates a 3D flip effect"
    },
    {
      q: "Which MySQL command retrieves data from a table?",
      opts: ["FETCH", "GET", "SELECT", "RETRIEVE"],
      correct: 2,
      hint: "SELECT is the standard SQL query command"
    }
  ];

  let qIndex = 0;
  let qTimer = 45;
  let timerInterval;

  function loadQuestion() {
    const q = questions[qIndex % questions.length];
    document.getElementById('qText').textContent = q.q;
    document.getElementById('qNum').textContent = qIndex + 1;
    const optsContainer = document.getElementById('qOptions');
    optsContainer.innerHTML = '';
    const letters = ['A', 'B', 'C', 'D'];
    q.opts.forEach((opt, i) => {
      const btn = document.createElement('button');
      btn.className = 'quiz-opt';
      btn.onclick = () => checkAnswer(btn, i === q.correct);
      btn.innerHTML = `
        <span class="opt-letter">${letters[i]}</span>
        <span>${opt}</span>
        <i class="opt-icon fa-solid fa-${i === q.correct ? 'check' : 'xmark'}"></i>
      `;
      optsContainer.appendChild(btn);
    });
    const progress = ((qIndex + 1) / 10) * 100;
    document.getElementById('qProgress').style.width = Math.min(progress, 100) + '%';
    document.getElementById('qProgressTxt').textContent = Math.min(progress, 100).toFixed(0) + '% Complete';
    qTimer = 45;
    document.getElementById('qTimer').textContent = '00:45';
  }

  window.checkAnswer = function(btn, isCorrect) {
    document.querySelectorAll('.quiz-opt').forEach(o => o.classList.add('disabled'));
    btn.classList.add(isCorrect ? 'correct' : 'wrong');
    if (!isCorrect) {
      // Also highlight correct
      document.querySelectorAll('.quiz-opt').forEach(o => {
        const icon = o.querySelector('.opt-icon');
        if (icon.classList.contains('fa-check')) o.classList.add('correct');
      });
    }
    if (isCorrect) showToast('Correct!', 'Well done. Keep it up!');
    else showToast('Not quite', 'Review the explanation and try the next one.');
  };

  window.nextQuestion = function() {
    qIndex++;
    loadQuestion();
  };

  // Timer
  timerInterval = setInterval(() => {
    qTimer--;
    if (qTimer < 0) {
      qTimer = 45;
      nextQuestion();
    }
    const m = String(Math.floor(qTimer / 60)).padStart(2, '0');
    const s = String(qTimer % 60).padStart(2, '0');
    document.getElementById('qTimer').textContent = `${m}:${s}`;
  }, 1000);

  // ========== TOAST ==========
  function showToast(title, msg) {
    const t = document.getElementById('toast');
    document.getElementById('toastTitle').textContent = title;
    document.getElementById('toastMsg').textContent = msg;
    t.classList.add('show');
    clearTimeout(window._toastT);
    window._toastT = setTimeout(() => t.classList.remove('show'), 3500);
  }
  window.showToast = showToast;

  // ========== DASH NAV ==========
  document.querySelectorAll('.dash-nav li').forEach(li => {
    li.addEventListener('click', () => {
      document.querySelectorAll('.dash-nav li').forEach(l => l.classList.remove('active'));
      li.classList.add('active');
      showToast('Navigation', `Switched to: ${li.textContent.trim()}`);
    });
  });

  // ========== CHART OPTS ==========
  document.querySelectorAll('.chart-head .opts button').forEach(b => {
    b.addEventListener('click', () => {
      b.parentElement.querySelectorAll('button').forEach(x => x.classList.remove('active'));
      b.classList.add('active');
    });
  });

  // ========== ANIMATE CHART BARS ==========
  setTimeout(() => {
    document.querySelectorAll('.chart-bar').forEach((bar, i) => {
      const h = bar.style.height;
      bar.style.height = '0';
      setTimeout(() => {
        bar.style.transition = 'height 1s cubic-bezier(.4,0,.2,1)';
        bar.style.height = h;
      }, i * 100 + 300);
    });
  }, 500);

  loadQuestion();