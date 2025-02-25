import JSZip from "jszip";

export const getSoundManager = () => sm;
export const playSound = (sound: string) => getSoundManager().playSound(sound);
export class SoundManager {
  soundBufs: Record<string, AudioBuffer>;
  audioContext: AudioContext;
  gainNode: GainNode;
  muted: boolean;
  previousVolume: number;

  constructor() {
    this.soundBufs = {};
    this.audioContext = new (window.AudioContext ||
      //@ts-ignore webkitaudiocontext exists
      window.webkitAudioContext)();
    this.gainNode = this.audioContext.createGain();
    this.gainNode.connect(this.audioContext.destination);
    this.muted = false;
    this.previousVolume = 0.28;
    this.queue = new Set();

    const theme = document.documentElement.dataset.theme;
    let currentTheme = theme;
    document.addEventListener("theme-change", () => {
      const theme = document.documentElement.dataset.theme;
      if (theme !== currentTheme) {
        // if (theme === "wiiu") {
        //   loadBaseSounds("./assets/audio/miiMakerU.zip");
        //   this.previousVolume = 0.75;
        //   this.setVolume(0.75);
        //   this.previousVolume = 0.75;
        // } else {
        loadBaseSounds("./assets/audio/miiMakerSwitch.zip");
        this.previousVolume = 0.28;
        this.setVolume(0.28);
        this.previousVolume = 0.28;
        // }
      }
      currentTheme = theme;
    });
  }

  async loadSound(url: string, name: string) {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();

    const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);

    this.soundBufs[name] = audioBuffer;
  }
  async loadSoundBuffer(arrayBuffer: ArrayBuffer, name: string) {
    const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);

    this.soundBufs[name] = audioBuffer;
  }

  queue!: Set<string>;

  playSound(name: string) {
    const soundBuffer = this.soundBufs[name];
    if (!soundBuffer) {
      console.error(`Sound "${name}" not found.`);
      return;
    }

    if (this.queue.has(name)) return;

    const source = this.audioContext.createBufferSource();
    source.buffer = soundBuffer;
    source.connect(this.gainNode);
    source.start();

    this.queue.add(name);

    setTimeout(() => {
      this.queue.delete(name);
    }, 50);
  }

  setVolume(volume: number) {
    if (this.muted) return;
    this.gainNode.gain.value = volume;
  }

  mute() {
    if (this.muted) return;
    this.previousVolume = this.gainNode.gain.value;
    this.setVolume(0);
    this.muted = true;
  }
  unmute() {
    if (this.muted === false) return;
    this.muted = false;
    this.setVolume(this.previousVolume);
  }
}

let sm: SoundManager = new SoundManager();

export const loadBaseSounds = async (
  path: string = "./assets/audio/miiMakerSwitch.zip"
) => {
  const data = await fetch(path).then((j) => j.blob());
  const zip = await JSZip.loadAsync(data);
  let promises = [];
  const fileList = Object.keys(zip.files);
  for (const file of fileList) {
    // console.log(file, zip.files[file]);
    promises.push(zip.files[file].async("arraybuffer"));
  }
  const resolves = await Promise.all(promises);
  for (let i = 0; i < fileList.length; i++) {
    const fileName = fileList[i].split(".");
    fileName.pop();
    await sm.loadSoundBuffer(resolves[i], fileName.join("."));
  }
};
