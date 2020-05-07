import {random} from './random.js';

console.log('L-Systems Demo');

let _APP = null;

window.addEventListener('DOMContentLoaded', () => {
  _APP = new LSystemDemo();

  const inputs = document.querySelectorAll('input');
  inputs.forEach(i => {
    i.onchange = () => {
      _APP.OnChange();
    };
  });
});


const _PRESETS = [
  {
    axiom: 'F',
    rules: [
      {
        symbol: 'F', odds: 1.0,
        Iterate: (prev) => {
          const newSymbolChars = 'F[+X]F[-X]X';
          const symbols = newSymbolChars.split('').map(
            c => ({symbol: c, params: {age: prev.params.age - 1}}));

          symbols[0].params.age = prev.params.age;
          symbols[10].params.age = prev.params.age;
          return symbols;
        },
      },
      {
        symbol: 'X', odds: 1.0,
        Iterate: (prev) => {
          const newSymbolChars = 'F[+L]F[-L]L';
          const symbols = newSymbolChars.split('').map(
            c => ({symbol: c, params: {age: prev.params.age - 1}}));

          symbols[0].params.age = prev.params.age;
          symbols[10].params.age = prev.params.age;
          return symbols;
        },
      },
    ]
  },
  {
    axiom: 'L',
    rules: [
      {
        symbol: 'L', odds: 1.0,
        Iterate: (prev) => {
          const newSymbolChars = 'F[+L]F[-L]L';
          const symbols = newSymbolChars.split('').map(
            c => ({symbol: c, params: {age: prev.params.age - 1}}));

          symbols[0].params.age = prev.params.age;
          symbols[10].params.age = prev.params.age;
          return symbols;
        },
      },
    ]
  },
  {
    axiom: 'L',
    rules: [
      {
        symbol: 'L', odds: 0.33,
        Iterate: (prev) => {
          const newSymbolChars = 'F[+L]F[-L]+L';
          const symbols = newSymbolChars.split('').map(
            c => ({symbol: c, params: {age: prev.params.age - 1}}));

            symbols[3].params.age = prev.params.age - 2;
            symbols[8].params.age = prev.params.age - 2;

            symbols[0].params.age = prev.params.age;
            symbols[symbols.length - 1].params.age = prev.params.age;
            symbols[symbols.length - 4].params.age = prev.params.age;

          return symbols;
        },
      },
      {
        symbol: 'L', odds: 0.33,
        Iterate: (prev) => {
          const newSymbolChars = 'F[-L]F[-L]+L';
          const symbols = newSymbolChars.split('').map(
            c => ({symbol: c, params: {age: prev.params.age - 1}}));

          symbols[3].params.age = prev.params.age - 2;
          symbols[8].params.age = prev.params.age - 2;
          
          symbols[0].params.age = prev.params.age;
          symbols[symbols.length - 1].params.age = prev.params.age;
          symbols[symbols.length - 4].params.age = prev.params.age;

          return symbols;
        },
      },
      {
        symbol: 'L', odds: 0.34,
        Iterate: (prev) => {
          const newSymbolChars = 'F[-L]F+L';
          const symbols = newSymbolChars.split('').map(
            c => ({symbol: c, params: {age: prev.params.age - 1}}));

            symbols[3].params.age = prev.params.age - 2;

            symbols[0].params.age = prev.params.age;
            symbols[symbols.length - 1].params.age = prev.params.age;

          return symbols;
        },
      },
      {
        symbol: 'F', odds: 1.0,
        Iterate: (prev) => {
          const newSymbolChars = 'FF';
          const symbols = newSymbolChars.split('').map(
            c => ({symbol: c, params: {age: prev.params.age - 1}}));

          symbols[0].params.age = prev.params.age;

          return symbols;
        },
      },
    ]
  },
];


function _RouletteSelection(rules) {
  const roll = random.Random();
  let sum = 0;
  for (let r of rules) {
    sum += r.odds;
    if (roll < sum) {
      return r;
    }
  }
  return rules[sortedParents.length - 1];
}


class LSystemDemo {
  constructor() {
    document.getElementById('presets').max = _PRESETS.length - 1;

    this._id = 0;

    this.OnChange();
  }

  OnChange() {
    this._UpdateFromUI();
    this._ApplyRules();

    // When we see that this changed, stop rendering.
    this._id++;

    const iteratorID = this._id;
    this._animationTimeElapsed = 0.0;
    this._totalAnimationTime = this._iterations * 20.0 / this._animationSpeed;
    this._previousRAF = null;

    if (this._animate) {
      const _RAF = (t) => {
        if (this._id != iteratorID) {
          return;
        }
        if (this._previousRAF === null) {
          this._previousRAF = t;
        }

        const timeInSeconds = (t - this._previousRAF) / 1000.0;
        this._animationTimeElapsed += timeInSeconds;
        this._Animate(timeInSeconds * this._animationSpeed);
        this._previousRAF = t;

        requestAnimationFrame((t) => {
          _RAF(t);
        });
      };
      requestAnimationFrame((t) => {
        _RAF(t);
      });
    } else {
      this._animationTimeElapsed = this._totalAnimationTime;
      this._Animate(this._totalAnimationTime);
    }
  }

