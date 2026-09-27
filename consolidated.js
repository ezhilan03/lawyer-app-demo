'use strict';
// One client experience section, shared by the desktop home and client overview.
experienceBlock = function () {
  const features = [
    ['calendar', tr('Appointments, with preparation included','சந்திப்பும் அதற்கான தயாரிப்பும்'), tr('Request or change a time, see confirmation and know what to prepare.','சந்திப்புக்கு நேரம் கேட்கலாம், மாற்றம் கோரலாம்; உறுதிசெய்யப்பட்ட நேரத்தையும் தயாராக வேண்டியவற்றையும் பார்க்கலாம்.')],
    ['file', tr('The right documents, in one place','தேவையான ஆவணங்கள் ஒரே இடத்தில்'), tr('See what your lawyer has requested and keep documents, review notes and reports together.','வழக்கறிஞர் கேட்ட ஆவணங்கள், ஆய்வுக் குறிப்புகள், அறிக்கைகள் அனைத்தையும் ஒரே இடத்தில் பார்க்கலாம்.')],
    ['check', tr('A clear next step after every conversation','ஒவ்வொரு ஆலோசனைக்குப் பிறகும் தெளிவான அடுத்த படி'), tr('Follow agreed actions and dates, with updates from the firm in your client account.','ஒப்புக்கொண்ட பணிகள், தேதிகள், நிறுவனத்தின் தகவல்கள் ஆகியவற்றை உங்கள் கணக்கில் பார்க்கலாம்.')]
  ];
  return `<section class="public-section experience-section client-continuity"><div>${eyebrow(tr('When you become a client','நீங்கள் வாடிக்கையாளராகும்போது'))}<h2>${tr('Your next steps.<br>All in one place.','உங்கள் அடுத்த படிகள்.<br>அனைத்தும் ஒரே இடத்தில்.')}</h2><p class="lead">${tr('Stay connected with the firm, from your first appointment to the next agreed action—on the website or in the proposed app.','முதல் சந்திப்பு முதல் அடுத்து செய்ய வேண்டிய பணி வரை, இணையதளத்திலோ முன்மொழியப்படும் செயலியிலோ நிறுவனத்துடன் தொடர்பில் இருக்கலாம்.')}</p><div class="client-actions">${button(tr('Preview the client dashboard →','வாடிக்கையாளர் பக்கத்தைப் பார்க்க →'),'login','client:web')}${link(tr('Explore the mobile app ↗','மொபைல் செயலியைப் பார்க்க ↗'),'login','client:mobile')}</div><p class="client-demo-note">${tr('Proposed experience · Appointment reminders and notifications are illustrative; nothing is sent.','முன்மொழியப்படும் வசதிகள் · சந்திப்பு நினைவூட்டல்களும் அறிவிப்புகளும் மாதிரிகள் மட்டுமே; எதுவும் அனுப்பப்படாது.')}</p></div><div class="feature-list">${features.map(([ic,h,p],i)=>`<article>${icon(ic)}<div><span class="continuity-step">0${i+1}</span><h3>${h}</h3><p>${p}</p></div></article>`).join('')}</div></section>`;
};
let supportChoice = 0;
function supportOptions() {
  return [
    {label:tr('One review','ஒரு ஆவண ஆய்வு'),title:tr('One decision. A focused review.','ஒரு முடிவுக்கு, தெளிவான ஆவண ஆய்வு.'),description:tr('For a document or question with a defined scope. Agree what needs reviewing, when you need it and the fee before work begins.','ஒரு ஆவணம் அல்லது குறிப்பிட்ட கேள்விக்கான உதவி. ஆய்வின் விவரம், காலக்கெடு, கட்டணம் ஆகியவற்றைப் பணியைத் தொடங்கும் முன் ஒப்புக்கொள்ளலாம்.'),example:tr('Before signing a supplier agreement, share the draft and the questions you want answered.','சப்ளையர் ஒப்பந்தத்தில் கையெழுத்திடும் முன், வரைவு ஒப்பந்தத்தையும் உங்கள் கேள்விகளையும் பகிரலாம்.'),steps:[tr('Share the document and your questions','ஆவணத்தையும் உங்கள் கேள்விகளையும் பகிருங்கள்'),tr('Agree the scope, fee and review date','ஆய்வின் விவரம், கட்டணம், தேதியை ஒப்புக்கொள்ளுங்கள்'),tr('Keep the review notes and next actions','ஆய்வுக் குறிப்புகளையும் அடுத்த பணிகளையும் பார்க்கலாம்')]},
    {label:tr('A project','ஒரு திட்டம்'),title:tr('Related work. One coordinated plan.','தொடர்புடைய பணிகளுக்கு ஒருங்கிணைந்த திட்டம்.'),description:tr('For several documents or decisions around one project. Coordinate the people, reviews and milestones with your assigned lawyer.','ஒரு திட்டத்துடன் தொடர்புடைய ஆவணங்களுக்கும் முடிவுகளுக்கும் உதவி. சம்பந்தப்பட்டவர்கள், ஆய்வுகள், முக்கிய தேதிகள் ஆகியவற்றை உங்கள் வழக்கறிஞருடன் ஒருங்கிணைக்கலாம்.'),example:tr('For a new business location, keep the lease review, supplier agreements and agreed dates together.','புதிய தொழில் இடத்திற்கான வாடகை ஒப்பந்தம், சப்ளையர் ஒப்பந்தங்கள், ஒப்புக்கொண்ட தேதிகள் ஆகியவற்றை ஒரே இடத்தில் வைத்துக்கொள்ளலாம்.'),steps:[tr('Outline the project and people involved','திட்டத்தையும் சம்பந்தப்பட்டவர்களையும் பற்றி விளக்குங்கள்'),tr('Agree milestones, responsibilities and fees','பணிகள், பொறுப்புகள், தேதிகள், கட்டணத்தை ஒப்புக்கொள்ளுங்கள்'),tr('Track related reviews in your client account','தொடர்புடைய ஆய்வுகளை உங்கள் கணக்கில் பார்க்கலாம்')]},
    {label:tr('Ongoing support','தொடர்ந்த உதவி'),title:tr('A familiar team as your business grows.','உங்கள் தொழில் வளரும்போது தொடர்ந்து உதவும் குழு.'),description:tr('For recurring legal work. Agree the scope, fees, expected response times and review dates with the firm.','அடிக்கடி தேவைப்படும் சட்ட உதவிக்கான ஏற்பாடு. உதவியின் விவரம், கட்டணம், பதில் கிடைக்கும் காலம், மறுஆய்வுத் தேதிகள் ஆகியவற்றை நிறுவனத்துடன் ஒப்புக்கொள்ளலாம்.'),example:tr('A supplier agreement today. Employment documents next month. The same client account keeps the work and next actions together.','இன்று சப்ளையர் ஒப்பந்தம்; அடுத்த மாதம் வேலை ஒப்பந்தங்கள். ஒரே வாடிக்கையாளர் கணக்கில் பணிகளையும் அடுத்த படிகளையும் பார்க்கலாம்.'),steps:[tr('Discuss the help you need regularly','தொடர்ந்து தேவைப்படும் உதவியைப் பற்றிப் பேசுங்கள்'),tr('Agree scope, fees and response expectations','உதவியின் விவரம், கட்டணம், பதில் நேரத்தை ஒப்புக்கொள்ளுங்கள்'),tr('Review priorities with your assigned lawyer','முன்னுரிமைகளை உங்கள் வழக்கறிஞருடன் மறுஆய்வு செய்யுங்கள்')]}
  ];
}
function supportPanel() {
 const s=supportOptions()[supportChoice];
 return `<div class="support-story"><span class="support-number">0${supportChoice+1}</span><h3>${s.title}</h3><p>${s.description}</p><div class="support-example"><span>${tr('For example','ஓர் உதாரணம்')}</span><p>${s.example}</p></div></div><div class="support-process"><h3>${tr('How it works','எப்படிப் பணிபுரிவோம்')}</h3><ol>${s.steps.map(x=>`<li>${x}</li>`).join('')}</ol>${button(tr('Discuss what you need →','உங்கள் தேவையைப் பற்றிப் பேசலாம் →'),'business-enquiry','',true)}<p class="tiny">${tr('One client account for personal and business work. Scope and fees are agreed with the firm.','தனிப்பட்ட மற்றும் தொழில் பணிகளுக்கு ஒரே வாடிக்கையாளர் கணக்கு. உதவியின் விவரமும் கட்டணமும் நிறுவனத்துடன் ஒப்புக்கொள்ளப்படும்.')}</p></div>`;
}
function workingTogether() {
 return `<section id="working-together" class="public-section support-studio"><div class="section-heading"><div>${eyebrow(tr('A way of working that fits','உங்கள் தேவைக்கு ஏற்ற உதவி'))}<h2>${tr('The right support. <br>For the work ahead.','உங்கள் பணிகளுக்கு <br>ஏற்ற சட்ட உதவி.')}</h2></div><p>${tr('Choose a starting point to see how we could work together.','எப்படிப் பணிபுரியலாம் என்பதைப் பார்க்க, உங்களுக்கு ஏற்ற வழியைத் தேர்ந்தெடுங்கள்.')}</p></div><div class="support-options" role="group" aria-label="${tr('Type of support','உதவியின் வகை')}">${supportOptions().map((s,i)=>`<button type="button" data-support-choice="${i}" aria-pressed="${supportChoice===i}" aria-controls="support-detail"><span>0${i+1}</span>${s.label}</button>`).join('')}</div><div id="support-detail" class="support-detail" aria-live="polite">${supportPanel()}</div></section>`;
}
const uncombinedServices = expandedServices;
expandedServices = function () {
 const template=document.createElement('template');
 template.innerHTML=uncombinedServices();
 template.content.querySelector('#working-together').outerHTML=workingTogether();
 template.content.querySelector('.business-example')?.remove();
 return template.innerHTML;
};
document.addEventListener('click',e=>{
 const target=e.target.closest('[data-support-choice]');
 if(!target)return;
 supportChoice=Number(target.dataset.supportChoice);
 document.querySelectorAll('[data-support-choice]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.supportChoice)===supportChoice)));
 document.querySelector('#support-detail').innerHTML=supportPanel();
});
