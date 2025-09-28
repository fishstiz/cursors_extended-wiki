---
title: Tools
prev: 
    text: Ensuring Compatibility
    link: /java-api/ensuring-compatibility 
next: true
---

# Tools

## V3 Converter
Convert **Minecraft Cursor** (v3) resource packs from to v4. Only works on `.zip` files 

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
import FileConverter from "@/components/FileConverter.vue"
import { processZip as v3Processor, validateZip as v3Validator } from "./v3Mapper"
import { processConfigFile, validateConfigFile, generateFileName as settingsZipName } from "./settingsGenerator"
</script>