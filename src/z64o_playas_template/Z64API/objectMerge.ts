import { optimize } from 'Z64Lib/API/zzoptimize';
import { ZZPlayasEmbedParser } from 'Z64Lib/API/Utilities/ZZPlayasEmbedParser';
import fs from 'fs';
import { SmartBuffer } from 'smart-buffer';
import crypto from 'crypto';
import Z64Serialize from './Z64Serialize';

export default class objectTools {
    parse = new ZZPlayasEmbedParser();
    pieces = new Map<string, ZobjPiece>();
    skeletons: Array<Skeleton> = [];

    findHierarchy(buf: Buffer, start: number = 0) {
        for (let i = start; i < buf.byteLength; i += 4) {
            // Is this possibly an 06 pointer?
            if (buf.readUInt8(i) === 0x06) {
                let possible = buf.readUInt32BE(i) & 0x00FFFFFF;
                // Does the offset stay within the bounds of the file?
                if (possible <= buf.byteLength) {
                    // If we take the next 4 bytes and subtract do we get 0xC or 0x10?
                    let possible2 = buf.readUInt32BE(i - 0x4) & 0x00FFFFFF;
                    let change = possible - possible2;
                    if (change === 0xC || change === 0x10) {
                        // Traverse down until we hit something that doesn't start with 06.
                        let cur = buf.readUInt32BE(i) & 0xFF000000;
                        let pos = i;
                        let count = 0;
                        while (cur === 0x06000000) {
                            pos += 4;
                            cur = buf.readUInt32BE(pos) & 0xFF000000;
                            count++;
                        }
                        pos -= 4;
                        // Hierarchy offset maybe?
                        let a1 = buf.readUInt8(pos + 4);
                        let a2 = buf.readUInt32BE(pos + 5);
                        if (a1 !== count) {
                            continue;
                        }
                        let format = a2 <= a1 ? 1 : 0;
                        return { pos, change, format };
                    }
                }
            }
        }
        return undefined;
    }

    mergeZobj(obj1: Buffer, obj2: Buffer) {

        let map1 = this.parse.parse(obj1);
        let map2 = this.parse.parse(obj2);

        this.processPieces(1, map1, obj1);
        this.processPieces(2, map2, obj2);

        this.skeletons.push(...this.processHierarchy(1, obj1));
        this.skeletons.push(...this.processHierarchy(2, obj2));

        let sb = new SmartBuffer();
        let temp = new SmartBuffer();
        temp.writeBuffer(obj1.slice(0, 0x5000));
        let off: Array<number> = [];
        let existingPieces: Map<string, number> = new Map();

        let dlist_map: any = {};

        let dupcount = 0;
        let processPiece = (p: ZobjPiece, name: string) => {
            if (existingPieces.has(p.hash)) {
                p.newOffset = existingPieces.get(p.hash)!;
            } else {
                let a = optimize(p.piece, [p.offset], temp.writeOffset);
                temp.writeBuffer(a.zobj);
                p.newOffset = a.oldOffs2NewOffs.get(p.offset)!;
                existingPieces.set(p.hash, p.newOffset);
                off.push(p.newOffset);
                if (dlist_map.hasOwnProperty(p.name)) {
                    dupcount++;
                    dlist_map[`${p.name}_${dupcount}`] = p.newOffset;
                } else {
                    dlist_map[p.name] = p.newOffset;
                }
            }
        };
        this.pieces.forEach(processPiece);

        for (let i = 0; i < this.skeletons.length; i++) {
            this.skeletons[i].bones.forEach((limb: Bone) => {
                if (limb.piece1 !== undefined) {
                    processPiece(limb.piece1, `${limb.name} dlist1`);
                }
            });
        }

        sb.writeBuffer(temp.toBuffer().slice(0x0, 0x5000), 0x0);
        let model_data = optimize(temp.toBuffer(), off, sb.writeOffset, 0x06, true);
        sb.writeBuffer(model_data.zobj);

        Object.keys(dlist_map).forEach((key: string) => {
            let o = dlist_map[key];
            o = model_data.oldOffs2NewOffs.get(o)!
            dlist_map[key] = o;
        });

        while (sb.length % 0x10 !== 0) {
            sb.writeUInt8(0xFF);
        }

        for (let i = 0; i < this.skeletons.length; i++) {
            this.skeletons[i].bones.forEach((limb: Bone) => {
                if (limb.piece1 !== undefined) {
                    limb.piece1.newOffset = model_data.oldOffs2NewOffs.get(limb.piece1.newOffset)!;
                }
            });
        }

        for (let i = 0; i < this.skeletons.length; i++) {
            let _boneoffs: Array<number> = [];
            while (sb.length % 0x10 !== 0) {
                sb.writeUInt8(0xFF);
            }
            sb.writeString(`SKELETON ${i}`);
            while (sb.length % 0x10 !== 0) {
                sb.writeUInt8(0xFF);
            }
            this.skeletons[i].bones.forEach((limb: Bone) => {
                let _boneoff = sb.writeOffset;
                sb.writeUInt32BE(limb.unk1);
                sb.writeUInt32BE(limb.unk2);
                if (limb.piece1 !== undefined) {
                    sb.writeUInt32BE(limb.piece1.newOffset + 0x06000000);
                    sb.writeUInt32BE(limb.piece1.newOffset + 0x06000000);
                } else {
                    sb.writeUInt32BE(0);
                    sb.writeUInt32BE(0);
                }
                _boneoffs.push(0x06000000 + _boneoff);
            });
            let lt = sb.writeOffset;
            for (let j = 0; j < _boneoffs.length; j++) {
                sb.writeUInt32BE(_boneoffs[j]);
            }
            let skelh = new SmartBuffer();
            skelh.writeUInt32BE(lt + 0x06000000);
            skelh.writeUInt8(this.skeletons[i].num);
            skelh.writeUInt32BE(this.skeletons[i].num2);
            sb.writeBuffer(skelh.toBuffer());
        }

        while (sb.length % 0x10 !== 0) {
            sb.writeUInt8(0xFF);
        }

        sb.writeString("!Z64OManifest000");

        sb.writeBuffer(Z64Serialize.serializeSync(dlist_map));

        sb.writeString("!Z64OManifest999");

        while (sb.length % 0x10 !== 0) {
            sb.writeUInt8(0xFF);
        }

        //fs.writeFileSync("./test.zobj", sb.toBuffer());

        //Object.keys(dlist_map).forEach((key: string) => {
        //    console.log(`${key} ${dlist_map[key].toString(16)}`);
        //});

        let test: Buffer = sb.toBuffer();
        return test;
        /* let t1 = this.findHierarchy(test); */
        /* let lastSkeleton = t1!.pos + 0x9; */
        /* while (lastSkeleton % 0x10 !== 0) { */
        /*     lastSkeleton++; */
        /* } */
        /* let t2 = this.findHierarchy(test, lastSkeleton); */
        /* console.log(t1); */
        /* console.log(t2); */
    }

