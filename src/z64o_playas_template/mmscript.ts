import { IMMCore } from "Z64Lib/API/mm/mmAPI";
import { bus } from "modloader64_api/EventHandler";
import { IModelReference, IModelScript, Z64OnlineEvents, Z64_AnimationBank } from "./Z64API/Z64API";
import { zzdata_mm } from "./zzdata";
import fs from 'fs-extra';
import path from 'path';
import { IModLoaderAPI } from "modloader64_api/IModLoaderAPI";
import zlib from 'zlib';
import { AgeOrForm } from "Z64Lib/API/Common/Z64API";

export default class mmscript implements IModelScript{

    name: string;
    zz: zzdata_mm;
    ModLoader!: IModLoaderAPI;
    core!: IMMCore;
    originalTunicColors!: Buffer;
    originalGauntletColors!: Buffer;
    rawSounds: any = {};
    hasEmbeddedSounds: boolean = false;

    constructor(name: string, zz: zzdata_mm, ModLoader: IModLoaderAPI){
        this.name = name;
        this.zz = zz;
        this.zz = zz;
        this.ModLoader = ModLoader;
        this.registerSoundPak();
    }

    private registerSoundPak(){
        let sound_folder: string = path.resolve(__dirname, "sounds");
        if (fs.existsSync(sound_folder)){
            this.hasEmbeddedSounds = true;
        }else{
            return;
        }
        fs.readdirSync(sound_folder).forEach((file: string) => {
            let f: string = path.resolve(sound_folder, file);
            let id: number = parseInt(path.parse(file).name.split("-")[0].trim(), 16);
            if (fs.lstatSync(f).isDirectory()) {
                this.rawSounds[id] = [];
                fs.readdirSync(f).forEach((sound: string) => {
                    let s: string = path.resolve(f, sound);
                    this.rawSounds[id].push(zlib.deflateSync(fs.readFileSync(s)));
                });
            }
        });
        bus.emit(Z64OnlineEvents.ON_LOAD_SOUND_PACK, {id: this.name, data: this.rawSounds});
    }

    private loadSoundPak(){
        if (!this.hasEmbeddedSounds) return;
        if (!this.zz.options.applySoundOnEquip) return;
        bus.emit(Z64OnlineEvents.ON_SELECT_SOUND_PACK, this.name);
    }

    private unloadSoundPak(){
        if (!this.hasEmbeddedSounds) return;
        if (!this.zz.options.applySoundOnEquip) return;
        bus.emit(Z64OnlineEvents.ON_SELECT_SOUND_PACK, undefined);
    }

    onModelEquipped(): void {
        if (this.zz.options.applyAnimBankOnEquip){
            bus.emit(Z64OnlineEvents.FORCE_CUSTOM_ANIMATION_BANK, new Z64_AnimationBank(this.zz.anim_file.name, fs.readFileSync(path.resolve(__dirname, this.zz.anim_file.file))));
        }
        this.loadSoundPak();
    }
    onModelRemoved(): void {
        if (this.zz.options.applyAnimBankOnEquip){
            bus.emit(Z64OnlineEvents.FORCE_CUSTOM_ANIMATION_BANK, new Z64_AnimationBank(this.zz.anim_file.name, Buffer.alloc(1)));
        }
        this.unloadSoundPak();
    }
    onSceneChange(scene: number, ref: IModelReference): IModelReference {
        return ref;
    }
    onDay(ref: IModelReference): IModelReference {
        return ref;
    }
    onNight(ref: IModelReference): IModelReference {
        return ref;
    }
    onHealthChanged(max: number, health: number, ref: IModelReference): IModelReference {
        return ref;
    }
    onTick(): void {
    }
    
}