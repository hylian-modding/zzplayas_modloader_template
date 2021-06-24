import { Tunic } from "modloader64_api/OOT/OOTAPI";
import { bus } from "modloader64_api/EventHandler";
import { IModelReference, IModelScript, Z64OnlineEvents, Z64_AnimationBank } from "./OotoAPI/OotoAPI";
import { zzdata_oot } from "./zzdata";
import fs from 'fs-extra';
import path from 'path';
import { IModLoaderAPI } from "modloader64_api/IModLoaderAPI";
import zlib from 'zlib';

export default class ootscript implements IModelScript{

    name: string;
    zz: zzdata_oot;
    ModLoader!: IModLoaderAPI;
    originalTunicColors!: Buffer;
    originalGauntletColors!: Buffer;
    rawSounds: any = {};
    hasEmbeddedSounds: boolean = false;

    constructor(name: string, zz: zzdata_oot, ModLoader: IModLoaderAPI){
        this.name = name;
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
        this.originalTunicColors = this.ModLoader.emulator.rdramReadBuffer(0x800F7AD8, (3 * 3));
        this.originalGauntletColors = this.ModLoader.emulator.rdramReadBuffer(0x800F7AE4, (2 * 3));
        if (this.zz.colors.kokiri !== ""){
            this.ModLoader.emulator.rdramWriteBuffer(0x800F7AD8 + (0 * 3), Buffer.from(this.zz.colors.kokiri, 'hex'));
        }
        if (this.zz.colors.goron !== ""){
            this.ModLoader.emulator.rdramWriteBuffer(0x800F7AD8 + (1 * 3), Buffer.from(this.zz.colors.goron, 'hex'));
        }
        if (this.zz.colors.zora !== ""){
            this.ModLoader.emulator.rdramWriteBuffer(0x800F7AD8 + (2 * 3), Buffer.from(this.zz.colors.zora, 'hex'));
        }
        if (this.zz.colors.silver !== ""){
            this.ModLoader.emulator.rdramWriteBuffer(0x800F7AE4 + (0 * 3), Buffer.from(this.zz.colors.silver, 'hex'));
        }
        if (this.zz.colors.golden !== ""){
            this.ModLoader.emulator.rdramWriteBuffer(0x800F7AE4 + (1 * 3), Buffer.from(this.zz.colors.golden, 'hex'));
        }
        this.loadSoundPak();
    }
    onModelRemoved(): void {
        if (this.zz.options.applyAnimBankOnEquip){
            bus.emit(Z64OnlineEvents.FORCE_CUSTOM_ANIMATION_BANK, new Z64_AnimationBank(this.zz.anim_file.name, Buffer.alloc(1)));
        }
        this.ModLoader.emulator.rdramWriteBuffer(0x800F7AD8, this.originalTunicColors);
        this.ModLoader.emulator.rdramWriteBuffer(0x800F7AE4, this.originalGauntletColors);
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
    onTunicChanged(ref: IModelReference, tunic: Tunic): IModelReference {
        return ref;
    }
    onHealthChanged(max: number, health: number, ref: IModelReference): IModelReference {
        return ref;
    }
    onTick(): void {
    }
    
}