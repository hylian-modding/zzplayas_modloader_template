# z64o_playas_modloader_template
Template for making a .pak file for ModLoader out of a zelda64 playas zobj.

## TODO: 
* Make z64convert/objex2 compatible templates

## Goron Play-as
Goron has two skeletons, "object_link_goron_1" & "object_link_goron_2". Alternatively, "Goron" & "Shield" is what I like to refer to them as. They are meant to be seperated into seperate objects for Z64O.

In your blender file, select the "zzSkel" (Goron) skeleton and all the objects parented to it. Export it as "objex", but change the export settings to "selection only" to export only the "Goron" object. Afterwards, do the same for the "zzSkel2" (Shield) skeleton and the parented objects and export with "selection only" into a seperate objex file. 

Once you have two exported files, one for "Goron" and the other for "Shield", you can then convert them each into a zobj using zzconvert. Now that you have two zobjs of both the "Goron" and "Shield" objects, put them in the template and write them into their slots in the package.json. 

Below is a snipped of an example package.json using the two Goron models:

```
    "goron_model_1": [
        {
          "file": "object_link_goron_1.zobj",
          "name": "Goron"
        }
      ],
	  "goron_model_2": [
        {
          "file": "object_link_goron_2.zobj",
          "name": "Shield"
        }
      ],
```

If done properly, both objects will be handled by Z64Online and will merge into one full Goron play-as during runtime. You'll know if you were successful by shielding with Goron Link -- The game will crash if the 2nd object isn't done properly!

If you have any questions or need help, feel free to reach out in #model-dev of the [ModLoader64 Discord](https://discord.gg/Vb8mKT6)
