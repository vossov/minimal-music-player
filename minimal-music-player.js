/*
 * Minimal Music Player
 * A very compact Lovelace media card: artwork background, one text line,
 * a handful of controls and a thin progress bar. Built for Music Assistant
 * but works with any media_player entity.
 *
 * No build step, no dependencies -- drop the file in /config/www/ and add it
 * as a module resource.
 */

const CARD_VERSION = "1.2.0";

/* ------------------------------------------------------------------ icons */

const ICONS = {
  play: "M8,5.14V19.14L19,12.14L8,5.14Z",
  pause: "M14,19H18V5H14M6,19H10V5H6V19Z",
  next: "M16,18H18V6H16M6,18L14.5,12L6,6V18Z",
  prev: "M6,18V6H8V18H6M9.5,12L18,6V18L9.5,12Z",
  stop: "M18,18H6V6H18V18Z",
  power:
    "M16.56,5.44L15.11,6.89C16.84,7.94 18,9.83 18,12A6,6 0 0,1 12,18A6,6 0 0,1 6,12C6,9.83 7.16,7.94 8.88,6.88L7.44,5.44C5.36,6.88 4,9.28 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12C20,9.28 18.64,6.88 16.56,5.44M13,3H11V13H13",
  heart:
    "M12,21.35L10.55,20.03C5.4,15.36 2,12.27 2,8.5C2,5.41 4.42,3 7.5,3C9.24,3 10.91,3.81 12,5.08C13.09,3.81 14.76,3 16.5,3C19.58,3 22,5.41 22,8.5C22,12.27 18.6,15.36 13.45,20.03L12,21.35Z",
  heartOutline:
    "M12.1,18.55L12,18.65L11.89,18.55C7.14,14.24 4,11.39 4,8.5C4,6.5 5.5,5 7.5,5C9.04,5 10.54,6 11.07,7.36H12.93C13.46,6 14.96,5 16.5,5C18.5,5 20,6.5 20,8.5C20,11.39 16.86,14.24 12.1,18.55M16.5,3C14.76,3 13.09,3.81 12,5.08C10.91,3.81 9.24,3 7.5,3C4.42,3 2,5.41 2,8.5C2,12.27 5.4,15.36 10.55,20.03L12,21.35L13.45,20.03C18.6,15.36 22,12.27 22,8.5C22,5.41 19.58,3 16.5,3Z",
  shuffle:
    "M14.83,13.41L13.42,14.82L16.55,17.95L14.5,20H20V14.5L17.96,16.54L14.83,13.41M14.5,4L16.54,6.04L4,18.59L5.41,20L17.96,7.46L20,9.5V4M10.59,9.17L5.41,4L4,5.41L9.17,10.58L10.59,9.17Z",
  repeat:
    "M17,17H7V14L3,18L7,22V19H19V13H17M7,7H17V10L21,6L17,2V5H5V11H7V7Z",
  repeatOne:
    "M13,15V9H12L10,10V11H11.5V15M17,17H7V14L3,18L7,22V19H19V13H17M7,7H17V10L21,6L17,2V5H5V11H7V7Z",
  volumeDown: "M3,9H7L12,4V20L7,15H3V9M14,11H22V13H14V11Z",
  volumeUp:
    "M3,9H7L12,4V20L7,15H3V9M14,11H17V8H19V11H22V13H19V16H17V13H14V11Z",
  volume:
    "M14,3.23V5.29C16.89,6.15 19,8.83 19,12C19,15.17 16.89,17.84 14,18.7V20.77C18,19.86 21,16.28 21,12C21,7.72 18,4.14 14,3.23M16.5,12C16.5,10.23 15.5,8.71 14,7.97V16C15.5,15.29 16.5,13.76 16.5,12M3,9V15H7L12,20V4L7,9H3Z",
  speaker:
    "M12,3A3,3 0 0,0 9,6A3,3 0 0,0 12,9A3,3 0 0,0 15,6A3,3 0 0,0 12,3M12,11A5,5 0 0,0 7,16A5,5 0 0,0 12,21A5,5 0 0,0 17,16A5,5 0 0,0 12,11M12,13A3,3 0 0,1 15,16A3,3 0 0,1 12,19A3,3 0 0,1 9,16A3,3 0 0,1 12,13Z",
  menu: "M3,6H21V8H3V6M3,11H21V13H3V11M3,16H21V18H3V16Z",
};

/* ------------------------------------------------- media_player constants */

const SUPPORT = {
  PAUSE: 1,
  SEEK: 2,
  VOLUME_SET: 4,
  VOLUME_MUTE: 8,
  VOLUME_STEP: 1024,
  PREVIOUS_TRACK: 16,
  NEXT_TRACK: 32,
  TURN_ON: 128,
  TURN_OFF: 256,
  STOP: 4096,
  PLAY: 16384,
  SHUFFLE_SET: 32768,
  REPEAT_SET: 262144,
};

const ACTIVE_STATES = ["playing", "paused", "buffering", "on"];

/* ---------------------------------------------------------------- helpers */

function fireEvent(node, type, detail = {}) {
  const event = new Event(type, {
    bubbles: true,
    cancelable: false,
    composed: true,
  });
  event.detail = detail;
  node.dispatchEvent(event);
  return event;
}

function normalizeEntity(item) {
  if (typeof item === "string") return { entity: item };
  if (!item || typeof item !== "object") return null;
  const entity = item.entity || item.entity_id;
  if (!entity) return null;
  return { ...item, entity };
}

/* Spelled out rather than using `?.`: the card ships unbundled and has to
 * parse on the older Android WebViews that Home Assistant companion apps
 * still run on, where optional chaining is a syntax error. */
function stateName(stateObj) {
  return stateObj ? stateObj.state : undefined;
}

function attrsOf(stateObj) {
  return (stateObj && stateObj.attributes) || {};
}

function supports(stateObj, feature) {
  return ((attrsOf(stateObj).supported_features || 0) & feature) !== 0;
}

