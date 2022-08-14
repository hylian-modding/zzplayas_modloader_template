import { IPlugin, IModLoaderAPI } from 'modloader64_api/IModLoaderAPI';
import { bus } from 'modloader64_api/EventHandler';
import path from 'path';
import { AgeOrForm } from 'Z64Lib/API/Common/Z64API';
import { InjectCore } from 'modloader64_api/CoreInjection';
import fse from 'fs-extra';
import { IModelScript, Z64OnlineEvents, Z64Online_ModelAllocation, Z64_AnimationBank } from './Z64API/Z64API';
import { zzroot } from './zzdata';
import { IZ64Main } from 'Z64Lib/API/Common/IZ64Main'
import { Z64_GAME } from 'Z64Lib/src/Common/types/GameAliases';
import { Z64LibSupportedGames } from 'Z64Lib/API/Utilities/Z64LibSupportedGames';
import objectTools from './Z64API/objectMerge';

class z64o_playas implements IPlugin {
  ModLoader!: IModLoaderAPI;
  pluginName?: string | undefined;
  @InjectCore()
  core!: IZ64Main;
  game!: number;
  obj_tool = new objectTools();

  preinit(): void { }
  init(): void {
    this.game = Z64_GAME;

    switch (this.game) {
      case Z64LibSupportedGames.OCARINA_OF_TIME:
        this.OOT();
        break;
      case Z64LibSupportedGames.MAJORAS_MASK:
        this.MM();
        break;
    }
  }

  postinit(): void { }
  onTick(): void { }

  private OOT() {
    let zz: zzroot = (this as any)['metadata']['z64o_playas'];
    let script: IModelScript | undefined;
    if (zz.OOT.oot_script !== "") {
      let s = require(path.resolve(__dirname, zz.OOT.oot_script)).default;
      script = new s((this as any)['metadata']['name'], zz.OOT, this.ModLoader, this.core.OOT!);
    }
    if (zz.OOT.adult_model.length > 0) {
      for (let i = 0; i < zz.OOT.adult_model.length; i++) {
        if (zz.OOT.adult_model[i].file === "") continue;
        let evt = new Z64Online_ModelAllocation(fse.readFileSync(path.resolve(__dirname, zz.OOT.adult_model[i].file)), AgeOrForm.ADULT, Z64LibSupportedGames.OCARINA_OF_TIME);
        evt.name = zz.OOT.adult_model[i].name;
        evt.script = script;
        bus.emit(Z64OnlineEvents.REGISTER_CUSTOM_MODEL, evt);
      }
    }
    if (zz.OOT.child_model.length > 0) {
      for (let i = 0; i < zz.OOT.child_model.length; i++) {
        if (zz.OOT.child_model[i].file === "") continue;
        let evt = new Z64Online_ModelAllocation(fse.readFileSync(path.resolve(__dirname, zz.OOT.child_model[i].file)), AgeOrForm.CHILD, Z64LibSupportedGames.OCARINA_OF_TIME);
        evt.name = zz.OOT.child_model[i].name;
        evt.script = script;
        bus.emit(Z64OnlineEvents.REGISTER_CUSTOM_MODEL, evt);
      }
    }
    if (zz.OOT.anim_file.file !== '') {
      bus.emit(Z64OnlineEvents.CUSTOM_ANIMATION_BANK_REGISTER, new Z64_AnimationBank(zz.OOT.anim_file.name, fse.readFileSync(path.resolve(path.join(__dirname, zz.OOT.anim_file.file)))));
    }
  }

