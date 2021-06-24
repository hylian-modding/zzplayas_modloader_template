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