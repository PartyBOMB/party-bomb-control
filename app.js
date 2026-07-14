const $=id=>document.getElementById(id);
const on=(id,event,handler)=>{
  const element=$(id);
  if(element)element.addEventListener(event,handler);
};
const APP={state:null,word:WORDS[0],used:[],init(){
this.state=Store.load()||this.defaults();
if(!Array.isArray(this.state.teams))this.state.teams=[];
this.state.teams=this.state.teams.slice(0,4).map(t=>{
  const meta=this.teamMeta(t.id);
  return {...t,name:meta.name,players:Array.isArray(t.players)?t.players.slice(0,4):[]};
});
if(this.state.currentTeam && !this.state.teams.some(t=>t.id===this.state.currentTeam)){
  this.state.currentTeam=this.state.teams[0]?.id||null;
}
this.bind();$("versionText").textContent=`v${CONFIG.version}`;this.render();if("serviceWorker"in navigator)navigator.serviceWorker.register("./sw.js")},defaults(){return{settings:{...CONFIG.defaults},teams:[],currentTeam:null,game:{status:"READY",time:180,life:2,target:3,good:0,bad:0,led:-1,wires:"00000",giver:0,task:"DRAW",word:0,battery:82,volt:4.05},logs:[]}},bind(){document.querySelectorAll(".tab").forEach(b=>b.onclick=()=>{document.querySelectorAll(".tab,.page").forEach(x=>x.classList.remove("active"));b.classList.add("active");$(b.dataset.page).classList.add("active")});$("usbConnect").onclick=()=>Hardware.usb(this).catch(e=>this.toast(e.message));
on("demoToggle","click",()=>this.toggleDemo());
on("disconnectControl","click",()=>Hardware.close(this));
on("liveStart","click",()=>this.ensurePlayable(()=>Game.start(this)));$("bleConnect").onclick=()=>Hardware.ble(this).catch(e=>this.toast(e.message));$("disconnect").onclick=()=>Hardware.close(this);$("saveSettings").onclick=()=>this.settings();$("sendSettings").onclick=()=>this.sendSettings();$("readSettings").onclick=()=>Hardware.send("GET").catch(e=>this.toast(e.message));$("startGame").onclick=()=>this.ensurePlayable(()=>Game.start(this));$("resetGame").onclick=()=>{this.reset();this.render()};$("rfTest").onclick=()=>Hardware.send("RFTEST");$("refreshBattery").onclick=()=>this.battery();$("addTeam").onclick=()=>this.addTeam();$("nextTeam").onclick=()=>Game.next(this);$("forceWin").onclick=()=>Game.finish(this,"WIN");$("forceBoom").onclick=()=>Game.finish(this,"BOOM");$("goodPlus").onclick=()=>this.adjust("good",1);$("goodMinus").onclick=()=>this.adjust("good",-1);$("badPlus").onclick=()=>this.adjust("bad",1);$("badMinus").onclick=()=>this.adjust("bad",-1);$("newWord").onclick=()=>{this.pick();this.words()};$("exportWords").onclick=()=>this.export();$("importWords").onchange=e=>this.import(e)},save(){Store.save(this.state)},toast(t){UI.toast(t)},
connection(t){$("connectionBadge").textContent=t;$("demoToggle").textContent=Hardware.mode==="demo"?"🧪 Demó: BE":"🧪 Demó: KI"},
toggleDemo(){
  if(Hardware.mode==="demo"){
    Hardware.mode="none";
    this.connection("⚪ Nincs kapcsolat");
  }else{
    Hardware.close(this);
    Hardware.mode="demo";
    this.connection("🧪 Demó");
  }
},
ensurePlayable(fn){
  if(this.state.teams.length===0)return this.toast("Előbb hozz létre legalább egy csapatot.");
  const team=this.team();
  if(!team || team.players.length<2)return this.toast("A kezdő csapatban legalább 2 játékos kell.");
  fn();
},team(){return this.state.teams.find(t=>t.id===this.state.currentTeam)||null},
teamMeta(id){
  const map={
    red:{name:"Piros csapat",emoji:"🔴",className:"team-red"},
    blue:{name:"Kék csapat",emoji:"🔵",className:"team-blue"},
    yellow:{name:"Sárga csapat",emoji:"🟡",className:"team-yellow"},
    green:{name:"Zöld csapat",emoji:"🟢",className:"team-green"}
  };
  return map[id]||{name:"Csapat",emoji:"⚪",className:"team-neutral"};
},
giver(){const team=this.team();return team?.players?.length?team.players[this.state.game.giver%team.players.length]:null},
guesser(){const team=this.team();return team?.players?.length?team.players[(this.state.game.giver+1)%team.players.length]:null},pick(){let a=WORDS.map((_,i)=>i).filter(i=>!this.used.includes(i));if(!a.length){this.used=[];a=WORDS.map((_,i)=>i)}const i=a[Math.floor(Math.random()*a.length)];this.used.push(i);this.state.game.word=i;this.word=WORDS[i]},activity(){if(!this.state.settings.activity){this.state.game.task="OFF";return}this.state.game.task=["DRAW","DESC","PANT"][Math.floor(Math.random()*3)];this.pick()},settings(){this.state.settings={time:+$("setTime").value,life:+$("setLife").value,cuts:+$("setCuts").value,ledSpeed:+$("setLedSpeed").value,activity:$("setActivity").value==="1",brightness:+$("setBrightness").value};this.save();this.render();this.toast("Mentve.")},async sendSettings(){this.settings();for(const[k,v]of Object.entries({TIME:this.state.settings.time,LIFE:this.state.settings.life,CUTC:this.state.settings.cuts,LEDT:this.state.settings.ledSpeed,ACTV:this.state.settings.activity?1:0,BRGT:this.state.settings.brightness}))await Hardware.send(`SET ${k} ${v}`).catch(e=>this.toast(e.message))},reset(){Game.cancelTimers();this.state.game={status:"READY",time:+this.state.settings.time,life:+this.state.settings.life,target:+this.state.settings.cuts,good:0,bad:0,led:-1,wires:"00000",giver:0,task:"DRAW",word:0,battery:this.state.game.battery,volt:this.state.game.volt};this.activity();this.save()},battery(){
  if(Hardware.mode==="demo"){
    const v=3.20+Math.random()*1.00;
    this.state.game.volt=v;
    this.state.game.battery=this.voltageToPercent(v);
    this.save();
    this.renderBattery();
  }else Hardware.send("BAT").catch(e=>this.toast(e.message))
},
voltageToPercent(v){
  v=Number(v);
  if(v>=4.20)return 100;
  if(v<=3.00)return 0;
  const points=[
    [3.00,0],[3.20,5],[3.40,12],[3.55,20],[3.65,30],
    [3.72,40],[3.78,50],[3.84,60],[3.90,70],[3.98,80],
    [4.08,90],[4.20,100]
  ];
  for(let i=1;i<points.length;i++){
    const [v1,p1]=points[i-1],[v2,p2]=points[i];
    if(v<=v2)return Math.round(p1+(p2-p1)*(v-v1)/(v2-v1));
  }
  return 100;
},adjust(k,d){this.state.game[k]=Math.max(0,this.state.game[k]+d);this.save();this.render()},addTeam(){
  const order=["red","blue","yellow","green"];
  const next=order.find(id=>!this.state.teams.some(t=>t.id===id));
  if(!next)return this.toast("Maximum 4 csapat lehet.");
  const meta=this.teamMeta(next);
  this.state.teams.push({id:next,name:meta.name,players:[]});
  if(!this.state.currentTeam)this.state.currentTeam=next;
  this.save();
  this.render();
},
removePlayer(tid,pid){const t=this.state.teams.find(x=>x.id===tid);if(!t)return;t.players=t.players.filter(p=>p.id!==pid);this.state.game.giver=0;this.save();this.render()},log(t){this.state.logs.unshift(`${new Date().toLocaleTimeString("hu-HU")} ${t}`);this.state.logs=this.state.logs.slice(0,200)},fx(r){$("fx").textContent=r==="WIN"?"🎉 DEFUSED":"💥 BOOM!";$("fx").className=`fx ${r==="WIN"?"win":"boom"}`;r==="WIN"?Sound.win():Sound.boom();setTimeout(()=>$("fx").className="fx",1400)},render(){this.word=WORDS[this.state.game.word]||WORDS[0];this.settingsUI();this.teams();this.live();this.ranking();this.renderBattery();this.words();$("logOutput").textContent=this.state.logs.join("\n")},settingsUI(){const s=this.state.settings;$("setTime").value=s.time;$("setLife").value=s.life;$("setCuts").value=s.cuts;$("setLedSpeed").value=s.ledSpeed;$("setActivity").value=s.activity?1:0;$("setBrightness").value=s.brightness},teams(){$("addTeam").disabled=this.state.teams.length>=4;$("teamEditor").innerHTML=this.state.teams.length?this.state.teams.map(t=>{const m=this.teamMeta(t.id);return `<div class="team-card ${m.className}"><div class="team-head"><div class="team-title">${m.emoji} ${m.name}</div><button data-start="${t.id}" class="${this.state.currentTeam===t.id?"primary":""}">🏁 Kezdő</button><button data-delteam="${t.id}">🗑️</button></div>${t.players.map((p,i)=>`<div class="player-row"><span class="role">${String.fromCharCode(65+i)}</span><input value="${UI.esc(p.name)}" data-player="${t.id}|${p.id}"><button data-delplayer="${t.id}|${p.id}">🗑️</button></div>`).join("")}<button data-add="${t.id}" ${t.players.length>=4?"disabled":""}>➕ Játékos</button></div>`}).join(""):"<p>Még nincs csapat. Nyomd meg a ➕ Csapat gombot.</p>";document.querySelectorAll("[data-start]").forEach(x=>x.onclick=()=>{this.state.currentTeam=x.dataset.start;this.state.game.giver=0;this.activity();this.save();this.render()});document.querySelectorAll("[data-delteam]").forEach(x=>x.onclick=()=>{this.state.teams=this.state.teams.filter(t=>t.id!==x.dataset.delteam);if(this.state.currentTeam===x.dataset.delteam)this.state.currentTeam=this.state.teams[0]?.id||null;this.save();this.render()});document.querySelectorAll("[data-player]").forEach(x=>x.onchange=()=>{const[t,p]=x.dataset.player.split("|");this.state.teams.find(a=>a.id===t).players.find(a=>a.id===p).name=x.value;this.save();this.render()});document.querySelectorAll("[data-delplayer]").forEach(x=>x.onclick=()=>{const[t,p]=x.dataset.delplayer.split("|");this.removePlayer(t,p)});document.querySelectorAll("[data-add]").forEach(x=>x.onclick=()=>this.addPlayer(x.dataset.add))},live(){
  const g=this.state.game;
  const team=this.team();
  $("timer").textContent=UI.fmt(g.time);
  $("gameStatus").textContent=g.status==="GAME"?"▶️ Játék":g.status==="WIN"?"✅ Hatástalanítva":g.status==="BOOM"?"💥 Felrobbant":"⏸️ Készenlét";
  if(!team){
    $("liveTeam").textContent="🏁 Nincs csapat";
    $("giverName").textContent="—";
    $("guesserName").textContent="—";
  }else{
    const m=this.teamMeta(team.id);
    const taskText=g.task==="DRAW"?"rajzol":g.task==="DESC"?"körülír":g.task==="PANT"?"mutogat":"normál bomba";
    $("liveTeam").textContent=`${m.emoji} ${m.name}`;
    $("giverName").textContent=`${m.emoji} ${this.giver()?.name||"—"} ${taskText}`;
    $("guesserName").textContent=`${m.emoji} ${this.guesser()?.name||"—"} találgat`;
    $("taskType").textContent=taskText;
  }
  $("currentWord").textContent=this.word?.word?.toUpperCase?.()||"—";
  $("activityPanel").classList.toggle("hidden",!this.state.settings.activity);
  $("tabooBox").classList.toggle("hidden",!this.state.settings.activity||g.task!=="DESC");
  $("tabooWords").innerHTML=(this.word?.taboo||[]).map(w=>`<span>${UI.esc(w)}</span>`).join("");
  $("goodCuts").textContent=g.good;$("badCuts").textContent=g.bad;$("lifeCount").textContent=g.life;
  $("leds").innerHTML=CONFIG.colors.map((c,i)=>`<span class="led ${c} ${g.led===i?"active":""}"></span>`).join("");
  $("wires").innerHTML=CONFIG.colors.map((c,i)=>`<button class="wire ${c} ${g.wires[i]==="1"?"cut":""}" data-wire="${i}" ${g.wires[i]==="1"?"disabled":""}></button>`).join("");
  document.querySelectorAll("[data-wire]").forEach(b=>b.onclick=()=>Game.cut(this,+b.dataset.wire));
},renderBattery(){
  const g=this.state.game;
  if(Number.isFinite(+g.volt))g.battery=this.voltageToPercent(+g.volt);
  $("batteryPercent").textContent=`${g.battery}%`;
  $("batteryVoltage").textContent=`${(+g.volt).toFixed(2)} V`;
  $("batteryFill").style.width=`${g.battery}%`;
  $("batteryFill").style.background=g.battery<20?"#ef4444":g.battery<40?"#f59e0b":"#22c55e";
},ranking(){const ts=(this.state.teams||[]).map(t=>{const c=t.players.reduce((s,p)=>s+(p.cuts||0),0),b=t.players.reduce((s,p)=>s+(p.booms||0),0);return{name:t.name,n:t.players.length,c,b,score:c-b*t.players.length}}).sort((a,b)=>b.score-a.score);$("teamRanking").innerHTML=ts.map((t,i)=>{const team=this.state.teams.find(x=>x.name===t.name),m=this.teamMeta(team?.id);return `<div class="rank-row"><div><strong>#${i+1} ${m.emoji} ${UI.esc(m.name)}</strong><small>${t.n} fő • ${t.c} vágás • ${t.b} robbanás</small></div><b>${t.score}</b></div>`}).join("");const ps=this.state.teams.flatMap(t=>t.players.map(p=>({...p,team:t.name}))).sort((a,b)=>(b.cuts||0)-(a.cuts||0));$("playerRanking").innerHTML=ps.map((p,i)=>`<div class="rank-row"><div><strong>#${i+1} ${UI.esc(p.name)}</strong><small>${UI.esc(p.team)} • ${p.booms||0} robbanás</small></div><b>${p.cuts||0}</b></div>`).join("")},words(){
  $("wordCount").textContent=`${WORDS.length} szó betöltve.`;
  $("wordTableBody").innerHTML=WORDS.map((w,i)=>`<tr><td>${i+1}</td><td>${UI.esc(w.word)}</td><td><div class="taboo-list">${(Array.isArray(w.taboo)?w.taboo:[]).map(t=>`<span>${UI.esc(t)}</span>`).join("")}</div></td></tr>`).join("");
},export(){const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([JSON.stringify(WORDS,null,2)],{type:"application/json"}));a.download="words.json";a.click()},async import(e){try{const x=JSON.parse(await e.target.files[0].text());if(!Array.isArray(x))throw 0;window.WORDS=x;this.used=[];this.pick();this.render();this.toast("Importálva.")}catch{this.toast("Hibás JSON.")}}};window.addEventListener("DOMContentLoaded",()=>APP.init());