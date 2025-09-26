//Interface with thecocktaildb API

import { Drink } from "../classes/drinks.js";
import { Ingredient } from "../classes/ingredients.js";

const dbURL = "https://www.thecocktaildb.com/api/json/v1/1/";

export const searchMethods = {
  text: (text) => `${dbURL}/search.php?s=${text}`,
  id: (id) => `${dbURL}/lookup.php?i=${id}`,
  firstLetter: (letter) => `${dbURL}/search.php?f=${letter}`,
  ingredient: (ing) => `${dbURL}/search.php?i=${ing}`,
  random: () => `https://www.thecocktaildb.com/api/json/v1/1/random.php`,
  soberDrinks: () => `${dbURL}filter.php?a=Non_Alcoholic`, //unfortunately not a way to do a name search & filter by alcoholic at the same time...
};

const formatSimple = (text) => String(text).toLowerCase().trim();
//URL for the db, as well as simple functions for different search methods:

const updateStats = (node, statsObj) => {
  if (node.dataset.isAlcoholic === true) {
    statsObj.numAlcoholic += 1;
  }
  if (node.dataset.ingredients) {
    const ingredients = node.dataset.ingredients.split(",");
    for (let ing of ingredients) {
      ing = ing.trim();
      if (ing !== "") {
        statsObj[ing] = statsObj.ingredients[ing] ? statsObj[ing] + 1 : 1;
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
  const noResultsContainer = config.elementContainers.noResults;
  const showMoreContainer = config.elementContainers.showMore;
  showMoreContainer.classList.add("hidden");
  noResultsContainer.classList.add("hidden");
  const numDrinksPerPage = config.settings.numDrinksPerPage;
  const filterText = formatSimple(searchText);
  const searchStats = {
    numAlcoholic: 0,
    ingredients: {},
    categories: {},
  };
  for (const node of [...container.children]) {
    const simpleName = formatSimple(node.dataset.drinkName);
    if (simpleName.includes(filterText)) {
      if (numVisible < numDrinksPerPage || numDrinksPerPage === 0) {
        node.classList.remove("hidden");
        numVisible++;
        updateStats(node, searchStats);
      } else {
        node.classList.add("hidden");
        node.dataset.hiddenBy = "pagination";
        numOver++;
      }
    } else {
      node.classList.add("hidden");
    }
  }
  if (numVisible == 0) {
    noResultsContainer.innerText = `No results found for "${searchText}".`;
    config.elementContainers.noResults.classList.remove("hidden");
  }
  if (numOver > 0) {
    console.log(config.elementContainers.showMore);
    showMoreContainer.innerText = `${numOver} results hidden. Show ${numDrinksPerPage} more results`;
    showMoreContainer.classList.remove("hidden");
  } else {
    showMoreContainer.classList.add("hidden");
  }
  printStats(searchStats, config.elementContainers.stats);
};

export const showMoreResults = (parentId, config) => {
  const showMoreContainer = config.elementContainers.showMore;
  showMoreContainer.classList.add("hidden");
  const numDrinksPerPage = config.settings.numDrinksPerPage;
  const numDrinks = config.settings.numDrinksPerPage;
  const container = document.querySelector(`#${parentId}`);
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

//TODO:integrate a "next page" and "previous page" functionality
export const printStats = (stats, statsContainer) => {
  console.table("stats", stats);
  console.log(statsContainer);
  statsContainer.innerHtml = "";
  let ingrHtml = `       <table>
              <caption>
                Ingredient occurances from search results
              </caption>
              <thead>
                <tr>
                  <th scope="col">Ingredient</th>
                  <th scope="col">Quantity</th>
                </tr>
              </thead>
              <tbody>
            `;
  for (const [key, val] of Object.entries(stats.ingredients)) {
    ingrHtml += `    <tr>
                  <td>${key}</td>
                  <td>${val}</td>
                </tr>`;
  }
  ingrHtml += `  </tbody>
            </table>`;
  let categoryHtml = `       <table>
              <caption>
                Category occurances from search results
              </caption>
              <thead>
                <tr>
                  <th scope="col">Category</th>
                  <th scope="col">Quantity</th>
                </tr>
              </thead>
              <tbody>
            `;
  for (const [key, val] of Object.entries(stats.categories)) {
    categoryHtml += `    <tr>
                  <td>${key}</td>
                  <td>${val}</td>
                </tr>`;
  }
  categoryHtml += `  </tbody>
            </table>`;

  const text = `  <div class="inline-flex gap-6">
            <h4 class="special-heading">Number of Alcoholic Drinks</h4>
            <p>${stats.numAlcoholic}</p>
            </div>
            <h4 class="special-heading">Ingredients</h4>
            ${ingrHtml}
            <h4 class="special-heading">Categories</h4>
            ${categoryHtml}`;
  statsContainer.innerHtml += text;
};

/**
 *
 * @param {*} url to request data from
 * @returns an array of drink objects
 */
export const fetchData = async (url) => {
  return fetch(url)
    .then((data) => data.json())
    .then((data) => {
      if (!data.drinks || data.drinks.length === 0) {
        throw new Error("Data is invalid", data);
      }
      return data.drinks.map((element) => new Drink(element));
    })
    .catch((err) => console.log(err.message || err));
};

//Search Function fetches from the API
const search = (
  searchText,
  config,
  container = config.elementContainers.drinks
) => {
  const method = config.settings.filterByIngredient ? "ingredient" : "text";
  const searchUrl = searchMethods[method](searchText);
  console.log("search request from: ", searchUrl);
  const fetchPromise = fetchData(searchUrl);
  fetchPromise
    .then((drinks) =>
      drinks.forEach((drink) => (container.innerHTML += drink.createFullCard()))
    )
    .then(() => {
      updateSearchResults(searchText, container, config);
    })
    .catch((err) => console.log(err.message || err));
  return fetchPromise;
};

export const searchEnter = (e, config) => {
  const searchText = formatSimple(e.target.value);
  const container = e.target.dataset.keySearch
    ? document.querySelector(e.target.dataset.keySearch)
    : config.elementContainers.drinks;
  console.log(searchText, container);
  if (searchText == undefined || searchText == "") return;
  if (e.key === "Enter") {
    search(searchText, config, container);
  }
};

export const searchClick = (elm, config) => {
  const searchText = formatSimple(elm.previousElementSibling.value);
  const container = document.querySelector(elm.dataset.clickSearch);
  console.log(searchText);
  if (searchText == undefined || searchText == "") return;
  search(searchText, config, container);
};
