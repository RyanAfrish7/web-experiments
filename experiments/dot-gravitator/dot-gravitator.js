class DotGravitator {

    constructor(container) {
        this.container = container;
        this.container.addEventListener("mousemove", event => this.mouseMove(event));
        this.container.addEventListener("mousedown", event => this.mouseDown(event));
        this.container.addEventListener("mouseup", event => this.mouseUp(event));
        this.container.addEventListener("mouseleave", event => this.mouseLeave(event));
    }

    setupGraphics() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.OrthographicCamera(0, this.container.offsetWidth, 0, this.container.offsetHeight);

        this.renderer = new THREE.WebGLRenderer({alpha: true, antialias: true});
        this.renderer.setSize(this.container.offsetWidth, this.container.offsetHeight);
        this.renderer.domElement.style.cursor = "none";
        this.container.appendChild(this.renderer.domElement);

        // create the dot
        this.dotGeometry = new THREE.Geometry();
        this.dotGeometry.dynamic = true;

        const dotSegmentsCount = 72;

        for (let i = 0; i < dotSegmentsCount + 1; i++) {
            const theta = i / dotSegmentsCount * Math.PI * 2;
            this.dotGeometry.vertices.push(new THREE.Vector3(Math.cos(theta) * 12, Math.sin(theta) * 12, 0));
        }

        this.dot = new THREE.Line(this.dotGeometry, new THREE.LineBasicMaterial({
            color: 0xff0000,
            opacity: 0.5,
            linewidth: 2
        }));
        this.scene.add(this.dot);

        // create the pointer
        this.pointer = new THREE.Mesh(
            new THREE.CircleGeometry(4, 12),
            new THREE.MeshBasicMaterial({color: 0xff0000, opacity: 0.7})
        );
        this.scene.add(this.pointer);

        // backface culling :(
        this.dot.rotation.y = Math.PI;
        this.pointer.rotation.y = Math.PI;

        // add breathe to dot
        new TWEEN.Tween(this.dot.scale)
            .to({
                x: 1.2,
                y: 1.2
            }, 4000)
            .repeat(Infinity).yoyo(true)
            .start();

        this.camera.position.z = 5;
    }

    setupPhysics() {
        this.dot.velocity = {x: 0, y: 0, z: 0};
        this.gravity = 500;
    }

    stepPhysics(delta) {
        const deltaX = this.mousePositionX - this.dot.position.x;
        const deltaY = this.mousePositionY - this.dot.position.y;

        const gravityX = this.gravity * Math.cos(Math.atan2(deltaY, deltaX));
        const gravityY = this.gravity * Math.sin(Math.atan2(deltaY, deltaX));

        const rmsVelocity = Math.sqrt(this.dot.velocity.x * this.dot.velocity.x + this.dot.velocity.y * this.dot.velocity.y);
        const rmsDistance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

        // apply acceleration
        this.dot.velocity.x += gravityX * delta / 1000;
        this.dot.velocity.y += gravityY * delta / 1000;

        // apply friction
        this.dot.velocity.x *= 0.99;
        this.dot.velocity.y *= 0.99;

        if (Math.sqrt(deltaX * deltaX + deltaY * deltaY) < 10) {
            this.dot.velocity.x *= 0.90;
            this.dot.velocity.y *= 0.90;
        }

        // outer space resistance
        if (this.dot.position.x < 0 && this.dot.velocity.x < 0 || this.dot.position.x >= this.container.offsetWidth && this.dot.velocity.x > 0) {
            this.dot.velocity.x *= 0.66;
        }
        if (this.dot.position.y < 0 && this.dot.velocity.y < 0 || this.dot.position.y >= this.container.offsetHeight && this.dot.velocity.y > 0) {
            this.dot.velocity.y *= 0.66;
        }

        // apply velocity
        this.dot.position.x += this.dot.velocity.x * delta / 1000;
        this.dot.position.y += this.dot.velocity.y * delta / 1000;

        if (rmsVelocity < 10 && rmsDistance < 3) {
            this.dot.velocity.x = this.dot.velocity.y = 0;
            this.dot.position.x = this.mousePositionX;
            this.dot.position.y = this.mousePositionY;
        }
    }

    render(now) {
        const delta = now - this.lastRender;

        if (delta && delta < 200 && this.mousePositionX && this.mousePositionY) {
            this.stepPhysics(delta);
            TWEEN.update();
            this.renderer.render(this.scene, this.camera);
        }

        this.lastRender = now;

        requestAnimationFrame(this.render.bind(this));
    }

    mouseMove(event) {
        if (!this.mousePositionX || !this.mousePositionY) {
            this.dot.position.x = event.offsetX;
            this.dot.position.y = event.offsetY;
        }

        this.pointer.position.x = event.offsetX;
        this.pointer.position.y = event.offsetY;

        this.mousePositionX = event.offsetX;
        this.mousePositionY = event.offsetY;
    }

    mouseDown() {
        this.scalingAnimation = [
            new TWEEN.Tween(this.pointer.scale)
                .to({
                    x: 2,
                    y: 2
                }, 200)
                .easing(TWEEN.Easing.Quadratic.Out)
                .start(),
            new TWEEN.Tween(this)
                .to({
                    gravity: 2000
                }, 200)
                .easing(TWEEN.Easing.Quadratic.Out)
                .start()
        ];
    }

    mouseUp() {
        if (this.scalingAnimation) {
            this.scalingAnimation.forEach(tween => tween.stop());
        }

        this.scalingAnimation = [
            new TWEEN.Tween(this.pointer.scale)
                .to({
                    x: 1,
                    y: 1
                }, 100)
                .easing(TWEEN.Easing.Quadratic.In)
                .start(),
            new TWEEN.Tween(this)
                .to({
                    gravity: 500
                }, 100)
                .easing(TWEEN.Easing.Quadratic.In)
                .start()
        ];

        this.gravity = 500;
    }

    mouseLeave() {
        this.mouseUp();
    }

    static init(container) {
        const dotGravitator = new DotGravitator(container);

        dotGravitator.setupGraphics();
        dotGravitator.setupPhysics();
        dotGravitator.render();

        return dotGravitator;
    }
}