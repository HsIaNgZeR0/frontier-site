'use strict';
window.FrontierShopUIV28=(()=>{
 const E=FrontierSurveyEngineV27,c=FrontierInventory.definitions;
 const ticket=()=>'<span class="item-icon rarity-6" data-item-id="wallet:ticket" role="img" aria-label="尋訪憑證"><img src="assets/recruit-ticket-official.png" alt="" draggable="false"></span>';
 const icon=FrontierIcons.html;FrontierIcons.html=function(id){return id==='wallet:ticket'?ticket():icon(id)};
 const count=FrontierMobile.count;FrontierMobile.count=function(id){const key=id?.replace('survey_focus_','');return E.limits[key]?(E.ensure(db).tickets[key]||0)+count(id):count(id)};
 function decorate(){
  for(const img of document.querySelectorAll('img[src*="item-legacy-ticket"]'))if(!img.alt.includes('人事')){img.src='assets/recruit-ticket-official.png';img.dataset.itemId='wallet:ticket';img.draggable=false}
  for(const row of document.querySelectorAll('[data-survey-product]')){const id=row.dataset.surveyProduct,key=id.replace('-focus','');if(id==='pull')row.querySelector('.store-picture').dataset.itemId='wallet:ticket';else if(['silver-pack','blue-pack'].includes(id)){const picture=row.querySelector('.store-picture'),key=id.replace('-pack','');picture.dataset.surveyPack=key;picture.setAttribute('role','button');picture.tabIndex=0;picture.setAttribute('aria-label','使用持有的'+(key==='silver'?'銀':'藍')+'色材料自選包');picture.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();FrontierSurveyV27.choosePack(key)}};}else if(id.endsWith('-focus')&&E.limits[key])row.querySelector('.store-picture').dataset.itemId='survey_focus_'+key;const title=row.querySelector(':scope>b');if(title)row.setAttribute('aria-label',title.textContent)}
  for(const button of document.querySelectorAll('.survey-held [data-survey-unpack]')){const item=db.inventory.items.find(i=>i.uid===button.dataset.surveyUnpack);if(item)button.dataset.itemId=item.itemId}
  for(const img of document.querySelectorAll('.survey-held>p img[src*="assets/survey/"]')){const key=img.getAttribute('src').match(/(gold|silver|blue)\.png/)?.[1];if(key)img.dataset.itemId='survey_focus_'+key}

 }
 const renderBefore=render;render=function(){renderBefore();decorate()};
 return{decorate,ticket};
})();
