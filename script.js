/**
 * ULTRA-ROMANTIC VALENTINE EXPERIENCE
 * Three.js Scene + GSAP Interactions
 * Premium quality, 60fps target
 */

(function () {
    'use strict';

    // ========================================
    // THREE.JS SCENE SETUP
    // ========================================
    const canvas = document.getElementById('scene-canvas');
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    camera.position.z = 30;

    // ========================================
    // BLOOM POST-PROCESSING
    // ========================================
    const composer = new THREE.EffectComposer(renderer);
    const renderPass = new THREE.RenderPass(scene, camera);
    composer.addPass(renderPass);

    const bloomPass = new THREE.UnrealBloomPass(
        new THREE.Vector2(window.innerWidth, window.innerHeight),
        1.5,   // strength
        0.4,   // radius
        0.2    // threshold
    );
    composer.addPass(bloomPass);

    // Mouse trail canvas
    const trailCanvas = document.getElementById('trail-canvas');
    const trailCtx = trailCanvas.getContext('2d');
    trailCanvas.width = window.innerWidth;
    trailCanvas.height = window.innerHeight;

    // ========================================
    // LIGHTING - SOFT & DREAMY
    // ========================================
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.25);
    scene.add(ambientLight);

    const pinkLight = new THREE.PointLight(0xff6b9d, 1.2, 120);
    pinkLight.position.set(25, 20, 20);
    scene.add(pinkLight);

    const purpleLight = new THREE.PointLight(0x9b4dca, 0.8, 100);
    purpleLight.position.set(-25, -15, 15);
    scene.add(purpleLight);

    const roseLight = new THREE.PointLight(0xffb8d0, 0.6, 80);
    roseLight.position.set(0, 25, 10);
    scene.add(roseLight);

    // ========================================
    // STARFIELD (~6000 STARS)
    // ========================================
    const starsGeometry = new THREE.BufferGeometry();
    const STAR_COUNT = 6000;
    const starPositions = new Float32Array(STAR_COUNT * 3);
    const starColors = new Float32Array(STAR_COUNT * 3);
    const starSizes = new Float32Array(STAR_COUNT);

    for (let i = 0; i < STAR_COUNT; i++) {
        const i3 = i * 3;
        // Expanded spread to cover wide screens at depth
        starPositions[i3] = (Math.random() - 0.5) * 1200;
        starPositions[i3 + 1] = (Math.random() - 0.5) * 1200;
        starPositions[i3 + 2] = -5 - Math.random() * 350; // Closer range to deeper range

        // Mostly white, some pink/purple tinted
        const isPink = Math.random() > 0.85;
        if (isPink) {
            const col = new THREE.Color().setHSL(0.9 + Math.random() * 0.1, 0.6, 0.8);
            starColors[i3] = col.r;
            starColors[i3 + 1] = col.g;
            starColors[i3 + 2] = col.b;
        } else {
            starColors[i3] = 1;
            starColors[i3 + 1] = 1;
            starColors[i3 + 2] = 1;
        }

        starSizes[i] = 0.5 + Math.random() * 1.5;
    }

    starsGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    starsGeometry.setAttribute('color', new THREE.BufferAttribute(starColors, 3));

    const starsMaterial = new THREE.PointsMaterial({
        size: 0.8,
        vertexColors: true,
        transparent: true,
        opacity: 0.9,
        sizeAttenuation: true,
        blending: THREE.AdditiveBlending
    });

    const stars = new THREE.Points(starsGeometry, starsMaterial);
    scene.add(stars);

    // ========================================
    // BREATHING HEART SWARM (12,000 particles)
    // Particles form a heart shape + breathe + mouse repulsion
    // ========================================
    const SWARM_COUNT = 12000;
    const swarmGeometry = new THREE.BufferGeometry();
    const swarmPositions = new Float32Array(SWARM_COUNT * 3);
    const swarmVelocities = new Float32Array(SWARM_COUNT * 3);
    const swarmColors = new Float32Array(SWARM_COUNT * 3);
    const heartTargets = new Float32Array(SWARM_COUNT * 3); // Target heart positions

    const baseColor = new THREE.Color(0xff6b9d);  // Pink
    const accentColor = new THREE.Color(0x9b4dca); // Purple

    // Heart parametric equation
    function getHeartPoint(t) {
        // t from 0 to 2*PI traces a heart
        const x = 16 * Math.pow(Math.sin(t), 3);
        const y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
        return { x: x * 0.8, y: y * 0.8 + 2 }; // Scale and center
    }

    for (let i = 0; i < SWARM_COUNT; i++) {
        const i3 = i * 3;

        // Initial spread cloud
        swarmPositions[i3] = (Math.random() - 0.5) * 60;
        swarmPositions[i3 + 1] = (Math.random() - 0.5) * 40;
        swarmPositions[i3 + 2] = (Math.random() - 0.5) * 15 - 5;

        // Heart target position for this particle
        const t = Math.random() * Math.PI * 2;
        const heart = getHeartPoint(t);
        // Add some thickness/depth to the heart
        const spread = 0.8 + Math.random() * 0.4; // Vary distance from perfect heart
        heartTargets[i3] = heart.x * spread + (Math.random() - 0.5) * 2;
        heartTargets[i3 + 1] = heart.y * spread + (Math.random() - 0.5) * 2;
        heartTargets[i3 + 2] = (Math.random() - 0.5) * 4 - 5;

        // Random initial velocity
        swarmVelocities[i3] = (Math.random() - 0.5) * 0.02;
        swarmVelocities[i3 + 1] = (Math.random() - 0.5) * 0.02;
        swarmVelocities[i3 + 2] = (Math.random() - 0.5) * 0.02;

        // Colors - pink to purple gradient
        const mixedColor = baseColor.clone().lerp(accentColor, Math.random());
        swarmColors[i3] = mixedColor.r;
        swarmColors[i3 + 1] = mixedColor.g;
        swarmColors[i3 + 2] = mixedColor.b;
    }

    swarmGeometry.setAttribute('position', new THREE.BufferAttribute(swarmPositions, 3));
    swarmGeometry.setAttribute('color', new THREE.BufferAttribute(swarmColors, 3));

    const swarmMaterial = new THREE.PointsMaterial({
        size: 0.1,
        vertexColors: true,
        transparent: true,
        opacity: 0.85,
        sizeAttenuation: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending
    });

    const swarm = new THREE.Points(swarmGeometry, swarmMaterial);
    scene.add(swarm);

    // Mouse position for swarm interaction
    let mouseWorldX = 0, mouseWorldY = 0;

    // ========================================
    // PERSONALIZATION (TEXT MORPH)
    // ========================================
    const textTargets = new Float32Array(SWARM_COUNT * 3);

    // GSAP Controlled Object
    const morphParams = { factor: 0 }; // 0 = Heart, 1 = Text
    let morphTimeline = null;
    let isPersonalized = false;

    // Initialize text targets to be same as heart initially
    for (let i = 0; i < SWARM_COUNT * 3; i++) {
        textTargets[i] = heartTargets[i];
    }

    function startMorphLoop() {
        if (morphTimeline) morphTimeline.kill();

        // Loop: Heart -> Text -> Heart
        morphTimeline = gsap.timeline({ repeat: -1, yoyo: true, repeatDelay: 2 });

        // Start from Heart (0), animate to Text (1) over 3 seconds
        // Hold Text for 2 seconds (repeatDelay), then yoyo back
        morphTimeline.to(morphParams, {
            factor: 1,
            duration: 3.5,
            ease: "power2.inOut",
            delay: 1 // Initial delay before first morph
        });
    }

    function createTextTargets(text) {
        const fontSize = 160;
        const fontName = 'Playfair Display, Georgia, serif';

        // Create offscreen canvas
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = 1200; // Increased width for longer names
        canvas.height = 300;

        ctx.font = `bold ${fontSize}px ${fontName}`;
        ctx.fillStyle = 'white';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, canvas.width / 2, canvas.height / 2);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
        const pixels = [];

        // Dynamic scaling based on text length to fit screen
        // Base scale 0.15 is good for short names (~5 chars)
        // For longer names, we reduce scale
        let scaleModifier = 0.15;
        if (text.length > 5) {
            scaleModifier = 0.12;
        }
        if (text.length > 8) {
            scaleModifier = 0.09;
        }
        if (text.length > 12) {
            scaleModifier = 0.07;
        }

        // Scan for pixels
        // Adjust step size based on scale to keep particle density reasonable
        const step = Math.max(1, Math.floor(2 * (0.15 / scaleModifier)));

        for (let y = 0; y < canvas.height; y += step) {
            for (let x = 0; x < canvas.width; x += step) {
                const alpha = imageData[(y * canvas.width + x) * 4 + 3];
                if (alpha > 128) {
                    pixels.push({
                        x: (x - canvas.width / 2) * scaleModifier,
                        y: -(y - canvas.height / 2) * scaleModifier + 5,
                        z: 0
                    });
                }
            }
        }

        // Map pixels to particles
        for (let i = 0; i < SWARM_COUNT; i++) {
            const i3 = i * 3;

            if (pixels.length > 0) {
                const pixelIndex = i % pixels.length;
                const pixel = pixels[pixelIndex];

                const depth = (Math.random() - 0.5) * 2;

                textTargets[i3] = pixel.x + (Math.random() - 0.5) * 0.5;
                textTargets[i3 + 1] = pixel.y + (Math.random() - 0.5) * 0.5;
                textTargets[i3 + 2] = pixel.z + depth;
            } else {
                textTargets[i3] = heartTargets[i3];
            }
        }
    }

    // ========================================
    // GLASS HEARTS (FOREGROUND, ~20)
    // ========================================
    const glassHearts = [];

    const heartShape = new THREE.Shape();
    heartShape.moveTo(0, 0.5);
    heartShape.bezierCurveTo(0, 0.5, -0.5, 0, -0.5, 0);
    heartShape.bezierCurveTo(-0.85, 0, -0.85, 0.55, -0.85, 0.55);
    heartShape.bezierCurveTo(-0.85, 0.85, -0.45, 1.15, 0, 1.45);
    heartShape.bezierCurveTo(0.45, 1.15, 0.85, 0.85, 0.85, 0.55);
    heartShape.bezierCurveTo(0.85, 0.55, 0.85, 0, 0.5, 0);
    heartShape.bezierCurveTo(0.5, 0, 0, 0.5, 0, 0.5);

    const heartGeo = new THREE.ExtrudeGeometry(heartShape, {
        depth: 0.12,
        bevelEnabled: true,
        bevelSegments: 3,
        bevelSize: 0.06,
        bevelThickness: 0.06
    });
    heartGeo.center();

    function createGlassHeart(isDeep = false) {
        const hue = 0.88 + Math.random() * 0.14;
        const color = new THREE.Color().setHSL(hue, 0.55, 0.75);

        const material = new THREE.MeshPhysicalMaterial({
            color,
            metalness: 0.05,
            roughness: 0.1,
            transmission: 0.92,
            thickness: 0.4,
            transparent: true,
            opacity: isDeep ? 0.12 : 0.25,
            side: THREE.DoubleSide,
            clearcoat: 1,
            clearcoatRoughness: 0.08,
            ior: 1.5,
            envMapIntensity: 0.8
        });

        const heart = new THREE.Mesh(heartGeo, material);

        const radius = isDeep ? 35 + Math.random() * 45 : 12 + Math.random() * 22;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);

        heart.position.set(
            radius * Math.sin(phi) * Math.cos(theta),
            radius * Math.sin(phi) * Math.sin(theta) * 0.7,
            isDeep ? -25 - Math.random() * 35 : radius * Math.cos(phi) * 0.4 - 8
        );

        const scale = isDeep ? 1.2 + Math.random() * 2.5 : 0.5 + Math.random() * 1;
        heart.scale.setScalar(scale);
        heart.rotation.set(
            (Math.random() - 0.5) * 0.25,
            Math.random() * Math.PI * 2,
            (Math.random() - 0.5) * 0.25
        );

        heart.userData = {
            rotSpeed: (Math.random() - 0.5) * 0.004,
            floatSpeed: 0.25 + Math.random() * 0.4,
            floatOffset: Math.random() * Math.PI * 2,
            baseY: heart.position.y,
            baseZ: heart.position.z
        };

        scene.add(heart);
        glassHearts.push(heart);
    }

    // 12 deep + 8 close = 20 glass hearts
    for (let i = 0; i < 12; i++) createGlassHeart(true);
    for (let i = 0; i < 8; i++) createGlassHeart(false);

    // ========================================
    // GLOW ORBS (AMBIENT)
    // ========================================
    const glowOrbs = [];
    const orbGeo = new THREE.SphereGeometry(1, 24, 24);

    for (let i = 0; i < 6; i++) {
        const colors = [0xff6b9d, 0xffb8d0, 0xe8b4f8, 0x9b4dca];
        const material = new THREE.MeshBasicMaterial({
            color: colors[i % colors.length],
            transparent: true,
            opacity: 0.06
        });

        const orb = new THREE.Mesh(orbGeo, material);
        orb.position.set(
            (Math.random() - 0.5) * 100,
            (Math.random() - 0.5) * 60,
            -40 - Math.random() * 50
        );
        orb.scale.setScalar(0.8 + Math.random() * 1.4);
        orb.userData = { pulseSpeed: 0.4 + Math.random() * 0.4, offset: Math.random() * Math.PI * 2 };

        scene.add(orb);
        glowOrbs.push(orb);
    }

    // ========================================
    // GLASS BUBBLES (CHAMPAGNE EFFECT)
    // ========================================
    const bubbles = [];
    const bubbleGeo = new THREE.SphereGeometry(0.08, 12, 12);

    for (let i = 0; i < 35; i++) {
        const material = new THREE.MeshPhysicalMaterial({
            color: new THREE.Color().setHSL(0.92 + Math.random() * 0.08, 0.5, 0.8),
            metalness: 0,
            roughness: 0,
            transmission: 0.95,
            thickness: 0.15,
            transparent: true,
            opacity: 0.35
        });

        const bubble = new THREE.Mesh(bubbleGeo, material);
        bubble.position.set(
            (Math.random() - 0.5) * 50,
            -25 + Math.random() * 50,
            (Math.random() - 0.5) * 25 - 5
        );
        bubble.scale.setScalar(0.5 + Math.random() * 1.5);
        bubble.userData = {
            speed: 0.015 + Math.random() * 0.025,
            sway: Math.random() * Math.PI * 2,
            baseX: bubble.position.x
        };

        scene.add(bubble);
        bubbles.push(bubble);
    }

    // ========================================
    // ANIMATION LOOP
    // ========================================
    const clock = new THREE.Clock();
    let mouseX = 0, mouseY = 0;
    let isActive = true;

    // Pause on tab inactive
    document.addEventListener('visibilitychange', () => {
        isActive = !document.hidden;
    });

    function animate() {
        if (!isActive) {
            requestAnimationFrame(animate);
            return;
        }

        requestAnimationFrame(animate);
        const t = clock.getElapsedTime();

        // Use GSAP controlled factor
        const morphFactor = morphParams.factor;

        // Starfield slow rotation
        stars.rotation.y = t * 0.008;
        stars.rotation.x = t * 0.003;

        // Breathing Heart Swarm Physics
        const positions = swarm.geometry.attributes.position.array;

        // Breathing scale - heart expands and contracts
        // When morphing to text, reduce breathing effect
        const heartStrength = 1 - morphFactor;
        const textStrength = morphFactor;

        const breathe = (Math.sin(t * 1.2) * 0.35 + 1) * heartStrength + 1 * textStrength;
        const heartPulse = (Math.sin(t * 2.5) * 0.05) * heartStrength;

        for (let i = 0; i < SWARM_COUNT; i++) {
            const i3 = i * 3;
            const px = positions[i3];
            const py = positions[i3 + 1];
            const pz = positions[i3 + 2];

            // HEART TARGET
            const hx = heartTargets[i3] * (breathe + heartPulse);
            const hy = heartTargets[i3 + 1] * (breathe + heartPulse);
            const hz = heartTargets[i3 + 2];

            // TEXT TARGET
            // Add subtle floating to text
            const floatScale = 1 + Math.sin(t * 2 + i * 0.1) * 0.02;
            const tx = textTargets[i3] * floatScale;
            const ty = textTargets[i3 + 1] * floatScale;
            const tz = textTargets[i3 + 2];

            // BLENDED TARGET
            const targetX = hx * (1 - morphFactor) + tx * morphFactor;
            const targetY = hy * (1 - morphFactor) + ty * morphFactor;
            const targetZ = hz * (1 - morphFactor) + tz * morphFactor;

            // 1. Attract toward target
            const toTargetX = targetX - px;
            const toTargetY = targetY - py;
            const toTargetZ = targetZ - pz;

            // Text needs tighter control, Heart can be looser
            const attraction = 0.008 + (0.012 * morphFactor);

            swarmVelocities[i3] += toTargetX * attraction;
            swarmVelocities[i3 + 1] += toTargetY * attraction;
            swarmVelocities[i3 + 2] += toTargetZ * 0.005;

            // 2. Subtle wave motion (reduced for text to keep it readable)
            const waveStrength = 0.001 * (1 - morphFactor * 0.5);
            const waveX = Math.sin(py * 0.3 + t * 0.8) * waveStrength;
            const waveY = Math.cos(px * 0.3 + t * 0.8) * waveStrength;
            swarmVelocities[i3] += waveX;
            swarmVelocities[i3 + 1] += waveY;

            // 3. Mouse Repulsion (negative magnet)
            const dx = mouseWorldX - px;
            const dy = mouseWorldY - py;
            const dz = -5 - pz;
            const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

            if (dist < 10 && dist > 0.1) {
                const force = (10 - dist) * 0.04;
                swarmVelocities[i3] -= (dx / dist) * force;
                swarmVelocities[i3 + 1] -= (dy / dist) * force;
                swarmVelocities[i3 + 2] -= (dz / dist) * force * 0.3;
            }

            // 4. Damping (Text needs higher damping for stability)
            const damping = 0.94 * (1 - morphFactor) + 0.90 * morphFactor;
            swarmVelocities[i3] *= damping;
            swarmVelocities[i3 + 1] *= damping;
            swarmVelocities[i3 + 2] *= damping;

            // Update positions
            positions[i3] += swarmVelocities[i3];
            positions[i3 + 1] += swarmVelocities[i3 + 1];
            positions[i3 + 2] += swarmVelocities[i3 + 2];
        }

        swarm.geometry.attributes.position.needsUpdate = true;

        // Glass hearts float + parallax
        // Fade out glass hearts when text is active
        const glassOpacity = 1 - morphFactor;

        glassHearts.forEach(heart => {
            heart.visible = glassOpacity > 0.01;
            if (heart.visible) {
                heart.material.opacity = (heart.userData.isDeep ? 0.12 : 0.25) * glassOpacity;

                heart.rotation.y += heart.userData.rotSpeed;
                heart.position.y = heart.userData.baseY + Math.sin(t * heart.userData.floatSpeed + heart.userData.floatOffset) * 1.2;
                heart.position.z = heart.userData.baseZ + Math.cos(t * heart.userData.floatSpeed * 0.7) * 0.4;
                heart.position.x += (mouseX * 0.0008 - heart.position.x * 0.00005);
            }
        });

        // Glow orbs pulse
        glowOrbs.forEach(orb => {
            const p = Math.sin(t * orb.userData.pulseSpeed + orb.userData.offset) * 0.35 + 0.65;
            orb.scale.setScalar(p * 1.5);
            orb.material.opacity = (0.04 + p * 0.04);
        });

        // Bubbles rise
        bubbles.forEach(b => {
            b.position.y += b.userData.speed;
            b.position.x = b.userData.baseX + Math.sin(t * 1.5 + b.userData.sway) * 0.3;
            if (b.position.y > 30) {
                b.position.y = -25;
                b.userData.baseX = (Math.random() - 0.5) * 50;
            }
        });

        // Lights subtle movement
        pinkLight.position.x = Math.sin(t * 0.15) * 28;
        pinkLight.position.y = 20 + Math.cos(t * 0.2) * 8;
        purpleLight.position.x = Math.cos(t * 0.12) * 28;

        // Cinematic camera movement
        // Slow breathing depth
        camera.position.z = 30 - Math.sin(t * 0.08) * 5;
        // Gentle horizontal sway
        camera.position.x = Math.sin(t * 0.03) * 2;
        // Subtle vertical drift
        camera.position.y = Math.cos(t * 0.04) * 1.5;
        // Cinematic tilt/roll
        camera.rotation.z = Math.sin(t * 0.02) * 0.015;

        // Render with bloom post-processing
        composer.render();
    }
    animate();

    // ========================================
    // MOUSE TRAIL
    // ========================================
    const trail = [];
    const TRAIL_LENGTH = 25;

    document.addEventListener('mousemove', e => {
        mouseX = e.clientX - window.innerWidth / 2;
        mouseY = e.clientY - window.innerHeight / 2;

        // Convert to world coordinates for swarm repulsion
        // Viewport is roughly -25 to 25 in world units
        mouseWorldX = (e.clientX / window.innerWidth - 0.5) * 50;
        mouseWorldY = -(e.clientY / window.innerHeight - 0.5) * 30;

        trail.push({ x: e.clientX, y: e.clientY });
        if (trail.length > TRAIL_LENGTH) trail.shift();
    });

    function drawTrail() {
        trailCtx.clearRect(0, 0, trailCanvas.width, trailCanvas.height);

        if (trail.length > 2) {
            // Gradient line
            trailCtx.beginPath();
            trailCtx.moveTo(trail[0].x, trail[0].y);
            for (let i = 1; i < trail.length; i++) {
                trailCtx.lineTo(trail[i].x, trail[i].y);
            }
            const grad = trailCtx.createLinearGradient(
                trail[0].x, trail[0].y,
                trail[trail.length - 1].x, trail[trail.length - 1].y
            );
            grad.addColorStop(0, 'rgba(255, 107, 157, 0)');
            grad.addColorStop(0.5, 'rgba(155, 77, 202, 0.3)');
            grad.addColorStop(1, 'rgba(255, 107, 157, 0.4)');
            trailCtx.strokeStyle = grad;
            trailCtx.lineWidth = 2.5;
            trailCtx.lineCap = 'round';
            trailCtx.lineJoin = 'round';
            trailCtx.stroke();

            // Sparkle dots
            trail.forEach((pt, i) => {
                const alpha = (i / trail.length) * 0.5;
                const size = 2 + (i / trail.length) * 4;
                trailCtx.beginPath();
                trailCtx.arc(pt.x, pt.y, size, 0, Math.PI * 2);
                trailCtx.fillStyle = `rgba(255, 184, 208, ${alpha})`;
                trailCtx.fill();
            });
        }

        requestAnimationFrame(drawTrail);
    }
    drawTrail();

    // ========================================
    // RESIZE HANDLER
    // ========================================
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
        composer.setSize(window.innerWidth, window.innerHeight);
        bloomPass.setSize(window.innerWidth, window.innerHeight);
        trailCanvas.width = window.innerWidth;
        trailCanvas.height = window.innerHeight;
    });

    // ========================================
    // ROMANTIC MESSAGES (20)
    // ========================================
    const messages = [
        "Are you clicking the wrong one?",
        "That was a misclick, right?",
        "Try the other button ->",
        "The universe says NO to your No",
        "I'm going to cry...",
        "Heart.exe has stopped working",
        "Error 404: Rejection not found",
        "Don't be like this...",
        "Have you no heart?",
        "I'm telling your mom",
        "Is this a joke?",
        "Stop playing hard to get",
        "You're breaking my code",
        "I can do this all day",
        "Still waiting for a Yes",
        "My developer is crying now",
        "Button is slippery, huh?",
        "Nice try, but no",
        "Access Denied",
        "System Override: Say Yes",
        "Look at those puppy eyes...",
        "Just one click on Yes?",
        "I'll buy you chocolate...",
        "What if I say pretty please?",
        "Unacceptable answer",
        "Try again in 5.4.3...",
        "Warning: Cuteness overload imminent",
        "You have no choice 💜",
        "Resistance is futile",
        "Just say it already!",
        "Okay, now you're just being mean",
        "I'm running out of buttons",
        "Fine, I'll just wait..."
    ];

    const poems = [
        `"In a universe of infinite stars,<br>
         I found my way to where you are.<br>
         Through time and space, my heart knew true—<br>
         Every path was leading me to you."`,

        `"Whatever our souls are made of,<br>
         his and mine are the same.<br>
         You are the finest, loveliest,<br>
         tenderest, and most beautiful person I have ever known."`,

        `"I love you without knowing how,<br>
         or when, or from where.<br>
         I love you simply, without problems or pride:<br>
         I love you in this way because I do not know any other way of loving."`,

        `"Yours is the light by which my spirit's born:<br>
         you are my sun, my moon, and all my stars."`,

        `"If I had a flower for every time I thought of you...<br>
         I could walk through my garden forever."`,

        `"I seem to have loved you in numberless forms, numberless times…<br>
         In life after life, in age after age, forever."`
    ];

    // ========================================
    // DOM ELEMENTS
    // ========================================
    const questionPage = document.getElementById('questionPage');
    const successPage = document.getElementById('successPage');
    const yesBtn = document.getElementById('yesBtn');
    const noBtn = document.getElementById('noBtn');
    const messageBox = document.getElementById('messageBox');
    const attemptCounter = document.getElementById('attemptCounter');
    const glassCard = document.getElementById('glassCard');
    const loveFill = document.getElementById('loveFill');
    const loveValue = document.getElementById('loveValue');

    let noCount = 0;
    let yesScale = 1;
    let noScale = 1;

    // ========================================
    // GLASS CARD HOVER GLOW
    // ========================================
    glassCard.addEventListener('mousemove', e => {
        const rect = glassCard.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        glassCard.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(255, 107, 157, 0.1), transparent 60%), rgba(255, 255, 255, 0.06)`;
    });

    glassCard.addEventListener('mouseleave', () => {
        glassCard.style.background = 'rgba(255, 255, 255, 0.06)';
    });

    // ========================================
    // "NO" BUTTON EVASION
    // ========================================
    // ========================================
    // CHAOTIC "NO" BUTTON EVASION
    // ========================================
    const noBtnTexts = ["No", "N0", "Nope", "Nah", "Can't", "Error", "Stop", "Wait", "Huh?", "Why?"];

    function evadeButton() {
        const rect = noBtn.getBoundingClientRect();
        const pad = 80; // Increased padding
        const maxX = window.innerWidth - rect.width - pad;
        const maxY = window.innerHeight - rect.height - pad;

        let newX, newY, attempts = 0;
        do {
            newX = pad + Math.random() * (maxX - pad);
            newY = pad + Math.random() * (maxY - pad);
            attempts++;
        } while (attempts < 25 &&
            Math.hypot(newX - rect.left, newY - rect.top) < 250); // Increased safe distance

        noBtn.classList.add('is-escaping');

        // Glitch Effect
        noBtn.classList.add('btn-glitch');
        setTimeout(() => noBtn.classList.remove('btn-glitch'), 400);

        // Speed ramps up with frustration (faster as count goes up)
        const duration = Math.max(0.08, 0.4 - (noCount * 0.02));

        gsap.to(noBtn, {
            left: newX,
            top: newY,
            rotation: (Math.random() - 0.5) * 90, // Random tilt
            duration: duration,
            ease: "back.out(2.5)"
        });

        noCount++;

        // Text Corruption
        if (noCount % 3 === 0) {
            noBtn.innerText = noBtnTexts[Math.min(Math.floor(noCount / 3), noBtnTexts.length - 1)];
            noBtn.style.fontFamily = Math.random() > 0.5 ? "'Courier New', monospace" : "inherit";
        }

        // Scale adjustments
        noScale = Math.max(noScale - 0.04, 0.5);
        yesScale = Math.min(yesScale + 0.15, 2.5);

        gsap.to(noBtn, { scale: noScale, duration: 0.2 });
        gsap.to(yesBtn, { scale: yesScale, duration: 0.2 });

        // Message
        const msgIndex = (noCount - 1) % messages.length;
        messageBox.innerHTML = `<p class="msg-pop">${messages[msgIndex]}</p>`;

        // Animate message pop
        gsap.fromTo("#messageBox p", { scale: 0.5, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.3, ease: "elastic.out(1, 0.5)" });

        // Counter
        if (noCount >= 5) {
            attemptCounter.classList.add('is-warning');
            attemptCounter.textContent = `Attempt ${noCount} — Why are you like this? 😭`;
        } else {
            attemptCounter.textContent = `Attempt ${noCount}`;
        }

        // Spawn broken particles
        createSparkBurst(rect.left + rect.width / 2, rect.top + rect.height / 2, true);

        // Shake screen violently after 10 tries
        if (noCount > 10) {
            const shakeIntensity = Math.min(10, (noCount - 10) * 1.5);
            gsap.to(questionPage, { x: `+=${shakeIntensity}`, y: `-=${shakeIntensity}`, yoyo: true, repeat: 5, duration: 0.05 });
        }

        // Screen shake every 5
        if (noCount % 5 === 0) {
            questionPage.classList.add('page--shake');
            setTimeout(() => questionPage.classList.remove('page--shake'), 500);
        }

        createSparkBurst(rect.left + rect.width / 2, rect.top + rect.height / 2);
    }

    function createSparkBurst(x, y) {
        const chars = ['✦', '✧', '♡', '·'];
        for (let i = 0; i < 8; i++) {
            const spark = document.createElement('span');
            spark.className = 'sparkle';
            spark.textContent = chars[i % chars.length];
            spark.style.left = `${x}px`;
            spark.style.top = `${y}px`;
            spark.style.fontSize = `${10 + Math.random() * 14}px`;
            spark.style.color = `hsl(${330 + Math.random() * 40}, 75%, 70%)`;
            document.body.appendChild(spark);

            gsap.to(spark, {
                x: (Math.random() - 0.5) * 120,
                y: (Math.random() - 0.5) * 120,
                opacity: 0,
                duration: 0.6,
                ease: 'power2.out',
                onComplete: () => spark.remove()
            });
        }
    }

    noBtn.addEventListener('mouseenter', evadeButton);
    noBtn.addEventListener('touchstart', e => { e.preventDefault(); evadeButton(); }, { passive: false });
    noBtn.addEventListener('click', e => { e.preventDefault(); evadeButton(); });

    // ========================================
    // "YES" BUTTON - SUCCESS
    // ========================================
    function handleSuccess() {
        // Disable No button
        noBtn.style.pointerEvents = 'none';
        noBtn.style.opacity = '0';

        // Flash
        const flash = document.createElement('div');
        flash.className = 'flash-overlay';
        document.body.appendChild(flash);
        setTimeout(() => flash.remove(), 600);

        // Heart explosion
        for (let i = 0; i < 30; i++) {
            setTimeout(() => {
                const heart = document.createElement('span');
                heart.className = 'sparkle';
                heart.textContent = ['♡', '♥', '💖', '💕', '✦'][Math.floor(Math.random() * 5)];
                heart.style.left = `${window.innerWidth / 2}px`;
                heart.style.top = `${window.innerHeight / 2}px`;
                heart.style.fontSize = `${24 + Math.random() * 36}px`;
                heart.style.color = `hsl(${330 + Math.random() * 40}, 80%, 65%)`;
                document.body.appendChild(heart);

                gsap.to(heart, {
                    x: (Math.random() - 0.5) * 700,
                    y: (Math.random() - 0.5) * 700,
                    rotation: Math.random() * 360,
                    opacity: 0,
                    duration: 1.4,
                    ease: 'power2.out',
                    onComplete: () => heart.remove()
                });
            }, i * 40);
        }

        // Set Random Poem
        const successPoem = document.getElementById('successPoem');
        if (successPoem) {
            successPoem.innerHTML = poems[Math.floor(Math.random() * poems.length)];
        }

        // Page transition
        setTimeout(() => {
            questionPage.classList.add('page--hidden');
            successPage.classList.remove('page--hidden');

            // Add more glass hearts
            for (let i = 0; i < 12; i++) createGlassHeart(Math.random() > 0.5);

            // Love meter animation
            setTimeout(() => {
                loveFill.classList.add('is-full');
                animateLoveValue();
            }, 400);

            startConfetti();
        }, 700);
    }

    function animateLoveValue() {
        let val = 0;
        const interval = setInterval(() => {
            val += 2;
            loveValue.textContent = `${Math.min(val, 100)}%`;
            if (val >= 100) {
                clearInterval(interval);
                loveValue.textContent = '∞%';
            }
        }, 45);
    }

    yesBtn.addEventListener('click', handleSuccess);

    // ========================================
    // CONFETTI
    // ========================================
    function startConfetti() {
        const colors = ['#ff6b9d', '#ffb8d0', '#e8b4f8', '#ffffff', '#c44569', '#9b4dca'];

        // Add keyframes
        const style = document.createElement('style');
        style.textContent = `
            @keyframes confettiFall {
                0% { transform: translateY(0) rotate(0deg); opacity: 0.8; }
                100% { transform: translateY(100vh) rotate(480deg); opacity: 0; }
            }
        `;
        document.head.appendChild(style);

        function spawn() {
            for (let i = 0; i < 6; i++) {
                setTimeout(() => {
                    const conf = document.createElement('div');
                    conf.className = 'confetti';
                    conf.style.width = `${5 + Math.random() * 8}px`;
                    conf.style.height = `${5 + Math.random() * 8}px`;
                    conf.style.background = colors[Math.floor(Math.random() * colors.length)];
                    conf.style.left = `${Math.random() * 100}%`;
                    conf.style.top = '-15px';
                    conf.style.borderRadius = Math.random() > 0.5 ? '50%' : '1px';
                    conf.style.animation = `confettiFall ${3.5 + Math.random() * 2}s linear forwards`;
                    document.body.appendChild(conf);
                    setTimeout(() => conf.remove(), 5500);
                }, i * 80);
            }
        }

        for (let i = 0; i < 12; i++) setTimeout(spawn, i * 100);
        setInterval(spawn, 1400);
    }

    // ========================================
    // INTRO OVERLAY & AUDIO
    // ========================================
    const introOverlay = document.getElementById('introOverlay');
    const bgMusic = document.getElementById('bgMusic');

    introOverlay.addEventListener('click', () => {
        // Start background music
        if (bgMusic) {
            bgMusic.volume = 0.3;
            bgMusic.play().catch(() => {
                // Audio autoplay blocked - continue silently
            });
        }

        // Fade out intro overlay
        introOverlay.classList.add('is-hidden');

        // Reveal question page
        setTimeout(() => {
            questionPage.classList.remove('page--hidden');
        }, 800);
    });

    // ========================================
    // PERSONALIZATION UI HANDLERS
    // ========================================
    const personalizeBtn = document.getElementById('personalizeBtn');
    const personalizeModal = document.getElementById('personalizeModal');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const nameInput = document.getElementById('nameInput');
    const createLinkBtn = document.getElementById('createLinkBtn');
    const shareResult = document.getElementById('shareResult');
    const shareLinkInput = document.getElementById('shareLinkInput');
    const copyLinkBtn = document.getElementById('copyLinkBtn');

    // Toggle Modal
    personalizeBtn.addEventListener('click', () => {
        personalizeModal.classList.remove('modal--hidden');
        nameInput.focus();
    });

    function closeModal() {
        personalizeModal.classList.add('modal--hidden');
        // Reset state if needed, or leave it
        setTimeout(() => {
            shareResult.classList.add('is-hidden');
            nameInput.value = '';
        }, 500);
    }

    closeModalBtn.addEventListener('click', closeModal);
    personalizeModal.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal-backdrop')) {
            closeModal();
        }
    });

    // Generate Logic
    createLinkBtn.addEventListener('click', () => {
        const name = nameInput.value.trim();
        if (!name) return;

        // 1. Update URL
        const url = new URL(window.location.href);
        url.searchParams.set('for', name);
        window.history.pushState({}, '', url);

        // 2. Generate Link
        shareLinkInput.value = url.toString();
        shareResult.classList.remove('is-hidden');

        // 3. Trigger Particle Morph
        createTextTargets(name);
        isPersonalized = true;
        startMorphLoop();

        // Update Question text
        // document.querySelector('.card-title').textContent = `${name}, My Dearest...`;
    });

    // Auto-load from URL
    function checkUrlParams() {
        const params = new URLSearchParams(window.location.search);
        const name = params.get('for');

        if (name) {
            // Wait for fonts to load for better canvas text
            document.fonts.ready.then(() => {
                createTextTargets(name);
                isPersonalized = true;
                startMorphLoop();

                // Update title
                document.querySelector('.intro-title').textContent = `For ${name}...`;
                document.querySelector('.card-title').textContent = `${name}, My Dearest...`;
            });
        }
    }

    checkUrlParams();

    // Copy Logic
    copyLinkBtn.addEventListener('click', () => {
        shareLinkInput.select();
        document.execCommand('copy');

        const originalText = copyLinkBtn.innerText;
        copyLinkBtn.innerText = 'Copied!';
        setTimeout(() => copyLinkBtn.innerText = originalText, 2000);
    });

    console.log('%c✦ Crafted with love ✦', 'color: #ff6b9d; font-size: 16px; font-weight: bold;');

})();
