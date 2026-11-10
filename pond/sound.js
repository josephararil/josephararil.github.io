// Part of the koi pond. Moved verbatim from the original single script; see README.
// Rule: never call an imported function or read an imported mutable binding at top level, only inside functions.

/* ---------- sound: off until asked for ---------- */
var ac = null, master = null, noiseBuf = null, soundOn = false, trickle = 0;
var soundBtn = document.getElementById('sound'), soundLbl = document.getElementById('soundLbl');
function initAudio() {
  var AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return false;
  ac = new AC();
  master = ac.createGain(); master.gain.value = 0; master.connect(ac.destination);
  var len = ac.sampleRate * 2;
  noiseBuf = ac.createBuffer(1, len, ac.sampleRate);
  var d = noiseBuf.getChannelData(0), b = 0;
  for (var i = 0; i < len; i++) { b = b * 0.6 + (Math.random() * 2 - 1) * 0.4; d[i] = b; }
  var src = ac.createBufferSource(); src.buffer = noiseBuf; src.loop = true;
  var bp = ac.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 1500; bp.Q.value = 0.6;
  var hp = ac.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 500;
  var g = ac.createGain(); g.gain.value = 0.085;
  var lfo = ac.createOscillator(); lfo.frequency.value = 0.19;
  var lg = ac.createGain(); lg.gain.value = 520;
  var lfo2 = ac.createOscillator(); lfo2.frequency.value = 0.31;
  var lg2 = ac.createGain(); lg2.gain.value = 0.03;
  lfo.connect(lg); lg.connect(bp.frequency); lfo2.connect(lg2); lg2.connect(g.gain);
  src.connect(bp); bp.connect(hp); hp.connect(g); g.connect(master);
  src.start(); lfo.start(); lfo2.start();
  return true;
}
function plip(vol, base) {
  if (!soundOn || !ac) return;
  var t = ac.currentTime, o = ac.createOscillator(), g = ac.createGain();
  o.type = 'sine';
  o.frequency.setValueAtTime(base, t);
  o.frequency.exponentialRampToValueAtTime(base * 2.3, t + 0.075);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.linearRampToValueAtTime(vol, t + 0.008);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.17);
  o.connect(g); g.connect(master); o.start(t); o.stop(t + 0.2);
  var n = ac.createBufferSource(); n.buffer = noiseBuf;
  var f = ac.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = base * 3.2; f.Q.value = 1.4;
  var ng = ac.createGain();
  ng.gain.setValueAtTime(vol * 0.7, t); ng.gain.exponentialRampToValueAtTime(0.0001, t + 0.05);
  n.connect(f); f.connect(ng); ng.connect(master);
  n.start(t, Math.random() * 1.5, 0.07);
}
/* the button listener that used to attach at load; main.js calls this once */
function initSound() {
  soundBtn.addEventListener('click', function () {
    if (!ac && !initAudio()) { soundLbl.textContent = 'no sound on this device'; return; }
    soundOn = !soundOn;
    if (soundOn) ac.resume();
    master.gain.cancelScheduledValues(ac.currentTime);
    master.gain.setTargetAtTime(soundOn ? 0.75 : 0, ac.currentTime, soundOn ? 0.5 : 0.18);
    soundBtn.setAttribute('aria-pressed', soundOn ? 'true' : 'false');
    soundLbl.textContent = soundOn ? 'water sound, on' : 'water sound, off';
  });
}
function isSoundOn() { return soundOn; }
/* the trickle that update() used to run inline */
function updateSound(dt) {
  if (soundOn) {
    trickle -= dt;
    if (trickle <= 0) { trickle = 0.05 + Math.random() * 0.3; plip(0.012 + Math.random() * 0.022, 900 + Math.random() * 2100); }
  }
}

export { plip, isSoundOn, initSound, updateSound };
