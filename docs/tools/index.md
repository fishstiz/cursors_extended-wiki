---
title: Tools
prev: 
    text: Ensuring Compatibility
    link: /java-api/ensuring-compatibility 
next: true
---

# Tools

## V3 Converter
Convert **Minecraft Cursor** (v3) resource packs to v4. Keeps the original files unless overwritten by the conversion. Only works on `.zip` resource packs. 

> [!NOTE]
> **v4** introduces a `resize_all` cursor which maps to the `grabbing` cursor in **v3**.

<FileConverter :processor="v3Processor" :validator="v3Validator" accept=".zip" />

## Cursor Settings Generator

Generates [cursor settings](/resource-pack/creating-cursor-textures#cursor-settings) from the given `cursors_extended.json` config file.

This allows you to easily modify cursor settings using the in-game GUI, and then using those saved values to generate the cursor settings for a resource pack.

> [!IMPORTANT]
> Does not generate with [animation properties](/resource-pack/creating-cursor-textures#animation).

> [!NOTE]
> The config file is only updated when reloading cursor textures or closing the configuration screen.

<FileConverter 
	:processor="processConfigFile" 
	:validator="validateConfigFile"
	:downloadName="settingsZipName"
	accept=".json" 
	actionText="GENERATE" 
/>

<script setup lang="ts">
import { processZip as v3Processor, validateZip as v3Validator } from "./v3-mapper"
import { processConfigFile, validateConfigFile, generateFileName as settingsZipName } from "./settings-generator"
import FileConverter from "@/components/FileConverter.vue"

</script>