'use strict';
// Keep the desktop content; disclose secondary detail on narrow Services/Resources pages.
const mobilePagesRender=render;
const compactPages=window.matchMedia('(max-width:700px)');
function foldArticle(el){const title=el.querySelector('h3');if(!title)return;const details=document.createElement('details');details.className='compact-item';const summary=document.createElement('summary');summary.textContent=title.textContent;title.remove();el.querySelector('.story-number')?.remove();details.append(summary);const body=document.createElement('div');body.className='compact-item-body';while(el.firstChild)body.append(el.firstChild);details.append(body);el.replaceWith(details)}
function foldSection(el,label){if(!el)return;const details=document.createElement('details');details.className='compact-section';details.id=el.id;const summary=document.createElement('summary');summary.textContent=label;details.append(summary);el.querySelector('.section-heading')?.remove();el.querySelector(':scope > h2')?.remove();el.querySelector(':scope > .eyebrow')?.remove();const body=document.createElement('div');body.className='compact-section-body';while(el.firstChild)body.append(el.firstChild);details.append(body);el.replaceWith(details)}
render=function(){mobilePagesRender();if(role!=='public'||!['services','guides'].includes(page)||!compactPages.matches)return;const main=document.querySelector('main');main.classList.add('compact-public-page');
if(page==='services'){
main.querySelectorAll('.service-grid .service,.business-grid article,.engagement-grid article').forEach(foldArticle);
foldSection(main.querySelector('#firm-evidence'),tr('Firm experience & professional network','நிறுவனத்தின் அனுபவமும் நிபுணர் தொடர்புகளும்'));
foldSection(main.querySelector('.business-example'),tr('An example of ongoing business support','தொடர்ந்த தொழில் உதவிக்கான உதாரணம்'));
}else{
main.querySelectorAll('.official-grid article').forEach(foldArticle);
foldSection(main.querySelector('#social-stories'),tr('From our social pages · Sample posts','சமூக வலைதளங்களில் · மாதிரிப் பதிவுகள்'));
// Keep the editorial reading section visible and distinct from the reference directory.
}
};
compactPages.addEventListener('change',()=>{if(role==='public'&&['services','guides'].includes(page))render()});
document.addEventListener('click',e=>{if(!compactPages.matches)return;const a=e.target.closest('.compact-public-page .content-jumps a');if(!a)return;const target=document.getElementById(a.getAttribute('href').slice(1));if(target?.tagName==='DETAILS'){target.open=true;target.scrollIntoView({block:'start'})}});
render();
