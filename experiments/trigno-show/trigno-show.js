class TrignoShow {
    constructor(container) {
        this.container = container;

        window.addEventListener("mousemove", event => this.mouseMove(event));
        this.container.addEventListener("mouseleave", event => this.mouseLeave(event));
    }

    setupGraphics() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.OrthographicCamera(0, this.container.offsetWidth, 0, this.container.offsetHeight);

        this.renderer = new THREE.WebGLRenderer({alpha: true, antialias: true});
        this.renderer.setSize(this.container.offsetWidth, this.container.offsetHeight);
        this.container.appendChild(this.renderer.domElement);

        this.createTriangularMesh();

        this.raycaster = new THREE.Raycaster();

        this.camera.position.z = 5;
    }

    updateFaceDistances(minDistance, transitionScale) {
        const faces = this.trignoMesh.geometry.faces;
        const vertices = this.trignoMesh.geometry.vertices;

        const whiteColor = new THREE.Color(0xffffff);
        const grayColor = new THREE.Color(0xc0c0c0);

        transitionScale = transitionScale || 0.96;

        const computeColor = vertex => {
            const distance = this.mousePosition.distanceTo(vertex);

            if (distance < minDistance) {
                return grayColor;
            }

            let z = transitionScale / minDistance;
            let value = 1 - 1 / Math.exp(z * distance - transitionScale);

            return grayColor.clone().lerp(whiteColor, value);
        };

        for (let i = 0; i < faces.length; i++) {
            const face = faces[i];

            face.vertexColors[0].set(computeColor(vertices[face.a]));
            face.vertexColors[1].set(computeColor(vertices[face.b]));
            face.vertexColors[2].set(computeColor(vertices[face.c]));

            // face.color.setHex(0xff00f0);
        }

        this.trignoMesh.geometry.colorsNeedUpdate = true;
    }

    createTriangularMesh() {
        const width = 100;
        const height = 100;

        const geometry = new THREE.Geometry();
        let squareCount = 0;
        for (let x = 0; x < Math.ceil((this.container.offsetWidth - 1) / width); x++) {
            for (let y = 0; y < Math.ceil((this.container.offsetHeight - 1) / height); y++) {
                const center = new THREE.Vector2(x * width + width / 2, y * height + height / 2);

                geometry.vertices.push(
                    new THREE.Vector3(center.x, center.y, 0),

                    new THREE.Vector3(center.x - width / 2, center.y - height / 2, 0),
                    new THREE.Vector3(center.x - width / 2, center.y, 0),
                    new THREE.Vector3(center.x - width / 2, center.y + height / 2, 0),

                    new THREE.Vector3(center.x, center.y + height / 2, 0),

                    new THREE.Vector3(center.x + width / 2, center.y + height / 2, 0),
                    new THREE.Vector3(center.x + width / 2, center.y, 0),
                    new THREE.Vector3(center.x + width / 2, center.y - height / 2, 0),

                    new THREE.Vector3(center.x, center.y - height / 2, 0),
                );

                geometry.faces.push(
                    new THREE.Face3(9 * squareCount, 9 * squareCount + 1, 9 * squareCount + 2, null, [new THREE.Color(0xa0f3b7), new THREE.Color(0xa9f3d7), new THREE.Color(0xa0a3b7)]),
                    new THREE.Face3(9 * squareCount, 9 * squareCount + 2, 9 * squareCount + 3, null, [new THREE.Color(0xa0f3b7), new THREE.Color(0xa9f3d7), new THREE.Color(0xa0a3b7)]),
                    new THREE.Face3(9 * squareCount, 9 * squareCount + 3, 9 * squareCount + 4, null, [new THREE.Color(0xa0f3b7), new THREE.Color(0xa9f3d7), new THREE.Color(0xa0a3b7)]),
                    new THREE.Face3(9 * squareCount, 9 * squareCount + 4, 9 * squareCount + 5, null, [new THREE.Color(0xa0f3b7), new THREE.Color(0xa9f3d7), new THREE.Color(0xa0a3b7)]),
                    new THREE.Face3(9 * squareCount, 9 * squareCount + 5, 9 * squareCount + 6, null, [new THREE.Color(0xa0f3b7), new THREE.Color(0xa9f3d7), new THREE.Color(0xa0a3b7)]),
                    new THREE.Face3(9 * squareCount, 9 * squareCount + 6, 9 * squareCount + 7, null, [new THREE.Color(0xa0f3b7), new THREE.Color(0xa9f3d7), new THREE.Color(0xa0a3b7)]),
                    new THREE.Face3(9 * squareCount, 9 * squareCount + 7, 9 * squareCount + 8, null, [new THREE.Color(0xa0f3b7), new THREE.Color(0xa9f3d7), new THREE.Color(0xa0a3b7)]),
                    new THREE.Face3(9 * squareCount, 9 * squareCount + 8, 9 * squareCount + 1, null, [new THREE.Color(0xa0f3b7), new THREE.Color(0xa9f3d7), new THREE.Color(0xa0a3b7)]),
                );

                geometry.dynamic = true;

                squareCount++;
            }
        }

        const material = new THREE.ShaderMaterial({
            uniforms: {
                mouse_position: {type: "v2", value: undefined},
                min_distance: {type: "float", value: 20},
                transition_factor: {type: "float", value: 0.96}
            },

            wireframe: true,

            vertexShader: `
	void main()	{
        vec4 modelViewPosition = modelViewMatrix * vec4(position, 1.0);
        gl_Position = projectionMatrix * modelViewPosition;
	}
            `,
            fragmentShader: `
	uniform vec2 mouse_position;
	uniform float min_distance;
	uniform float transition_factor;

	void main()	{
	    float distance = distance(gl_FragCoord.xy, mouse_position);
	    
	    if(distance < min_distance) {
	        gl_FragColor = vec4(0.7, 0.7, 0.7, 1.0);
	    } else {
	        float z = transition_factor / min_distance;
	        float value = 1.0 - 1.0 / exp(z * distance - transition_factor);
	        gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0) * value + vec4(0.7, 0.7, 0.7, 1.0) * (1.0 - value);
	    }
	}
            `
        });

        this.trignoMesh = new THREE.Mesh(geometry, material);
        this.scene.add(this.trignoMesh);
    }

    render(now) {
        const delta = now - this.lastRender;
        requestAnimationFrame(now => this.render(now));

        if (delta && delta < 600) {
        }

        const smoothFunction = val => {
            return Math.sign(val) * (1 - 1 / Math.exp(2 * Math.abs(val)));
        };

        if (this.trignoMesh.material.uniforms.mouse_position.value) {
            this.trignoMesh.position.x = smoothFunction((this.mousePosition.x - this.container.offsetWidth / 2) / this.container.offsetWidth * 2) * this.container.offsetWidth * 0.01;
            this.trignoMesh.position.y = smoothFunction((this.mousePosition.y - this.container.offsetHeight / 2) / this.container.offsetHeight * 2) * this.container.offsetHeight * 0.01;

            this.lastRender = now;
            this.renderer.render(this.scene, this.camera);
        }
    }

    mouseMove(event) {
        const boundingRect = this.container.getBoundingClientRect();
        this.trignoMesh.material.uniforms.mouse_position.value = new THREE.Vector2(event.clientX - boundingRect.left, -(event.clientY - boundingRect.top) + boundingRect.height);
        this.mousePosition = new THREE.Vector2(event.clientX - boundingRect.left, event.clientY - boundingRect.top);
    }

    mouseLeave(event) {
    }

    static init(container) {
        const trignoShow = new TrignoShow(container);

        trignoShow.setupGraphics();
        trignoShow.render();

        return trignoShow;
    }
}