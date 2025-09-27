---
title: Creating Cursor Textures
next: false
---
# Creating Cursor Textures

**Requirements**:
- Minimum Size: **8x8**
- File name must match a [cursor name](getting-started.md#all-cursors).
- Format: **.png**

**Recommendations**:
- For 1x scale: Use a **power-of-two** size (16x16, 32x32, 64x64, etc.).
- For 0x scale (auto): Match your resource packs' resolution (16x16 in vanilla).
- Other, non-standard scale values should be configured on a per-user basis.

## Animated Textures

1. All frames must be equal in size. Follow the requirements above.
2. Stack frames vertically from top to bottom. The topmost sprite is used as fallback when the animation is disabled.
3. Add the `animation` properties to the [cursor settings](#cursor-settings). Without the `animation` properties, the whole image will be read as a single cursor texture.

## Cursor Settings
Specifies the default cursor settings and may also include animation properties. This file is optional; if omitted, the default values will be applied instead.

```json [cursor-name.png.json]
{
  "cursor": {
    "scale": 1,
    "xhot": 0,
    "yhot": 0,		
  },          
  "animation": {               
    "frametime": 1,            
  }
}
```

### `cursor`
<table>
	<thead>
		<tr>
      <th>Key</th>
      <th>Type</th>
      <th>Default</th>
      <th>Description</th>
    </tr>
	</thead>
	<tbody>
		<tr>
			<td><code>enabled</code>&nbsp;</td>
			<td><code>boolean</code></td>
			<td><code>true</code></td>
			<td>Can only be used to disable the cursor by specifying <code>false</code>.</td>
		</tr>
		<tr>
			<td><code>scale</code>&nbsp;</td>
			<td><code>float</code></td>
			<td><code>1.00</code></td>
			<td>
				<p>The scale of the texture. Caps at <code>8</code>.</p>
				<p>To enable <b>auto-scale</b>, set the value to <code>0</code>.</p>
			</td>
		</tr>
		<tr>
			<td><code>xhot</code>&nbsp;</td>
			<td><code>int</code></td>
			<td><code>0</code></td>
			<td>The x-hotspot position. Caps at image width minus one.</td>
		</tr>
		<tr>
			<td><code>yhot</code>&nbsp;</td>
			<td><code>int</code></td>
			<td><code>0</code></td>
			<td>The y-hotspot position. Caps at image height minus one.</td>
		</tr>
		<tr>
			<td><code>animated</code>&nbsp;</td>
			<td><code>boolean</code></td>
			<td><code>null</code>, or <code>true</code> if animation properties exist</td>
			<td>Determines whether the animation should be played if animation properties exist.</td>
		</tr>
	</tbody>
</table>


### `animation`
<table>
  <thead>
    <tr>
      <th>Key</th>
      <th>Type</th>
      <th>Default</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>mode</code>&nbsp;</td>
      <td><code>String</code></td>
      <td><code>loop</code></td>
      <td>
        <p>The animation mode.</p>          
        <table>
          <thead>
            <tr><th colspan="2" align="left">Animation Modes</th></tr>
            <tr>
              <th>Name</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><code>loop</code></td>
              <td>Repeats in a continuous loop.</td>
            </tr>
            <tr>
              <td><code>loop_reverse</code></td>
              <td>Repeats in a continuous loop in reverse.</td>
            </tr>
            <tr>
              <td><code>forwards</code></td>
              <td>Plays the animation and stops at the last frame.</td>
            </tr>
            <tr>
              <td><code>reverse</code></td>
              <td>Plays the animation in reverse and stops at the first frame.</td>
            </tr>
            <tr>
              <td><code>oscillate</code></td>
              <td>Loops back and forth continuously.</td>
            </tr>
            <tr>
              <td><code>random</code></td>
              <td>Randomly selects frames in a loop. Does not repeat the same frame twice.</td>
            </tr>
            <tr>
              <td><code>random_cycle</code></td>
              <td>Randomly selects frames in a loop, cycling through all frames before repeating.</td>
            </tr>
          </tbody>
        </table>
      </td>
    </tr>
    <tr>
      <td><code>width</code>&nbsp;</td>
      <td><code>int</code></td>
      <td>min dimension</td>
      <td>The width of each frame. Defaults to the smaller value between the image's width and height. Caps at image width.</td>
    </tr>
    <tr>
      <td><code>width</code>&nbsp;</td>
      <td><code>int</code></td>
      <td>min dimension</td>
      <td>The height of each frame. Defaults to the smaller value between the image's width and height. Caps at image height.</td>
    </tr>
    <tr>
      <td><code>frametime</code>&nbsp;</td>
      <td><code>int</code></td>
      <td><code>1</code></td>
      <td>The amount of ticks per frame. Min value: <code>1</code>.</td>
    </tr>
    <tr>
      <td><code>frames</code>&nbsp;</td>
      <td><code>Array</code></td>
      <td><code>null</code></td>
      <td>
        <p>Determines the order and/or time of the frames to be played.</p>
        <ul>
          <li>Array elements can either be an <strong><code>int</code></strong> or a <strong><code>Frame</code></strong> object.</li>
        </ul>
        <table>
          <thead><tr><th><code>int</code></th></tr></thead>
          <tbody><tr><td>Specifies the index of the frame in the sprite sheet starting from <code>0</code>.</td></tr></tbody>
        </table>
        <table>
          <thead>
            <tr><th colspan="3" align="left">Frame</th></tr>
            <tr>            
              <th>Key</th>
              <th>Type</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><code>index</code>&nbsp;*</td>
              <td><code>int</code></td>
              <td>Specifies the index of the frame in the sprite sheet starting from <code>0</code>.</td>
            </tr>
            <tr>
              <td><code>time</code>&nbsp;*</td>
              <td><code>int</code></td>
              <td>The <code>frametime</code> of the frame. Min value: <code>1</code>.</td>
            </tr>
          </tbody>
        </table>
      </td>
    </tr>
  </tbody>
</table>

#### Examples

```json [cursor-name.png.json]
{
	"animation": {
		"mode": "loop",
		"frametime": 4,
		"frames": [
			3,
			{ "index": 1, "time": 6 },
			0,
			5,
			{ "index": 2, "time": 3 }
		]
	}
}
```

- Animation loops continuously.
- Default frame duration is 4 ticks.
- Frames played in this order: 3 → 1 → 0 → 5 → 2.
- Frame 1 plays for 6 ticks (overridden).
- Frame 2 plays for 3 ticks (overridden).
- All other frames play for 4 ticks (default).

--- 

```json [cursor-name.png.json]
{
	"animation": {
		"frametime": 2
	}
}
```
- Frames are played in order from top to bottom.
- Each frame lasts two ticks.
- Animation loops by default.

## Practical Examples

For more examples, you can take a look at the built-in textures in the [source files](https://github.com/fishstiz/cursors_extended/tree/master/common/src/main/resources/resourcepacks).
