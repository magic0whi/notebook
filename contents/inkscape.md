## <u>N</u>ode Tool (N)

- Dragging over line with `<M>` to select their nodes, release to switch to rubber band mode.

| Key | Description |
| --- | ----------- |
| `!` | Invert node selection in current subpath(s) |
| `[`,`]` | rotate 15&deg |
| `<`,`>` | scale. |
| `2x<LMB>` or `<C-M-LMB>` | Add node |
| `2x<LMB>` or `<C-M-LMB>` or `<Del>` |  Delete node |
| `<C-Del>` | Delete node, but preserve the shape |
| `<S>-d` | Duplicate selected objects |
| `<S>-b` | Break selected nodes |
| `<S>-j` | Joins two selected endnodes |
| `<S>-c` | Make node cusp, which means its two handles can move independently at any angle |
| `<S>-s` | Make node smooth, which means its handles are always collinear |
| `<S>-y` | Make node symmetric, which is same as smooth, but the handles also have the same length |
| `<S>-a` | make node auto-smooth, which is a special node that automatically adjusts the handles and surrounding auto-smooth nodes to maintain a smooth curve |

> When switching the type of node, preserve one position of the two handles by hovering cursor over it. So that only the other handle is rotated/scaled to match.

| Key | Description |
| --- | ----------- |
| `<C-LMB>` | Retract handle |
| `<S-LMB>` | Pull out handle |
| `<C>-k` | Combine into compound path |
| `<C-S>-k` | Break apart compound path |
| `<C-S>-c` | Convert shape or text to path |
| `<C-S-M>-k` | Split path, split non-connected sections of a path |

> Compound path is not the same as a group. It's a single object which is only selectable as a whole.

> Parts of a path (i.e. a selection of nodes) can be copied with `<C>-c` and inserted as a new path with `<C>-v`.


Boolean Operators:

| Key | Description |
| --- | ----------- |
| `<C>-+` | Union |
| `<C>--` | Difference (Bottom minus top) |
| `<C>-*` | Intersection |
| `<C>-^` | Exclusion |
| `<C>-/` | Division |
| `<C-M>-/` | Cut Path |
| `<S-M>-f` | Fracture connected paths piece by piece |
|`<S>-f` | Flatten, new difference that remove all overlapped areas in the selected paths | 

> Exclusion command looks similar to combine, but it is different in that exclusion adds extra nodes where the original paths intersect.

> The difference between division and cut path is that the former cuts the entire bottom object by the path of the top object, while the latter only cuts the bottom object's stroke and removes any fill.

### Inset and Outset

Inkscape can expand and contract shapes not only by scaling, but also by offsetting an object's path, i.e. by displacing perpendicular to the path in each point.

| Key | Description |
| --- | ----------- |
| `<C>-(`,`)` | Inset/Outset |
| `<C>-j` | Dynamic Offset, create an object with a draggable handle controlling the offset distance |
| `<C-M>-i` | Linked Offset, create a dynamic offset linked to the original path |

### Simplification

`<C>-l`: Simplify. This may be useful for paths created by the Pencil tool. The amount of implication depends on the size of the selection. Moreover, the simplify command is accelerated if press `<C>-l` several times in quick succession.

### Shape Build Tool (<u>X</u>)

Before switch to the tool, select at least one overlapping object.

| Key | Description |
| --- | ----------- |
| `<LMB>` | Add a section to the result |
| `<S-LMB>` | Remove (can be used to create a hole in its place) |
| `<LMB>-Drag` | Connect multiple sections to one |
| `<S-LMB>-Drag` | Remove a contiguous section |

## Pen Tool (B)

| Key | Description |
| --- | ----------- |
| `<LMB>` | Creates a sharp node |
| `<LMB>-Drag` | Create a smooth Bézier node |
| `<S>-Drag` | Drag out a handle |
| `<C>` | Limit the direction of either the current line segment or the Bézier handles to 15&deg; increments |
| `<CR>` | Finalize the line |
| `<Esc>` | Cancel |

## <u>T</u>ext Tool

| Key | Description |
| --- | ----------- |
| `<C-S>-t` | Open the Text and Font dialog |
| `<M>-<`,`>` | Decrease/Increase the letter spacing of a text object |
| `<C-M>-<`,`>` | Adjust line spacing in multi-line text objects |
| `<M-Left,Right,Up,Down>` | Kerning the letters right of the cursor |
| `<LMB>-Drag` | Click and drag with the text tool |

## XML Editor

`<C-S>-x`: Allows to do tricks.
