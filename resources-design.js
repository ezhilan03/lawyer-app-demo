'use strict';
const resourcesBeforeDesign = expandedResources;
function preparationCollection() {
 return `<section id="quick-guides" class="public-section preparation-collection"><div class="preparation-heading"><h2>${tr('A good place to start.','இங்கிருந்து தொடங்கலாம்.')}</h2><p>${tr('A little preparation makes room for a better conversation. Choose the situation closest to yours.','சிறிது தயாரிப்புடன் வந்தால் ஆலோசனை இன்னும் பயனுள்ளதாக இருக்கும். உங்கள் சூழ்நிலைக்கு ஏற்ற வழிகாட்டியைத் தேர்ந்தெடுங்கள்.')}</p></div><div class="preparation-layout"><article class="preparation-feature"><div class="preparation-topic">${icon('home')}<span>${tr('Buying a property','சொத்து வாங்கும்போது')}</span></div><h3>${tr('Before the keys,<br>start with the papers.','வீடு வாங்கும் முன்,<br>ஆவணங்களைப் பற்றிப் பேசலாம்.')}</h3><p>${tr('The documents you have. The dates that matter. The questions to bring to your first review.','உங்களிடம் உள்ள ஆவணங்கள், முக்கியமான தேதிகள், முதல் ஆலோசனையில் கேட்க விரும்பும் கேள்விகள் — இவற்றைத் தயாராக வைத்திருக்கலாம்.')}</p>${button(tr('Read the property guide →','சொத்து வழிகாட்டியைப் படிக்க →'),'service-guide','property',true)}<span class="preparation-footnote">${tr('Preparation guide · Chennai property example','தயாரிப்பு வழிகாட்டி · சென்னை சொத்து உதாரணம்')}</span></article><div class="preparation-more"><article><div>${icon('file')}<span>${tr('Rental agreements','வாடகை ஒப்பந்தங்கள்')}</span></div><h3>${tr('Before you sign <br>the lease.','வாடகை ஒப்பந்தத்தில் <br>கையெழுத்திடும் முன்.')}</h3><p>${tr('Bring the draft, your questions and the terms you want explained.','வரைவு ஒப்பந்தம், உங்கள் கேள்விகள், விளக்கம் தேவைப்படும் நிபந்தனைகள் ஆகியவற்றைத் தயாராக வைத்திருங்கள்.')}</p>${link(tr('Read the rental guide →','வாடகை வழிகாட்டியைப் படிக்க →'),'service-guide','rental')}</article><article><div>${icon('briefcase')}<span>${tr('Business contracts','தொழில் ஒப்பந்தங்கள்')}</span></div><h3>${tr('A clearer agreement. <br>A better starting point.','ஒப்பந்தத்தைப் புரிந்துகொண்டு <br>அடுத்த படியை முடிவு செய்யலாம்.')}</h3><p>${tr('Set out what the contract is for and what you need reviewed.','ஒப்பந்தத்தின் நோக்கம் என்ன, எதை ஆய்வு செய்ய வேண்டும் என்பதை முன்கூட்டியே குறிப்பிடுங்கள்.')}</p>${link(tr('Read the business guide →','தொழில் வழிகாட்டியைப் படிக்க →'),'service-guide','business')}</article></div></div></section>`;
}
expandedResources = function () {
 const template=document.createElement('template');
 template.innerHTML=resourcesBeforeDesign();
 template.content.querySelector('#quick-guides').outerHTML=preparationCollection();
 const library=template.content.querySelector('#official-library');
 library.classList.add('reference-directory');
 library.querySelector('.eyebrow')?.remove();
 library.querySelector('h2').innerHTML=tr('The official reference desk.','அதிகாரப்பூர்வ தகவல்களைப் பார்க்கலாம்.');
 const news=template.content.querySelector('#news-reading');
 news.classList.add('reading-journal');
 news.querySelector('h2').insertAdjacentHTML('afterend',`<p class="journal-intro">${tr('Selected announcements and useful reading, with the original source close at hand.','தேர்ந்தெடுக்கப்பட்ட அறிவிப்புகளும் பயனுள்ள விளக்கங்களும், அவற்றின் அதிகாரப்பூர்வ இணைப்புகளுடன்.')}</p>`);
 return template.innerHTML;
};