  private MM() {
    let zz: zzroot = (this as any)['metadata']['z64o_playas'];
    let script: IModelScript | undefined;
    if (zz.MM.mm_script !== "") {
      let s = require(path.resolve(__dirname, zz.MM.mm_script)).default;
      script = new s((this as any)['metadata']['name'], zz.MM, this.ModLoader, this.core.MM!);
    }
    if (zz.MM.child_model.length > 0) {
      for (let i = 0; i < zz.MM.child_model.length; i++) {
        if (zz.MM.child_model[i].file === "") continue;
        let evt = new Z64Online_ModelAllocation(fse.readFileSync(path.resolve(__dirname, zz.MM.child_model[i].file)), AgeOrForm.HUMAN, Z64LibSupportedGames.MAJORAS_MASK);
        evt.name = zz.MM.child_model[i].name;
        evt.script = script;
        bus.emit(Z64OnlineEvents.REGISTER_CUSTOM_MODEL, evt);
      }
    }
    else if (zz.OOT.child_model.length > 0) {
      for (let i = 0; i < zz.OOT.child_model.length; i++) {
        if (zz.OOT.child_model[i].file === "") continue;
        let evt = new Z64Online_ModelAllocation(fse.readFileSync(path.resolve(__dirname, zz.OOT.child_model[i].file)), AgeOrForm.HUMAN, Z64LibSupportedGames.MAJORAS_MASK);
        evt.name = zz.OOT.child_model[i].name;
        evt.script = script;
        bus.emit(Z64OnlineEvents.REGISTER_CUSTOM_MODEL, evt);
      }
    }
    if (zz.MM.adult_model.length > 0) {
      for (let i = 0; i < zz.MM.adult_model.length; i++) {
        if (zz.MM.adult_model[i].file === "") continue;
        let evt = new Z64Online_ModelAllocation(fse.readFileSync(path.resolve(__dirname, zz.MM.adult_model[i].file)), 0x68, Z64LibSupportedGames.MAJORAS_MASK);
        evt.name = zz.MM.adult_model[i].name;
        evt.script = script;
        bus.emit(Z64OnlineEvents.REGISTER_CUSTOM_MODEL, evt);
      }
    }
    else if (zz.OOT.adult_model.length > 0) {
      for (let i = 0; i < zz.OOT.adult_model.length; i++) {
        if (zz.OOT.adult_model[i].file === "") continue;
        let evt = new Z64Online_ModelAllocation(fse.readFileSync(path.resolve(__dirname, zz.OOT.adult_model[i].file)), 0x68, Z64LibSupportedGames.MAJORAS_MASK);
        evt.name = zz.OOT.adult_model[i].name;
        evt.script = script;
        bus.emit(Z64OnlineEvents.REGISTER_CUSTOM_MODEL, evt);
      }
    }
    if (zz.MM.deku_model.length > 0) {
      for (let i = 0; i < zz.MM.deku_model.length; i++) {
        if (zz.MM.deku_model[i].file === "") continue;
        let evt = new Z64Online_ModelAllocation(fse.readFileSync(path.resolve(__dirname, zz.MM.deku_model[i].file)), AgeOrForm.DEKU, Z64LibSupportedGames.MAJORAS_MASK);
        evt.name = zz.MM.deku_model[i].name;
        evt.script = script;
        bus.emit(Z64OnlineEvents.REGISTER_CUSTOM_MODEL, evt);
      }
    }
    if (zz.MM.goron_model_1.length > 0 || zz.MM.goron_model_2.length > 0) {
      for (let i = 0; i < zz.MM.goron_model_1.length; i++) {
        if (zz.MM.goron_model_1[i].file === "" || zz.MM.goron_model_2[i].file === "") continue;

        let obj1 = fse.readFileSync(path.resolve(__dirname, zz.MM.goron_model_1[i].file));
        let obj2 = fse.readFileSync(path.resolve(__dirname, zz.MM.goron_model_2[i].file));

        let zobj = this.obj_tool.mergeZobj(obj1, obj2);

        let evt = new Z64Online_ModelAllocation(zobj, AgeOrForm.GORON, Z64LibSupportedGames.MAJORAS_MASK);
        evt.name = zz.MM.goron_model_1[i].name;
        evt.script = script;
        bus.emit(Z64OnlineEvents.REGISTER_CUSTOM_MODEL, evt);

        /*let obj1 = fs.readFileSync("./object_link_goron_1.zobj");
        console.log("Object 1: object_link_goron_1.zobj");
        let obj2 = fs.readFileSync("./object_link_goron_2.zobj");
        console.log("Object 2: object_link_goron_2.zobj");*/
      }
    }
    if (zz.MM.zora_model.length > 0) {
      for (let i = 0; i < zz.MM.zora_model.length; i++) {
        if (zz.MM.zora_model[i].file === "") continue;
        let evt = new Z64Online_ModelAllocation(fse.readFileSync(path.resolve(__dirname, zz.MM.zora_model[i].file)), AgeOrForm.ZORA, Z64LibSupportedGames.MAJORAS_MASK);
        evt.name = zz.MM.zora_model[i].name;
        evt.script = script;
        bus.emit(Z64OnlineEvents.REGISTER_CUSTOM_MODEL, evt);
      }
    }
    if (zz.MM.deity_model.length > 0) {
      for (let i = 0; i < zz.MM.deity_model.length; i++) {
        if (zz.MM.deity_model[i].file === "") continue;
        let evt = new Z64Online_ModelAllocation(fse.readFileSync(path.resolve(__dirname, zz.MM.deity_model[i].file)), AgeOrForm.FD, Z64LibSupportedGames.MAJORAS_MASK);
        evt.name = zz.MM.deity_model[i].name;
        evt.script = script;
        bus.emit(Z64OnlineEvents.REGISTER_CUSTOM_MODEL, evt);
      }
    }
    if (zz.MM.anim_file.file !== '') {
      console.log(`anim bank found: ${zz.MM.anim_file.file}`);
      bus.emit(Z64OnlineEvents.CUSTOM_ANIMATION_BANK_REGISTER, new Z64_AnimationBank(zz.MM.anim_file.name, fse.readFileSync(path.resolve(path.join(__dirname, zz.MM.anim_file.file)))));
    }
  }
}

module.exports = z64o_playas;
