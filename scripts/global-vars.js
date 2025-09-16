//List of variables for queryselects and dataset checks
const activeClass = "active";
const searchBarClass = ".search-bar";
const searchBtnClass = ".search-btn";
const [toggleOn, toggleOff] = [`fa-toggle-on`, `fa-toggle-off`];
const activateData = "[data-activate]";
const deactivateData = "[data-deactivate]";
const toggleData = "[data-togglebtn]";
const randomData = `[data-search="random"]`;
const createModalData = "[data-createmodal]";
const keySearchData = "[data-keysearch]";
let numDrinksPerPage = 2;

const settings = {
  isSober: false,
  filterByIngredient: false,
  sortReverse: false,
  displayTable: false,
};

//screen size query function
const checkIfMobile = () => window.matchMedia("(max-width: 1023px)").matches;

let isMobile = checkIfMobile();

//URL for the db, as well as simple functions for different search methods:
const dbURL = "https://www.thecocktaildb.com/api/json/v1/1/";

/**
 * The initial promises to fetch and fill the featured drinks
 */
const drinkPromises = [];

/**
 * Succesful drink fetches from the database are stored in a Map.
 */
const drinksStorage = new Map();

/**
 * Successful ingredient fetches from database are stored in a Map.
 */
const ingredientsStorage = new Map();

/**
 * Element containing ALL drinks, and displays them based on search results.
 */
const drinksContainer = document.getElementById("results-container");

/**
 * Favorites container element
 */
const favoritesContainer = document.getElementById("favorites");

/**
 * Dynamic modal container element
 */
const modalContainer = document.getElementById("modal-container");

//local storage favorites, and check whether to show alcoholic or non-alcoholic drink recipes
const favorites = new Set();
const favoriteDrinksKey = "favorite-drinks";
try {
  let storedFaves = localStorage.getItem(favoriteDrinksKey);
  storedFaves = JSON.parse(storedFaves);
  if (!storedFaves) {
    throw new Error("User doesn't have any favorites yet.");
  }
  for (let fave of storedFaves) {
    favorites.add(parseInt(fave));
  }
  console.log("User favorites: ", favorites);
} catch (err) {
  console.log(err.message || err);
}

/**Favorites functionality */
const addFavorite = (drinkId) => {
  favorites.add(parseInt(drinkId));
  localStorage.setItem(favoriteDrinksKey, JSON.stringify([...favorites]));
};

//TODO: refactor
const removeFavorite = (drinkId) => {
  if (favorites.has(drinkId)) {
    favorites.delete(drinkId);
    const children = favoritesContainer.children;
    const getFaveChild = () => {
      for (child of children) {
        if (child.dataset.drinkid == drinkId) {
          return child;
        }
      }
    };
    const childToRmv = getFaveChild();
    childToRmv ? childToRmv.remove() : console.log("not in favorites");
    localStorage.setItem(favoriteDrinksKey, JSON.stringify([...favorites]));
  }
};

const checkFavorite = (drinkId) => {
  return favorites.has(parseInt(drinkId));
};

const savePreference = (localVar, val) => {
  localStorage.setItem(localVar, val);
};

//TODO: save and retrieve settings from local storage -
