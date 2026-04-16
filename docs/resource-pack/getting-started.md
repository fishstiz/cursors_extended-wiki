---
title: Getting Started
---
# Getting Started

> [!IMPORTANT] 
> This wiki was last updated on v4 of Cursors Extended. Click [here](https://fishstiz.github.io/minecraft-cursor-wiki/resource-pack/getting-started) for the v3 wiki for Minecraft versions 1.21.8 and below.

> [!TIP]
> You can convert **v3** resource packs to **v4** using the [V3 Converter](/tools/#v3-converter) tool.

> [!INFO]
> View community-made resource packs **[here](/resource-pack/showcase)**.

You may optionally start with this template to serve as guide:
[Legacy-Cursors_v4.0.0.zip](/templates/Legacy-Cursors_v4.0.0.zip)

## Resource Pack Structure
**namespace**: `cursors_extended`
<LiteTree>
picture={{ icons.picture }}
---
assets
	cursors_extended                                                         
		textures
			gui
				sprites
					cursors
						[picture]{{ commonNodes.CURSOR_NAME.node }}.png              // The Cursor Texture
						{{ commonNodes.CURSOR_NAME.node }}.png.json&nbsp;(optional)  // Cursor Settings
pack.mcmeta
pack.png                                                                  
</LiteTree>

## All Cursors
Each cursor has an associated **name** used to identify the texture and its settings.

### Standard Cursors
<table>
  <thead>
    <tr>
      <th>Name</th>
      <th>Texture</th>
      <th>Vanilla Usage</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>default</code></td>
      <td><img src="/assets/cursors/default.png" width="32" alt="default"/></td>
			<td>The default cursor.</td>
    </tr>
    <tr>
      <td><code>pointing_hand</code></td>
      <td><img src="/assets/cursors/pointing_hand.png" width="32" alt="pointer"/></td>
			<td>Hovered over active buttons and scrollbars</td>
    </tr>
    <tr>
      <td><code>ibeam</code></td>
      <td><img src="/assets/cursors/ibeam.png" width="32" alt="text"/></td>
			<td>Hovered over active text fields</td>
    </tr>
    <tr>
      <td><code>not_allowed</code></td>
      <td><img src="/assets/cursors/not_allowed.png" width="32" alt="not_allowed"/></td>
			<td>Hovered over inactive buttons and text fields</td>
    </tr>
    <tr>
      <td><code>crosshair</code></td>
      <td><img src="/assets/cursors/crosshair.png" width="32" alt="crosshair"/></td>
			<td>Unused in vanilla</td>
    </tr>
    <tr>
      <td><code>resize_all</code></td>
      <td><img src="/assets/cursors/resize_all.png" width="32" alt="resize_ew"/></td>
			<td>Unused in vanilla</td>
    </tr>
    <tr>
      <td><code>resize_ew</code></td>
      <td><img src="/assets/cursors/resize_ew.png" width="32" alt="resize_ew"/></td>
			<td>Dragging sliders</td>
    </tr>
    <tr>
      <td><code>resize_ns</code></td>
      <td><img src="/assets/cursors/resize_ns.png" width="32" alt="resize_ns"/></td>
			<td>Dragging scrollbars</td>
    </tr>
  </tbody>
</table>

### Extra Cursors
<table>
  <thead>
    <tr>
      <th>Name</th>
      <th>Texture</th>
      <th>Mod Usage</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>grabbing</code></td>
      <td><img src="/assets/cursors/grabbing.png" width="32" alt="grabbing"/></td>
      <td>(Legacy) Grabbing items in the inventory.</td>
    </tr>
    <tr>
      <td><code>shift</code></td>
      <td><img src="/assets/cursors/shift.png" width="32" alt="shift"/></td>
      <td>
        <span>(Legacy) Shift is pressed and mouse is hovered over:</span>
        <ul>
          <li>Inventory slots with item/s</li>
          <li>Creative inventory destroy item slot</li>
          <li>Recipe book recipes</li>
          <li>Villager trade offers</li>
        </ul>
      </td>
    </tr>
    <tr>
      <td><code>busy</code></td>
      <td><img src="/assets/cursors/busy.gif" width="32" alt="busy"/></td>
      <td>
        <ul>
					<li>(Legacy) In loading screens</li>
					<li>When loading resources</li>
				</ul>
      </td>
    </tr>
		    <tr>
      <td><code>resize_nwse</code></td>
      <td><img src="/assets/cursors/resize_nwse.png" width="32" alt="resize_nwse"/></td>
			<td>Unused in Cursors Extended</td>
    </tr>
    <tr>
      <td><code>resize_nesw</code></td>
      <td><img src="/assets/cursors/resize_nesw.png" width="32" alt="resize_nesw"/></td>
			<td>Unused in Cursors Extended</td>
    </tr>
  </tbody>
</table>

<script setup lang="ts">
import { commonNodes, useLiteTreeHighlighter } from '@/composables/lite-tree-highlighter'
import icons from '@/utils/icons'

useLiteTreeHighlighter(commonNodes.CURSOR_NAME.regex)
</script>