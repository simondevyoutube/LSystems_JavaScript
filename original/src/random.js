// The reason we use our own random instead of Math.random() is because
// we can seed this, and thus get the same L-System each time we view.
// Otherwise, when you view the same L-System with the same parameters,
// using Math.random(), it'll change each time.
//
// Code from https://stackoverflow.com/questions/521295/

export const random = (function() {

  function xmur3(str) {
    for(var i = 0, h = 1779033703 ^ str.length; i < str.length; i++)
        h = Math.imul(h ^ str.charCodeAt(i), 3432918353),
        h = h << 13 | h >>> 19;
    return function() {
        h = Math.imul(h ^ h >>> 16, 2246822507);
        h = Math.imul(h ^ h >>> 13, 3266489909);
        return (h ^= h >>> 16) >>> 0;
    }
  }

  function sfc32(a, b, c, d) {
    return function() {
      a >>>= 0; b >>>= 0; c >>>= 0; d >>>= 0; 
      var t = (a + b) | 0;
      a = b ^ b >>> 9;
      b = c + (c << 3) | 0;
      c = (c << 21 | c >>> 11);
      d = d + 1 | 0;
      t = t + d | 0;
      c = c + t | 0;
      return (t >>> 0) / 4294967296;
    }
  }

  let _SeededRandom = null;

  function _Random() {
    if (!_SeededRandom) {
      _Seed('abc');
    }

    return _SeededRandom();
  }

  function _RandomRange(a, b) {
    return _Random() * (b - a) + a;
  }

  function _Seed(s) {
    const seed = xmur3(s + '');
    _SeededRandom = sfc32(seed(), seed(), seed(), seed());
  }

  return {
    Seed: _Seed,
    Random: _Random,
    RandomRange: _RandomRange,
  }
})();

