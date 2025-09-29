import { fetchData, getStats, printStats, searchMethods } from "./search.js";
import { slideshowLoop } from "./slideshow.js";
const favoriteDrinksKey = "favorite-drinks";

const activeClass = "active";
//screen size query function
export const checkIfMobile = () =>
  window.matchMedia("(max-width: 1023px)").matches;

export const formatSimple = (text) => String(text).toLowerCase().trim();

/**
 *
 * @param {*} config - the config object
 * sorts the drinks in the drinks and favorites containers alphabetically
 * removes duplicates
 */
export const sortDrinks = (config) => {
  const getNameCB = config.getDataset.drinkName;
  const { favorites, drinks } = config.elementContainers;
  for (const parentElm of [favorites, drinks]) {
    let children = [...parentElm.children];
    children.sort((a, b) => {
      const nameA = formatSimple(getNameCB(a));
      const nameB = formatSimple(getNameCB(b));
      if (nameA == nameB) {
        b.remove();
      }
      if (!config.settings.sortReverse) {
        return nameA.localeCompare(nameB);
      } else {
        return nameB.localeCompare(nameA);
      }
    });
    for (let elm of children) {
      parentElm.appendChild(elm);
    }
  }
};

/**
 *
 * @param {} e - either the click event, or the id# of a drink
 *
 * creates a modal for a drink if it has a valid id
 */
export const createModal = async (id, config) => {
  const { favorites } = config.settings;
  const modalContainer = config.elementContainers.modal;
  const isFavorite = favorites.has(parseInt(id)) || false;
  const url = searchMethods.id(id, config);
  return fetchData(url, config).then((drink) => {
    modalContainer.innerHTML = drink[0].createModalCard(isFavorite);
    modalContainer.classList.add(activeClass);
  });
};

/**
 *
 * @param {*} config -config object
 * creates a modal with a random drink
 */
export const createRandomModal = async (config) => {
  const modalContainer = config.elementContainers.modal;
  return fetchData(searchMethods.random(), config).then((drink) => {
    const isFavorite = config.settings.favorites.has(drink[0].id) || false;
    modalContainer.innerHTML = drink[0].createModalCard(isFavorite);
    modalContainer.classList.add(activeClass);
  });
};

/**
 * Retrieves data from API, then populates the relevant container
 */
export const getFavorites = async (config) => {
  for (let fave of config.settings.favorites) {
    const id = parseInt(fave);
    try {
      if (!Number.isInteger(fave)) {
        throw new Error("Invalid id for fetch request: ", id);
      }
      fetchData(searchMethods.id(id, config), config).then((data) => {
        console.log("Successfully retrieved favorite: ", data[0].name);
        config.elementContainers.favorites.innerHTML +=
          data[0].createFullCard(true);
      });
    } catch (err) {
      throw new Error(
        `Error retrieving from database id: ${id}, ${err.message || err}`
      );
    }
  }
};

/**
 *
 * @param {*} [idStr, btn] - is is the drinkId, btn is the button element
 * @param {*} config - config object
 *
 * swaps an element between favorites and the search results container,
 * and adds or removes its id from the favorites variable, then saves it to local storage
 * also removes duplicates, in the case that there are any.
 *
 */
export const toggleFavorite = ([idStr, btn], config) => {
  const id = parseInt(idStr);
  const { favorites, drinks } = config.elementContainers;
  let removeFrom, addTo, isFave;
  if (!Number.isInteger(id))
    throw new Error(`Cannot toggle favorite "${id}" is NaN`);
  if (config.settings.favorites.has(id)) {
    btn.parentElement.classList.remove("favorite");
    config.settings.favorites.delete(id);
    [removeFrom, addTo] = [favorites, drinks];
  } else {
    isFave = true;
    btn.parentElement.classList.add("favorite");
    new Promise((resolve) => setTimeout(resolve, 5000));
    config.settings.favorites.add(id);
    [removeFrom, addTo] = [drinks, favorites];
  }
  const cardNodes = removeFrom.querySelectorAll(`[data-drink-id="${id}"]`); // used instead of btn.parentElement.parentElement.etc. in case if in a modal.
  if (!cardNodes || cardNodes.length === 0) {
    fetchData(searchMethods.id(id, config), config).then((data) => {
      addTo.innerHTML += data[0].createFullCard(isFave);
      sortDrinks(config);
    });
  }
  if (cardNodes.length > 0) addTo.append(cardNodes[0]);
  if (cardNodes.length > 1) {
    let isFirst = true;
    cardNodes.forEach((node) => {
      if (isFirst) {
        isFirst = false;
      } else {
        node.remove();
      }
    });
  }
  getStats(config.elementContainers.drinks).then((stats) =>
    printStats(stats, config.elementContainers.stats)
  );
  if (config.elementContainers.favorites.children.length > 0) {
    getStats(config.elementContainers.favorites).then((faveStats) =>
      printStats(faveStats, config.elementContainers.statsFavorites)
    );
  } else {
    config.elementContainers.statsFavorites.innerHTML = "No favorites";
  }
  localStorage.setItem(favoriteDrinksKey, [...config.settings.favorites]);
};
export const addActive = (id) => {
  const elm = document.getElementById(id);
  elm.classList.add(activeClass);
};

