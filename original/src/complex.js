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
      {symbol: 'F', odds: 0.33, newSymbols: 'F[+F]F[-F][F]'},
      {symbol: 'F', odds: 0.33, newSymbols: 'F[+F][F]'},
      {symbol: 'F', odds: 0.34, newSymbols: 'F[-F][F]'},
    ]
  },
  {
    axiom: 'X',
    rules: [
      {symbol: 'F', odds: 1.0, newSymbols: 'FF'},
      {symbol: 'X', odds: 1.0, newSymbols: 'F+[-F-XF-X][+FF][--XF[+X]][++F-X]'},
    ]
  },
  {
    axiom: 'F',
    rules: [
      {symbol: 'F', odds: 1.0, newSymbols: 'FF+[+F-F-F]-[-F+F+F]'},
    ]
  },
  {
    axiom: 'X',
    rules: [
      {symbol: 'F', odds: 1.0, newSymbols: 'FX[FX[+XF]]'},
      {symbol: 'X', odds: 1.0, newSymbols: 'FF[+XZ++X-F[+ZX]][-X++F-X]'},
      {symbol: 'Z', odds: 1.0, newSymbols: '[+F-X-F][++ZX]'},
    ]
  },
  {
    axiom: 'F',
    rules: [
      {symbol: 'F', odds: 1.0, newSymbols: 'F[+F]F[-F]F'},
    ]
  },
  {
    axiom: 'X',
    rules: [
      {symbol: 'X', odds: 0.33, newSymbols: 'F[+X]F[-X]+X'},
      {symbol: 'X', odds: 0.33, newSymbols: 'F[-X]F[-X]+X'},
      {symbol: 'X', odds: 0.34, newSymbols: 'F[-X]F+X'},
      {symbol: 'F', odds: 1.0, newSymbols: 'FF'},
    ]
  },
  {
    axiom: 'X',
    rules: [
      {symbol: 'X', odds: 1.0, newSymbols: 'F[-[[X]+X]]+F[+FX]-X'},
      {symbol: 'F', odds: 1.0, newSymbols: 'FF'},
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

    if (this._animate) {
      this._iterator = this._RenderAsync();
      this._id++;
  
      // When we see that this changed, stop rendering.
      const iteratorID = this._id;
  
      const _PumpIterator = () => {
        if (this._id != iteratorID) {
          return;
        }
  
        const r = this._iterator.next();
        if (!r.done) {
          window.setTimeout(_PumpIterator, 0);
        }
      };
      _PumpIterator();
    } else {
      this._iterator = this._RenderAsync();

      while (!this._iterator.next().done);
  }
  }

  _UpdateFromUI() {
    const preset = document.getElementById('presets').valueAsNumber;
    this._axiom = _PRESETS[preset].axiom;
    this._rules = _PRESETS[preset].rules;
    
    this._backgroundColor = document.getElementById('background.color').value;
    document.body.bgColor = this._backgroundColor;

    this._iterations = document.getElementById('iterations').valueAsNumber;
    this._animate = document.getElementById('animate').checked;
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
      const [c, params] = sentence[i];

      const matchingRules = [];
      for (let rule of this._rules) {
        if (c == rule.symbol) {
          matchingRules.push(rule);
        }
      }
      if (matchingRules.length > 0) {
        const rule = _RouletteSelection(matchingRules);
        newSentence.push(...rule.newSymbols.split('').map(
            c => [c, this._CreateParameterizedSymbol(c, params)]));
      } else {
        newSentence.push([c, params]);
      }
    }
    return newSentence;
  }

  _ApplyRules() {
    let cur = [...this._axiom.split('').map(c => [c, this._CreateParameterizedSymbol(c, {})])];

    for (let i = 0; i < this._iterations; i++) {
      cur = this._ApplyRulesToSentence(cur);
    }
    this._sentence = cur;
  }

  _CreateParameterizedSymbol(c, params) {
    if (c == 'F') {
      const branchLengthMult = 1.0;
      const randomLength = random.RandomRange(
          this._branchLength * (1 - this._variability),
          this._branchLength * (1 + this._variability));
      const branchLength = branchLengthMult * randomLength;
      return {
        branchLength: branchLength,
      };
    } else if (c == '+' || c == '-') {
      const baseAngle = this._branchAngle;
      const randomAngleMult = random.RandomRange(
          (1 - this._variability), (1 + this._variability))
      const finalAngle = baseAngle * randomAngleMult;
      return {
        angle: finalAngle,
      };
    }

    return {};
  }

  *_RenderAsync() {
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    ctx.resetTransform();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.transform(1, 0, 0, 1, canvas.width / 2, canvas.height);

    const stateStack = [];
    let currentState = {
      width: this._branchWidth,
    };

    for (let i = 0; i < this._sentence.length; i++) {
      yield;
      const [c, params] = this._sentence[i];

      if (c == 'F') {
        ctx.fillStyle = this._branchColor;
        const w1 = currentState.width;
        currentState.width *= (1 - (1 - this._branchWidthFalloff) ** 3);
        currentState.width = Math.max(this._branchWidth * 0.25, currentState.width);
        const w2 = currentState.width;
        const l = params.branchLength;

        ctx.beginPath();
        ctx.moveTo(-w2 / 2, -l - 1);
        ctx.lineTo(-w1 / 2, 1);
        ctx.lineTo(w1 / 2, 1);
        ctx.lineTo(w2 / 2, -l - 1);
        ctx.lineTo(-w2 / 2, -l - 1);
        ctx.closePath();
        ctx.fill();

        ctx.transform(1, 0, 0, 1, 0, -l);
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
        ctx.fillStyle = this._leafColor;
        ctx.strokeStyle = this._leafColor;
        ctx.globalAlpha = this._leafAlpha;

        const _DrawLeaf = () => {
          ctx.save();

          const leafWidth = random.RandomRange(
              this._leafWidth * (1 - this._variability),
              this._leafWidth * (1 + this._variability));
          const leafLength = random.RandomRange(
              this._leafLength * (1 - this._variability),
              this._leafLength * (1 + this._variability));
          ctx.scale(leafWidth, leafLength);
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

        ctx.restore();
        currentState = stateStack.pop();
      }
    }
  }
};
