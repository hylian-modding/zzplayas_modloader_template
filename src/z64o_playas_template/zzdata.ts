export class zzroot{
  OOT!: zzdata_oot;
  MM!: zzdata_mm;
}

export class zzdata_oot {
  adult_model!: zzentry[];
  child_model!: zzentry[];
  anim_file!: zzentry;
  oot_script!: string;
  options!: zzoptions;
  colors!: zzcolor;
}

export class zzdata_mm{
  child_model!: zzentry[];
  adult_model!: zzentry[];
  deku_model!: zzentry[];
  goron_model_1!: zzentry[];
  goron_model_2!: zzentry[];
  zora_model!: zzentry[];
  deity_model!: zzentry[];
  mm_script!: string;
  anim_file!: zzentry;
  options!: zzoptions;
}

export class zzentry {
  file!: string;
  name!: string;
}

export class zzoptions{
  applyAnimBankOnEquip!: boolean; 
  applySoundOnEquip!: boolean;
}

export class zzcolor{
  kokiri!: string;
  goron!: string;
  zora!: string;
  silver!: string;
  golden!: string;
}