function formatTime(seconds) {
  if (seconds === null || seconds === undefined || isNaN(seconds)) return "";
  const total = Math.max(0, Math.round(seconds));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const pad = (n) => String(n).padStart(2, "0");
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
}

/* Fill "{title} · {artist}" and drop separators around empty values. */
function renderTemplate(template, values) {
  const tokens = template.split(/(\{[a-z_]+\})/g);
  const parts = [];
  let pending = "";

  for (const token of tokens) {
    const match = /^\{([a-z_]+)\}$/.exec(token);
    if (!match) {
      pending += token;
      continue;
    }
    const value = values[match[1]];
    if (!value) {
      // Drop the literal that was waiting in front of a missing value.
      pending = "";
      continue;
    }
    if (parts.length) parts.push(pending);
    parts.push(value);
    pending = "";
  }
  return parts.join("").trim().replace(/^[\s·|,\-–—]+|[\s·|,\-–—]+$/g, "");
}

/* ----------------------------------------------------------- default conf */

const DEFAULTS = {
  entities: [],
  height: 132,
  radius: 18,
  artwork: "background", // background | none
  artwork_fit: "cover", // cover | contain
  artwork_position: "center center",
  blur: 0,
  dim: 0.35,
  show_cover: false,
  cover_size: 64,
  cover_position: "bottom right",
  cover_radius: 10,
  gradient: true,
  accent: "#ffffff",
  title_format: "{title} · {artist}",
  idle_format: "{name}",
  font_size: 15,
  marquee: true,
  show_chips: "auto", // auto | always | never
  chip_artwork: true,
  chip_labels: true,
  hide_inactive: false,
  controls: ["play", "next", "favorite", "stop"],
  control_size: 24,
  show_progress: true,
  show_timestamps: false,
  seek: true,
  show_volume: false,
  volume_step: 0.05,
  idle: "dim", // dim | hide | show
  stop_behavior: "stop", // stop | turn_off
  favorite_entity: null,
  favorite_action: null,
  tap_action: { action: "more-info" },
  hold_action: { action: "none" },
};

const CONTROL_TYPES = [
  "prev",
  "play",
  "next",
  "favorite",
  "stop",
  "power",
  "shuffle",
  "repeat",
  "volume_down",
  "volume_up",
];

/* ------------------------------------------------------------------- card */

