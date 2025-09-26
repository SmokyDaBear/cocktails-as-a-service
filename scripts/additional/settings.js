import { slideshowLoop } from "./slideshow.js";
import { sortDrinks } from "./additional.js";
const favoriteDrinksKey = "favorite-drinks";

/**
 *
 * Retrieve favorites from local storage,
 * and returns a set, either empty or full of the saved ids.
 *
 */
const getStoredFavorites = () => {
  const favorites = new Set();
  let storedFaves = localStorage.getItem(favoriteDrinksKey);
  console.log(storedFaves);
  if (storedFaves == null) return favorites;
  try {
    storedFaves = JSON.parse(storedFaves);
    if (Number.isInteger(storedFaves)) {
      favorites.add(storedFaves);
    } else if (Array.isArray(storedFaves)) {
      for (let fave of storedFaves) {
        favorites.add(parseInt(fave));
      }
    }
    console.log("User favorites retrieved: ", favorites);
  } catch (err) {
    console.log(err.message || err);
    localStorage.removeItem(favoriteDrinksKey);
  }

  return favorites;
};

/**
 *
 * @param {*} localName to save the preference under in localStorage
 * @param {*} value the value to save
 */
const savePreference = (localName, value) => {
  const toggleSwitches = [
    "isSober",
    "filterByIngredient",
    "sortReverse",
    "displayTable",
    "forcePauseSlideshow",
  ];
  if (toggleSwitches.includes(localName))
    localStorage.setItem(localName, value);
};

const getSavedPreference = (key, val) => {
  const localSetting = localStorage.getItem(key);
  if (localSetting == null) return val;
  const savedVal = JSON.parse(localSetting);
  return savedVal;
};

const toggleDisplayMethod = (config) => {
  const [classToAdd, classToRemove] = config.settings.displayTable
    ? ["table", "grid"]
    : ["grid", "table"];
  document
    .querySelectorAll(".card-container")
    .forEach((c) => c.classList.replace(classToRemove, classToAdd));
};

/**
 *
 * @param {*} setting to be changed
 * updates settings
 */
const updateSettings = (setting, config) => {
  updateBtn(setting, config);
  console.log(setting);
  let { forcePauseSlideshow } = config.settings;
  if (setting == "displayTable") {
    toggleDisplayMethod(config);
  }
  if (setting == "sortReverse") {
    sortDrinks(config);
  }
  if (setting == "isSober") {
    console.log("Ahh sober... Lame lol");
  }
  if (setting == "forcePauseSlideshow" && !forcePauseSlideshow) {
    console.log("Starting slideshow back up...");
    slideshowLoop(config);
  }
  savePreference(setting, config.settings[setting]);
};

/**
 *
 * @param {*} setting -the name of the setting to change
 * @param {*} config - the config object containing settings and other data
 * Toggles a setting, and makes the appropriate change to the page.
 */
export const toggleSetting = (setting, config) => {
  const curVal = config.settings[setting];
  config.settings[setting] = !curVal;
  updateSettings(setting, config);
};

/**
 *
 * @param {*} key setting that has button updated
 * @param {*} config config object containing settings and other data
 */
const updateBtn = (key, config) => {
  const toggleSwitches = [
    "isSober",
    "filterByIngredient",
    "sortReverse",
    "displayTable",
    "forcePauseSlideshow",
  ];
  let isPlayBtn = String(key) == "forcePauseSlideshow" ? true : false;
  if (toggleSwitches.includes(String(key))) {
    const { toggleOff, toggleOn, pauseBtn, playBtn } = config.elmClasses;
    const [on, off] = isPlayBtn ? [playBtn, pauseBtn] : [toggleOn, toggleOff];
    document
      .querySelectorAll(`[data-toggle-btn="${key}"]`)
      .forEach((btn) =>
        config.settings[key]
          ? btn.classList.replace(off, on)
          : btn.classList.replace(on, off)
      );
  }
};

/**
 * Default settings
 */
const settings = {
  isSober: false,
  filterByIngredient: false,
  sortReverse: false,
  displayTable: false,
};

/**
 *
 *
 * @returns settings retrieved from local storage
 */
export const getSettings = (config) => {
  const keysWithChanges = [];
  const staticSettings = {
    pauseSlideshow: false,
    forcePauseSlideshow: false,
    numDrinksPerPage: 10,
    delayTime: 4000,
    currentSlide: 0,
  };
  for (let [key, val] of Object.entries(settings)) {
    staticSettings[key] = getSavedPreference(key, val);
    if (staticSettings[key] === true) keysWithChanges.push(key);
  }
  staticSettings.favorites = getStoredFavorites();
  config.settings = staticSettings;
  if (keysWithChanges.length > 0) {
    for (let key of keysWithChanges) {
      updateSettings(key, config);
    }
  }
};
