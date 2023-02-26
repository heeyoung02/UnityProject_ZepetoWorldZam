import { AudioClip, AudioSource, GameObject } from 'UnityEngine';
import { ZepetoScriptBehaviour } from 'ZEPETO.Script'

export default class SoundManager extends ZepetoScriptBehaviour {

    private audio: AudioSource;

    /* Singleton */
    private static m_instance: SoundManager = null;
    public static get instance(): SoundManager {
        if (this.m_instance === null) {
            this.m_instance = GameObject.FindObjectOfType<SoundManager>();
            if (this.m_instance === null) {
                this.m_instance = new GameObject(SoundManager.name).AddComponent<SoundManager>();
            }
        }
        return this.m_instance;
    }
    private Awake() {
        if (SoundManager.m_instance !== null && SoundManager.m_instance !== this) {
            GameObject.Destroy(this.gameObject);
        } else {
            SoundManager.m_instance = this;
            GameObject.DontDestroyOnLoad(this.gameObject);
        }
    }

    private Start() {
        this.audio = this.GetComponent<AudioSource>();
        this.audio.loop = true;
    }

    public BGM_Start(clip: AudioClip) {
        if (this.audio.clip == null || this.audio.clip != clip) {
            this.audio.clip = clip;
            this.audio.Play();
        }
    }

}