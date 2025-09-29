/**
 *
 * @param {*} div element to have the filter options built
 * @param {*} id unique identifier to avoid duplicate ids
 */
const buildFilterOptions = (div, id) => {
  div.innerHTML = `
              <!--Dropdown button-->
              <i class="fa-solid fa-sliders" data-activate="settings-list-${id}"></i
              >
              <!--Dropdown Menu-->
              <div class="dropdown-list column-flex" id="settings-list-${id}">
                <h3>Filters <i class="fa-solid fa-gears"></i></h3>
                <!--toggle show only non-alcoholic drinks-->
                <div class="inline-flex space-between">
                  <h4>Hide Alcoholic Drinks</h4>
                  <i
                    data-toggle-btn="isSober"
                    class="fa-solid fa-toggle-off"
                  ></i>
                </div>
                <!--toggle filter by drink name-->
                <div class="inline-flex space-between">
                  <h4>Search by Name / Ingredient</h4>
                  <i
                    data-toggle-btn="filterByIngredient"
                    class="fa-solid fa-toggle-off"
                  >
                  </i>
                </div>
                <h3>Sort <i class="fa-solid fa-arrow-down-a-z"></i></h3>
                <!--Sort a-z or z-a-->
                <div class="inline-flex space-between">
                  <h4>A-Z Alphabetical</h4>
                  <i
                    data-toggle-btn="sortReverse"
                    class="fa-solid fa-toggle-off"
                  >
                  </i>
                  <h4>Z-A Alphabetical</h4>
                </div>
                <h3>
                  Display Style <i class="fa-solid fa-users-viewfinder"></i>
                </h3>
                <div class="inline-flex space-between">
                  <h4>
                    Grid View <i class="fa-solid fa-table-cells-large"></i>
                  </h4>
                  <i
                    data-toggle-btn="displayTable"
                    class="fa-solid fa-toggle-off"
                  >
                  </i>
                  <h4>List View <i class="fa-solid fa-table-list"></i></h4>
                </div>
                <h3>Other <i class="fa-solid fa-puzzle-piece"></i></h3>
                <!--find a random drink-->
                <div class="inline-flex space-between">
                  <h4>Random Drink</h4>
                  <i class="fa-solid fa-shuffle" data-random-modal="random">
                  </i>
                </div>
              </div>
        `;
};

const buildSearchBar = (div, id, containerId) => {
  div.innerHTML = `<div class="search-bar" id="search-bar-${id}">
              <input
                type="text"
                name="search-bar-${id}"
                id="search-bar-input-${id}"
                placeholder="Search"
                class="search-bar-input"
                data-key-search="#${containerId}"
              />
              <i
                class="fa-solid fa-magnifying-glass"
                data-click-search="#${containerId}"
              ></i>
              <i
                class="fa-solid fa-magnifying-glass"
                data-activate="search-bar-${id}"
              ></i>
            </div>`;
};

export const buildPageSearches = () => {
  const filterDivs = document.querySelectorAll('[data-build-elm="filters"]');
  const searchDivs = document.querySelectorAll('[data-build-elm="search"]');
  if (filterDivs) {
    let uniqueId = 1;
    for (let elm of filterDivs) {
      buildFilterOptions(elm, uniqueId);
      uniqueId++;
    }
  }
  if (searchDivs) {
    let uniqueId = 1;
    for (let elm of searchDivs) {
      const containerId = elm.dataset.relativeContainer || "results-container";
      buildSearchBar(elm, uniqueId, containerId);
      uniqueId++;
    }
  }
};
