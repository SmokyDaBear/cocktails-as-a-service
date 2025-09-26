import { changeSlide, slideshowLoop } from "./additional/slideshow.js";
import {
  addActive,
  removeActive,
  closeAll,
  createModal,
  toggleFavorite,
  formatSimple,
  getFavorites,
  buildPage,
} from "./additional/additional.js";

import {
  searchMethods,
  fetchData,
  searchEnter,
  updateSearchResults,
  searchClick,
  showMoreResults,
} from "./additional/search.js";

import { getSettings, toggleSetting } from "./additional/settings.js";

//URL for the db, as well as simple functions for different search methods:
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

//TODO:Fix the carousel initial start
//TODO:Get search working
//TODO: *** Get localstorage working ****

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
    noResults: document.getElementById("no-results"),
    stats: document.getElementById("stats-container"),
    favorites: document.getElementById("favorites"),
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
  },
  featuredDrinkIds: {
    alcoholic: [11007, 12528, 17105, 11001, 11728],
    sober: [12862, 12710, 12730, 12782, 12726],
  },
  drinkCache: {
    prev: {},
    curr: {},
    next: {},
  },
};

getSettings(config);

const eventHandler = {
  activate: (id) => addActive(id),
  deactivate: (id) => removeActive(id),
  toggleBtn: (setting) => toggleSetting(setting, config),
  changeSlide: (e) => changeSlide(e, config),
  modal: (id) => createModal(id, config),
  toggleFave: (id) => toggleFavorite(id, config),
  drinkName: (name) => console.log("You clicked on " + name),
  search: (elm) => searchClick(elm, config),
  showMore: (id) => showMoreResults(id, config),
};

/**
 *
 * @param {*} e -event
 * hides elements not matching search results
 */
const hideOnKeyup = (e) => {
  const containerId = e.target.dataset.keySearch;
  const filterText = formatSimple(e.target.value);
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
  elm.addEventListener("keyup", (e) => searchEnter(e, config));
  elm.addEventListener("keyup", hideOnKeyup);
});

window.addEventListener("click", handleClickEvent);

buildPage(config);

//Offline testing
const sudoGetExamples = (numCards, container) => {
  const exampleCard = (
    number
  ) => `  <div class="drink-card card current" data-drink-id="12726" data-drink-name="Example ${number}">
              <div class="img-container favorite-container">
              <div class="faves-btn  column-flex">
                  <i class="fa-solid fa-heart" data-add-favorite="12726" aria-hidden="true"></i><span>Favorites</span>
                </div>
                <img src="../assets/cocktail-6713320_1920.jpg" alt="Tomato Tang">
                
              </div>
              <h2 class="special-heading card-title">Drink ${number}</h2>
              <div class="card-text">
                <h3 class="special-heading">Ingredients</h3>
                <p></p><p>Tomato juice - 2 cups </p><p>Lemon juice - 1-2 tblsp </p><p>and 1 more...</p>
                  <div class="tags">
                  <p class="card-tag">Non-Alcoholic</p><p class="card-tag"> + 1 more...</p>
                </div>
                <span data-create-modal="12726" class="pill-btn">See Full Recipe <i class="fa-solid fa-circle-info" data-create-modal="12726" aria-hidden="true"></i></span>
              </div>
            </div>`;
  for (let num = 1; num <= numCards; num++) {
    if (num < 10) {
      num = 0 + String(num);
    }
    container.innerHTML += exampleCard(num);
  }
};
// sudoGetExamples(6, config.elementContainers.featured);
// slideshowLoop(config);
// sudoGetExamples(30, config.elementContainers.drinks);
// getFavorites(config);
