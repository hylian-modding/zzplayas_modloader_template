import { IPlugin, IModLoaderAPI } from 'modloader64_api/IModLoaderAPI';
import { bus } from 'modloader64_api/EventHandler';
import path from 'path';
import { Age, IOOTCore, Tunic } from 'modloader64_api/OOT/OOTAPI';
import { InjectCore } from 'modloader64_api/CoreInjection';
import fse from 'fs-extra';
import { IModelScript, Z64OnlineEvents, Z64Online_ModelAllocation, Z64_AnimationBank, registerModel} from './OotoAPI/OotoAPI';
import { zzroot } from './zzdata';
import { MMOnlineEvents } from './MMAPI/MMAPI';
import ootscript from './ootscript';

class zzplayas implements IPlugin {
  ModLoader!: IModLoaderAPI;
  pluginName?: string | undefined;
  @InjectCore()
  core!: IOOTCore;

  preinit(): void { }
  init(): void {
    this.OOT();
    this.MM();
  }
  postinit(): void { }
  onTick(): void { }

  private OOT() {
    let zz: zzroot = (this as any)['metadata']['zzplayas'];
    let script: ootscript | undefined;
    if (zz.OOT.oot_script !== "") {
      let s = require(path.resolve(__dirname, zz.OOT.oot_script)).default;
      script = new s((this as any)['metadata']['name'], zz.OOT, this.ModLoader);
      script!.core = this.core;
      script!.tunicRefs.set(Age.ADULT, []);
      let adultOk: boolean = true;
      Object.keys(zz.OOT.tunic_models_adult).forEach((key: string)=>{
        if ((zz.OOT.tunic_models_adult as any)[key] === ""){
          adultOk = false;
        }else{
          console.log((zz.OOT.tunic_models_adult as any)[key]);
        }
      });
      if (adultOk){
        Object.keys(zz.OOT.tunic_models_adult).forEach((key: string)=>{
          let buf = fse.readFileSync(path.resolve(__dirname, (zz.OOT.tunic_models_adult as any)[key]));
          let ref = registerModel(buf);
          script!.tunicRefs.get(Age.ADULT)!.push(ref);
        });
      }
      script!.tunicRefs.set(Age.CHILD, []);
      let childOk: boolean = true;
      Object.keys(zz.OOT.tunic_models_child).forEach((key: string)=>{
        if ((zz.OOT.tunic_models_child as any)[key] === ""){
          childOk = false;
        }
      });
      if (childOk){
        Object.keys(zz.OOT.tunic_models_child).forEach((key: string)=>{
          let buf = fse.readFileSync(path.resolve(__dirname, (zz.OOT.tunic_models_child as any)[key]));
          let ref = registerModel(buf);
          script!.tunicRefs.get(Age.CHILD)!.push(ref);
        });
      }
    }
    if (zz.OOT.adult_model.length > 0) {
      for (let i = 0; i < zz.OOT.adult_model.length; i++) {
        if (zz.OOT.adult_model[i].file === "") continue;
        let evt = new Z64Online_ModelAllocation(fse.readFileSync(path.resolve(__dirname, zz.OOT.adult_model[i].file)), Age.ADULT);
        evt.name = zz.OOT.adult_model[i].name;
        evt.script = script;
        bus.emit(Z64OnlineEvents.CUSTOM_MODEL_LOAD_ADULT, evt);
      }
    }
    if (zz.OOT.child_model.length > 0) {
      for (let i = 0; i < zz.OOT.child_model.length; i++) {
        if (zz.OOT.child_model[i].file === "") continue;
        let evt = new Z64Online_ModelAllocation(fse.readFileSync(path.resolve(__dirname, zz.OOT.child_model[i].file)), Age.ADULT);
        evt.name = zz.OOT.child_model[i].name;
        evt.script = script;
        bus.emit(Z64OnlineEvents.CUSTOM_MODEL_LOAD_CHILD, evt);
      }
    }
    if (zz.OOT.anim_file.file !== '') {
      bus.emit(Z64OnlineEvents.CUSTOM_ANIMATION_BANK_REGISTER, new Z64_AnimationBank(zz.OOT.anim_file.name, fse.readFileSync(path.resolve(path.join(__dirname, zz.OOT.anim_file.file)))));
    }
  }

  private MM() {
    let zz: zzroot = (this as any)['metadata']['zzplayas'];
    if (zz.MM.child_model.length > 0) {
      for (let i = 0; i < zz.MM.child_model.length; i++) {
        bus.emit(MMOnlineEvents.CUSTOM_MODEL_APPLIED_CHILD, path.resolve(path.join(__dirname, zz.MM.child_model[i].file)));
      }
    }
  }
}

module.exports = zzplayas;
