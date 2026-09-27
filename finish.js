"use strict";
// Presentational route labels keep calm reading surfaces distinct from firm identity.
const finishRender = render;
render = function () {
  finishRender();
  document.body.dataset.role = role;
  document.body.dataset.page = page;
  document.body.dataset.surface = surface;
};
render();
