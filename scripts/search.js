//Interface with thecocktaildb API

const formatSimple = (text) => String(text).toLowerCase().trim();

const searchMethods = {
  text: (text) => `${dbURL}/search.php?s=${text}`,
  id: (id) => `${dbURL}/lookup.php?i=${id}`,
  firstLetter: (letter) => `${dbURL}/search.php?f=${letter}`,
  ingredient: (ing) => `${dbURL}/search.php?i=${ing}`,
  random: () => `https://www.thecocktaildb.com/api/json/v1/1/random.php`,
};

const parseJson = (data) => {
  try {
    return data.json();
  } catch (err) {
    throw new Error(`Data is not valid Json - ${err.message || err}.`);
  }
};

const formatData = (data) => {
  const dataType = data.drinks ? "drinks" : data.ingredients ? " " : null;
  if (!data || data.length === 0) {
    throw new Error("Empty data returned from API");
  }
  if (data.drinks && data.drinks.length != 0) {
    return ["drink", data.drinks];
  }
  if (data.ingredients && data.ingredients.length != 0) {
    return ["ingredient", data.ingredients];
  }
  throw new Error("No drinks or ingredients found");
};

const storeData = ([dataType, dataArr]) => {
  const returnIds = [];
  if (dataType !== "drink" && dataType !== "ingredient") {
    console.log(`Type: ${dataType} | Data: ${dataArr}`);
    throw new Error("Invalid data type for fetched data");
  }
  const isDrinkData = dataType === "drink";
  for (const data of dataArr) {
    try {
      const obj = isDrinkData ? new Drink(data) : new Ingredient(data);
      if (!obj) {
        throw new Error("Invalid Format. Skipping");
      }
      if (isDrinkData) {
        drinksStorage.set(obj.id, obj);
        returnIds.push(obj.id);
      } else {
        ingredientsStorage.set(obj.id, obj);
      }
    } catch (err) {
      console.log("Error Storing Data : ", err.message || err);
    }
  }
  return returnIds;
};

//TODO: test
/**
 *
 * @param url - the url to fetch the data from, based on the search text
 *
 * @returns an array of ids that have been fetched from the api
 */
const fetchData = async (url) => {
  return fetch(url)
    .then(parseJson)
    .then(formatData)
    .then(storeData)
    .catch((err) => {
      console.log("Error fetching data: ", err.message || err);
    });
};

const getRandomDrink = async () => {
  return fetchData(searchMethods.random());
};

const updateSearchResults = (searchText, container = drinksContainer) => {
  const numVisible = 0;
  const numHidden = 0;
  const filterText = formatSimple(searchText);
  for (const node of [...container.childNodes]) {
    const simpleName = formatSimple(node.dataset.drinkname);
    if (simpleName.includes(filterText) && numVisible < numDrinksPerPage) {
      node.classList.remove("hidden");
      numVisible++;
    } else {
      node.classList.add("hidden");
      numHidden++;
    }
  }
  console.log("Search results updated. ", numHidden, " results hidden.");
};

//TODO: refactor, and integrate a "next page" and "previous page" functionality
/**
 *
 * @param {*} e -event
 * hides elements not matching search results
 */
const hideOnKeyup = (e) => {
  const relevantId = e.target.dataset.keysearch;
  const filterText = formatSimple(e.target.value);
  const parentContainer = document.querySelector(relevantId);
  updateSearchResults(filterText, parentContainer);
  //const children = [...parentContainer.childNodes];
  // let numChildren = children.length;
  // let numVisible = 0;
  // let numHidden = 0;

  // for (let node of children) {
  //   if (!formatSimple(node.dataset.drinkname).includes(filterText)) {
  //     node.classList.add("hidden");
  //     numHidden += 1;
  //   } else if (numVisible <= numDrinksPerPage) {
  //     node.classList.remove("hidden");
  //     numVisible += 1;
  //   }
  // }
};

//searchbar

//TODO: Fix this shit
const search = (searchText, method = "text") => {
  const searchUrl = searchMethods[method](searchText);
  console.log(searchUrl);
  const fetchPromise = fetchData(searchUrl);
  fetchPromise.then(() => populate).then(() => updateSearchResults(searchText));
};

const searchEnter = (e) => {
  const searchText = e.target.value;
  if (e.key === "Enter") {
    search(searchText);
  }
};

const searchClick = (e) => {
  const elm = e.target;
  const searchText = elm.previousSibling.value;
  if (elm.classList.contains(activeClass) || isMobile) {
    search(searchText);
  }
};