    processPieces(objnum: number, map: any, obj: Buffer) {
        console.log(`Processing display lists in object ${objnum}...`);
        let count = 0;
        Object.keys(map).forEach((key: string) => {
            let offset = map[key];
            let op = optimize(obj, [offset]);
            let piece = new ZobjPiece(op.zobj, op.oldOffs2NewOffs.get(offset)!, key);
            this.pieces.set(piece.hash, piece);
            count++;
        });
        console.log(`Processed ${count} pieces`);
    }

    processHierarchy(objnum: number, obj: Buffer) {
        let skeletons: Array<Skeleton> = [];

        let lastSkeleton: number = 0;
        for (let i = 0; i < 4; i++) {
            let skeleton: Array<Bone> = [];
            let skel2: number = 0;
            let skel3: number = 0;
            let bones: number = 0;
            let __bones: number = 0;
            let f = this.findHierarchy(obj, lastSkeleton);
            if (f === undefined) {
                break;
            }
            lastSkeleton = f!.pos + 0x9;
            while (lastSkeleton % 0x10 !== 0) {
                lastSkeleton++;
            }
            skel2 = f.pos & 0x00FFFFFF;
            skel3 = obj.readUInt32BE(skel2) & 0x00FFFFFF;
            bones = obj.readUInt32BE(skel2 + 0x5);
            __bones = obj.readUInt8(skel2 + 0x4);
            for (let i = 0; i < __bones; i++) {
                let pointer = obj.readUInt32BE(skel3 + (i * 0x4)) & 0x00FFFFFF;
                let unk1 = obj.readUInt32BE(pointer);
                let unk2 = obj.readUInt32BE(pointer + 0x4);
                let dlist1 = obj.readUInt32BE(pointer + 0x8) & 0x00FFFFFF;
                let limb = new Bone(`Limb ${i}`, pointer, unk1, unk2, dlist1);
                if (dlist1 > 0) {
                    let op = optimize(obj, [dlist1]);
                    limb.piece1 = new ZobjPiece(op.zobj, op.oldOffs2NewOffs.get(dlist1)!, `Obj ${objnum} Bone ${i}`);
                }
                skeleton.push(limb);
            }
            skeletons.push(new Skeleton(__bones, skeleton, bones));
        }
        console.log(`Skeletons found for object ${objnum}:`);
        for (let i = 0; i < skeletons.length; i++) {
            console.log(`Skeleton ${i}. Bones: ${skeletons[i].bones.length}`);
        }
        return skeletons;
    }

}

class ZobjPiece {
    piece: Buffer;
    hash: string;
    offset: number;
    newOffset: number = -1;
    name: string;

    constructor(piece: Buffer, offset: number, name: string) {
        this.piece = piece;
        this.offset = offset;
        this.hash = crypto.createHash('md5').update(this.piece).digest('hex');
        this.name = name;
    }
}

class Bone {
    name: string;
    pointer: number;
    unk1: number;
    unk2: number;
    dlist1: number;
    piece1!: ZobjPiece;

    constructor(name: string, pointer: number, unk1: number, unk2: number, dlist1: number) {
        this.name = name;
        this.pointer = pointer;
        this.unk1 = unk1;
        this.unk2 = unk2;
        this.dlist1 = dlist1;
    }
}

class Skeleton {
    bones: Array<Bone>;
    num: number;
    num2: number;

    constructor(num: number, limbs: Array<Bone>, num2: number) {
        this.num = num;
        this.bones = limbs;
        this.num2 = num2;
    }
}

module.exports = objectTools;