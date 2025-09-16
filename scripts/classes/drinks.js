/**
 * The Drink class is used to create a drink object from the parsed json data after a
 * successful fetch from the db
 */
class Drink {
  constructor(drink) {
    if (!Drink.validateDrinkData(drink)) {
      throw new Error("Drink data is missing a required property. Discarding.");
    }
    this.data = drink;
    this.id = parseInt(this.data.idDrink);
    this.name = this.data.strDrink;
    this.category = this.data.strCategory;
    this.isAlcoholic = this.data.strAlcoholic === "Alcoholic" ? true : false;
    this.tags = this.data.strTags ? this.data.strTags.split(",") : [];
    this.imageURL = this.data.strDrinkThumb;
    this.instructions = this.data.strInstructions;
    this.glassType = this.data.strGlass;
    this.getIngredients();
  }

  /**
   *
   * @returns
   *  performs null/undefined checks on objects necessary properties
   */
  static validateDrinkData(data) {
    for (let value of [
      data.idDrink,
      data.strDrink,
      data.strInstructions,
      data.strCategory,
      data.strAlcoholic,
      data.strGlass,
      data.strDrinkThumb,
    ]) {
      if (!value) {
        return false;
      }
    }
    return true;
  }

  /**
   * Used to parse the list of ingredients and amounts from the raw data
   * and adds them to the Drink object
   */
  getIngredients() {
    let ingredients = {};

    for (let [key, val] of Object.entries(this.data)) {
      if (key.startsWith("strIngredient") && val !== null) {
        const index = key.match(/\d+/g)[0];
        let measurement;
        measurement = this.data[`strMeasure${index}`] || null;
        if (measurement == null) {
          measurement = "to taste";
        }
        ingredients[val] = measurement;
      }
    }
    this.ingredients = ingredients;
  }

  /**
   * Prints drink info to the console for debugging purposes
   */
  printDrink() {
    let mes = `${this.name} is a${
      this.isAlcoholic ? "n alcoholic " : " non alchoholic"
    } beverage.
    It's category is ${this.category}.
    Instructions: ${this.instructions}
    Ingredients: `;

    for (let [key, val] of Object.entries(this.ingredients)) {
      mes += `${key} - ${val} `;
    }

    console.log(mes);
  }

  /**
   *
   * @returns the image URL for the drink, or else a stock image from assets
   */
  checkImage() {
    return this.imageURL ? this.imageURL : "./assets/cocktail-6713320_1920.jpg";
  }

  createModalCard(isFave = false) {
    const { id, name, instructions } = this;

    const imageURL = this.checkImage();
    const ingrHtml = this.generateIngredientsHtml();
    const tags = this.generateTags();
    const isFavorite = isFave ? " favorite" : "";
    const text = `
           <div class="full-site-modal modal-bg" data-deactivate="modal-container">
              <i
              data-deactivate="modal-container"
              class="fa-solid fa-x close-btn color-three"
            ></i>
          <div
            class="drink-modal"
            data-drinkid="${id}"
            data-drinkname="${name}"
          >
         
            <div class="img-container favorite-container">
                <div class="faves-btn ${isFavorite} column-flex">
                  <i class="fa-solid fa-heart" data-addfavorite="${id}"></i><span>Favorite</span>
                </div>
              <img
                src="${imageURL}"
                alt="${name}"
              />
            </div>
            <h2 class="special-heading">${name}</h2>
            <div class="modal-text">
              <div class="tags">
                ${tags}
              </div>
              <h3 class="special-heading">Ingredients</h3>
              <div class="text-center">${ingrHtml}</div>
              <h3 class="special-heading">Instructions</h3>
              <p class="drink-description">${instructions}</p>
            </div>
          </div>
        </div>`;
    console.log(text);
    return text;
  }
  generateIngredientsHtml(getShortList = false) {
    let ingrHtml = "";
    let counter = 0;
    let andXMore = 0;
    for (let [ing, amt] of Object.entries(this.ingredients)) {
      if (counter > 1 && getShortList) {
        andXMore++;
        continue;
      }
      counter += 1;
      ingrHtml += `<p>${ing} - ${amt}</p>`;
    }
    if (andXMore > 0) {
      console.log("too many ingredients");
      ingrHtml += `<p>and ${andXMore} more...`;
    }
    return ingrHtml;
  }

  generateTags(getShortList = false) {
    const alcoholic = this.isAlcoholic ? "Alcoholic" : "Non-Alcoholic";
    let tags = "";
    let counter = 0;
    let xMore = 0;
    for (let tag of [this.category, alcoholic, this.glassType, ...this.tags]) {
      if (counter > 1 && getShortList) {
        xMore += 1;
        continue;
      }
      if (tag && !tag.startsWith("Other")) {
        tags += `<p class="card-tag">${tag}</p>`;
      }
      counter++;
    }
    if (xMore > 0) {
      tags += `<p class="card-tag"> + ${xMore} more...</p>`;
    }
    return tags;
  }

  /**
   *
   * @returns html built from the drink object for a full card and description
   */
  createFullCard(isFave = false) {
    const { id, name, instructions } = this;

    const imageURL = this.checkImage();
    const ingrHtml = this.generateIngredientsHtml(true);
    const tags = this.generateTags(true);
    let isFavorite = isFave ? " favorite" : "";
    const instructionsHtml = `   <p class="drink-description">${instructions}</p>`;

    return `<div class="drink-card card" data-drinkId="${id}"  data-drinkName="${name}">
              <div class="img-container favorite-container">
              <div class="faves-btn ${isFavorite} column-flex">
                  <i class="fa-solid fa-heart" data-addfavorite="${id}"></i><span>Favorites</span>
                </div>
                <img src="${imageURL}" alt="${name}" />
                
              </div>
              <h2 class="special-heading card-title">${name}</h2>
              <div class="card-text">
                <h3 class="special-heading">Ingredients</h3>
                <p>${ingrHtml}</p>
                   <div class="tags">
                  ${tags}
                </div>
                <span data-createModal="${id}" class="pill-btn">See Full Recipe <i class="fa-solid fa-circle-info" data-createModal="${id}"></i></span>
              </div>
            </div>`;
  }

  /**
   *
   * @returns html built from the drink object for a basic card
   */
  createBasicCard(isFave = false) {
    let { id, name } = this;
    const imageURL = this.checkImage();
    let isFavorite = isFave ? " favorite" : "";

    return `<div class="drink-card card favorite-container" id="${id}" data-drinkName="${name}">
      <button data-addFavorite="${id}" class="faves-btn ${isFavorite}"><i class="fa-solid fa-star"></i></button>             
      <div data-createModal="${id}" class="img-container">
                <img src="${imageURL}" alt="${name}" />
              </div>
              <h2 class="special-heading">${name}</h2>
              </div>`;
  }
}
