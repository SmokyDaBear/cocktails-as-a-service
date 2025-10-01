//Interface with thecocktaildb API

import { Drink } from "../classes/drinks.js";
import { sortDrinks } from "./additional.js";

const dbURL = "https://www.thecocktaildb.com/api/json/v1/1/";

export const searchMethods = {
  text: (text, config = undefined) => {
    if (config && config.drinkCache.byName.has(text)) {
      return `fromCache, ,${text}`;
    }
    return `${dbURL}/search.php?s=${text}`;
  },
  id: (idStr, config = undefined) => {
    const id = parseInt(idStr);
    if (config && config.drinkCache.byId.has(id)) {
      return `fromCache,${id}, `;
    }
    return `${dbURL}/lookup.php?i=${id}`;
  },
  firstLetter: (letter) => `${dbURL}/search.php?f=${letter}`,
  ingredient: (ing, config = undefined) => `${dbURL}/filter.php?i=${ing}`,
  random: () => `https://www.thecocktaildb.com/api/json/v1/1/random.php`,
  soberDrinks: () => `${dbURL}filter.php?a=Non_Alcoholic`, //unfortunately not a way to do a name search & filter by alcoholic at the same time...
};

const formatSimple = (text) => String(text).toLowerCase().trim();
//URL for the db, as well as simple functions for different search methods:

const makeTable = (tableData, captionName) => {
  try {
    let str = "";
    for (const [key, val] of Object.entries(tableData)) {
      str += `    <tr><td>${key}</td><td>${val}</td></tr>`;
    }
    return `<table>
              <caption>${captionName} occurances from search results</caption>
              <thead><tr>
                  <th scope="col">${captionName}</th>
                  <th scope="col">Quantity</th>
                </tr></thead><tbody>${str}</tbody></table>`;
  } catch (err) {
    console.log("Error creating table", err);
    return `<p class="text-center">Error creating table: ${tableData}</p>`;
  }
};
/**
 *
 * @param {*} stats object with stats data
 * @param {*} statsContainer container to populate with stats
 * prints stats to the statsContainer
 */
export const printStats = (stats, statsContainer) => {
  statsContainer.innerHTML = "";
  const ingrHtml = makeTable(stats.ingredients, "Ingredient");
  const categoryHtml = makeTable(stats.categories, "Category");
  statsContainer.innerHTML = `
            <h4 class="special-heading">Total Number of Drinks: ${stats.totalDrinks}</h4>
            <h4 class="special-heading">Number of Alcoholic Drinks: ${stats.numAlcoholic}</h4>
            <h4 class="special-heading">Ingredients</h4>
            ${ingrHtml}
            <h4 class="special-heading">Categories</h4>
            ${categoryHtml}`;
};

const updateStats = (node, statsObj) => {
  statsObj.totalDrinks += 1;
  if (node.dataset.isAlcoholic && node.dataset.isAlcoholic === "true") {
    statsObj.numAlcoholic += 1;
  }
  if (node.dataset.ingredients) {
    const ingredients = node.dataset.ingredients.split(",");
    for (let ing of ingredients) {
      ing = ing.trim();
      if (ing !== "") {
        statsObj.ingredients[ing] = statsObj.ingredients[ing]
          ? statsObj.ingredients[ing] + 1
          : 1;
      }
    }
  }
  if (node.dataset.category) {
    const cat = node.dataset.category;
    statsObj.categories[cat] = statsObj.categories[cat]
      ? statsObj.categories[cat] + 1
      : 1;
  }
};

/**
 *
 * @param {*} searchText text to filter by
 * @param {*} container the parent container of drink elements
 * @param {*} config the config object
 * @returns updates the visibility of drink elements in the container based on the searchText
 */
export const updateSearchResults = (searchText, container, config) => {
  let numVisible = 0;
  let numOver = 0;
  const parent = container.parentElement;
  const { isSober } = config.settings;
  const noResultsContainer = parent.querySelector(".no-results");
  const statsContainer = parent.querySelector(".stats-container");
  const showMoreContainer = parent.querySelector(".show-more");
  if (noResultsContainer) noResultsContainer.innerText = "";
  if (statsContainer) statsContainer.innerHTML = "";
  showMoreContainer.classList.add("hidden");
  noResultsContainer.classList.add("hidden");
  const numDrinksPerPage = config.settings.numDrinksPerPage;
  const filterText = formatSimple(searchText);
  const searchStats = {
    totalDrinks: 0,
    numAlcoholic: 0,
    ingredients: {},
    categories: {},
  };
  for (const node of [...container.children]) {
    const simpleName = formatSimple(node.dataset.drinkName);
    if (isSober && node.dataset.isAlcoholic === "true") {
      node.classList.add("hidden");
      continue;
    }
    if (!simpleName.includes(filterText)) {
      node.classList.add("hidden");
      continue;
    }

    if (numVisible <= numDrinksPerPage || numDrinksPerPage === 0) {
      node.classList.remove("hidden");
      numVisible++;
      updateStats(node, searchStats);
    } else {
      node.classList.add("hidden");
      node.dataset.hiddenBy = "pagination";
      numOver++;
    }
  }
  if (numVisible == 0) {
    noResultsContainer.innerText = `No results found for "${searchText}".`;
    noResultsContainer.classList.remove("hidden");
  }
  if (numOver > 0) {
    showMoreContainer.innerText = `${numOver} results hidden. Show ${Math.min(
      numDrinksPerPage,
      numOver
    )} more results`;
    showMoreContainer.classList.remove("hidden");
  }
  printStats(searchStats, statsContainer);
};