class MinimalMusicPlayer extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._config = null;
    this._hass = null;
    this._selected = null; // entity id picked by tapping a chip
    this._entities = [];
    this._tick = null;
    this._holdTimer = null;
    this._seeking = false;
    this._built = false;
    this._els = {};
  }

  static getStubConfig(hass) {
    const players = Object.keys((hass && hass.states) || {})
      .filter((id) => id.startsWith("media_player."))
      .slice(0, 3);
    return { entities: players };
  }

  static getConfigElement() {
    return document.createElement("minimal-music-player-editor");
  }

  setConfig(config) {
    const entities = (config.entities || [])
      .map(normalizeEntity)
      .filter(Boolean);

    if (!entities.length) {
      throw new Error("Define at least one media_player in `entities`.");
    }

    let controls = config.controls == null ? DEFAULTS.controls : config.controls;
    if (typeof controls === "string") controls = [controls];
    controls = controls.filter((c) => CONTROL_TYPES.includes(c));

    let showChips =
      config.show_chips == null ? DEFAULTS.show_chips : config.show_chips;
    if (showChips === true) showChips = "always";
    if (showChips === false) showChips = "never";

    this._config = { ...DEFAULTS, ...config, controls, show_chips: showChips };

    // A sharp cover on top of a sharp background is mush, so blur the
    // background unless the user picked a value themselves.
    if (this._config.show_cover && config.blur === undefined) {
      this._config.blur = 18;
    }

    this._entities = entities;
    this._built = false;
    this.shadowRoot.innerHTML = "";
    if (this._hass) this._build();
  }

  set hass(hass) {
    this._hass = hass;
    if (!this._config) return;
    if (!this._built) this._build();
    this._update();
  }

  getCardSize() {
    const height = (this._config && this._config.height) || 132;
    return Math.max(2, Math.ceil(height / 50));
  }

  connectedCallback() {
    this._startTicker();
  }

  disconnectedCallback() {
    this._stopTicker();
  }

  /* ------------------------------------------------------ entity plumbing */

  _stateOf(entityId) {
    return this._hass && this._hass.states
      ? this._hass.states[entityId]
      : undefined;
  }

  /* The chip the user picked wins, until that player stops. Otherwise the
   * first player that is actually playing something. */
  _activeEntity() {
    const ids = this._entities.map((e) => e.entity);
    const isActive = (id) =>
      ACTIVE_STATES.includes(stateName(this._stateOf(id)));

    if (this._selected && isActive(this._selected)) return this._selected;

    const playing = ids.find(
      (id) => stateName(this._stateOf(id)) === "playing",
    );
    if (playing) return playing;

    if (this._selected && ids.includes(this._selected)) return this._selected;
    return ids.find(isActive) || ids[0];
  }

  _entityConfig(entityId) {
    return this._entities.find((e) => e.entity === entityId) || {};
  }

  _friendlyName(entityId) {
    const conf = this._entityConfig(entityId);
    if (conf.name) return conf.name;
    const stateObj = this._stateOf(entityId);
    return attrsOf(stateObj).friendly_name || entityId;
  }

  _artworkUrl(stateObj) {
    if (!stateObj) return null;
    const pic =
      stateObj.attributes.entity_picture_local ||
      stateObj.attributes.entity_picture;
    if (!pic) return null;
    // HA serves artwork from a relative path; anything else (data:, http:) is
    // already usable as-is.
    return pic.startsWith("/") ? `${location.origin}${pic}` : pic;
  }

  /* Live playback position, extrapolated from the last state update. */
  _position(stateObj) {
    if (!stateObj) return null;
    const { media_position, media_position_updated_at, media_duration } =
      stateObj.attributes;
    if (media_position === undefined || !media_duration) return null;

    let position = media_position;
    if (stateObj.state === "playing" && media_position_updated_at) {
      const since =
        (Date.now() - new Date(media_position_updated_at).getTime()) / 1000;
      position += Math.max(0, since);
    }
    return {
      position: Math.min(position, media_duration),
      duration: media_duration,
    };
  }

  /* ------------------------------------------------------------- services */

  _call(domain, service, data) {
    this._hass.callService(domain, service, data);
  }

  _mediaCall(service, extra = {}) {
    const entityId = this._activeEntity();
    if (!entityId) return;
    this._call("media_player", service, { entity_id: entityId, ...extra });
  }

  _handleAction(actionConfig, entityId) {
    const config = actionConfig || { action: "none" };
    switch (config.action) {
      case "none":
        break;
      case "more-info":
        fireEvent(this, "hass-more-info", {
          entityId: config.entity || entityId || this._activeEntity(),
        });
        break;
      case "navigate":
        if (!config.navigation_path) break;
        history.pushState(null, "", config.navigation_path);
        fireEvent(window, "location-changed", { replace: false });
        break;
      case "url":
        if (config.url_path) window.open(config.url_path);
        break;
      case "toggle":
        if (config.entity) {
          this._call("homeassistant", "toggle", { entity_id: config.entity });
        }
        break;
      case "call-service":
      case "perform-action": {
        const target = config.service || config.perform_action;
        if (!target) break;
        const [domain, service] = target.split(".");
        if (!domain || !service) break;
        this._call(domain, service, {
          ...(config.data || config.service_data || {}),
          ...(config.target || {}),
        });
        break;
      }
      default:
        break;
    }
  }

  /* ---------------------------------------------------------------- build */

  _build() {
    const c = this._config;
    const root = this.shadowRoot;
    root.innerHTML = "";

    const style = document.createElement("style");
    style.textContent = this._css();
    root.appendChild(style);

    const card = document.createElement("ha-card");
    card.className = "card";
    card.innerHTML = `
      <div class="bg"></div>
      <div class="scrim"></div>
      <div class="cover"></div>
      <div class="content">
        <div class="chips"></div>
        <div class="spacer"></div>
        <div class="info"><div class="marquee"><span class="text"></span></div></div>
        <div class="row">
          <div class="controls"></div>
          <div class="times"></div>
        </div>
        <div class="volume"><input type="range" min="0" max="100" step="1" /></div>
      </div>
      <div class="progress"><div class="fill"></div></div>
    `;
    root.appendChild(card);

    this._els = {
      card,
      bg: card.querySelector(".bg"),
      cover: card.querySelector(".cover"),
      chips: card.querySelector(".chips"),
      info: card.querySelector(".info"),
      marquee: card.querySelector(".marquee"),
      text: card.querySelector(".text"),
      controls: card.querySelector(".controls"),
      times: card.querySelector(".times"),
      volume: card.querySelector(".volume"),
      slider: card.querySelector(".volume input"),
      progress: card.querySelector(".progress"),
      fill: card.querySelector(".fill"),
      buttons: {},
    };

    if (c.show_cover) {
      const tokens = String(c.cover_position).toLowerCase().split(/\s+/);
      const vertical = tokens.includes("top") ? "top" : "bottom";
      const horizontal = tokens.includes("left") ? "left" : "right";
      card.classList.add("has-cover", `cover-${vertical}`, `cover-${horizontal}`);
    }

    this._buildChips();
    this._buildControls();

    // Card-level tap / hold on the artwork itself.
    const surface = card.querySelector(".scrim");
    surface.addEventListener("pointerdown", () => {
      this._holdTimer = window.setTimeout(() => {
        this._holdTimer = null;
        this._handleAction(c.hold_action);
      }, 500);
    });
    const cancelHold = () => {
      if (this._holdTimer) {
        clearTimeout(this._holdTimer);
        this._holdTimer = null;
        return true;
      }
      return false;
    };
    surface.addEventListener("pointerleave", cancelHold);
    surface.addEventListener("pointerup", () => {
      if (cancelHold()) this._handleAction(c.tap_action);
    });

    if (c.show_progress && c.seek) {
      this._els.progress.addEventListener("click", (ev) => this._seek(ev));
    }

    this._els.slider.addEventListener("change", (ev) => {
      this._mediaCall("volume_set", {
        volume_level: Number(ev.target.value) / 100,
      });
    });

    this._built = true;
    this._startTicker();
  }

  _buildChips() {
    const c = this._config;
    const container = this._els.chips;
    container.innerHTML = "";
    this._els.chipEls = {};

    for (const conf of this._entities) {
      const chip = document.createElement("button");
      chip.className = "chip";
      chip.type = "button";
      chip.innerHTML = `
        <span class="chip-art"></span>
        <span class="chip-name"></span>
        <span class="eq"><i></i><i></i><i></i></span>
      `;
      if (!c.chip_labels) chip.classList.add("no-label");
      if (!c.chip_artwork) chip.classList.add("no-art");

      chip.addEventListener("click", (ev) => {
        ev.stopPropagation();
        this._selected = conf.entity;
        this._update();
      });
      chip.addEventListener("contextmenu", (ev) => {
        ev.preventDefault();
        fireEvent(this, "hass-more-info", { entityId: conf.entity });
      });

      container.appendChild(chip);
      this._els.chipEls[conf.entity] = {
        root: chip,
        art: chip.querySelector(".chip-art"),
        name: chip.querySelector(".chip-name"),
      };
    }
  }

  _buildControls() {
    const c = this._config;
    const container = this._els.controls;
    container.innerHTML = "";
    this._els.buttons = {};

    for (const type of c.controls) {
      const button = document.createElement("button");
      button.className = `btn btn-${type}`;
      button.type = "button";
      button.innerHTML = `<svg viewBox="0 0 24 24"><path d=""/></svg>`;
      button.addEventListener("click", (ev) => {
        ev.stopPropagation();
        this._press(type);
      });
      container.appendChild(button);
      this._els.buttons[type] = {
        root: button,
        path: button.querySelector("path"),
      };
    }
  }

  /* --------------------------------------------------------------- update */

  _update() {
    if (!this._built || !this._hass) return;
    const c = this._config;
    const entityId = this._activeEntity();
    const stateObj = this._stateOf(entityId);
    const state = stateName(stateObj) || "unavailable";
    const idle = !ACTIVE_STATES.includes(state);

    if (idle && c.idle === "hide") {
      this.style.display = "none";
      return;
    }
    this.style.display = "";
    this._els.card.classList.toggle("idle", idle);
    this._els.card.classList.toggle("dim-idle", idle && c.idle === "dim");

    this._updateBackground(stateObj);
    this._updateText(entityId, stateObj, idle);
    this._updateChips(entityId);
    this._updateControls(stateObj, state);
    this._updateProgress(stateObj);
    this._updateVolume(stateObj);
  }

  _updateBackground(stateObj) {
    const url = this._artworkUrl(stateObj);
    const next = url ? `url("${url}")` : "none";

    if (this._config.artwork !== "none") {
      if (this._els.bg.style.backgroundImage !== next) {
        this._els.bg.style.backgroundImage = next;
      }
      this._els.card.classList.toggle("no-art", !url);
    }

    if (this._config.show_cover) {
      if (this._els.cover.style.backgroundImage !== next) {
        this._els.cover.style.backgroundImage = next;
      }
      this._els.cover.classList.toggle("hidden", !url);
    }
  }

  _updateText(entityId, stateObj, idle) {
    const c = this._config;
    const attrs = attrsOf(stateObj);
    const values = {
      title: attrs.media_title || "",
      artist: attrs.media_artist || attrs.media_album_artist || "",
      album: attrs.media_album_name || "",
      series: attrs.media_series_title || "",
      channel: attrs.media_channel || "",
      app: attrs.app_name || "",
      name: this._friendlyName(entityId),
      state: stateName(stateObj) || "",
    };

    const template = idle || !values.title ? c.idle_format : c.title_format;
    const text = renderTemplate(template, values) || values.name;

    if (this._els.text.textContent !== text) {
      this._els.text.textContent = text;
      this._applyMarquee();
    }
  }

  _applyMarquee() {
    const el = this._els.marquee;
    el.classList.remove("scroll");
    if (!this._config.marquee) return;

    requestAnimationFrame(() => {
      const overflow = this._els.text.scrollWidth - el.clientWidth;
      if (overflow <= 4) return;
      el.style.setProperty("--marquee-distance", `${overflow + 16}px`);
      el.style.setProperty(
        "--marquee-duration",
        `${Math.max(6, (overflow + 16) / 24)}s`,
      );
      el.classList.add("scroll");
    });
  }

  _updateChips(activeId) {
    const c = this._config;
    const visible =
      c.show_chips === "always" ||
      (c.show_chips === "auto" && this._entities.length > 1);
    this._els.chips.style.display = visible ? "" : "none";
    if (!visible) return;

    for (const conf of this._entities) {
      const els = this._els.chipEls[conf.entity];
      if (!els) continue;
      const stateObj = this._stateOf(conf.entity);
      const state = stateName(stateObj) || "unavailable";

      const inactive = !ACTIVE_STATES.includes(state);
      els.root.classList.toggle("active", conf.entity === activeId);
      els.root.classList.toggle("playing", state === "playing");
      els.root.classList.toggle("off", inactive);
      // The player being controlled keeps its chip even when it goes quiet,
      // otherwise the controls would point at something you cannot see.
      els.root.classList.toggle(
        "gone",
        c.hide_inactive && inactive && conf.entity !== activeId,
      );

      const name = this._friendlyName(conf.entity);
      if (els.name.textContent !== name) els.name.textContent = name;
      els.root.title = name;

      if (c.chip_artwork) {
        const url = this._artworkUrl(stateObj);
        const next = url ? `url("${url}")` : "";
        if (els.art.style.backgroundImage !== next) {
          els.art.style.backgroundImage = next;
        }
        els.art.classList.toggle("fallback", !url);
        if (!url && !els.art.innerHTML) {
          els.art.innerHTML = `<svg viewBox="0 0 24 24"><path d="${ICONS.speaker}"/></svg>`;
        } else if (url) {
          els.art.innerHTML = "";
        }
      }
    }

    const chips = this._els.chips;
    chips.classList.toggle(
      "overflowing",
      chips.scrollWidth > chips.clientWidth + 2,
    );
  }

  _updateControls(stateObj, state) {
    const c = this._config;
    const favorited =
      c.favorite_entity &&
      stateName(this._stateOf(c.favorite_entity)) === "on";

    for (const type of c.controls) {
      const els = this._els.buttons[type];
      if (!els) continue;
      let path = ICONS[type];
      let disabled = !stateObj;

      switch (type) {
        case "play":
          path = state === "playing" ? ICONS.pause : ICONS.play;
          disabled = disabled || !supports(stateObj, SUPPORT.PLAY | SUPPORT.PAUSE);
          break;
        case "next":
          disabled = disabled || !supports(stateObj, SUPPORT.NEXT_TRACK);
          break;
        case "prev":
          disabled = disabled || !supports(stateObj, SUPPORT.PREVIOUS_TRACK);
          break;
        case "stop":
          disabled = disabled || !ACTIVE_STATES.includes(state);
          break;
        case "favorite":
          path = favorited ? ICONS.heart : ICONS.heartOutline;
          els.root.classList.toggle("on", !!favorited);
          disabled = false;
          break;
        case "volume_down":
        case "volume_up": {
          const up = type === "volume_up";
          path = up ? ICONS.volumeUp : ICONS.volumeDown;
          const canSet = supports(stateObj, SUPPORT.VOLUME_SET);
          const level = attrsOf(stateObj).volume_level;
          disabled =
            disabled || !(canSet || supports(stateObj, SUPPORT.VOLUME_STEP));
          // Dim the end of the range instead of letting it look live.
          if (!disabled && canSet && typeof level === "number") {
            disabled = up ? level >= 0.999 : level <= 0.001;
          }
          break;
        }
        case "shuffle":
          path = ICONS.shuffle;
          els.root.classList.toggle("on", !!attrsOf(stateObj).shuffle);
          disabled = disabled || !supports(stateObj, SUPPORT.SHUFFLE_SET);
          break;
        case "repeat": {
          const repeat = attrsOf(stateObj).repeat || "off";
          path = repeat === "one" ? ICONS.repeatOne : ICONS.repeat;
          els.root.classList.toggle("on", repeat !== "off");
          disabled = disabled || !supports(stateObj, SUPPORT.REPEAT_SET);
          break;
        }
        default:
          break;
      }

      if (els.path.getAttribute("d") !== path) els.path.setAttribute("d", path);
      els.root.classList.toggle("disabled", disabled);
    }
  }

  _updateProgress(stateObj) {
    const c = this._config;
    if (!c.show_progress) {
      this._els.progress.style.display = "none";
      this._els.times.style.display = "none";
      return;
    }

    const progress = this._position(stateObj);
    this._els.progress.style.display = progress ? "" : "none";
    if (progress) {
      const ratio = progress.duration
        ? Math.min(1, progress.position / progress.duration)
        : 0;
      this._els.fill.style.transform = `scaleX(${ratio})`;
    }

    if (!c.show_timestamps || !progress) {
      this._els.times.style.display = "none";
      return;
    }
    this._els.times.style.display = "";
    const label = `${formatTime(progress.position)} / ${formatTime(progress.duration)}`;
    if (this._els.times.textContent !== label) {
      this._els.times.textContent = label;
    }
  }

  _updateVolume(stateObj) {
    const c = this._config;
    const canSet = c.show_volume && supports(stateObj, SUPPORT.VOLUME_SET);
    this._els.volume.style.display = canSet ? "" : "none";
    if (!canSet) return;
    const level = Math.round((stateObj.attributes.volume_level || 0) * 100);
    if (document.activeElement !== this._els.slider) {
      this._els.slider.value = String(level);
    }
  }

  /* ------------------------------------------------------------- actions */

  _press(type) {
    const c = this._config;
    const entityId = this._activeEntity();
    const stateObj = this._stateOf(entityId);

    switch (type) {
      case "play":
        this._mediaCall("media_play_pause");
        break;
      case "next":
        this._mediaCall("media_next_track");
        break;
      case "prev":
        this._mediaCall("media_previous_track");
        break;
      case "stop":
        if (c.stop_behavior === "turn_off") this._mediaCall("turn_off");
        else this._mediaCall("media_stop");
        break;
      case "power":
        this._mediaCall(
          ACTIVE_STATES.includes(stateName(stateObj)) ? "turn_off" : "turn_on",
        );
        break;
      case "shuffle":
        this._mediaCall("shuffle_set", {
          shuffle: !attrsOf(stateObj).shuffle,
        });
        break;
      case "repeat": {
        const order = ["off", "all", "one"];
        const current = attrsOf(stateObj).repeat || "off";
        const next = order[(order.indexOf(current) + 1) % order.length];
        this._mediaCall("repeat_set", { repeat: next });
        break;
      }
      case "volume_down":
        this._stepVolume(stateObj, -1);
        break;
      case "volume_up":
        this._stepVolume(stateObj, 1);
        break;
      case "favorite":
        this._favorite(entityId);
        break;
      default:
        break;
    }
  }

  /* Home Assistant's own volume_up/volume_down step by whatever the
   * integration decided, which is usually far too coarse. Set the level
   * outright where the player allows it, and fall back to the services only
   * for players that cannot take an absolute level. */
  _stepVolume(stateObj, direction) {
    const step = Number(this._config.volume_step) || 0.05;

    if (!supports(stateObj, SUPPORT.VOLUME_SET)) {
      this._mediaCall(direction > 0 ? "volume_up" : "volume_down");
      return;
    }

    const current = Number(attrsOf(stateObj).volume_level) || 0;
    const next = Math.min(1, Math.max(0, current + direction * step));
    if (Math.abs(next - current) < 0.0005) return;

    // Round to whole percent so repeated presses cannot drift.
    this._mediaCall("volume_set", { volume_level: Math.round(next * 100) / 100 });
  }

  _favorite(entityId) {
    const c = this._config;
    const favoriteButton = this._els.buttons.favorite;
    const button = favoriteButton && favoriteButton.root;
    if (button) {
      button.classList.remove("pulse");
      void button.offsetWidth; // restart the animation
      button.classList.add("pulse");
    }

    if (c.favorite_action) {
      this._handleAction(c.favorite_action, entityId);
      return;
    }
    if (c.favorite_entity) {
      this._call("homeassistant", "toggle", { entity_id: c.favorite_entity });
      return;
    }
    // Nothing wired up: tell the user instead of silently doing nothing.
    fireEvent(this, "hass-notification", {
      message:
        "Minimal Music Player: set `favorite_action` (or `favorite_entity`) to make the heart do something.",
    });
  }

  _seek(ev) {
    const stateObj = this._stateOf(this._activeEntity());
    if (!supports(stateObj, SUPPORT.SEEK)) return;
    const progress = this._position(stateObj);
    if (!progress) return;

    const rect = this._els.progress.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (ev.clientX - rect.left) / rect.width));
    this._mediaCall("media_seek", {
      seek_position: Math.round(ratio * progress.duration),
    });
  }

  /* --------------------------------------------------------------- ticker */

  _startTicker() {
    if (this._tick || !this._built) return;
    this._tick = window.setInterval(() => {
      if (!this._hass) return;
      const stateObj = this._stateOf(this._activeEntity());
      if (stateName(stateObj) === "playing") this._updateProgress(stateObj);
    }, 500);
  }

  _stopTicker() {
    if (this._tick) {
      clearInterval(this._tick);
      this._tick = null;
    }
  }

  /* ------------------------------------------------------------------ css */

  _css() {
    const c = this._config;
    const fit = c.artwork_fit === "contain" ? "contain" : "cover";
    return `
      :host {
        --mmp-accent: ${c.accent};
        --mmp-height: ${c.height}px;
        --mmp-radius: ${c.radius}px;
        --mmp-icon: ${c.control_size}px;
        --mmp-font: ${c.font_size}px;
        --mmp-cover: ${c.cover_size}px;
        --mmp-cover-radius: ${c.cover_radius}px;
        --mmp-cover-inset: 12px;
        --mmp-cover-space: calc(var(--mmp-cover) + var(--mmp-cover-inset) + 10px);
        display: block;
      }
      .card {
        display: block;
        position: relative;
        height: var(--mmp-height);
        border-radius: var(--mmp-radius);
        overflow: hidden;
        color: #fff;
        background: var(--card-background-color, #1c1c1c);
      }
      /* Fade the content, not the card: an opaque card keeps its own
         background instead of bleeding the dashboard through. */
      .card.dim-idle .content { opacity: 0.62; }
      .content { transition: opacity 220ms ease; }

      .bg {
        position: absolute;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
        background-size: ${fit};
        background-position: ${c.artwork_position};
        background-repeat: no-repeat;
        filter: blur(${c.blur}px);
        transform: scale(${c.blur > 0 ? 1 + c.blur / 40 : 1});
        transition: background-image 400ms ease;
      }
      .card.no-art .bg {
        background: linear-gradient(135deg, #2b2b31, #17171a);
      }

      .scrim {
        position: absolute;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
        background:
          ${
            c.gradient
              ? "linear-gradient(to top, rgba(0,0,0,.85) 0%, rgba(0,0,0,.45) 45%, rgba(0,0,0,.15) 75%, rgba(0,0,0,.35) 100%),"
              : ""
          }
          rgba(0, 0, 0, ${c.dim});
        cursor: pointer;
      }

      /* --------------------------------------------------- cover thumbnail */
      .cover {
        position: absolute;
        z-index: 1;
        width: var(--mmp-cover);
        height: var(--mmp-cover);
        border-radius: var(--mmp-cover-radius);
        background-size: cover;
        background-position: center;
        box-shadow: 0 8px 22px rgba(0, 0, 0, 0.5);
        pointer-events: none;
        display: none;
        transition: opacity 300ms ease;
      }
      .card.has-cover .cover { display: block; }
      .cover.hidden { opacity: 0; }
      .cover-bottom .cover { bottom: var(--mmp-cover-inset); }
      .cover-top .cover { top: var(--mmp-cover-inset); }
      .cover-right .cover { right: var(--mmp-cover-inset); }
      .cover-left .cover { left: var(--mmp-cover-inset); }

      /* Keep text and controls clear of the thumbnail. */
      .cover-bottom.cover-right .info,
      .cover-bottom.cover-right .row,
      .cover-bottom.cover-right .volume { padding-right: var(--mmp-cover-space); }
      .cover-bottom.cover-left .info,
      .cover-bottom.cover-left .row,
      .cover-bottom.cover-left .volume { padding-left: var(--mmp-cover-space); }
      /* The chip row scrolls, so it needs a smaller box -- padding would let
         chips slide underneath the thumbnail. */
      .cover-top.cover-right .chips { margin-right: var(--mmp-cover-space); }
      .cover-top.cover-left .chips { margin-left: var(--mmp-cover-space); }

      .content {
        position: relative;
        height: 100%;
        display: flex;
        flex-direction: column;
        padding: 10px 12px ${c.show_progress ? 10 : 8}px;
        box-sizing: border-box;
        pointer-events: none;
      }
      .content > * + * { margin-top: 4px; }
      /* Sit above the progress bar's enlarged hit area so taps on the
         controls and the volume slider are never swallowed by it. */
      .content > * { pointer-events: auto; position: relative; z-index: 2; }
      .spacer { flex: 1 1 auto; min-height: 0; pointer-events: none; }

      /* ------------------------------------------------------------ chips */
      .chips {
        display: flex;
        overflow-x: auto;
        scrollbar-width: none;
        margin: -2px -2px 0;
        padding: 2px;
      }
      .chips::-webkit-scrollbar { display: none; }
      .chip + .chip { margin-left: 6px; }
      /* Hint that there are more speakers to the right. */
      .chips.overflowing {
        -webkit-mask-image: linear-gradient(to right, #000 84%, transparent 100%);
        mask-image: linear-gradient(to right, #000 84%, transparent 100%);
      }

      .chip {
        display: inline-flex;
        align-items: center;
        flex: 0 0 auto;
        max-width: 62%;
        padding: 3px 10px 3px 3px;
        border: 1px solid rgba(255, 255, 255, 0.22);
        border-radius: 999px;
        background: rgba(0, 0, 0, 0.28);
        -webkit-backdrop-filter: blur(8px);
        backdrop-filter: blur(8px);
        color: rgba(255, 255, 255, 0.82);
        font: inherit;
        font-size: 12px;
        line-height: 1;
        cursor: pointer;
        transition: background 160ms ease, color 160ms ease, border-color 160ms ease;
      }
      .chip > * + * { margin-left: 6px; }
      .chip.gone { display: none; }
      .chip.no-label { padding: 3px; }
      .chip.no-label .chip-name { display: none; }
      .chip.no-art { padding-left: 10px; }
      .chip.no-art .chip-art { display: none; }
      .chip.off { opacity: 0.55; }
      .chip.active {
        background: rgba(255, 255, 255, 0.92);
        border-color: transparent;
        color: #101014;
      }

      .chip-art {
        width: 20px;
        height: 20px;
        border-radius: 50%;
        flex: 0 0 auto;
        background-size: cover;
        background-position: center;
        background-color: rgba(255, 255, 255, 0.16);
        display: grid;
        place-items: center;
      }
      .chip-art svg { width: 13px; height: 13px; fill: currentColor; opacity: 0.75; }

      .chip-name {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .eq { display: none; align-items: flex-end; height: 10px; }
      .eq i + i { margin-left: 2px; }
      .chip.playing .eq { display: inline-flex; }
      .eq i {
        width: 2px;
        background: currentColor;
        border-radius: 1px;
        animation: eq 900ms ease-in-out infinite;
      }
      .eq i:nth-child(1) { height: 5px; animation-delay: -200ms; }
      .eq i:nth-child(2) { height: 9px; animation-delay: -600ms; }
      .eq i:nth-child(3) { height: 6px; animation-delay: -400ms; }
      @keyframes eq {
        0%, 100% { transform: scaleY(0.4); }
        50% { transform: scaleY(1); }
      }

      /* ------------------------------------------------------------- info */
      .info { min-width: 0; }
      .marquee {
        overflow: hidden;
        white-space: nowrap;
        -webkit-mask-image: linear-gradient(to right, #000 88%, transparent 100%);
        mask-image: linear-gradient(to right, #000 88%, transparent 100%);
      }
      .marquee .text {
        display: inline-block;
        font-size: var(--mmp-font);
        font-weight: 500;
        letter-spacing: 0.1px;
        text-shadow: 0 1px 3px rgba(0, 0, 0, 0.55);
      }
      .marquee.scroll .text {
        animation: marquee var(--marquee-duration, 10s) linear infinite alternate;
      }
      @keyframes marquee {
        0%, 12% { transform: translateX(0); }
        88%, 100% { transform: translateX(calc(-1 * var(--marquee-distance, 0px))); }
      }

      /* --------------------------------------------------------- controls */
      .row {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      .controls {
        display: flex;
        align-items: center;
      }
      /* 12px, not 14px: each button carries 2px of padding and -2px of
         margin, so this lands on the same 14px gap between the glyphs. */
      .btn + .btn { margin-left: 12px; }
      .btn {
        border: 0;
        background: none;
        padding: 2px;
        margin: -2px;
        cursor: pointer;
        color: #fff;
        line-height: 0;
        border-radius: 50%;
        transition: transform 120ms ease, opacity 160ms ease;
      }
      .btn svg {
        width: var(--mmp-icon);
        height: var(--mmp-icon);
        fill: currentColor;
        filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.5));
      }
      .btn:hover { transform: scale(1.08); }
      .btn:active { transform: scale(0.94); }
      .btn.disabled { opacity: 0.3; pointer-events: none; }
      .btn.on { color: var(--mmp-accent); }
      .btn.pulse { animation: pulse 420ms ease; }
      @keyframes pulse {
        40% { transform: scale(1.3); }
        100% { transform: scale(1); }
      }

      .times {
        margin-left: 8px;
        font-size: 11px;
        font-variant-numeric: tabular-nums;
        opacity: 0.75;
        white-space: nowrap;
        text-shadow: 0 1px 2px rgba(0, 0, 0, 0.6);
      }

      /* ----------------------------------------------------------- volume */
      .volume { display: flex; align-items: center; padding-top: 2px; }
      .volume input {
        -webkit-appearance: none;
        appearance: none;
        width: 100%;
        height: 3px;
        border-radius: 2px;
        background: rgba(255, 255, 255, 0.3);
        cursor: pointer;
      }
      .volume input::-webkit-slider-thumb {
        -webkit-appearance: none;
        width: 11px;
        height: 11px;
        border-radius: 50%;
        background: var(--mmp-accent);
      }
      .volume input::-moz-range-thumb {
        width: 11px;
        height: 11px;
        border: 0;
        border-radius: 50%;
        background: var(--mmp-accent);
      }

      /* --------------------------------------------------------- progress */
      .progress {
        position: absolute;
        left: 0;
        right: 0;
        bottom: 0;
        height: 3px;
        background: rgba(255, 255, 255, 0.18);
        cursor: ${c.seek ? "pointer" : "default"};
      }
      .progress::before {
        content: "";
        position: absolute;
        top: -8px;
        right: 0;
        bottom: 0;
        left: 0;
      }
      .fill {
        height: 100%;
        width: 100%;
        transform-origin: left center;
        transform: scaleX(0);
        background: var(--mmp-accent);
        transition: transform 500ms linear;
      }

      @media (prefers-reduced-motion: reduce) {
        .marquee.scroll .text,
        .eq i,
        .btn.pulse { animation: none; }
        .fill { transition: none; }
      }
    `;
  }
}

