---
title: Ensuring Compatibility
prev: 
    text: Getting Started
    link: /resource-pack/getting-started 
---
# Ensuring Compatibility

Cursors Extended **does not** provide a Java API. Since Minecraft 1.21.9, a standard cursor API has been made available in Vanilla. Use that for compatibility with this mod and others that may use GLFW cursors.

- `CursorType`: Represents a GLFW cursor containing the handle and name.
- `CursorTypes`: Contains premade `CursorType`s.
- `GuiGraphics#requestCursor(CursorType)`: Schedules a cursor to be applied after render calls, ensuring priority for top rendered elements and preventing conflicts.
- `Window#selectCursor(CursorType)`: Immediately applies the cursor and tracks the current cursor type. Use sparingly to reduce conflicts.
- `CursorType#select()`: Immediately applies the cursor. Avoid calling directly, as it may cause conflicts and desynchronize state.

## Creating Custom Cursors
- When creating a custom cursor, make use of `CursorType` so it can be selected, identified (`#toString()`), and tracked via `GuiGraphics#requestCursor` or `Window#selectCursor`.

  An accessor mixin or access widener/transformer may be required to initialize a `CursorType`.
- If Cursors Extended is loaded, you may make use of its cursor creation system by simply creating and selecting a `CursorType` whose name points to a cursor in a resource pack.

## Using Cursors Extended Cursors
- If you want to make use of the extra cursor shapes provided by Cursors Extended, you can create a `CursorType` object with the matching name (see: [Extra Cursors](/resource-pack/getting-started#extra-cursors)). The handle does not matter.