const galleryThemes = {
  locale: { label: "Il locale" },
  food: { label: "Colazioni & food" },
  drinks: { label: "Drink & bottiglie" },
  events: { label: "Feste & serate" },
};

const toIdSet = (values) => new Set(values.trim().split(/\s+/).filter(Boolean).map(Number));
const padGalleryId = (value) => String(value).padStart(4, "0");

const missingPhotoIds = toIdSet(
  "14 15 17 20 21 27 28 31 35 38 39 40 47 48 49 51 52 53 54 55 59 64 65 66 75 77 79 81 83 86 87 91 94 98 102 106 108 112 113 114 116 118 120 124 125 129 137 139 143 144 146 148 149 150 151 153 157 160 162 163 166 167 168 171 174 175 176 177 184 187 190 193 196 197 199 202 203 204 207 208 209 210 211 212 213 214 216 217 226 230",
);
const missingVideoIds = toIdSet(
  "239 240 243 245 246 247 248 250 253 255 257 260 262 263 266 268 271 272 273 282 286 288 293 298 299 301 302 305 306 307 308 309 311 321 324 326 329 333 334 335 337",
);

const foodPhotoIds = toIdSet(
  "19 20 25 26 27 28 30 31 36 37 38 39 40 41 44 45 46 47 48 50 51 53 54 55 68 72 78 79 83 84 88 92 93 95 96 100 105 106 108 109 112 118 119 120 121 122 123 124 125 126 129 132 133 135 136 137 138 143 145 151 154 156 161 164 172 173 174 179 183 193 194 219 226",
);
const localePhotoIds = toIdSet("56 58 64 67 73 76 77 82 90 115 116 134 220 222 224");
const eventPhotoIds = toIdSet(
  "16 23 32 33 34 42 43 57 69 85 99 101 104 111 131 139 140 141 147 149 155 163 180 185 186 188 189 191 192 195 196 197 198 199 200 206 225",
);

const foodVideoIds = toIdSet("244 252 285 291 300 313 314 315 316 317 318 325 327 330 338");
const localeVideoIds = toIdSet("258 281 287 295 297 310");
const eventVideoIds = toIdSet(
  "232 234 235 236 241 242 265 269 270 274 275 280 283 292 294 301 303 304 312 319 320 323 328 336",
);

function galleryThemeFor(id, type) {
  if (type === "photo") {
    if (eventPhotoIds.has(id)) return "events";
    if (localePhotoIds.has(id)) return "locale";
    if (foodPhotoIds.has(id)) return "food";
    return "drinks";
  }

  if (eventVideoIds.has(id)) return "events";
  if (localeVideoIds.has(id)) return "locale";
  if (foodVideoIds.has(id)) return "food";
  return "drinks";
}

const galleryPhotos = [
  {
    id: "photo-dom-perignon",
    type: "photo",
    theme: "drinks",
    src: "assets/gallery/photos/IMG-20260703-WA0049.webp",
  },
  ...Array.from({ length: 217 }, (_, index) => index + 14)
    .filter((id) => !missingPhotoIds.has(id))
    .map((id) => ({
      id: `photo-${id}`,
      type: "photo",
      theme: galleryThemeFor(id, "photo"),
      src: `assets/gallery/photos/IMG-20260721-WA${padGalleryId(id)}.webp`,
    })),
];

const galleryVideos = Array.from({ length: 108 }, (_, index) => index + 231)
  .filter((id) => !missingVideoIds.has(id))
  .map((id) => ({
    id: `video-${id}`,
    type: "video",
    theme: galleryThemeFor(id, "video"),
    src: `assets/gallery/videos/VID-20260721-WA${padGalleryId(id)}.mp4`,
    poster: `assets/gallery/posters/VID-20260721-WA${padGalleryId(id)}.webp?v=20260727-2`,
  }));

function interleaveGalleryMedia(photos, videos) {
  const items = [];
  let photoIndex = 0;
  let videoIndex = 0;

  while (photoIndex < photos.length || videoIndex < videos.length) {
    for (let index = 0; index < 3 && photoIndex < photos.length; index += 1) {
      items.push(photos[photoIndex]);
      photoIndex += 1;
    }
    if (videoIndex < videos.length) {
      items.push(videos[videoIndex]);
      videoIndex += 1;
    }
  }

  return items;
}

const galleryItems = interleaveGalleryMedia(galleryPhotos, galleryVideos);
const galleryGrid = document.querySelector("#gallery-grid");
const galleryFilters = document.querySelector("#gallery-filters");
const galleryMore = document.querySelector("#gallery-more");
const galleryCount = document.querySelector("#gallery-count");
const galleryDialog = document.querySelector("#gallery-dialog");
const galleryDialogMedia = document.querySelector("#gallery-dialog-media");
const galleryPosition = document.querySelector("#gallery-position");

