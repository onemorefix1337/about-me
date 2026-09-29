/**
 * OneMoreFix (onemorefix1337) - 3D Cyber-Schematic Portfolio Engine
 * Minimalist Black & White / 3D Constellation Architecture
 * Full Mobile & Touch Optimization
 */

class SchematicPortfolio {
  constructor() {
    this.container = document.getElementById('webgl-canvas');
    this.labelsContainer = document.getElementById('labels-container');
    this.radarCanvas = document.getElementById('radar-canvas');
    this.radarCtx = this.radarCanvas ? this.radarCanvas.getContext('2d') : null;

    // Core Three.js components
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.controls = null;
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();

    // Node objects & animations
    this.nodeMeshes = [];
    this.nodeObjects = {};
    this.nodeLabels = {};
    this.connectionLines = [];
    this.dataPackets = [];
    this.activeNodeId = null;

    // Camera animation state
    this.isTransitioning = false;
    this.camStartPos = new THREE.Vector3();
    this.camTargetPos = new THREE.Vector3();
    this.targetLookAtStart = new THREE.Vector3();
    this.targetLookAtEnd = new THREE.Vector3();
    this.transitionProgress = 0;
    this.transitionDuration = 1100; // ms
    this.transitionStartTime = 0;

    // Overview Camera (Dynamic based on aspect ratio)
    this.overviewPos = this.calculateOverviewPos();
    this.overviewTarget = new THREE.Vector3(0, 0, 0);

    // Radar state
    this.radarAngle = 0;

    // Performance & Telemetry
    this.lastFrameTime = performance.now();
    this.fps = 60;
    this.frameCount = 0;
    this.fpsTimer = performance.now();

    this.init();
  }

  calculateOverviewPos() {
    const aspect = window.innerWidth / (window.innerHeight || 1);
    if (aspect < 1.0) {
      // Portrait / Phone orientation: pull camera further back and up so all nodes fit
      const factor = Math.max(1.15, (1.0 / aspect) * 0.75);
      return new THREE.Vector3(0, 52 * factor, 115 * factor);
    }
    return new THREE.Vector3(0, 52, 105);
  }

  init() {
    this.setupThreeScene();
    this.setupEnvironment();
    this.buildNodes();
    this.buildConnections();
    this.buildDataPackets();
    this.setupLabels();
    this.setupEventListeners();
    this.setupUI();
    this.animate();

    // On desktop start focused on Core, on mobile start with overview so full galaxy is seen!
    const isMobile = window.innerWidth <= 768;
    setTimeout(() => {
      if (isMobile) {
        this.resetView();
      } else {
        this.selectNode('core', false);
      }
    }, 350);
  }

