/**
 * The Drink class is used to create a drink object from the parsed json data after a
 * successful fetch from the db
 */
export class Drink {
  constructor(drink) {
    if (!Drink.validateDrinkData(drink)) {
      throw new Error("Drink data is missing a required property. Discarding.");
    }
    this.id = parseInt(drink.idDrink);
    this.name = drink.strDrink;
    this.imageURL = drink.strDrinkThumb;
    this.isBasicCard = Drink.checkFullInfo(drink);
    if (!this.isBasicCard) {
      this.category = drink.strCategory;
      this.isAlcoholic = drink.strAlcoholic === "Alcoholic" ? true : false;
      this.tags = drink.strTags;
      this.instructions = drink.strInstructions;
      this.glassType = drink.strGlass;
      this.getIngredients(drink);
    }
  }
  static getStats(drinkObj) {
    const isAlcoholic = drinkObj.isAlcoholic || false;
    const ingredients = this.ingredients || false;
    const category = this.category || false;

    return [isAlcoholic, ingredients, category];
  }
  /**
   *
   * @returns
   *  performs null/undefined checks on objects necessary properties
   */
  static validateDrinkData(data) {
    for (let value of [data.idDrink, data.strDrink, data.strDrinkThumb]) {
      if (!value) {
        return false;
      }
    }
    return true;
  }

  /**
   *
   * @param {*} data
   * @returns
   * checks for optional properties required to make a full card
   */
  static checkFullInfo(data) {
    let isBasicCard = false;
    for (let val of [
      data.strInstructions,
      data.strCategory,
      data.strAlcoholic,
      data.strGlass,
    ]) {
      if (!val || val == null) {
        isBasicCard = true;
        break;
      }
    }
    return isBasicCard;
  }

  /**
   * Used to parse the list of ingredients and amounts from the raw data
   * and adds them to the Drink object
   */
  getIngredients(drink) {
    let ingredients = {};
    const strIngr = [];

    for (let [key, val] of Object.entries(drink)) {
      if (key.startsWith("strIngredient") && val !== null) {
        strIngr.push(val);
        const index = key.match(/\d+/g)[0];
        let measurement;
        measurement = drink[`strMeasure${index}`] || null;
        if (measurement == null) {
          measurement = "to taste";
        }
        ingredients[val] = measurement;
      }
    }
    this.strIngredients = strIngr.join(",");
    this.ingredients = ingredients;
  }
  formatInstructions() {
    return typeof this.instructions !== "string"
      ? ""
      : this.instructions.includes(".")
      ? this.instructions
          .split(".")
          .filter((elm) => elm !== "")
          .map((element) => `<li>${element}</li>`)
          .join("")
      : `<li>${this.instructions}</li>`;
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
    const instructionsFormat = this.formatInstructions();
    return `
        <div class="full-site-modal modal-bg" data-deactivate="modal-container">
          <i
              data-deactivate="modal-container"
              class="fa-solid fa-x close-btn color-three"
          ></i>
          <div
            class="drink-modal"
            data-drink-id="${id}"
            data-drink-name="${name}">
          <div class="img-container favorite-container">
                <div class="faves-btn ${isFavorite} column-flex">
                  <i class="fa-solid fa-heart" data-add-favorite="${id}"></i><span>Favorite</span>
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
              <ol class="drink-description">${instructionsFormat}</ol>
            </div>
          </div>
        </div>`;
  }
  generateIngredientsHtml(getShortList = false) {
    if (!this.ingredients) return "";
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
      ingrHtml += `<p>and ${andXMore} more...`;
    }
    return ingrHtml;
  }

  generateTags(getShortList = false) {
    const alcoholic = this.isAlcoholic ? "Alcoholic" : "Non-Alcoholic";
    let tags = "";
    let counter = 0;
    let xMore = 0;
    let validOptions = [alcoholic];
    if (this.category !== null) validOptions.push(this.category);
    if (this.glassType !== null) validOptions.push(this.glassType);
    if (typeof this.tags === "string")
      if (this.tags.includes(",")) {
        this.tags.split(",").forEach((tag) => validOptions.push(tag));
      } else {
        validOptions.push(this.tags);
      }

    for (let tag of validOptions) {
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
    if (this.isBasicCard) {
      return this.createBasicCard(isFave);
    }
    const { id, name } = this;

    const imageURL = this.checkImage();
    const ingrHtml = this.generateIngredientsHtml(true);
    const tags = this.generateTags(true);
    let isFavorite = isFave ? " favorite" : "";

    return `<div class="drink-card card" data-drink-id="${id}"  data-drink-name="${name} data-is-alchoholic="${this.isAlcoholic}"
    data-ingredients="${this.strIngredients}" data-category="${this.category}">
              <div class="img-container favorite-container">
              <div class="faves-btn ${isFavorite} column-flex">
                  <i class="fa-solid fa-heart" data-add-favorite="${id}"></i><span>Favorites</span>
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
                <span data-create-modal="${id}" class="pill-btn">See Full Recipe <i class="fa-solid fa-circle-info" data-create-modal="${id}"></i></span>
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

    return `<div class="drink-card card" data-drink-id="${id}"  data-drink-name="${name}">
    <div class="img-container favorite-container">
         <div class="faves-btn ${isFavorite} column-flex">
                  <i class="fa-solid fa-heart" data-add-favorite="${id}"></i><span>Favorites</span>
                </div>
              <img src="${imageURL}" alt="${name}" />
            </div>
            <h2 class="special-heading">${name}</h2>
                  <div class="card-text">
                <span data-create-modal="${id}" class="pill-btn">See Full Recipe <i class="fa-solid fa-circle-info" data-create-modal="${id}"></i></span>
              </div>
           </div>`;
  }
}
