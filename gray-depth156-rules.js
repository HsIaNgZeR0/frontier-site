'use strict';
globalThis.FrontierGrayDepthRules156 = (() => {
  function growth(wave) {
    const steps = wave - 1 - Math.floor(wave / 5);
    return {hp: Math.pow(1.18, steps), atk: Math.pow(1.12, steps), def: Math.pow(1.10, steps)};
  }
  function drops(wave) {
    const position = (wave - 1) % 5 + 1;
    return {tickets: position === 5 ? 2 : 1, hope: [2, 2, 3, 2, 4][position - 1],
      exp: position === 5 ? 6 : 3, modules: position >= 4 ? 2 : 1,
      choices: [2, 4, 5].includes(position) ? 3 : 0};
  }
  function reward(wave, difficulty) {
    if (difficulty !== 'torment' && wave < 3) return 0;
    const exponent = difficulty === 'torment' ? wave - 1 : wave - 3;
    return Math.min(3000, (difficulty === 'torment' ? 4 : 1) * Math.pow(2, Math.min(12, exponent)));
  }
  function week(at) {
    const date = new Date(at + 4 * 3600000);
    date.setUTCDate(date.getUTCDate() - (date.getUTCDay() + 6) % 7);
    return date.toISOString().slice(0, 10);
  }
  return {growth, drops, reward, week};
})();
