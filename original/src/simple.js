console.log('L-Systems Demo');

let _APP = null;

window.addEventListener('DOMContentLoaded', () => {
  _APP = new LSystemDemo();
});


const _PRESETS = [
  {
    axiom: 'X',
    rules: [
      ['F', 'FF'],
      ['X', 'F+[-F-XF-X][+FF][--XF[+X]][++F-X]'],
    ]
  },
  {
    axiom: 'FX',
    rules: [
      ['F', 'FF+[+F-F-F]-[-F+F+F]'],
    ]
  },
  {
    axiom: 'X',
    rules: [
      ['F', 'FX[FX[+XF]]'],
      ['X', 'FF[+XZ++X-F[+ZX]][-X++F-X]'],
      ['Z', '[+F-X-F][++ZX]'],
    ]
  },
  {
    axiom: 'F',
    rules: [
      ['F', 'F > F[+F]F[-F]F'],
    ]
  },
];

class LSystemDemo {
  constructor() {
    this._sentence = this._axiom;
    this._id = 0;

    this.OnChange();
  }

  OnChange() {
    this._UpdateFromUI();
    this._ApplyRules();
    this._Render();
  }

  _UpdateFromUI() {
    const preset = document.getElementById('presets').valueAsNumber;
    this._axiom = _PRESETS[preset].axiom;
    this._rules = _PRESETS[preset].rules;
    
    this._iterations = document.getElementById('iterations').valueAsNumber;
    this._leafLength = document.getElementById('leaf.length').valueAsNumber;
    this._leafWidth = document.getElementById('leaf.width').valueAsNumber;
    this._leafColor = document.getElementById('leaf.color').value;
    this._leafAlpha = document.getElementById('leaf.alpha').value;
    this._branchLength = document.getElementById('branch.length').valueAsNumber;
    this._branchWidth = document.getElementById('branch.width').valueAsNumber;
    this._branchAngle = document.getElementById('branch.angle').valueAsNumber;
    this._branchColor = document.getElementById('branch.color').value;
    this._branchLengthFalloff = document.getElementById('branch.lengthFalloff').value;
  }

  _FindMatchingRule(c) {
    for (let rule of this._rules) {
      if (c == rule[0]) {
        return rule;
      }
    }
    return null;
  }

  _ApplyRulesToSentence(sentence) {
    let newSentence = '';
    for (let i = 0; i < sentence.length; i++) {
      const c = sentence[i];

      const rule = this._FindMatchingRule(c);
      if (rule) {
        newSentence += rule[1];
      } else {
        newSentence += c;
      }
    }
    return newSentence;
  }

  _ApplyRules() {
    let cur = this._axiom;
    for (let i = 0; i < this._iterations; i++) {
      cur = this._ApplyRulesToSentence(cur);

      this._branchLength *= this._branchLengthFalloff;
    }
    this._sentence = cur;
  }

  _Render() {
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    ctx.resetTransform();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.transform(1, 0, 0, 1, canvas.width / 2, canvas.height);

    for (let i = 0; i < this._sentence.length; i++) {
      const c = this._sentence[i];

      if (c == 'F') {
        ctx.fillStyle = this._branchColor;
        ctx.fillRect(0, 0, this._branchWidth, -this._branchLength);
        ctx.transform(1, 0, 0, 1, 0, -this._branchLength);
      } else if (c == '+') {
        ctx.rotate(this._branchAngle * Math.PI / 180);
      } else if (c == '-') {
        ctx.rotate(-this._branchAngle * Math.PI / 180);
      } else if (c == '[') {
        ctx.save();
      } else if (c == ']') {
        ctx.fillStyle = this._leafColor;
        ctx.globalAlpha = this._leafAlpha;

        ctx.scale(this._leafWidth, this._leafLength);

        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(1, -1);
        ctx.lineTo(0, -4);
        ctx.lineTo(-1, -1);
        ctx.lineTo(0, 0);
        ctx.closePath();
        ctx.fill();

        ctx.restore();
      }
    }
  }
};

function APP_OnChange() {
  _APP.OnChange();
}