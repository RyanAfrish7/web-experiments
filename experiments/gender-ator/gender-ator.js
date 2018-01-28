class GenderAtor {
    constructor(modelFile, charMap) {
        this.model = new KerasJS.Model({
            filepath: modelFile,
            gpu: false
        });

        this.charMap = charMap;
        this.vocab_length = Object.keys(this.charMap).length;
        this.ready = this.model.ready();
    }

    static init() {
        return new GenderAtor('model.bin', {
            'a': 1,
            'b': 2,
            'c': 3,
            'd': 4,
            'e': 5,
            'f': 6,
            'g': 7,
            'h': 8,
            'i': 9,
            'j': 10,
            'k': 11,
            'l': 12,
            'm': 13,
            'n': 14,
            'o': 15,
            'p': 16,
            'q': 17,
            'r': 18,
            's': 19,
            't': 20,
            'u': 21,
            'v': 22,
            'w': 23,
            'x': 24,
            'y': 25,
            'z': 26,
            ' ': 27,
            '.': 28,
            'END': 0
        });
    }

    oneHotVector(index) {
        const vec = new Array(this.vocab_length).fill(0);
        vec[index] = 1;
        return vec;
    }

    async predict(name) {
        await this.ready;

        const inputArray = [];

        for (let char of name.slice(0, 24)) {
            if (char in this.charMap) {
                inputArray.push(...this.oneHotVector(this.charMap[char]));
            }
        }

        while (inputArray.length < this.vocab_length * 24) {
            inputArray.push(...this.oneHotVector(this.charMap["END"]))
        }

        const inputData = {
            input: new Float32Array(inputArray)
        };

        return this.model.predict(inputData).then(outputData => outputData["output"])
    }
}