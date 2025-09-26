//Slideshow--

const delay = (ms) => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
};

const updateSlideshow = (config) => {
  const children = [...config.elementContainers.featured.children];
  if (config.settings.currentSlide > children.length - 1) {
    config.settings.currentSlide = 0;
  } else if (config.settings.currentSlide < 0) {
    config.settings.currentSlide = children.length - 1;
  }
  let nextSlide =
    config.settings.currentSlide < children.length - 1
      ? config.settings.currentSlide + 1
      : 0;
  let previousSlide =
    config.settings.currentSlide > 0
      ? config.settings.currentSlide - 1
      : children.length - 1;
  children.forEach((elm) => {
    elm.classList.remove("current");
    elm.classList.remove("next");
    elm.classList.remove("previous");
  });
  children[config.settings.currentSlide].classList.add("current");
  children[nextSlide].classList.add("next");
  children[previousSlide].classList.add("previous");
};

export const changeSlide = (e, config) => {
  switch (e) {
    case "next":
      config.settings.currentSlide += 1;
      break;
    case "prev":
      config.settings.currentSlide -= 1;
      break;
  }
  updateSlideshow(config);
};

/**
 *
 * @param {*} config the settings config reference from the index.js file
 * @param {*} container the container to loop the slideshow through
 */
export const slideshowLoop = async (config) => {
  if (config.settings.slideShowAlreadyPlaying) {
    throw new Error("Already playing slideshow");
  }
  while (!config.settings.forcePauseSlideshow) {
    config.settings.slideShowAlreadyPlaying = true;
    if (!config.settings.pauseSlideshow) {
      updateSlideshow(config);
      config.settings.currentSlide += 1;
    }
    await delay(config.settings.delayTime);
  }
  config.settings.slideShowAlreadyPlaying = false;
};
