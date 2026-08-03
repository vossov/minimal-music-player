# Minimal Music Player

A very compact Lovelace media card for Home Assistant. Album art as the
background, the track on a single line, only the buttons you actually press,
and a thin progress bar along the bottom edge. Built with Music Assistant in
mind, but it works with any `media_player` entity.

![preview](preview.png)

- Speaker chips, so you pick which player you are controlling.
- Title and artist on **one** line (`{title} · {artist}`), scrolling when too long.
- Only the controls you list — by default play/pause, next, favourite and stop.
- No dead space: the card is 132 px high out of the box.
- Artwork fills the whole card, with an optional blur and dim.
- Or: a sharp cover thumbnail in a corner over a blurred background.
- Thin progress bar at the very bottom, tap it to seek.
- Everything above is configurable, from the GUI editor or in YAML.

## Installation

### Manual

1. Copy `minimal-music-player.js` to `/config/www/`.
2. Settings → Dashboards → ⋮ → Resources → **Add resource**
   - URL: `/local/minimal-music-player.js`
   - Type: **JavaScript module**
3. Reload the page (hard refresh if the card does not show up).

### HACS (custom repository)

HACS → ⋮ → Custom repositories → add this repository with category
**Dashboard**, then install it and add the resource as above.

## Quick start

```yaml
type: custom:minimal-music-player
entities:
  - media_player.soundbar_tv
  - media_player.speaker_keuken_2
  - media_player.speaker_slaapkamer
```

Everything else has a sensible default. The card shows up in the card picker
as *Minimal Music Player* and has a GUI editor for the common options.

## Options

### Entities

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `entities` | list | *(required)* | Media players. A plain entity id, or `{entity: ..., name: ...}` / `{entity_id: ...}` to override the label. |

```yaml
entities:
  - media_player.soundbar_tv
  - entity: media_player.speaker_keuken_2
    name: Keuken
```

The card follows whichever player is playing. Tap a chip to control a specific
one; that choice sticks until that player stops. Long-press (right click) a
chip for the more-info dialog.

### Layout

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `height` | number | `132` | Card height in pixels. |
| `radius` | number | `18` | Corner radius. |
| `font_size` | number | `15` | Size of the text line. |
| `control_size` | number | `24` | Icon size. |

### Artwork

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `artwork` | `background` \| `none` | `background` | Use the cover as the card background. |
| `artwork_fit` | `cover` \| `contain` | `cover` | How the artwork fills the card. |
| `artwork_position` | string | `center center` | Any CSS `background-position`, e.g. `center 30%`. |
| `blur` | number | `0` | Blur radius in pixels. |
| `dim` | number | `0.35` | Black overlay, `0`–`1`. |
| `gradient` | boolean | `true` | Extra gradient behind the text for legibility. |
| `accent` | string | `theme` | Progress bar, volume slider and active icons (favourite, shuffle, repeat). |
| `icon_color` | string | `white` | The control icons themselves. |

Both take a keyword or any CSS colour:

| Keyword | Resolves to |
| --- | --- |
| `theme` | `var(--primary-color)` — follows the active Home Assistant theme |
| `accent` | `var(--accent-color)` |
| `text` | `var(--primary-text-color)` |
| `white` | `#ffffff` |

Anything else is passed through, so `"#8b7cff"`, `"rgb(139 124 255)"` and
`"var(--my-theme-variable, #fff)"` all work. Themes publish their colours as
CSS custom properties on the document and those cross into the card, so
`theme` needs no wiring — recolour your theme and the bar follows.

The icons default to white rather than to the theme on purpose: they sit on
top of album art, and white stays readable over any photo. `icon_color: theme`
is there if you want them coloured anyway, but check it against a few dark
covers first.

### Cover thumbnail

Fills the empty corner with a sharp copy of the cover while the background
stays blurred behind it.

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `show_cover` | boolean | `false` | Show the thumbnail. |
| `cover_size` | number | `76` | Size in pixels. Clamped so it always fits the card height. |
| `cover_position` | string | `bottom right` | `bottom right`, `bottom left`, `top right` or `top left`. |
| `cover_radius` | number | `10` | Corner radius; set it to half the size for a circle. |

```yaml
show_cover: true
```

That is all you need — switching the thumbnail on sets `blur: 10` for you,
because a sharp cover on top of a sharp background reads as mush. It is only a
starting point: set `blur` yourself and that wins, at any value including
`blur: 0` for a background that stays sharp. Around `4` the artwork is still
legible behind the card, `10` softens it to a wash of its colours, and past
`16` it is a featureless gradient.

The text and the buttons keep clear of the thumbnail automatically, so the
timestamps land next to it rather than under it.

### Text

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `title_format` | string | `{title} · {artist}` | The single text line. |
| `idle_format` | string | `{name}` | Shown when nothing is playing. |
| `marquee` | boolean | `true` | Scroll the line when it does not fit. |

Placeholders: `{title}`, `{artist}`, `{album}`, `{series}`, `{channel}`,
`{app}`, `{name}` (the speaker), `{state}`. A missing value drops the
separator in front of it, so `{title} · {artist}` never leaves a dangling `·`.

### Chips

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `show_chips` | `auto` \| `always` \| `never` | `auto` | `auto` hides them when there is only one speaker. |
| `chip_artwork` | boolean | `true` | Show the cover as the chip avatar. |
| `chip_labels` | boolean | `true` | Set to `false` for avatar-only chips. |
| `hide_inactive` | boolean | `false` | Drop speakers that are idle, off or unavailable. |

