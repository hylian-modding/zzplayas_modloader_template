import { IPlugin, IModLoaderAPI } from 'modloader64_api/IModLoaderAPI';
import { bus } from 'modloader64_api/EventHandler';
import { OotOnlineEvents } from './OotoAPI/OotoAPI';
import path from 'path';
import { IOOTCore } from 'modloader64_api/OOT/OOTAPI';
import { InjectCore } from 'modloader64_api/CoreInjection';
import { MMOnlineEvents } from './MMOAPI/MMOAPI';

interface OotO_ZZ {
  adult_model: string;
  child_model: string;
  anim_file: string;
  adult_icon: string;
  child_icon: string;
}

interface MM_ZZ {
  child_model: string;
  anim_file: string;
}

class zzdata {
  OcarinaOfTime!: OotO_ZZ;
  MajorasMask!: MM_ZZ;
}

class zzplayas implements IPlugin {
  ModLoader!: IModLoaderAPI;
  pluginName?: string | undefined;
  @InjectCore()
  core!: IOOTCore;

  preinit(): void { }
  init(): void {
    let zz: zzdata = (this as any)['metadata']['zzplayas'];
    let OOT = () => {
      if (zz.OcarinaOfTime.adult_model !== '') {
        bus.emit(
          OotOnlineEvents.CUSTOM_MODEL_APPLIED_ADULT,
          path.resolve(path.join(__dirname, zz.OcarinaOfTime.adult_model))
        );
      }
      if (zz.OcarinaOfTime.child_model !== '') {
        bus.emit(
          OotOnlineEvents.CUSTOM_MODEL_APPLIED_CHILD,
          path.resolve(path.join(__dirname, zz.OcarinaOfTime.child_model))
        );
      }
      if (zz.OcarinaOfTime.anim_file !== '') {
        bus.emit(OotOnlineEvents.CUSTOM_MODEL_APPLIED_ANIMATIONS, path.resolve(path.join(__dirname, zz.OcarinaOfTime.anim_file)));
      }
      if (zz.OcarinaOfTime.adult_icon !== '') {
        bus.emit(OotOnlineEvents.CUSTOM_MODEL_APPLIED_ICON_ADULT, path.resolve(path.join(__dirname, zz.OcarinaOfTime.adult_icon)));
      }
      if (zz.OcarinaOfTime.child_icon !== '') {
        bus.emit(OotOnlineEvents.CUSTOM_MODEL_APPLIED_ICON_CHILD, path.resolve(path.join(__dirname, zz.OcarinaOfTime.child_icon)));
      }
    };
    let MM = () =>{
      if (zz.MajorasMask.child_model !== '') {
        bus.emit(
          MMOnlineEvents.CUSTOM_MODEL_APPLIED_CHILD,
          path.resolve(path.join(__dirname, zz.MajorasMask.child_model))
        );
      }
      if (zz.MajorasMask.anim_file !== '') {
        bus.emit(MMOnlineEvents.CUSTOM_MODEL_APPLIED_ANIMATIONS, path.resolve(path.join(__dirname, zz.MajorasMask.anim_file)));
      }
    };

    OOT();
    MM();
  }
  postinit(): void { }
  onTick(): void { }
}

module.exports = zzplayas;
