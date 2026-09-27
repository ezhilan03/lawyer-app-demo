(function(root){
'use strict';
const make=()=>({version:1,service:'property',format:'office',language:'ta',slot:0,source:'direct',stage:null,consent:false,booking:null,docs:[false,false,false],reminder:false,events:[]});
function transition(s,action){
 const n=JSON.parse(JSON.stringify(s));
 const log=type=>n.events.push(type);
 const b=n.booking;
 switch(action.type){
 case 'submit':
  if(b && !['cancelled','completed'].includes(b.status))return s;
  n.booking={id:'DEMO-001',status:'requested',service:n.service,format:n.format,language:n.language,slot:n.slot,source:n.source,summary:n.consent?n.stage:null,assigned:null,requestedSlot:null};n.docs=[false,false,false];n.reminder=false;n.events=[];log('requested');break;
 case 'approve':if(!b||b.status!=='requested')return s;b.status='awaiting_payment';b.assigned='A';log('approved');break;
 case 'pay':if(!b||b.status!=='awaiting_payment')return s;b.status='confirmed';log('confirmed');break;
 case 'reschedule':if(!b||b.status!=='confirmed')return s;b.requestedSlot=(b.slot+1)%3;b.status='reschedule_requested';log('reschedule_requested');break;
 case 'approve_reschedule':if(!b||b.status!=='reschedule_requested')return s;b.slot=b.requestedSlot;b.requestedSlot=null;b.status='confirmed';log('rescheduled');break;
 case 'attend':if(!b||b.status!=='confirmed')return s;b.status='completed';log('completed');break;
 case 'cancel':if(!b||!['requested','awaiting_payment','confirmed','reschedule_requested'].includes(b.status))return s;b.status='cancelled';b.requestedSlot=null;log('cancelled');break;
 default:return s;
 }return n;
}
function restore(raw){try{const s=JSON.parse(raw);if(!s||s.version!==1)return make();const base=make();for(const key of ['service','format','language','slot','source','stage','consent','booking','docs','reminder','events'])if(key in s)base[key]=s[key];if(!['property','rental','business'].includes(base.service)||!['office','video','phone'].includes(base.format)||!['en','ta'].includes(base.language)||![0,1,2].includes(base.slot))return make();if(!Array.isArray(base.docs)||base.docs.length!==3||!base.docs.every(x=>typeof x==='boolean')||!Array.isArray(base.events))return make();if(base.booking&&(!['requested','awaiting_payment','confirmed','reschedule_requested','completed','cancelled'].includes(base.booking.status)||!['property','rental','business'].includes(base.booking.service)||![0,1,2].includes(base.booking.slot)))return make();return base;}catch{return make();}}
const api={make,transition,restore};if(typeof module!=='undefined')module.exports=api;else root.DemoModel=api;
})(typeof window!=='undefined'?window:globalThis);
