class DotGravitator {

    constructor(container) {
        this.container = container;
        this.container.addEventListener("mousemove", event => this.mouseMove(event));
    }

    setupGraphics() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.OrthographicCamera(0, this.container.offsetWidth, 0, this.container.offsetHeight);

        this.renderer = new THREE.WebGLRenderer({alpha: true, antialias: true});
        this.renderer.setSize(this.container.offsetWidth, this.container.offsetHeight);
        this.container.appendChild(this.renderer.domElement);

        // create the dot
        const geometry = new THREE.CircleGeometry(15, 32);
        const material = new THREE.MeshBasicMaterial({color: 0xff0000, opacity: 0.5});

        this.dot = new THREE.Mesh(geometry, material);
        this.scene.add(this.dot);

        // backface culling :(
        this.dot.rotation.y = Math.PI;

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

        // apply acceleration
        this.dot.velocity.x += gravityX * delta / 1000;
        this.dot.velocity.y += gravityY * delta / 1000;

        // apply friction
        this.dot.velocity.x *= 0.99;
        this.dot.velocity.y *= 0.99;

        if (Math.sqrt(deltaX * deltaX + deltaY * deltaY) < 10) {
            this.dot.velocity.x *= 0.96;
            this.dot.velocity.y *= 0.96;
        }

        // outer space resistance
        if (this.dot.position.x < 0 && this.dot.velocity.x < 0 || this.dot.position.x >= this.container.offsetWidth && this.dot.velocity.x > 0) {
            this.dot.velocity.x *= 0.66;
        }
        if (this.dot.position.y < 0 && this.dot.velocity.y < 0 || this.dot.position.y >= this.container.offsetHeight && this.dot.velocity.y > 0) {
            this.dot.velocity.y *= 0.66;
        }

        if (Math.sqrt(this.dot.velocity.x * this.dot.velocity.x + this.dot.velocity.y * this.dot.velocity.y) < 10 &&
            Math.sqrt(deltaX * deltaX + deltaY * deltaY) < 5) {
            this.animating = false;
        }

        // apply velocity
        this.dot.position.x += this.dot.velocity.x * delta / 1000;
        this.dot.position.y += this.dot.velocity.y * delta / 1000;
    }

    render(now) {
        const delta = now - this.lastRender;

        if (delta && delta < 200 && this.mousePositionX && this.mousePositionY) {
            this.stepPhysics(delta);
            this.renderer.render(this.scene, this.camera);
        }

        this.lastRender = now;

        if (this.animating) {
            requestAnimationFrame(this.render.bind(this));
        } else {
            this.lastRender = undefined;
        }
    }

    mouseMove(event) {
        console.log(event);

        if (!this.mousePositionX || !this.mousePositionY) {
            this.dot.position.x = event.offsetX;
            this.dot.position.y = event.offsetY;
        }

        if (!this.animating) {
            this.animating = true;
            this.render();
        }

        this.mousePositionX = event.offsetX;
        this.mousePositionY = event.offsetY;
    }

    static init(container) {
        const dotGravitator = new DotGravitator(container);

        dotGravitator.setupGraphics();
        dotGravitator.setupPhysics();
        dotGravitator.render();

        return dotGravitator;
    }
}