  _UpdateFromUI() {
    const preset = document.getElementById('presets').valueAsNumber;
    this._axiom = _PRESETS[preset].axiom;
    this._rules = _PRESETS[preset].rules;
    
    this._backgroundColor = document.getElementById('background.color').value;
    document.body.bgColor = this._backgroundColor;

    this._animate = document.getElementById('animate').checked;
    this._animationSpeed = document.getElementById('animation.speed').valueAsNumber;
    this._animationAgeSpeed = document.getElementById('animation.age').valueAsNumber;
    this._iterations = document.getElementById('iterations').valueAsNumber;
    this._seed = document.getElementById('seed').value;
    this._variability = document.getElementById('variability').valueAsNumber;
    this._leafType = document.getElementById('leaf.type').valueAsNumber;
    this._leafLength = document.getElementById('leaf.length').valueAsNumber;
    this._leafWidth = document.getElementById('leaf.width').valueAsNumber;
    this._leafColor = document.getElementById('leaf.color').value;
    this._leafAlpha = document.getElementById('leaf.alpha').value;
    this._leafRepeat = document.getElementById('leaf.repeat').value;
    this._branchLength = document.getElementById('branch.length').valueAsNumber;
    this._branchWidth = document.getElementById('branch.width').valueAsNumber;
    this._branchAngle = document.getElementById('branch.angle').valueAsNumber;
    this._branchColor = document.getElementById('branch.color').value;
    this._branchWidthFalloff = document.getElementById('branch.widthFalloff').valueAsNumber;

    random.Seed(this._seed);
  }

  _ApplyRulesToSentence(sentence) {
    const newSentence = [];
    for (let i = 0; i < sentence.length; i++) {
      const s = sentence[i];

      const matchingRules = [];
      for (let rule of this._rules) {
        if (s.symbol == rule.symbol) {
          matchingRules.push(rule);
        }
      }
      if (matchingRules.length > 0) {
        const rule = _RouletteSelection(matchingRules);
        const newSymbols = rule.Iterate(s);
        newSentence.push(...newSymbols.map(cur => this._CreateParameterizedSymbol(cur, s.params)))
      } else {
        newSentence.push(s);
      }
    }
    return newSentence;
  }

  _ApplyRules() {
    let cur = [...this._axiom.split('').map(c => this._CreateParameterizedSymbol({symbol: c}))];

    for (let i = 0; i < this._iterations; i++) {
      cur = this._ApplyRulesToSentence(cur);
    }
    this._sentence = cur;
  }

  _CreateParameterizedSymbol(c, params) {
    let symbol = c;
    if (!c.params) {
      c.params = {age: 0.0};
    }

    if (c.symbol == 'F') {
      const branchLengthMult = 1.0;
      const randomLength = random.RandomRange(
          this._branchLength * (1 - this._variability),
          this._branchLength * (1 + this._variability));
      const branchLength = branchLengthMult * randomLength;

      symbol.params = {...symbol.params, ...{branchLength: branchLength}};
    } else if (c.symbol == '+' || c.symbol == '-') {
      const baseAngle = this._branchAngle;
      const randomAngleMult = random.RandomRange(
          (1 - this._variability), (1 + this._variability))
      const finalAngle = baseAngle * randomAngleMult;

      symbol.params = {...symbol.params, ...{angle: finalAngle}};
    } else if (c.symbol == 'L') {
      const leafWidth = random.RandomRange(
        this._leafWidth * (1 - this._variability),
        this._leafWidth * (1 + this._variability));
      const leafLength = random.RandomRange(
        this._leafLength * (1 - this._variability),
        this._leafLength * (1 + this._variability));
      symbol.params = {...symbol.params, ...{width: leafWidth, length: leafLength}};
    }

    return symbol;
  }

  _Animate(timeElapsed) {
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    ctx.resetTransform();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.transform(1, 0, 0, 1, canvas.width / 2, canvas.height);

    for (let i = 0; i < this._sentence.length; i++) {
      this._sentence[i].params.age += timeElapsed * this._animationAgeSpeed;
    }

    ctx.shadowBlur = 5;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    ctx.shadowColor = '#000000';

    this._RenderToContext(ctx);

    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    ctx.resetTransform();
    ctx.transform(1, 0, 0, 1, canvas.width / 2, canvas.height);

    this._RenderToContext(ctx);
  }

