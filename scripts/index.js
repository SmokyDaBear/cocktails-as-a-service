import { changeSlide, slideshowLoop } from "./additional/slideshow.js";
import {
  addActive,
  removeActive,
  closeAll,
  createModal,
  toggleFavorite,
  formatSimple,
  buildPage,
  createRandomModal,
} from "./additional/additional.js";

import {
  searchEnter,
  updateSearchResults,
  searchClick,
  showMoreResults,
} from "./additional/search.js";

import { getSettings, toggleSetting } from "./additional/settings.js";
import { buildPageSearches } from "./additional/build.js";
import { Drink } from "./classes/drinks.js";

//URL for the db
const dbURL = "https://www.thecocktaildb.com/api/json/v1/1/";

//For reference
const elmDatasets = {
  activate: "[data-activate]",
  deactivate: "[data-deactivate]",
  toggleBtn: "[data-toggle-btn]",
  modal: "[data-create-modal]",
  searchBar: "[data-key-search]",
  random: `[data-search="random"]`,
  changeSlide: `[data-change-slide]`,
};

const config = {
  elmClasses: {
    active: "active",
    hidden: "hidden",
    searchBar: "search-bar",
    searchBtn: "search-btn",
    toggleOn: "fa-toggle-on",
    toggleOff: "fa-toggle-off",
    playBtn: "fa-play",
    pauseBtn: "fa-pause",
  },
  elementContainers: {
    drinks: document.getElementById("results-container"),
    stats: document.getElementById("stats-container"),
    favorites: document.getElementById("favorites"),
    statsFavorites: document.getElementById("stats-favorites-container"),
    modal: document.getElementById("modal-container"),
    featured: document.getElementById("featured"),
    hero: document.getElementById("hero-section"),
    showMore: document.getElementById("show-more"),
  },
  getDataset: {
    activate: (elm) => elm.dataset.activate || false,
    deactivate: (elm) => elm.dataset.deactivate || false,
    toggleBtn: (elm) => elm.dataset.toggleBtn || false,
    modal: (elm) => elm.dataset.createModal || false,
    drinkName: (elm) => elm.dataset.drinkName || false,
    toggleFave: (elm) =>
      elm.dataset.addFavorite ? [elm.dataset.addFavorite, elm] : false,
    changeSlide: (elm) => elm.dataset.changeSlide || false,
    search: (elm) => (elm.dataset.clickSearch ? elm : false),
    showMore: (elm) => elm.dataset.showMore || false,
    random: (elm) => (elm.dataset.randomModal ? "random" : false),
  },
  featuredDrinkIds: {
    alcoholic: [11007, 12528, 17105, 11001, 11728],
    sober: [12862, 12710, 12730, 12782, 12726],
  },
  drinkCache: {
    byId: new Map(),
    byName: new Map(),
    soberIds: new Set(),
  },
  settings: {
    pauseSlideshow: false,
    forcePauseSlideshow: false,
    numDrinksPerPage: 2,
    delayTime: 4000,
    currentSlide: 0,
  },
};
//Build search bars and filter options if needed
buildPageSearches();
/**
 * Settings that can be retrieved from and saved to local storage
 * @type {Object}
 */
const settingsDefaults = {
  isSober: false,
  filterByIngredient: false,
  sortReverse: false,
  displayTable: false,
};

//Retrieve settings from localStorage, or set defaults
getSettings(config, settingsDefaults);

/**
 * Event handlers for various clickable elements
 */
const eventHandler = {
  activate: (ids) => ids.split(" ").forEach((id) => addActive(id)),
  deactivate: (ids) => ids.split(" ").forEach((id) => removeActive(id)),
  toggleBtn: (setting) => toggleSetting(setting, config),
  modal: (id) => createModal(id, config),
  drinkName: (name) => console.log("You clicked on " + name),
  toggleFave: (id) => toggleFavorite(id, config),
  changeSlide: (e) => changeSlide(e, config),
  search: (elm) => searchClick(elm, config),
  showMore: (id) => showMoreResults(id, config),
  random: (randStr) =>
    randStr === "random" ? createRandomModal(config) : null,
};

/**
 *
 * @param {*} e -event
 * hides elements not matching search results
 */
const hideOnKeyup = (e) => {
  const containerId = e.target.dataset.keySearch;
  const filterText = formatSimple(e.target.value);
  if (!containerId) {
    console.log("Invalid container for search", containerId);
    return;
  }
  const parentContainer = document.querySelector(containerId);
  updateSearchResults(filterText, parentContainer, config);
};

//Event Handling

const handleClickEvent = (e) => {
  const target = e.target;
  let shouldClose = true;
  for (let [key, value] of Object.entries(config.getDataset)) {
    const val = value(target);
    if (val) {
      eventHandler[key](val);
      shouldClose = false;
      break;
    }
  }
  if (shouldClose) closeAll(e);
};

config.elementContainers.hero.addEventListener("mouseenter", () => {
  config.settings.pauseSlideshow = true;
});
config.elementContainers.hero.addEventListener("mouseleave", () => {
  config.settings.pauseSlideshow = false;
});
document.querySelectorAll(elmDatasets.searchBar).forEach((elm) => {
  if (elm.dataset.keySearch == "#results-container") {
    elm.addEventListener("keyup", (e) => searchEnter(e, config));
  }

  elm.addEventListener("keyup", hideOnKeyup);
});

window.addEventListener("click", handleClickEvent);

//Build page
buildPage(config);
