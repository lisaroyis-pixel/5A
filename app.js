
const D=window.TF_DATA, $=s=>document.querySelector(s), app=$("#app"), title=$("#title");
let S=JSON.parse(localStorage.getItem("teachflow-clean")||'{"hh":[],"notes":{},"points":0}');
const save=()=>localStorage.setItem("teachflow-clean",JSON.stringify(S));
const esc=s=>String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]));
const HH=["Collaboration","Autonomie","Autorégulation","Fiabilité","Organisation","Initiative","Utilisation du français oral"];
const subjects=["Français","Mathématiques","Sciences","Enseignement religieux","Études sociales","Les arts"];
function shell(t,h){title.textContent=t;app.innerHTML=h}
function today(){
 let d=new Date(), key=d.toISOString().slice(0,10);
 shell("Aujourd’hui",`<div class="card hero"><div><h3>${d.toLocaleDateString("fr-CA",{weekday:"long",day:"numeric",month:"long"})}</h3><div class="muted">Classe 5A · TeachFlow</div></div><div class="points">${S.hh.filter(x=>x.date.slice(0,10)===key).length} observations aujourd’hui</div></div>
 <div class="grid g4">${["Planifier ma journée","Ajouter une observation","Ouvrir mes unités","Centre de classe"].map((x,i)=>`<button class="bigbtn" data-jump="${["week","hh","units","classhub"][i]}">${x}</button>`).join("")}</div>`);
 document.querySelectorAll("[data-jump]").forEach(b=>b.onclick=()=>go(b.dataset.jump));
}
function week(){
 const names=["Jour 1","Jour 2","Jour 3","Jour 4","Jour 5"];
 shell("Ma semaine",`<div class="grid g5">${names.map((n,i)=>`<div class="card day"><h4>${n}</h4>${subjects.slice(0,4).map((s,j)=>`<div class="block"><b>${s}</b><span class="muted">Cliquer pour planifier</span></div>`).join("")}</div>`).join("")}</div><div class="card"><b>Notes de la semaine</b><textarea id="wn">${esc(S.notes.week||"")}</textarea></div>`);
 $("#wn").oninput=e=>{S.notes.week=e.target.value;save()};
}
function annual(){shell("Planification annuelle",`<div class="grid g4">${["Septembre","Octobre","Novembre","Décembre","Janvier","Février","Mars","Avril","Mai","Juin"].map(m=>`<div class="card"><h3>${m}</h3><p class="muted">Planification interdisciplinaire</p><button class="primary">Ouvrir</button></div>`).join("")}</div>`)}
function units(){shell("Matières / Unités",`<div class="grid g4">${subjects.map(s=>`<div class="card"><h3>${s}</h3><p class="muted">Unités, leçons et ressources</p><button class="primary">+ Ajouter une unité</button></div>`).join("")}</div>`)}
function prayers(){shell("Prières",`<div class="card"><h3>Prière du jour</h3><textarea id="pr" placeholder="Écrire ou coller la prière…">${esc(S.notes.prayer||"")}</textarea></div>`);$("#pr").oninput=e=>{S.notes.prayer=e.target.value;save()}}
function students(){shell("Élèves",`<div class="card"><input class="search" id="sq" placeholder="🔎 Rechercher un élève…"></div><div class="student-grid" id="sg">${D.students.map(n=>`<div class="student" data-name="${esc(n)}">${esc(n)}<div class="muted" style="font-size:12px">${D.birthdays[n]?"🎂 "+D.birthdays[n]:""}</div></div>`).join("")}</div>`);$("#sq").oninput=e=>document.querySelectorAll("[data-name]").forEach(x=>x.style.display=x.dataset.name.toLowerCase().includes(e.target.value.toLowerCase())?"":"none")}
function hh(){
 shell("Habitudes de travail",`<div class="card hero"><div><h3>Habitudes de travail</h3></div><div class="points">${S.hh.length} observations</div></div>
 <div class="card"><input class="search" id="hs" placeholder="🔎 Trouver un élève…"><div class="student-grid" id="hsg" style="margin-top:12px"><button class="student all" data-all="1">✓ Tous<br><span class="muted">Toute la classe</span></button>${D.students.map(n=>`<button class="student" data-hstu="${esc(n)}">${esc(n)}</button>`).join("")}</div></div>
 <div class="card"><h3>Habitude observée</h3><div id="chosen" class="muted">Aucun élève choisi</div><div class="hh-grid" style="margin-top:12px">${HH.map((h,i)=>`<button class="hh" data-hh="${i}" disabled><strong>${esc(h)}</strong></button>`).join("")}</div><div id="ok"></div></div>
 <div class="card"><h3>Dernières observations</h3><table class="history"><tbody>${S.hh.slice(0,12).map(x=>`<tr><td><b>${esc(x.student)}</b></td><td>${esc(x.hh)}</td><td>${new Date(x.date).toLocaleDateString("fr-CA")}</td></tr>`).join("")||'<tr><td class="muted">Aucune observation.</td></tr>'}</tbody></table></div>`);
 let chosen=new Set();
 const allBtn=document.querySelector("[data-all]");
 const studentBtns=[...document.querySelectorAll("[data-hstu]")];
 function refreshSelection(){
   studentBtns.forEach(b=>b.classList.toggle("sel",chosen.has(b.dataset.hstu)));
   const allSelected=D.students.length>0 && D.students.every(n=>chosen.has(n));
   allBtn.classList.toggle("sel",allSelected);
   $("#chosen").textContent=chosen.size===0?"Aucun élève choisi":allSelected?`Toute la classe sélectionnée (${chosen.size})`:`${chosen.size} élève${chosen.size>1?"s":""} sélectionné${chosen.size>1?"s":""}`;
   document.querySelectorAll("[data-hh]").forEach(x=>x.disabled=chosen.size===0);
 }
 studentBtns.forEach(b=>b.onclick=()=>{const n=b.dataset.hstu;chosen.has(n)?chosen.delete(n):chosen.add(n);refreshSelection()});
 allBtn.onclick=()=>{const allSelected=D.students.every(n=>chosen.has(n));chosen=allSelected?new Set():new Set(D.students);refreshSelection()};
 $("#hs").oninput=e=>studentBtns.forEach(x=>x.style.display=x.textContent.toLowerCase().includes(e.target.value.toLowerCase())?"":"none");
 document.querySelectorAll("[data-hh]").forEach(b=>b.onclick=()=>{
   if(!chosen.size)return;
   let h=HH[+b.dataset.hh],targets=[...chosen];
   targets.forEach(student=>S.hh.unshift({student,hh:h,date:new Date().toISOString()}));
   save();
   $("#ok").innerHTML=`<div class="success">✓ ${esc(h)} ajouté à ${targets.length===D.students.length?"toute la classe":targets.length+" élève"+(targets.length>1?"s":"")}.</div>`;
   chosen=new Set();refreshSelection();
 });
 refreshSelection();
}
function classhub(){shell("Centre de classe",`<div class="grid g4">${["⏱️ Minuterie","🎲 Élève au hasard","🔊 Niveau de voix","👥 Groupes","🎯 Points de classe","📝 Message"].map(x=>`<button class="bigbtn">${x}</button>`).join("")}</div><div class="card"><h3>Points de classe</h3><div class="points">${S.points||0}</div><button class="primary" id="plus">+ 1</button></div>`);$("#plus").onclick=()=>{S.points=(S.points||0)+1;save();classhub()}}
function resources(){shell("Ressources",`<div class="card"><h3>Mes liens</h3><textarea id="res" placeholder="Colle ici tes liens et notes…">${esc(S.notes.resources||"")}</textarea></div>`);$("#res").oninput=e=>{S.notes.resources=e.target.value;save()}}
const views={today,week,annual,units,prayers,students,hh,classhub,resources};
function go(v){document.querySelectorAll("nav button").forEach(b=>b.classList.toggle("active",b.dataset.v===v));(views[v]||today)()}
document.querySelectorAll("nav button").forEach(b=>b.onclick=()=>go(b.dataset.v));
$("#print").onclick=()=>print();go("today");
