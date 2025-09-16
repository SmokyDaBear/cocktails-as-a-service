//Setting switch toggles
const toggleSetting = (e) => {
  const btn = e.target;
  const setting = btn.dataset.togglebtn;
  const curVal = settings[setting];
  settings[setting] = !curVal;
  btn.classList.toggle(toggleOn);
  btn.classList.toggle(toggleOff);
  updateSettings(setting);
};

const updateSettings = (setting) => {
  let { isSober, filterByIngredient, sortReverse, displayTable } = settings;
  if (setting == "displayTable") {
    const [classToAdd, classToRemove] = displayTable
      ? ["table", "grid"]
      : ["grid", "table"];
    const cardContainers = document.querySelectorAll(".card-container");
    for (let c of cardContainers) {
      c.classList.replace(classToRemove, classToAdd);
    }
  }
  if (setting == "sortReverse") {
    sortDrinks(drinksContainer);
    sortDrinks(favoritesContainer);
  }
  if (setting == "isSober" && settings.isSober) {
    console.log("Ahh sober... Lame lol");
  }
};

/**
 *
 * @param {} e - either the clickevent, or the id# of a drink
 *
 * creates a modal for a drink if it has a valid id
 */
const createModal = async (id) => {
  const drink = drinksStorage.get(id);
  const isFavorite = favorites.has(parseInt(id));
  const divText = drink.createModalCard(isFavorite);
  modalContainer.innerHTML = divText;
  setTimeout(console.log("hi"), 3000);
  modalContainer.classList.add(activeClass);
};

/**
 *
 * @param {*} parentElm - the containing element to have its children sorted
 * sorts the drinks by name, also removes duplicates
 */
const sortDrinks = (parentElm) => {
  let drinks = [...parentElm.childNodes];
  drinks.sort((a, b) => {
    const nameA = formatSimple(a.dataset.drinkname);
    const nameB = formatSimple(b.dataset.drinkname);
    if (nameA == nameB) {
      b.remove();
    }
    if (!settings.sortReverse) {
      return nameA.localeCompare(nameB);
    } else {
      return nameB.localeCompare(nameA);
    }
  });
  for (let drink of drinks) {
    parentElm.appendChild(drink);
  }
};

const randButtons = document.querySelectorAll(randomData);

/**
 *
 * @param {*} container - element to populate with search results
 * @param  {...any} idsArr - Array of ids to add cards for
 *
 * Takes in an array of ids, creates an html card for them, and adds it
 * to the chosen container
 */
const addDrinks = async (container, ...idsArr) => {
  const ids = idsArr.flat().map((id) => parseInt(id));
  for (const id of ids) {
    try {
      if (!drinksStorage.has(id)) {
        throw new Error(`"${id}" is not found in storage`);
      }
      const drink = drinksStorage.get(id);
      const isFave = favorites.has(id);
      container.innerHTML += drink.createFullCard(isFave);
    } catch (err) {
      console.log("Error populating favorites container: ", err.message || err);
    }
  }
};

/**
 *
 * @param {*} container - element to populate with fetched results
 *
 * This fills the container with the initial fetched results on a page load
 */
const populateAllDrinks = async (container) => {
  container.innerHTML = "";
  for (let [id, drink] of drinksStorage.entries()) {
    const isAFavoriteDrink = favorites.has(id);
    container.innerHTML += drink.createFullCard(isAFavoriteDrink);
  }
};

/**
 * Retrieves data from API, then populates the relevant container
 */
const getFavorites = async () => {
  const promises = [];
  for (let fave of favorites) {
    const id = parseInt(fave);
    if (!drinksStorage.has(id)) {
      promises.push(fetchData(searchMethods.id(id)));
    }
  }
  Promise.all(promises).then(() => {
    const ids = [...favorites];
    console.log("favorites to add: ", ids);
    addDrinks(favoritesContainer, ids);
  });
};

const startTheParty = async () => {
  const promises = [];
  let numDrinks = favorites.length || 0;
  promises.push(getFavorites());

  while (numDrinks < numDrinksPerPage) {
    promises.push(getRandomDrink());
    numDrinks++;
  }
  Promise.allSettled(promises).then(() => {
    populateAllDrinks(drinksContainer);
  });
};

const toggleFavorite = (e) => {
  const target = e.target;
  const id = parseInt(target.dataset.addfavorite);

  if (favorites.has(id)) {
    removeFavorite(id);
    target.classList.remove("favorite");
    favoritesContainer.childNodes.forEach((node) => {
      if (parseInt(node.dataset.drinkId) == id) {
        node.remove();
      }
    });
  } else {
    addFavorite(id);
    target.classList.add("favorite");
    addDrinks(favoritesContainer, id);
  }
};

const searchBars = document.querySelectorAll(searchBarClass);
for (let bar of searchBars) {
  bar.addEventListener("keyup", searchEnter);
}

const searchBtns = document.querySelectorAll(searchBtnClass);
for (let btn of searchBtns) {
  btn.addEventListener("click", searchClick);
}

const searchInputs = document.querySelectorAll(keySearchData);
for (let searchInput of searchInputs) {
  searchInput.addEventListener("keyup", hideOnKeyup);
}
const addActive = (e) => {
  const id = e.target.dataset.activate;
  const elm = document.getElementById(id);
  elm.classList.add(activeClass);
};
const removeActive = (e) => {
  const id = e.target.dataset.deactivate;
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
const closeAll = (e) => {
  const target = e.target;
  for (let elm of document.querySelectorAll(`.${activeClass}`)) {
    console.log(elm);
    if (!target === elm || !elm.contains(target)) {
      elm.classList.remove(activeClass);
    }
  }
};

const windowClick = (e) => {
  const data = e.target.dataset;
  if (data.activate) {
    console.log("activator - ", data.activate);
    addActive(e);
  } else if (data.deactivate) {
    console.log("deactivator - ", data.deactivate);
    removeActive(e);
  } else if (data.togglebtn) {
    console.log("toggle switch - ", data.togglebtn);
    toggleSetting(e);
  } else if (data.search === "random") {
    console.log("random! :)");
    getRandomDrink().then((idArr) => {
      addDrinks(drinksContainer, idArr[0]);
      createModal(idArr[0]);
    });
  } else if (data.createmodal) {
    const id = parseInt(data.createmodal);
    createModal(id);
  } else if (data.addfavorite) {
    console.log("favorite toggler - ", data.addfavorite);
    toggleFavorite(e);
  } else {
    console.log("closing all..");
    closeAll(e);
  }
};

window.addEventListener("click", windowClick);

startTheParty().then(() => {
  console.log("Party has been set");
});
