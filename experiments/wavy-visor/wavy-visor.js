class WavyVisor {

    get waves() {
        return this._waves;
    }

    set waves(val) {
        this._waves.forEach(wave => this.scene.remove(wave.object));
        this._waves = val;
        this._waves.forEach(wave => this.scene.add(wave.object));
    }

    constructor(container) {
        this.container = container;
        this._waves = [];
    }

    setupGraphics() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.OrthographicCamera(0, 1, -1.2, 1.2);

        this.renderer = new THREE.WebGLRenderer({alpha: true, antialias: true});
        this.renderer.setSize(this.container.offsetWidth, this.container.offsetHeight);
        this.container.appendChild(this.renderer.domElement);

        this.camera.position.z = 5;
    }

    render(now) {
        const delta = now - this.lastRender;
        requestAnimationFrame(now => this.render(now));

        if (delta && delta < 600) {
            for (const wave of this._waves) {
                wave.animate(delta);
            }
        }

        this.lastRender = now;

        this.renderer.render(this.scene, this.camera);
    }

    static init(container, waves) {
        const wavyVisor = new WavyVisor(container);

        wavyVisor.setupGraphics();
        wavyVisor.waves = waves || WavyVisor.generateWaves({segments: container.offsetWidth});
        wavyVisor.render();

        return wavyVisor;
    }

    static generateWaves(parameters) {
        const wavesCount = 3;
        const waves = [];

        for (let i = 0; i < wavesCount; i++) {
            const offset = i / wavesCount;

            // wave configurations here
            waves.push(
                new Wave({
                    color: new THREE.Color(`hsl(170, 38%, ${Math.floor(offset * 40 + 60)}%)`),
                    opacity: 1,
                    linewidth: Math.random() * 3 + 1,
                    segments: parameters.segments,
                    frequency: 2,
                    phase: Math.random() * Math.PI * 2,
                    timePeriod: 4000,
                    amplitudeMax: 1,
                    amplitudePhase: Math.random() * Math.PI * 2,
                    amplitudeFrequency: 0.5,
                    amplitudeTimePeriod: 5000,
                    phasePhase: Math.random() * Math.PI * 2,
                    phaseFrequency: 0.05,
                    phaseTimePeriod: 3000
                })
            );
        }

        return waves;
    }
}

class Wave {
    constructor(parameters) {
        const material = new THREE.LineBasicMaterial({
            color: parameters.color,
            linewidth: parameters.linewidth,
            opacity: parameters.opacity
        });

        this.phase = parameters.phase;
        this.frequency = parameters.frequency;
        this.timePeriod = parameters.timePeriod;

        this.amplitudeMax = parameters.amplitudeMax;
        this.amplitudePhase = parameters.amplitudePhase;
        this.amplitudeFrequency = parameters.amplitudeFrequency;
        this.amplitudeTimePeriod = parameters.amplitudeTimePeriod;

        this.phasePhase = parameters.phasePhase;
        this.phaseFrequency = parameters.phaseFrequency;
        this.phaseTimePeriod = parameters.phaseTimePeriod;

        this.geometry = new THREE.Geometry();
        this.geometry.dynamic = true;

        for (let i = 0; i < parameters.segments; i++) {
            const offset = i / parameters.segments;
            this.geometry.vertices.push(new THREE.Vector3(offset, Math.sin(2 * Math.PI * this.frequency * offset + this.phase) * this.amplitude, 0));
        }

        this.object = new THREE.Line(this.geometry, material);
    }

    phaseModulator(delta) {
        this.phasePhase += delta / this.phaseTimePeriod * Math.PI * 2;
        this.phaseMod = Math.sin(2 * Math.PI * this.phaseFrequency * this.phasePhase);
    }

    amplitudeModulator(delta) {
        this.amplitudePhase += delta / this.amplitudeTimePeriod * Math.PI * 2;

        this.amplitude = this.amplitudeMax * Math.sin(2 * Math.PI * this.amplitudeFrequency * this.amplitudePhase);
    }

    animate(delta) {
        this.amplitudeModulator(delta);
        this.phaseModulator(delta);

        this.phase += delta / this.timePeriod * Math.PI * 2 * this.phaseMod;

        for (let i = 0; i < this.geometry.vertices.length; i++) {
            const offset = i / this.geometry.vertices.length;
            this.geometry.vertices[i].y = Math.sin(2 * Math.PI * this.frequency * offset + this.phase) * this.amplitude * 2 * (0.5 - Math.abs(offset - 0.5));
        }
        this.geometry.verticesNeedUpdate = true;
    }
}