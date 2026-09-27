'use strict';
// V1 remains the visual authority. Classify existing sections for clear reading boundaries.
const v3PublicRender = render;
render = function () {
  v3PublicRender();
  if (role !== 'public') return;
  const main = document.querySelector('main');
  if (!main) return;
  main.classList.add('v3-public');
  for (const section of main.querySelectorAll(':scope > section')) {
    const title = section.querySelector('h2');
    if (title) {
      if (!title.id) title.id = `section-heading-${[...main.children].indexOf(section)}`;
      section.setAttribute('aria-labelledby', title.id);
    }
    if (section.querySelector('.service-grid')) section.classList.add('v3-services');
    if (section.querySelector('.story-grid')) section.classList.add('v3-stories');
    if (section.querySelector('.guide-list')) section.classList.add('v3-reading');
  }
};
render();