customElements.define("minimal-music-player", MinimalMusicPlayer);

/* ----------------------------------------------------------- gui editor */

const EDITOR_SCHEMA = [
  {
    name: "entities",
    selector: { entity: { multiple: true, filter: { domain: "media_player" } } },
  },
  { name: "title_format", selector: { text: {} } },
  {
    name: "controls",
    selector: {
      select: {
        multiple: true,
        mode: "list",
        options: CONTROL_TYPES.map((value) => ({ value, label: value })),
      },
    },
  },
  {
    type: "grid",
    name: "",
    schema: [
      { name: "height", selector: { number: { min: 80, max: 420, mode: "box" } } },
      { name: "radius", selector: { number: { min: 0, max: 48, mode: "box" } } },
      {
        name: "control_size",
        selector: { number: { min: 14, max: 48, mode: "box" } },
      },
      {
        name: "volume_step",
        selector: { number: { min: 0.01, max: 0.5, step: 0.01, mode: "box" } },
      },
      { name: "font_size", selector: { number: { min: 10, max: 30, mode: "box" } } },
      { name: "blur", selector: { number: { min: 0, max: 30, mode: "box" } } },
      {
        name: "dim",
        selector: { number: { min: 0, max: 1, step: 0.05, mode: "box" } },
      },
    ],
  },
  {
    type: "grid",
    name: "",
    schema: [
      { name: "show_progress", selector: { boolean: {} } },
      { name: "show_timestamps", selector: { boolean: {} } },
      { name: "seek", selector: { boolean: {} } },
      { name: "marquee", selector: { boolean: {} } },
      { name: "gradient", selector: { boolean: {} } },
      { name: "chip_artwork", selector: { boolean: {} } },
      { name: "chip_labels", selector: { boolean: {} } },
      { name: "hide_inactive", selector: { boolean: {} } },
      { name: "show_volume", selector: { boolean: {} } },
      { name: "show_cover", selector: { boolean: {} } },
    ],
  },
  {
    type: "grid",
    name: "",
    schema: [
      {
        name: "cover_size",
        selector: { number: { min: 32, max: 160, mode: "box" } },
      },
      {
        name: "cover_radius",
        selector: { number: { min: 0, max: 80, mode: "box" } },
      },
      {
        name: "cover_position",
        selector: {
          select: {
            mode: "dropdown",
            options: [
              "bottom right",
              "bottom left",
              "top right",
              "top left",
            ],
          },
        },
      },
    ],
  },
  {
    type: "grid",
    name: "",
    schema: [
      {
        name: "show_chips",
        selector: {
          select: {
            mode: "dropdown",
            options: ["auto", "always", "never"],
          },
        },
      },
      {
        name: "idle",
        selector: {
          select: { mode: "dropdown", options: ["dim", "hide", "show"] },
        },
      },
      {
        name: "stop_behavior",
        selector: {
          select: { mode: "dropdown", options: ["stop", "turn_off"] },
        },
      },
      { name: "artwork_position", selector: { text: {} } },
      { name: "accent", selector: { text: {} } },
      {
        name: "favorite_entity",
        selector: { entity: {} },
      },
    ],
  },
];

