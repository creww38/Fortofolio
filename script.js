// Three.js Scene
        const container = document.getElementById('canvas-container');
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        container.appendChild(renderer.domElement);

        // Lights
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
        scene.add(ambientLight);

        const pointLight1 = new THREE.PointLight(0x00f5d4, 1, 100);
        pointLight1.position.set(10, 10, 10);
        scene.add(pointLight1);

        const pointLight2 = new THREE.PointLight(0xf15bb5, 1, 100);
        pointLight2.position.set(-10, -10, -10);
        scene.add(pointLight2);

        // Geometric Shapes
        const shapes = [];

        // Torus Knot
        const torusKnotGeo = new THREE.TorusKnotGeometry(1.5, 0.4, 100, 16);
        const torusKnotMat = new THREE.MeshStandardMaterial({ 
            color: 0x00f5d4,
            metalness: 0.8,
            roughness: 0.2,
            wireframe: false
        });
        const torusKnot = new THREE.Mesh(torusKnotGeo, torusKnotMat);
        torusKnot.position.set(8, 0, -5);
        scene.add(torusKnot);
        shapes.push({ mesh: torusKnot, speed: 0.003, floatSpeed: 0.02 });

        // Icosahedron
        const icoGeo = new THREE.IcosahedronGeometry(1.2, 0);
        const icoMat = new THREE.MeshStandardMaterial({ 
            color: 0xfee440,
            metalness: 0.7,
            roughness: 0.3,
            wireframe: true
        });
        const icosahedron = new THREE.Mesh(icoGeo, icoMat);
        icosahedron.position.set(-7, 3, -8);
        scene.add(icosahedron);
        shapes.push({ mesh: icosahedron, speed: 0.005, floatSpeed: 0.015 });

        // Octahedron
        const octaGeo = new THREE.OctahedronGeometry(0.8, 0);
        const octaMat = new THREE.MeshStandardMaterial({ 
            color: 0x9b5de5,
            metalness: 0.8,
            roughness: 0.2
        });
        const octahedron = new THREE.Mesh(octaGeo, octaMat);
        octahedron.position.set(5, -4, -6);
        scene.add(octahedron);
        shapes.push({ mesh: octahedron, speed: 0.004, floatSpeed: 0.025 });

        // Dodecahedron
        const dodecaGeo = new THREE.DodecahedronGeometry(0.6, 0);
        const dodecaMat = new THREE.MeshStandardMaterial({ 
            color: 0xf15bb5,
            metalness: 0.9,
            roughness: 0.1,
            wireframe: true
        });
        const dodecahedron = new THREE.Mesh(dodecaGeo, dodecaMat);
        dodecahedron.position.set(-4, -3, -4);
        scene.add(dodecahedron);
        shapes.push({ mesh: dodecahedron, speed: 0.006, floatSpeed: 0.018 });

        camera.position.z = 10;

        // Mouse interaction
        let mouseX = 0;
        let mouseY = 0;
        
        document.addEventListener('mousemove', (e) => {
            mouseX = (e.clientX / window.innerWidth) * 2 - 1;
            mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
        });

        // Animation
        let time = 0;
        
        function animate() {
            requestAnimationFrame(animate);
            time += 0.01;

            shapes.forEach((shape, index) => {
                shape.mesh.rotation.x += shape.speed;
                shape.mesh.rotation.y += shape.speed;
                shape.mesh.position.y += Math.sin(time * 2 + index) * shape.floatSpeed;
            });

            // Mouse parallax
            camera.position.x += (mouseX * 0.5 - camera.position.x) * 0.05;
            camera.position.y += (mouseY * 0.5 - camera.position.y) * 0.05;
            camera.lookAt(scene.position);

            renderer.render(scene, camera);
        }

        animate();

        // Resize handler
        window.addEventListener('resize', () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        });

        // Scroll animations
        const fadeElements = document.querySelectorAll('.fade-in');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, { threshold: 0.1 });

        fadeElements.forEach(el => observer.observe(el));

        // Mobile menu toggle
        const menuToggle = document.querySelector('.menu-toggle');
        const navLinks = document.querySelector('.nav-links');
        
        menuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });

        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
            });
        });