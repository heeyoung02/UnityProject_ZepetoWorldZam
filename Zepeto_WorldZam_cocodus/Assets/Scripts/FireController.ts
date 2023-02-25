import { Collider, ParticleSystem } from 'UnityEngine';
import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import PlayerSync from '../Multi/Player/PlayerSync';

export default class FireController extends ZepetoScriptBehaviour {

    private particles: ParticleSystem[];

    Start() {
        this.particles = this.GetComponentsInChildren<ParticleSystem>();
    }

    OnTriggerEnter(coll: Collider) {
        if (!coll.transform.GetComponent<PlayerSync>()?.isLocal)
            return;
        this.particles.forEach((particle: ParticleSystem) => {
            particle.Play();
        });
    }

}