let activeGalleryTheme = "all";
let visibleGalleryItems = 16;
let currentGalleryItems = galleryItems;
let activeGalleryIndex = 0;

function refreshGalleryIcons() {
  window.lucide?.createIcons({ attrs: { "aria-hidden": "true" } });
}

function galleryMediaLabel(item) {
  return item.type === "video" ? "Video" : "Foto";
}

function renderGallery() {
  currentGalleryItems =
    activeGalleryTheme === "all"
      ? galleryItems
      : galleryItems.filter((item) => item.theme === activeGalleryTheme);

  const visibleItems = currentGalleryItems.slice(0, visibleGalleryItems);
  galleryGrid.innerHTML = visibleItems
    .map((item) => {
      const themeLabel = galleryThemes[item.theme].label;
      const imageSource = item.poster || item.src;
      const mediaLabel = galleryMediaLabel(item);
      return `
        <button
          class="gallery-card"
          type="button"
          data-gallery-item="${item.id}"
          aria-label="Apri ${mediaLabel.toLowerCase()}: ${themeLabel}"
        >
          <img src="${imageSource}" alt="${mediaLabel} ${themeLabel} al Paradiso" loading="lazy" />
          <span class="gallery-card-type" aria-hidden="true">
            <i data-lucide="${item.type === "video" ? "play" : "maximize-2"}"></i>
          </span>
        </button>
      `;
    })
    .join("");

  const remaining = currentGalleryItems.length - visibleItems.length;
  galleryCount.textContent = `${currentGalleryItems.length} contenuti`;
  galleryMore.parentElement.hidden = remaining <= 0;
  galleryMore.querySelector("span").textContent = remaining > 0 ? `Mostra altri (${remaining})` : "Tutto mostrato";
  refreshGalleryIcons();
}

function showGalleryItem(index) {
  activeGalleryIndex = (index + currentGalleryItems.length) % currentGalleryItems.length;
  const item = currentGalleryItems[activeGalleryIndex];
  const themeLabel = galleryThemes[item.theme].label;
  const mediaLabel = galleryMediaLabel(item);

  galleryDialogMedia.replaceChildren();
  if (item.type === "video") {
    const video = document.createElement("video");
    video.src = item.src;
    video.poster = item.poster;
    video.controls = true;
    video.autoplay = true;
    video.playsInline = true;
    video.preload = "metadata";
    galleryDialogMedia.append(video);
  } else {
    const image = document.createElement("img");
    image.src = item.src;
    image.alt = `${mediaLabel} ${themeLabel} al Paradiso`;
    galleryDialogMedia.append(image);
  }

  galleryPosition.textContent = `${activeGalleryIndex + 1} / ${currentGalleryItems.length}`;
}

function openGalleryItem(itemId) {
  const itemIndex = currentGalleryItems.findIndex((item) => item.id === itemId);
  if (itemIndex < 0) return;
  showGalleryItem(itemIndex);
  galleryDialog.showModal();
  document.body.classList.add("gallery-open");
}

function closeGallery() {
  galleryDialogMedia.querySelector("video")?.pause();
  galleryDialog.close();
  document.body.classList.remove("gallery-open");
}

galleryFilters.addEventListener("click", (event) => {
  const button = event.target.closest("[data-gallery-filter]");
  if (!button) return;
  activeGalleryTheme = button.dataset.galleryFilter;
  visibleGalleryItems = 16;
  galleryFilters.querySelectorAll("[data-gallery-filter]").forEach((filterButton) => {
    filterButton.setAttribute("aria-selected", String(filterButton === button));
  });
  renderGallery();
});

galleryGrid.addEventListener("click", (event) => {
  const button = event.target.closest("[data-gallery-item]");
  if (button) openGalleryItem(button.dataset.galleryItem);
});

galleryMore.addEventListener("click", () => {
  visibleGalleryItems += 16;
  renderGallery();
});

document.querySelector(".gallery-dialog-close").addEventListener("click", closeGallery);
document.querySelector("#gallery-previous").addEventListener("click", () => showGalleryItem(activeGalleryIndex - 1));
document.querySelector("#gallery-next").addEventListener("click", () => showGalleryItem(activeGalleryIndex + 1));

galleryDialog.addEventListener("click", (event) => {
  const bounds = galleryDialog.getBoundingClientRect();
  const isBackdrop =
    event.clientX < bounds.left ||
    event.clientX > bounds.right ||
    event.clientY < bounds.top ||
    event.clientY > bounds.bottom;
  if (isBackdrop) closeGallery();
});

galleryDialog.addEventListener("close", () => {
  galleryDialogMedia.querySelector("video")?.pause();
  document.body.classList.remove("gallery-open");
});

galleryDialog.addEventListener("keydown", (event) => {
  if (event.key === "ArrowLeft") showGalleryItem(activeGalleryIndex - 1);
  if (event.key === "ArrowRight") showGalleryItem(activeGalleryIndex + 1);
});

renderGallery();