export const getStats = async (container) => {
  const searchStats = {
    totalDrinks: 0,
    numAlcoholic: 0,
    ingredients: {},
    categories: {},
  };
  for (const node of [...container.children]) {
    if (node.classList.contains("hidden")) continue;
    searchStats.totalDrinks += 1;
    if (node.dataset.isAlcoholic === "true") {
      searchStats.numAlcoholic += 1;
    }
    if (node.dataset.ingredients) {
      const ingredients = node.dataset.ingredients.split(",");
      for (let ing of ingredients) {
        ing = ing.trim();
        if (ing !== "") {
          searchStats.ingredients[ing] = searchStats.ingredients[ing]
            ? searchStats.ingredients[ing] + 1
            : 1;
        }
      }
    }
    if (node.dataset.category) {
      const cat = node.dataset.category;
      searchStats.categories[cat] = searchStats.categories[cat]
        ? searchStats.categories[cat] + 1
        : 1;
    }
  }
  return searchStats;
};
export const showMoreResults = (parentId, config) => {
  const numDrinksPerPage = config.settings.numDrinksPerPage;
  const numDrinks = config.settings.numDrinksPerPage;
  const container = document.querySelector(`#${parentId}`);
  const showMoreContainer = container.parentElement.querySelector(".show-more");
  showMoreContainer.classList.add("hidden");
  let numShown = 0;
  let numOver = 0;
  for (const node of [...container.children]) {
    if (numShown >= numDrinks) {
      numOver++;
      continue;
    }
    if (
      node.classList.contains("hidden") &&
      node.dataset.hiddenBy === "pagination"
    ) {
      node.classList.remove("hidden");
      node.dataset.hiddenBy = "";
      numShown++;
    }
  }
  if (numOver > 0) {
    showMoreContainer.innerText = `${numOver} results hidden. Show ${numDrinksPerPage} more results`;
    showMoreContainer.classList.remove("hidden");
  }
};

/**
 *
 * @param {*} url to request data from, or to retrieve from cache
 * @param {*} config the config object
 * @returns an array of drink objects
 */
export const fetchData = async (url, config) => {
  if (config.settings.debug) console.log("fetching ", url);
  if (url === undefined || url === null || url === "") {
    return Promise.reject("Invalid URL for fetch request");
  }
  if (url.startsWith("fromCache,")) {
    const [trash, id, name] = url.split(",");
    if (id != " " && config && config.drinkCache.byId.has(parseInt(id)))
      return Promise.resolve([config.drinkCache.byId.get(parseInt(id))]);
    if (name != " " && config && config.drinkCache.byName.has(name))
      return Promise.resolve([config.drinkCache.byName.get(name)]);
    return Promise.reject("Invalid cache fetch request");
  }
  return fetch(url)
    .then((data) => data.json())
    .then((data) => {
      if (data.ingredients) {
        console.log("Ingredient data not supported", data);
        return [];
      }
      if (!data.drinks || data.drinks.length === 0) {
        throw new Error(`Data is invalid: ${JSON.stringify(data)}`);
      }
      return data.drinks.map((element) => {
        const drink = new Drink(element);
        if (drink.isBasicCard === false) {
          config.drinkCache.byId.set(parseInt(drink.id), drink);
          config.drinkCache.byName.set(drink.name, drink);
          if (drink.isAlcoholic === false) {
            config.drinkCache.soberIds.add(parseInt(drink.id));
          }
        } else if (config.drinkCache.byId.has(parseInt(drink.id))) {
          return config.drinkCache.byId.get(parseInt(drink.id));
        }
        return drink;
      });
    })
    .catch((err) => console.log(err.message || err));
};

/**
 *
 * @param {*} searchText text to search for
 * @param {*} config the config object
 * @param {*} container the parent container to add results to
 * @returns a promise that resolves when the search is complete
 */
const search = async (
  searchText,
  config,
  container = config.elementContainers.drinks
) => {
  const method = config.settings.filterByIngredient ? "ingredient" : "text";
  const searchUrl = searchMethods[method](searchText, config);
  return fetchData(searchUrl, config)
    .then((drinks) =>
      drinks.forEach((drink) => (container.innerHTML += drink.createFullCard()))
    )
    .then(() => {
      updateSearchResults(searchText, container, config);
    })
    .catch((err) => console.log(err.message || err));
};

export const searchEnter = (e, config) => {
  const searchText = formatSimple(e.target.value);
  const container = e.target.dataset.keySearch
    ? document.querySelector(e.target.dataset.keySearch)
    : config.elementContainers.drinks;
  if (searchText == undefined || searchText == "") return;
  if (e.key === "Enter") {
    search(searchText, config, container);
  }
};

export const searchClick = (elm, config) => {
  const searchText = formatSimple(elm.previousElementSibling.value);
  const container = document.querySelector(elm.dataset.clickSearch);
  if (searchText == undefined || searchText == "") return;
  search(searchText, config, container);
};