const EDITOR_LABELS = {
  entities: "Speakers",
  title_format: "Text line",
  controls: "Buttons",
  height: "Height (px)",
  radius: "Corner radius",
  control_size: "Icon size",
  font_size: "Font size",
  blur: "Artwork blur",
  dim: "Artwork dim",
  show_progress: "Progress bar",
  show_timestamps: "Timestamps",
  seek: "Tap bar to seek",
  marquee: "Scroll long text",
  gradient: "Legibility gradient",
  chip_artwork: "Artwork on chips",
  chip_labels: "Names on chips",
  hide_inactive: "Hide idle speakers",
  show_volume: "Volume slider",
  volume_step: "Volume button step",
  show_cover: "Cover thumbnail",
  cover_size: "Cover size",
  cover_radius: "Cover radius",
  cover_position: "Cover corner",
  show_chips: "Speaker chips",
  idle: "When idle",
  stop_behavior: "Stop button",
  artwork_position: "Artwork position",
  accent: "Accent colour",
  favorite_entity: "Favourite state entity",
};

class MinimalMusicPlayerEditor extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._config = {};
    this._form = null;
  }

  setConfig(config) {
    this._config = config || {};
    this._render();
  }

  set hass(hass) {
    this._hass = hass;
    if (this._form) this._form.hass = hass;
  }

  _data() {
    const entities = (this._config.entities || [])
      .map(normalizeEntity)
      .filter(Boolean)
      .map((e) => e.entity);
    return { ...DEFAULTS, ...this._config, entities };
  }

  _render() {
    if (!this._form) {
      this.shadowRoot.innerHTML = `
        <style>
          .hint {
            margin-top: 12px;
            font-size: 12px;
            line-height: 1.5;
            color: var(--secondary-text-color);
          }
          code { font-size: 11px; }
        </style>
      `;
      this._form = document.createElement("ha-form");
      this._form.schema = EDITOR_SCHEMA;
      this._form.computeLabel = (schema) =>
        EDITOR_LABELS[schema.name] || schema.name;
      this._form.addEventListener("value-changed", (ev) =>
        this._valueChanged(ev),
      );
      this.shadowRoot.appendChild(this._form);

      const hint = document.createElement("div");
      hint.className = "hint";
      hint.innerHTML =
        "The heart needs <code>favorite_action</code> (a service call, e.g. a Music Assistant script) " +
        "in YAML. <code>tap_action</code>, <code>hold_action</code> and per-speaker names are YAML-only too.";
      this.shadowRoot.appendChild(hint);
    }
    if (this._hass) this._form.hass = this._hass;
    this._form.data = this._data();
  }

  _valueChanged(ev) {
    ev.stopPropagation();
    const value = { ...ev.detail.value };

    // Keep per-entity overrides (name/icon) that the form does not know about.
    const previous = (this._config.entities || [])
      .map(normalizeEntity)
      .filter(Boolean);
    value.entities = (value.entities || []).map((id) => {
      const existing = previous.find((e) => e.entity === id);
      return existing && Object.keys(existing).length > 1 ? existing : id;
    });

    // Drop anything still equal to the default so the YAML stays short.
    const config = { type: this._config.type || "custom:minimal-music-player" };
    for (const [key, val] of Object.entries(value)) {
      if (val === undefined || val === null || val === "") continue;
      if (JSON.stringify(val) === JSON.stringify(DEFAULTS[key])) continue;
      config[key] = val;
    }
    for (const key of ["tap_action", "hold_action", "favorite_action", "idle_format"]) {
      if (this._config[key] !== undefined) config[key] = this._config[key];
    }

    this._config = config;
    fireEvent(this, "config-changed", { config });
  }
}

customElements.define("minimal-music-player-editor", MinimalMusicPlayerEditor);

/* ------------------------------------------------------------ card picker */

window.customCards = window.customCards || [];
window.customCards.push({
  type: "minimal-music-player",
  name: "Minimal Music Player",
  preview: true,
  description:
    "Compact media card: artwork background, one text line, a few controls and a thin progress bar.",
});

console.info(
  `%c MINIMAL-MUSIC-PLAYER %c ${CARD_VERSION} `,
  "background:#101014;color:#fff;border-radius:3px 0 0 3px;padding:1px 4px",
  "background:#6c5ce7;color:#fff;border-radius:0 3px 3px 0;padding:1px 4px",
);
