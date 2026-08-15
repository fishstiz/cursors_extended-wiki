---
title: Creating Cursor Textures
---
# Creating Cursor Textures

**Requirements**:
- Minimum Size: **8x8**
- File name must match a [cursor name](getting-started.md#all-cursors).
- Format: **.png**

**Recommendations**:
- Use 1x scale for best resolution and accuracy, and dimensions in powers of two (16x16, 32x32, 64x64, etc.).
- Use 0x scale for GUI scale.
- Other scale values should be configured on a per-user basis.

## Animated Textures

1. In a single image, stack multiple textures vertically from top to bottom to create frames. 
   - All frames must have the same size. Refer to the requirements above.
   - The topmost frame will be used when the animation is disabled.
2. Create a [cursor settings](#animated-textures) file in the same directory as the image.
   - For example, if creating an animated texture for the `default` cursor, you will need the `default.png` and `default.png.json`.
3.  Add the `animation` property to the cursor settings file. Without it, the whole image will be read as a single cursor texture.
   ```json [cursor-name.png.json]
   {
    "animation": {}
   }
   ```

## Cursor Settings
Specifies the default cursor settings and may also include animation properties. This file is optional; if omitted, the default or inherited values will be applied instead.

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
      <td><code>height</code>&nbsp;</td>
      <td><code>int</code></td>
      <td>min dimension</td>
      <td>The height of each frame. Defaults to the smaller value between the image's width and height. Caps at image height.</td>
    </tr>
    <tr>
      <td><code>frametime</code>&nbsp;</td>
      <td><code>int</code></td>
      <td><code>1</code></td>
      <td>The frame duration in ticks. Min value: <code>1</code>.</td>
    </tr>
    <tr>
      <td><code>frames</code>&nbsp;</td>
      <td><code>Array</code></td>
      <td><code>null</code></td>
      <td>
        Determines which frames to play in the specified order and in the specified duration. 
        <p>If undefined, all frames will be played from top to bottom of the image.</p>
        <p>Array elements can either be an <strong><code>int</code></strong> or a <strong><code>Frame</code></strong> object.</p>
        <table>
          <thead><tr><th><code>int</code></th></tr></thead>
          <tbody><tr><td>The frame's index (or position) in the image. Starts from <code>0</code>.</td></tr></tbody>
        </table>
        <table>
          <thead>
            <tr>
              <th colspan="3" align="left">
                Frame
              </th>
            </tr>
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
              <td>Required. The frame's index (or position) in the image. Starts from <code>0</code>.</td>
            </tr>
            <tr>
              <td><code>time</code>&nbsp;*</td>
              <td><code>int</code></td>
              <td>Required. The frame duration in ticks. Min value: <code>1</code>.</td>
            </tr>
          </tbody>
        </table>
      </td>
    </tr>
  </tbody>
</table>

#### Example

Suppose we have an animated texture for the default cursor. It has four frames, each with a different color:
1. Frame `0` is <span style="color: red">Red</span>.
2. Frame `1` is <span style="color: orange">Orange</span>.
3. Frame `2` is <span style="color: yellow">Yellow</span>.
4. Frame `3` is <span style="color: green">Green</span>.

<figure>
  <img
    src="/assets/examples/cursor-settings-example1.png"
    alt="Cursor Settings Example 1"
    width="100"
  />
  <figcaption style="text-align: center"><code>default.png</code></figcaption>
</figure>

Next we add the following cursor settings. Note the line numbers.

```json:line-numbers [default.png.json]
{
	"animation": {
		"mode": "loop",
		"frametime": 2,
		"frames": [
			3,
			{ "index": 1, "time": 4 },
			0
		]
	}
}
```

With these settings, our animated texture will play in this order:

1. <span style="color: green">Green</span> **for 2 ticks.**
   - line #6 specifies frame `3` (or green) as the first frame to play.
   - line #4 specifies the frame duration as 2 ticks.
2. <span style="color: orange">Orange</span> **for 4 ticks.**
   - line #7 specifies frame `1` (or orange) as the next frame and should play for 4 ticks instead of 2 from line #4.
3. <span style="color: red">Red</span> **for 2 ticks.**
   - line #8 specifies frame `0` (or red) as the last frame
   - line #4 specifies the frame duration as 2 ticks.
4. **Repeat.**
   - line #3 specifies the animation mode as "loop"
- <span style="color: yellow">Yellow</span> is never played since it's not included in `frames`.

Most of the animation settings are optional, so lets remove everything but the `frametime`:

```json:line-numbers [default.png.json]
{
	"animation": {
		"frametime": 2
	}
}
```

Now the animated texture will loop and play all frames in the natural order in 2 ticks per frame.

1. <span style="color: red">Red</span> **for 2 ticks**.
2. <span style="color: orange">Orange</span> **for 2 ticks**.
3. <span style="color: yellow">Yellow</span> **for 2 ticks**.
4. <span style="color: green">Green</span> **for 2 ticks**.
5. **Repeat**
   - "loop" is the default animation mode.


## Practical Examples

For more examples, you can take a look at the built-in textures in the [source files](https://github.com/fishstiz/cursors_extended/tree/master/common/src/main/resources/resourcepacks).

You may also view the community-made resource packs [here](/resource-pack/showcase).