  setupThreeScene() {
    // Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x030304);
    this.scene.fog = new THREE.FogExp2(0x030304, 0.0035);

    // Camera
    const aspect = window.innerWidth / window.innerHeight;
    this.camera = new THREE.PerspectiveCamera(52, aspect, 0.1, 2200);
    this.camera.position.copy(this.overviewPos);

    // Renderer
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.container,
      antialias: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    // Clamp DPR to 2.0 to save mobile GPU/battery while staying razor sharp
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2.0));

    // Orbit Controls
    this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.07;
    this.controls.maxDistance = 280;
    this.controls.minDistance = 12;
    this.controls.maxPolarAngle = Math.PI / 2 + 0.12;
    this.controls.target.copy(this.overviewTarget);

    // Touch controls config
    this.controls.touches = {
      ONE: THREE.TOUCH.ROTATE,
      TWO: THREE.TOUCH.DOLLY_PAN
    };
  }

  setupEnvironment() {
    // 1. Blueprint Grid on Floor
    const gridHelper = new THREE.GridHelper(280, 56, 0x444450, 0x121218);
    gridHelper.position.y = -35;
    this.scene.add(gridHelper);

    // 2. Concentric Radar Rings on Floor
    const ringsGroup = new THREE.Group();
    const ringRadii = [35, 70, 105, 140];
    ringRadii.forEach(r => {
      const ringGeo = new THREE.RingGeometry(r - 0.15, r, 64);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0x22222a,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.7
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.rotation.x = Math.PI / 2;
      ringMesh.position.y = -34.9;
      ringsGroup.add(ringMesh);
    });
    this.scene.add(ringsGroup);

    // 3. Constellation Star Field / Dust
    const starsCount = 1800;
    const starGeo = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starsCount * 3);

    for (let i = 0; i < starsCount * 3; i += 3) {
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = 180 + Math.random() * 450;
      starPositions[i] = r * Math.sin(phi) * Math.cos(theta);
      starPositions[i + 1] = r * Math.sin(phi) * Math.sin(theta);
      starPositions[i + 2] = r * Math.cos(phi);
    }

    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const starMat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 1.2,
      transparent: true,
      opacity: 0.65
    });
    this.stars = new THREE.Points(starGeo, starMat);
    this.scene.add(this.stars);
  }

  buildNodes() {
    const isMobile = window.innerWidth <= 768;

    SCHEMATIC_DATA.nodes.forEach(node => {
      const group = new THREE.Group();
      group.position.set(node.coords.x, node.coords.y, node.coords.z);
      group.userData = { id: node.id, rawData: node };

      let coreMesh = null;
      let wireMesh = null;
      let rings = [];

      // Geometry based on node specification
      if (node.geometry === 'icosahedron') {
        const wireGeo = new THREE.IcosahedronGeometry(5.2, 1);
        const wireMat = new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true, transparent: true, opacity: 0.9 });
        wireMesh = new THREE.Mesh(wireGeo, wireMat);

        const innerGeo = new THREE.IcosahedronGeometry(2.6, 0);
        const innerMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
        coreMesh = new THREE.Mesh(innerGeo, innerMat);

        [6.8, 8.2].forEach((radius, idx) => {
          const ringGeo = new THREE.TorusGeometry(radius, 0.08, 8, 48);
          const ringMat = new THREE.MeshBasicMaterial({ color: 0x888892, transparent: true, opacity: 0.6 });
          const ring = new THREE.Mesh(ringGeo, ringMat);
          ring.rotation.x = idx * (Math.PI / 3);
          ring.rotation.y = idx * (Math.PI / 4);
          group.add(ring);
          rings.push(ring);
        });

      } else if (node.geometry === 'octahedron') {
        const wireGeo = new THREE.OctahedronGeometry(4.4, 0);
        const wireMat = new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true, transparent: true, opacity: 0.9 });
        wireMesh = new THREE.Mesh(wireGeo, wireMat);

        const innerGeo = new THREE.OctahedronGeometry(2.0, 0);
        const innerMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
        coreMesh = new THREE.Mesh(innerGeo, innerMat);

        const ringGeo = new THREE.TorusGeometry(5.8, 0.07, 6, 36);
        const ringMat = new THREE.MeshBasicMaterial({ color: 0x777780 });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.rotation.x = Math.PI / 2;
        group.add(ring);
        rings.push(ring);

      } else if (node.geometry === 'box') {
        const wireGeo = new THREE.BoxGeometry(5.2, 5.2, 5.2);
        const wireMat = new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true, transparent: true, opacity: 0.9 });
        wireMesh = new THREE.Mesh(wireGeo, wireMat);

        const innerGeo = new THREE.BoxGeometry(2.2, 2.2, 2.2);
        const innerMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
        coreMesh = new THREE.Mesh(innerGeo, innerMat);

      } else if (node.geometry === 'dodecahedron') {
        const wireGeo = new THREE.DodecahedronGeometry(4.2, 0);
        const wireMat = new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true, transparent: true, opacity: 0.9 });
        wireMesh = new THREE.Mesh(wireGeo, wireMat);

        const innerGeo = new THREE.DodecahedronGeometry(2.0, 0);
        const innerMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
        coreMesh = new THREE.Mesh(innerGeo, innerMat);

      } else if (node.geometry === 'torus') {
        const wireGeo = new THREE.TorusGeometry(4.0, 1.2, 10, 24);
        const wireMat = new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true, transparent: true, opacity: 0.85 });
        wireMesh = new THREE.Mesh(wireGeo, wireMat);

        const innerGeo = new THREE.OctahedronGeometry(1.8, 0);
        const innerMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
        coreMesh = new THREE.Mesh(innerGeo, innerMat);

      } else {
        const wireGeo = new THREE.ConeGeometry(3.6, 7.0, 4);
        const wireMat = new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true, transparent: true, opacity: 0.9 });
        wireMesh = new THREE.Mesh(wireGeo, wireMat);

        const innerGeo = new THREE.SphereGeometry(1.4, 8, 8);
        const innerMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
        coreMesh = new THREE.Mesh(innerGeo, innerMat);
      }

      if (wireMesh) group.add(wireMesh);
      if (coreMesh) group.add(coreMesh);

      // Hit sphere for click/raycasting (larger on mobile for easy finger taps)
      const hitRadius = isMobile ? 9.5 : 7.0;
      const hitGeo = new THREE.SphereGeometry(hitRadius, 8, 8);
      const hitMat = new THREE.MeshBasicMaterial({ visible: false });
      const hitSphere = new THREE.Mesh(hitGeo, hitMat);
      hitSphere.userData = { id: node.id };
      group.add(hitSphere);

      // Vertical Floor Anchor Line
      const lineDist = node.coords.y - (-35);
      const anchorPoints = [
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0, -lineDist, 0)
      ];
      const anchorGeo = new THREE.BufferGeometry().setFromPoints(anchorPoints);
      const anchorMat = new THREE.LineDashedMaterial({
        color: 0x33333e,
        dashSize: 1.5,
        gapSize: 1.5,
        transparent: true,
        opacity: 0.6
      });
      const anchorLine = new THREE.Line(anchorGeo, anchorMat);
      anchorLine.computeLineDistances();
      group.add(anchorLine);

      // Ground Crosshair
      const crosshairGroup = new THREE.Group();
      crosshairGroup.position.set(0, -lineDist, 0);
      const crossMat = new THREE.LineBasicMaterial({ color: 0x33333e });
      const crossPtsX = [new THREE.Vector3(-2.5, 0, 0), new THREE.Vector3(2.5, 0, 0)];
      const crossPtsZ = [new THREE.Vector3(0, 0, -2.5), new THREE.Vector3(0, 0, 2.5)];
      crosshairGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(crossPtsX), crossMat));
      crosshairGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(crossPtsZ), crossMat));
      group.add(crosshairGroup);

      this.scene.add(group);

      this.nodeObjects[node.id] = {
        group: group,
        wireMesh: wireMesh,
        coreMesh: coreMesh,
        rings: rings,
        data: node
      };
      this.nodeMeshes.push(hitSphere);
    });
  }

  buildConnections() {
    SCHEMATIC_DATA.connections.forEach(conn => {
      const fromNode = SCHEMATIC_DATA.nodes.find(n => n.id === conn.from);
      const toNode = SCHEMATIC_DATA.nodes.find(n => n.id === conn.to);
      if (!fromNode || !toNode) return;

      const p1 = new THREE.Vector3(fromNode.coords.x, fromNode.coords.y, fromNode.coords.z);
      const p2 = new THREE.Vector3(toNode.coords.x, toNode.coords.y, toNode.coords.z);

      const points = [p1, p2];
      const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
      const lineMat = new THREE.LineBasicMaterial({
        color: 0x2e2e38,
        transparent: true,
        opacity: 0.7
      });
      const line = new THREE.Line(lineGeo, lineMat);
      this.scene.add(line);
      this.connectionLines.push({ line, p1, p2 });
    });
  }

  buildDataPackets() {
    const packetGeo = new THREE.SphereGeometry(0.4, 8, 8);
    const packetMat = new THREE.MeshBasicMaterial({ color: 0xffffff });

    this.connectionLines.forEach((conn, index) => {
      const packetMesh = new THREE.Mesh(packetGeo, packetMat);
      this.scene.add(packetMesh);
      this.dataPackets.push({
        mesh: packetMesh,
        p1: conn.p1,
        p2: conn.p2,
        progress: (index * 0.17) % 1.0,
        speed: 0.003 + Math.random() * 0.003
      });
    });
  }

  setupLabels() {
    SCHEMATIC_DATA.nodes.forEach(node => {
      const label = document.createElement('div');
      label.className = 'node-3d-label';
      label.dataset.id = node.id;
      label.innerHTML = `
        <span class="label-code">[${node.code}]</span>
        <span class="label-title">${node.title.toUpperCase()}</span>
      `;

      label.addEventListener('click', (e) => {
        e.stopPropagation();
        this.selectNode(node.id);
      });

      label.addEventListener('mouseenter', () => {
        window.soundEngine.playHover();
      });

      this.labelsContainer.appendChild(label);
      this.nodeLabels[node.id] = {
        element: label,
        coords: new THREE.Vector3(node.coords.x, node.coords.y + 6.5, node.coords.z)
      };
    });
  }

  setupUI() {
    // 1. Navigation Dock buttons
    const dockContainer = document.getElementById('nav-dock');
    SCHEMATIC_DATA.nodes.forEach(node => {
      const btn = document.createElement('button');
      btn.className = 'dock-btn';
      btn.dataset.id = node.id;
      btn.innerHTML = `<span class="btn-code">${node.code}</span> ${node.title}`;
      btn.addEventListener('click', () => {
        this.selectNode(node.id);
      });
      btn.addEventListener('mouseenter', () => {
        window.soundEngine.playHover();
      });
      dockContainer.appendChild(btn);
    });

    // 2. Drawer Close
    const closeBtn = document.getElementById('drawer-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        this.closeDrawer();
      });
    }

    // 3. Mobile Pull Handle (Swipe down to close)
    const dragHandle = document.getElementById('drawer-drag-handle');
    if (dragHandle) {
      let touchStartY = 0;
      let touchDiffY = 0;

      dragHandle.addEventListener('touchstart', (e) => {
        touchStartY = e.touches[0].clientY;
        touchDiffY = 0;
      }, { passive: true });

      dragHandle.addEventListener('touchmove', (e) => {
        touchDiffY = e.touches[0].clientY - touchStartY;
      }, { passive: true });

      dragHandle.addEventListener('touchend', () => {
        if (touchDiffY > 40) {
          this.closeDrawer();
        }
        touchStartY = 0;
        touchDiffY = 0;
      });

      dragHandle.addEventListener('click', () => {
        this.closeDrawer();
      });
    }

    // 4. Overview / Recenter
    const recenterBtn = document.getElementById('btn-recenter');
    if (recenterBtn) {
      recenterBtn.addEventListener('click', () => {
        this.resetView();
      });
    }

    // 5. Sound Toggle
    const soundBtn = document.getElementById('btn-sound');
    if (soundBtn) {
      soundBtn.addEventListener('click', () => {
        const enabled = window.soundEngine.toggle();
        const fullSpan = soundBtn.querySelector('.btn-text-full');
        const mobSpan = soundBtn.querySelector('.btn-text-mobile');
        if (fullSpan) fullSpan.textContent = enabled ? `[ SOUND: ON ]` : `[ SOUND: OFF ]`;
        if (mobSpan) mobSpan.textContent = enabled ? `♫ ON` : `♫ OFF`;
        soundBtn.classList.toggle('active', enabled);
      });
    }

    // 6. Font Toggle (Ubuntu <-> Comic Sans)
    const fontBtn = document.getElementById('btn-font');
    if (fontBtn) {
      fontBtn.addEventListener('click', () => {
        const isComic = document.body.classList.toggle('font-comic');
        const fullSpan = fontBtn.querySelector('.btn-text-full');
        const mobSpan = fontBtn.querySelector('.btn-text-mobile');
        if (fullSpan) fullSpan.textContent = isComic ? `[ FONT: COMIC SANS 1337 ]` : `[ FONT: UBUNTU ]`;
        if (mobSpan) mobSpan.textContent = isComic ? `Comic` : `Aa`;
        fontBtn.classList.toggle('active', isComic);
        window.soundEngine.playSelect();
      });
    }
  }

  setupEventListeners() {
    window.addEventListener('resize', () => this.onWindowResize());

    // Click / Touch on canvas with proper mobile tap tolerance
    this.container.addEventListener('pointerdown', (e) => {
      this.pointerDownX = e.clientX;
      this.pointerDownY = e.clientY;
    });

    this.container.addEventListener('pointerup', (e) => {
      const diffX = Math.abs(e.clientX - this.pointerDownX);
      const diffY = Math.abs(e.clientY - this.pointerDownY);
      const threshold = (e.pointerType === 'touch') ? 18 : 6;
      if (diffX < threshold && diffY < threshold) {
        this.onCanvasClick(e);
      }
    });

    // Keyboard Shortcuts
    window.addEventListener('keydown', (e) => {
      if (e.key >= '0' && e.key <= '5') {
        const idx = parseInt(e.key, 10);
        if (SCHEMATIC_DATA.nodes[idx]) {
          this.selectNode(SCHEMATIC_DATA.nodes[idx].id);
        }
      } else if (e.key === ' ' || e.key === 'Home') {
        e.preventDefault();
        this.resetView();
      } else if (e.key === 'Escape') {
        this.closeDrawer();
      }
    });
  }

  onCanvasClick(e) {
    const rect = this.container.getBoundingClientRect();
    this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.nodeMeshes);

    if (intersects.length > 0) {
      const hitNodeId = intersects[0].object.userData.id;
      if (hitNodeId) {
        this.selectNode(hitNodeId);
      }
    }
  }

  selectNode(nodeId, playSound = true) {
    if (this.activeNodeId === nodeId && !this.isTransitioning) {
      return;
    }

    const node = SCHEMATIC_DATA.nodes.find(n => n.id === nodeId);
    if (!node) return;

    this.activeNodeId = nodeId;

    if (playSound) {
      window.soundEngine.playWarp();
      window.soundEngine.playSelect();
    }

    // Update active styles on dock
    document.querySelectorAll('.dock-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.id === nodeId);
    });

    // Scroll active dock button into view smoothly on mobile
    const activeBtn = document.querySelector(`.dock-btn[data-id="${nodeId}"]`);
    if (activeBtn && activeBtn.scrollIntoView) {
      activeBtn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }

    // Update active styles on labels
    Object.keys(this.nodeLabels).forEach(id => {
      this.nodeLabels[id].element.classList.toggle('active', id === nodeId);
    });

    // Calculate camera target
    const isMobile = window.innerWidth <= 768;
    const targetNodePos = new THREE.Vector3(node.coords.x, node.coords.y, node.coords.z);
    
    // Direction vector from origin to node
    const offsetDir = new THREE.Vector3().subVectors(targetNodePos, new THREE.Vector3(0, 0, 0)).normalize();
    if (offsetDir.lengthSq() < 0.001) {
      offsetDir.set(0, 0.4, 1).normalize();
    }

    // On mobile portrait, pull back further and raise lookAt slightly so node is in upper half above bottom sheet
    const distance = isMobile ? 38.0 : 24.0;
    const destCamPos = new THREE.Vector3()
      .copy(targetNodePos)
      .add(new THREE.Vector3(
        offsetDir.x * distance * (isMobile ? 0.4 : 0.7),
        isMobile ? 12.0 : 9.0,
        Math.max(offsetDir.z * distance, isMobile ? 26.0 : 18.0)
      ));

    const lookTarget = new THREE.Vector3().copy(targetNodePos);
    if (isMobile) {
      lookTarget.y -= 4.0; // shifts node into top viewport area
    }

    this.startCameraTransition(destCamPos, lookTarget);
    this.openDrawer(node);
  }

  resetView() {
    this.activeNodeId = null;
    window.soundEngine.playWarp();

    document.querySelectorAll('.dock-btn').forEach(btn => btn.classList.remove('active'));
    Object.keys(this.nodeLabels).forEach(id => this.nodeLabels[id].element.classList.remove('active'));

    this.overviewPos = this.calculateOverviewPos();
    this.startCameraTransition(this.overviewPos, this.overviewTarget);
    this.closeDrawer();
  }

  startCameraTransition(targetCamPos, targetLookAt) {
    this.isTransitioning = true;
    this.camStartPos.copy(this.camera.position);
    this.camTargetPos.copy(targetCamPos);
    this.targetLookAtStart.copy(this.controls.target);
    this.targetLookAtEnd.copy(targetLookAt);
    this.transitionStartTime = performance.now();
  }

  openDrawer(node) {
    const drawer = document.getElementById('inspector-drawer');
    if (!drawer) return;

    // Header metadata
    document.getElementById('drawer-code').textContent = `[NODE ${node.code}]`;
    document.getElementById('drawer-status').textContent = node.status;
    document.getElementById('drawer-badge').textContent = node.badge;
    document.getElementById('drawer-category').textContent = node.category;
    document.getElementById('drawer-subtitle').textContent = node.subtitle;

    // Glitch / decrypt title animation
    this.decryptText(document.getElementById('drawer-title'), node.title);

    // Summary
    document.getElementById('drawer-summary').textContent = node.summary;

    // Feature list
    const featuresContainer = document.getElementById('drawer-features');
    featuresContainer.innerHTML = '';
    node.details.forEach(item => {
      const li = document.createElement('li');
      li.textContent = item;
      featuresContainer.appendChild(li);
    });

    // Tech stack
    const techContainer = document.getElementById('drawer-tech');
    techContainer.innerHTML = '';
    node.tech.forEach(t => {
      const pill = document.createElement('span');
      pill.className = 'tech-pill';
      pill.textContent = t;
      techContainer.appendChild(pill);
    });

    // Special stats container (for core profile)
    const statsSection = document.getElementById('drawer-stats-section');
    const statsContainer = document.getElementById('drawer-stats');
    if (node.id === 'core' && SCHEMATIC_DATA.profile.stats) {
      statsSection.style.display = 'block';
      statsContainer.innerHTML = '';
      SCHEMATIC_DATA.profile.stats.forEach(s => {
        const card = document.createElement('div');
        card.className = 'stat-card';
        card.innerHTML = `
          <div class="stat-value">${s.value}</div>
          <div class="stat-label">${s.label}</div>
        `;
        statsContainer.appendChild(card);
      });
    } else {
      statsSection.style.display = 'none';
    }

    // Action Links
    const linksContainer = document.getElementById('drawer-links');
    linksContainer.innerHTML = '';
    node.links.forEach(link => {
      const a = document.createElement('a');
      a.className = `action-link ${link.primary ? 'primary' : 'secondary'}`;
      a.href = link.url;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.innerHTML = `<span>${link.label}</span> <span>↗</span>`;
      a.addEventListener('mouseenter', () => window.soundEngine.playHover());
      linksContainer.appendChild(a);
    });

    drawer.classList.add('open');
    document.body.classList.add('drawer-open');
  }

  closeDrawer() {
    const drawer = document.getElementById('inspector-drawer');
    if (drawer) {
      drawer.classList.remove('open');
    }
    document.body.classList.remove('drawer-open');
  }

  decryptText(element, targetText) {
    const chars = '0123456789ABCDEF_//-[]<>';
    let iteration = 0;
    const maxIterations = targetText.length;
    clearInterval(this.decryptInterval);

    this.decryptInterval = setInterval(() => {
      element.innerText = targetText
        .split('')
        .map((letter, index) => {
          if (index < iteration) return targetText[index];
          return chars[Math.floor(Math.random() * chars.length)];
        })
        .join('');

      if (iteration >= maxIterations) {
        clearInterval(this.decryptInterval);
      }
      iteration += 1 / 2;
    }, 25);
  }

  onWindowResize() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2.0));

    this.overviewPos.copy(this.calculateOverviewPos());
    if (!this.activeNodeId && !this.isTransitioning) {
      this.camera.position.copy(this.overviewPos);
      this.controls.target.copy(this.overviewTarget);
    }
  }

  updateCameraTransition() {
    if (!this.isTransitioning) return;

    const elapsed = performance.now() - this.transitionStartTime;
    let t = elapsed / this.transitionDuration;

    if (t >= 1.0) {
      t = 1.0;
      this.isTransitioning = false;
    }

    const ease = 1 - Math.pow(1 - t, 3);
    this.camera.position.lerpVectors(this.camStartPos, this.camTargetPos, ease);
    this.controls.target.lerpVectors(this.targetLookAtStart, this.targetLookAtEnd, ease);
    this.controls.update();
  }

  updateLabels() {
    const halfWidth = window.innerWidth / 2;
    const halfHeight = window.innerHeight / 2;
    const tempV = new THREE.Vector3();

    Object.keys(this.nodeLabels).forEach(id => {
      const item = this.nodeLabels[id];
      tempV.copy(item.coords);
      tempV.project(this.camera);

      if (tempV.z < 1.0) {
        const x = (tempV.x * halfWidth) + halfWidth;
        const y = -(tempV.y * halfHeight) + halfHeight;
        item.element.style.transform = `translate(-50%, -100%) translate(${x}px, ${y}px)`;
        item.element.style.display = 'flex';
      } else {
        item.element.style.display = 'none';
      }
    });
  }

  updateDataPackets() {
    this.dataPackets.forEach(packet => {
      packet.progress += packet.speed;
      if (packet.progress > 1.0) packet.progress = 0;
      packet.mesh.position.lerpVectors(packet.p1, packet.p2, packet.progress);
    });
  }

  updateRadar() {
    if (!this.radarCtx) return;
    const ctx = this.radarCtx;
    const w = this.radarCanvas.width;
    const h = this.radarCanvas.height;
    const centerX = w / 2;
    const centerY = h / 2;
    const maxRadius = Math.min(centerX, centerY) - 4;

    ctx.clearRect(0, 0, w, h);

    // Radar Circles
    ctx.strokeStyle = '#22222a';
    ctx.lineWidth = 1;
    [0.35, 0.7, 1.0].forEach(rRatio => {
      ctx.beginPath();
      ctx.arc(centerX, centerY, maxRadius * rRatio, 0, Math.PI * 2);
      ctx.stroke();
    });

    // Crosshairs
    ctx.beginPath();
    ctx.moveTo(centerX, 0);
    ctx.lineTo(centerX, h);
    ctx.moveTo(0, centerY);
    ctx.lineTo(w, centerY);
    ctx.stroke();

    // Rotating Sweep line
    this.radarAngle += 0.035;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(
      centerX + Math.cos(this.radarAngle) * maxRadius,
      centerY + Math.sin(this.radarAngle) * maxRadius
    );
    ctx.stroke();

    // Draw Node blips
    const scale = maxRadius / 90;
    SCHEMATIC_DATA.nodes.forEach(node => {
      const bx = centerX + node.coords.x * scale;
      const by = centerY + node.coords.z * scale;
      const isActive = this.activeNodeId === node.id;

      ctx.fillStyle = isActive ? '#ffffff' : '#888892';
      ctx.beginPath();
      ctx.arc(bx, by, isActive ? 3.5 : 2.0, 0, Math.PI * 2);
      ctx.fill();

      if (isActive) {
        ctx.strokeStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(bx, by, 6.0, 0, Math.PI * 2);
        ctx.stroke();
      }
    });

    // Camera Frustum Indicator
    const camDirX = (this.controls.target.x - this.camera.position.x);
    const camDirZ = (this.controls.target.z - this.camera.position.z);
    const camAngle = Math.atan2(camDirZ, camDirX);

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(centerX + Math.cos(camAngle - 0.3) * maxRadius * 0.9, centerY + Math.sin(camAngle - 0.3) * maxRadius * 0.9);
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(centerX + Math.cos(camAngle + 0.3) * maxRadius * 0.9, centerY + Math.sin(camAngle + 0.3) * maxRadius * 0.9);
    ctx.stroke();
  }

  updateTelemetry() {
    this.frameCount++;
    const now = performance.now();
    if (now - this.fpsTimer >= 500) {
      this.fps = Math.round((this.frameCount * 1000) / (now - this.fpsTimer));
      this.frameCount = 0;
      this.fpsTimer = now;

      const fpsEl = document.getElementById('telemetry-fps');
      if (fpsEl) fpsEl.textContent = `${this.fps} FPS`;
    }

    const coordsEl = document.getElementById('telemetry-coords');
    if (coordsEl && this.camera) {
      const x = this.camera.position.x.toFixed(1);
      const y = this.camera.position.y.toFixed(1);
      const z = this.camera.position.z.toFixed(1);
      coordsEl.textContent = `XYZ: [${x}, ${y}, ${z}]`;
    }
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    const delta = (performance.now() - this.lastFrameTime) * 0.001;
    this.lastFrameTime = performance.now();

    // Rotate node wireframes
    Object.keys(this.nodeObjects).forEach(id => {
      const obj = this.nodeObjects[id];
      if (obj.wireMesh) {
        obj.wireMesh.rotation.y += 0.008;
        obj.wireMesh.rotation.x += 0.004;
      }
      if (obj.coreMesh) {
        obj.coreMesh.rotation.y -= 0.012;
      }
      if (obj.rings) {
        obj.rings.forEach((ring, idx) => {
          ring.rotation.z += (idx % 2 === 0 ? 0.015 : -0.012);
        });
      }
    });

    if (this.stars) {
      this.stars.rotation.y += 0.0003;
    }

    if (this.isTransitioning) {
      this.updateCameraTransition();
    } else {
      this.controls.update();
    }

    this.updateLabels();
    this.updateDataPackets();
    this.updateRadar();
    this.updateTelemetry();

    this.renderer.render(this.scene, this.camera);
  }
}

// Bootstrap once DOM is loaded
window.addEventListener('DOMContentLoaded', () => {
  window.portfolio = new SchematicPortfolio();
});