export const removeActive = (id) => {
  const elm = document.getElementById(id);
  elm.classList.remove(activeClass);
};

/**
 *
 * @param {*} e -the event target
 *
 * this removes the "active" class from ALL elements unless it is the same element
 * that was clicked on, is a direct parent of the target element, or has an id
 * matching the [data-activate] dataset
 */
export const closeAll = (e) => {
  const target = e.target;
  for (let elm of document.querySelectorAll(`.${activeClass}`)) {
    if (!target === elm || !elm.contains(target)) {
      elm.classList.remove(activeClass);
    }
  }
};

const getFeaturedDrinks = async (config) => {
  const ids = config.settings.isSober
    ? config.featuredDrinkIds.sober
    : config.featuredDrinkIds.alcoholic;
  config.elementContainers.featured.innerHTML = "";
  await Promise.allSettled(
    ids.map(async (id) =>
      fetchData(searchMethods.id(id, config), config).then((data) => {
        config.elementContainers.featured.innerHTML += data[0].createFullCard();
      })
    )
  );

  console.log("Starting slideshow");
  slideshowLoop(config);
};

const getRandomSelection = async (config) => {
  const promises = [];
  if (config.settings.isSober) {
    if (config.drinkCache.soberIds.size > config.settings.numDrinksPerPage) {
      for (let id of config.drinkCache.soberIds) {
        promises.push(fetchData(searchMethods.id(id, config), config));
        if (promises.length >= config.settings.numDrinksPerPage) break;
      }
    } else {
      promises.push(fetchData(searchMethods.soberDrinks(), config));
    }
    return promises;
  }

  let numSoFar = 0;
  while (numSoFar <= config.settings.numDrinksPerPage) {
    if (config.drinkCache.byId.size >= config.settings.numDrinksPerPage) {
      promises.push(
        fetchData(
          searchMethods.id(
            [...config.drinkCache.byId.keys()][numSoFar],
            config
          ),
          config
        )
      );
      numSoFar++;
      continue;
    }
    promises.push(fetchData(searchMethods.random(), config));
    numSoFar++;
  }
  return promises;
};

const updateDrinks = async (promises, config) => {
  return Promise.allSettled(promises).then((data) => {
    data.forEach((promise) => {
      const drinks = promise.value;
      drinks.forEach((drink) => {
        const isFave = config.settings.favorites.has(drink.id) || false;
        config.elementContainers.drinks.innerHTML +=
          drink.createFullCard(isFave);
      });
    });
  });
};

/**
 *
 * @param {*} config
 * Builds the page either on load, or when isSober option is changed
 */
export const buildPage = async (config) => {
  const { drinks, stats, featured, favorites, statsFavorites } =
    config.elementContainers;
  for (const container of [
    drinks,
    stats,
    featured,
    favorites,
    statsFavorites,
  ]) {
    container.innerHTML = "";
  }
  getFeaturedDrinks(config).catch((err) =>
    console.log("Error fetching featured Drinks: ", err.message || err)
  );

  getFavorites(config).catch((err) =>
    console.log("Error fetching favorites : ", err.message || err)
  );

  getRandomSelection(config)
    .then((promises) => updateDrinks(promises, config))
    .then(() => sortDrinks(config))
    .then(() => {
      if (config.elementContainers.drinks.children.length === 0) {
        alert("No drinks found, server may be down. Try again later.");
        const norResDrinks =
          config.elementContainers.drinks.previousElementSibling;
        norResDrinks.innerText =
          "No drinks found, server may be down. Try again later.";
        norResDrinks.classList.remove("hidden");
      } else {
        console.log("Drinks loaded successfully");
        getStats(config.elementContainers.drinks).then((stats) => {
          printStats(stats, config.elementContainers.stats);
        });
        if (config.elementContainers.favorites.children.length > 0) {
          getStats(config.elementContainers.favorites).then((faveStats) =>
            printStats(faveStats, config.elementContainers.statsFavorites)
          );
        }
      }
    })
    .catch((err) =>
      console.log("Error retrieving drinks selection", err.message || err)
    );
};