  _RenderToContext(ctx, timeElapsed) {
    const stateStack = [];

    const widthFactor = Math.max(0.0, (1.0 / (1.0 + Math.exp(-this._animationTimeElapsed / 10.0))) * 2 - 1);
    const widthByAge = this._branchWidth * Math.max(0.25, widthFactor);

    let currentState = {
      width: widthByAge,
    };

    const leafFactor = 1.0;
    const totalAgeFactor = Math.min(1.0, this._animationTimeElapsed / this._totalAnimationTime) ** 0.5;

    for (let i = 0; i < this._sentence.length; i++) {
      const s = this._sentence[i];
      const c = s.symbol;
      const params = s.params;

      const ageFactor = Math.max(0.0, (1.0 / (1.0 + Math.exp(-params.age))) * 2 - 1);

      if (c == 'F') {
        ctx.fillStyle = this._branchColor;
        ctx.strokeStyle = this._branchColor;
        const w1 = currentState.width;
        currentState.width *= (1 - (1 - this._branchWidthFalloff) ** 3);
        currentState.width = Math.max(widthByAge * 0.25, currentState.width);
        const w2 = currentState.width;
        const l = params.branchLength * ageFactor;

        if (ageFactor > 0) {
          ctx.beginPath();
          ctx.moveTo(-w2 / 2, -l);
          ctx.lineTo(-w1 / 2, 1);
          ctx.lineTo(w1 / 2, 1);
          ctx.lineTo(w2 / 2, -l);
          ctx.lineTo(-w2 / 2, -l);
          ctx.closePath();
          ctx.fill();
  
          ctx.globalAlpha = 0.2;
          ctx.beginPath();
          ctx.moveTo(-w2 / 2, -l);
          ctx.lineTo(-w1 / 2, 0);
          ctx.closePath();
          ctx.stroke();
  
          ctx.beginPath();
          ctx.moveTo(w1 / 2, 0);
          ctx.lineTo(w2 / 2, -l);
          ctx.closePath();
          ctx.stroke();
  
          ctx.transform(1, 0, 0, 1, 0, -l);
          ctx.globalAlpha = 1.0;
        }
      } else if (c == 'L') {
        if (ageFactor > 0) {
          ctx.fillStyle = this._leafColor;
          ctx.strokeStyle = this._leafColor;
          ctx.globalAlpha = this._leafAlpha;
  
          const _DrawLeaf = () => {
            ctx.save();
            ctx.scale(params.width * ageFactor * leafFactor, params.length * ageFactor * leafFactor);
            if (this._leafType == 0) {
              ctx.beginPath();
              ctx.moveTo(0, 0);
              ctx.lineTo(1, -1);
              ctx.lineTo(0, -4);
              ctx.lineTo(-1, -1);
              ctx.lineTo(0, 0);
              ctx.closePath();
              ctx.fill();
              ctx.stroke();
            } else if (this._leafType == 1) {
              ctx.beginPath();
              ctx.arc(0, -2, 2, 0, 2 * Math.PI);
              ctx.closePath();
              ctx.fill();
              ctx.stroke();
            } else if (this._leafType == 2) {
              ctx.beginPath();
              ctx.moveTo(0, 0);
              ctx.lineTo(1, -1);
              ctx.lineTo(1, -4);
              ctx.lineTo(0, -5);
              ctx.lineTo(-1, -4);
              ctx.lineTo(-1, -1);
              ctx.lineTo(0, 0);
              ctx.closePath();
              ctx.fill();
              ctx.stroke();
    
              ctx.fillRect(0, 0, 0.25, -5);
            } else if (this._leafType == 3) {
              ctx.beginPath();
              ctx.arc(0, -2, 2, 0, 2 * Math.PI);
              ctx.closePath();
              ctx.fill();
              ctx.stroke();
            }
            ctx.restore();
          }
  
          _DrawLeaf();
          if (this._leafRepeat > 1) {
            ctx.save();
            for (let r = 0; r < this._leafRepeat; r++) {
              ctx.rotate((r + 1) * 5 * Math.PI / 180);
              _DrawLeaf();
            }
            ctx.restore();
            ctx.save();
            for (let r = 0; r < this._leafRepeat; r++) {
              ctx.rotate(-(r + 1) * 5 * Math.PI / 180);
              _DrawLeaf();
            }
            ctx.restore();
          }
          ctx.globalAlpha = 1.0;
        }
      } else if (c == '+') {
        const a = params.angle;
        ctx.rotate(a * Math.PI / 180);
      } else if (c == '-') {
        const a = params.angle;
        ctx.rotate(-a * Math.PI / 180);
      } else if (c == '[') {
        ctx.save();
        stateStack.push({...currentState});
      } else if (c == ']') {
        ctx.restore();
        currentState = stateStack.pop();
      }
    }
  }
};
