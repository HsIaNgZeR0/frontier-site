'use strict';
(()=>{
 const U=FrontierCombatUnits61,seen=new WeakSet();U.migrate(db);
 const stats=(s,keys=U.statKeys)=>{if(!s||seen.has(s))return;seen.add(s);for(const k of keys)if(typeof s[k]==='number')s[k]*=10;};
 for(const f of FrontierOperatorCatalogV113.forms){for(const s of Object.values(f.stats))stats(s);U.prose(f)}
 for(const d of Object.values(FrontierCombat.operators)){stats(d);for(const s of Object.values(d.stageStats||{}))stats(s)}
 for(const d of defs)stats(d);
 for(const d of Object.values(cards)){stats(d,['damage','block','heal','power','thorns','armorBreak']);if(d.text)d.text=U.text(d.text)}
 for(const d of Object.values(FrontierInventory.definitions))if(d.category==='medicine')d.description=U.text(d.description);
 for(const d of FrontierLinks.definitions)U.prose(d);
 for(const d of Object.values(FrontierRegionalEnemies.traits))d.text=d.combatText61??U.text(d.text);
 const oldStart=startRun;startRun=function(...args){const before=R(),result=oldStart(...args),r=R();if(r&&r!==before)r.combatUnitVersion61=61;return result};
})();