`hide_inactive` keeps the row down to whatever is actually running, which is
usually the difference between chips that fit and chips that scroll. The
trade-off is that a hidden speaker cannot be tapped, so the row stops being a
way to switch players and becomes a display of what is on. The speaker being
controlled always keeps its chip, even once it goes quiet — otherwise the
buttons would point at something you cannot see.

### Controls

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `controls` | list | `[play, next, favorite, stop]` | Which buttons, in this order. |
| `stop_behavior` | `stop` \| `turn_off` | `stop` | What the stop button does. |

Available buttons: `prev`, `play`, `next`, `favorite`, `stop`, `power`,
`shuffle`, `repeat`, `volume_down`, `volume_up`. Buttons the player does not
support are dimmed.

```yaml
controls: [play, next, favorite, stop, volume_down, volume_up]
```

The volume buttons move by `volume_step` (default `0.05`) and set the level
outright rather than calling Home Assistant's `volume_up` / `volume_down`,
which step by whatever the integration decided and are usually far too coarse.
Each press lands on a whole percent, so holding a small step does not drift.
They dim at 0% and 100%. Players that cannot take an absolute level fall back
to the stepping services.

### Progress and volume

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `show_progress` | boolean | `true` | The bar at the bottom edge. |
| `show_timestamps` | boolean | `false` | `1:16 / 4:10` next to the buttons. |
| `seek` | boolean | `true` | Tap the bar to seek (if the player supports it). |
| `show_volume` | boolean | `false` | Slim volume slider above the progress bar. |
| `volume_step` | number | `0.05` | How far one press of `volume_down` / `volume_up` moves, `0`–`1`. |

### Behaviour

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `idle` | `dim` \| `hide` \| `show` | `dim` | What to do when nothing is playing. |
| `tap_action` | action | `more-info` | Tapping the artwork. |
| `hold_action` | action | `none` | Holding the artwork. |
| `favorite_action` | action | – | What the heart does. |
| `favorite_entity` | entity | – | Entity that reflects "is favourite" (`on` = filled heart). |

`tap_action`, `hold_action` and `favorite_action` take the standard Home
Assistant action config (`more-info`, `navigate`, `url`, `toggle`,
`call-service`, `none`).

## The heart button

Home Assistant has no generic "favourite" service, so the heart is wired up by
you. Point it at whatever your setup uses — a Music Assistant script, a shell
command, a REST command:

```yaml
favorite_action:
  action: call-service
  service: script.favorite_current_track
  data:
    entity_id: media_player.speaker_keuken_2
```

To make the heart fill in when a track *is* a favourite, give it a state to
read — for example a template sensor or an `input_boolean`:

```yaml
favorite_entity: input_boolean.current_track_favorite
```

Without `favorite_action` the heart still animates, but it only tells you it is
not configured yet. Drop `favorite` from `controls` if you do not want it.

## Recipes

Replacing a `yet-another-media-player` setup:

```yaml
type: custom:minimal-music-player
entities:
  - media_player.soundbar_tv
  - media_player.speaker_keuken_2
  - media_player.speaker_slaapkamer
height: 140
show_timestamps: true
visibility:
  - condition: or
    conditions:
      - condition: state
        entity: media_player.soundbar_tv_3
        state: playing
      - condition: state
        entity: media_player.speaker_keuken
        state: playing
      - condition: state
        entity: media_player.speaker_slaapkamer
        state: playing
  - condition: state
    entity: input_boolean.media_dashboard
    state: "on"
```

As bare as it gets — one speaker, no chips, three buttons:

```yaml
type: custom:minimal-music-player
entities:
  - media_player.speaker_keuken_2
height: 100
controls: [play, next, favorite]
control_size: 22
font_size: 14
```

Cover in the corner, timestamps beside it:

```yaml
type: custom:minimal-music-player
entities:
  - media_player.speaker_keuken_2
  - media_player.speaker_slaapkamer
show_cover: true
cover_size: 88
height: 160
show_timestamps: true
```

Frosted look, avatar-only chips:

```yaml
type: custom:minimal-music-player
entities:
  - media_player.speaker_keuken_2
  - media_player.speaker_slaapkamer
blur: 16
dim: 0.45
chip_labels: false
accent: "#8b7cff"
```

## Browser support

The card is loaded as an ES module and is not bundled or transpiled, so the
source is what the browser parses. It targets **Chrome 61 and up**, which is
where ES modules land, to stay usable in the older Android WebViews that the
Home Assistant companion app runs on.

That rules out a few things that are otherwise ordinary: optional chaining and
`??` (Chrome 80) are a *parse* error, which kills the whole module and stops
the custom element from ever registering; flexbox `gap` (Chrome 84) and the
`inset` shorthand (Chrome 87) are silently dropped and wreck the layout. CI
parses the file at ES2018 and greps for those properties on every push,
because a rendering test in a current headless Chrome cannot catch any of it.

`backdrop-filter` and `mask-image` are used, but only for the frosted chips and
the fade at the end of a long line. Where they are unsupported you lose the
effect and nothing else.

## Notes

- The card collapses itself with `idle: hide`, which pairs well with a
  `visibility:` block if you want the row to disappear entirely.
- Playback position is extrapolated between state updates, so the bar moves
  smoothly instead of jumping once a minute.
- Animations are disabled when the system asks for reduced motion.

## License

MIT — see [LICENSE](LICENSE). Use, modify and redistribute it, commercially
too; the licence text travels along and there is no warranty.
