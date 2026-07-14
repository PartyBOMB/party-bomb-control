window.Game={
  timer:null,
  ledTimer:null,
  transitionTimer:null,

  random(wires){
    const available=[0,1,2,3,4].filter(i=>wires[i]==="0");
    return available.length?available[Math.floor(Math.random()*available.length)]:-1;
  },

  cancelTimers(){
    clearInterval(this.timer);
    clearInterval(this.ledTimer);
    clearTimeout(this.transitionTimer);
  },

  start(app){
    this.cancelTimers();

    if(!app.team() || app.team().players.length<2){
      return app.toast("A kezdő csapatban legalább 2 játékos kell.");
    }

    const settings=app.state.settings;
    const game=app.state.game;

    Object.assign(game,{
      status:"GAME",
      time:+settings.time,
      life:+settings.life,
      target:+settings.cuts,
      good:0,
      bad:0,
      wires:"00000",
      led:this.random("00000"),
      giver:0
    });

    app.activity();
    app.log(`Játék indult: ${app.team().name}.`);
    app.save();
    app.render();

    this.timer=setInterval(()=>{
      if(game.status!=="GAME")return;
      game.time--;

      if(game.time<=0){
        this.finish(app,"BOOM");
        return;
      }

      app.live();
    },1000);

    this.ledTimer=setInterval(()=>{
      if(game.status!=="GAME")return;
      game.led=this.random(game.wires);
      app.live();
    },Math.max(400,2200-(+settings.ledSpeed*300)));
  },

  cut(app,index){
    const game=app.state.game;

    if(game.status!=="GAME"){
      return app.toast("Előbb indítsd el a játékot.");
    }

    if(game.wires[index]==="1"){
      return app.toast("Ezt a vezetéket már elvágtad.");
    }

    if(Hardware.mode!=="demo"){
      Hardware.send(`WIRE ${index}`).catch(error=>app.toast(error.message));
      return;
    }

    game.wires=game.wires.slice(0,index)+"1"+game.wires.slice(index+1);

    if(index===game.led){
      game.good++;
      const giver=app.giver();
      if(giver)giver.cuts=(giver.cuts||0)+1;
      Sound.good();
      app.log(`Jó vágás: ${index+1}. vezeték.`);

      if(game.good>=game.target){
        this.finish(app,"WIN");
        return;
      }

      game.giver=(game.giver+1)%app.team().players.length;
      app.activity();
    }else{
      game.bad++;
      game.life--;
      Sound.bad();
      app.log(`Rossz vágás: ${index+1}. vezeték.`);

      if(game.life<=0){
        this.finish(app,"BOOM");
        return;
      }
    }

    game.led=this.random(game.wires);
    app.save();
    app.render();
  },

  finish(app,result){
    clearInterval(this.timer);
    clearInterval(this.ledTimer);
    clearTimeout(this.transitionTimer);

    const game=app.state.game;
    const finishedTeam=app.team();

    game.status=result;
    game.led=-1;

    if(result==="BOOM"){
      const giver=app.giver();
      if(giver)giver.booms=(giver.booms||0)+1;
      app.log(`${finishedTeam?.name||"Csapat"} felrobbant.`);
    }else{
      app.log(`${finishedTeam?.name||"Csapat"} hatástalanította a bombát.`);
    }

    app.fx(result);
    app.save();
    app.render();

    // Activity ON esetén automatikusan a következő csapat kap friss bombát.
    // A következő forduló nem indul el magától: az Indítás gombot kell megnyomni.
    if(app.state.settings.activity && app.state.teams.length>0){
      this.transitionTimer=setTimeout(()=>{
        this.next(app,true);
      },2200);
    }
  },

  next(app,automatic=false){
    this.cancelTimers();

    if(!app.state.teams.length){
      return app.toast("Nincs létrehozott csapat.");
    }

    const currentIndex=app.state.teams.findIndex(team=>team.id===app.state.currentTeam);
    const nextIndex=currentIndex<0?0:(currentIndex+1)%app.state.teams.length;
    app.state.currentTeam=app.state.teams[nextIndex].id;

    // Friss bomba, készenléti állapotban.
    app.reset();

    app.log(`${automatic?"Automatikus":"Manuális"} csapatváltás: ${app.team().name}.`);
    app.save();
    app.render();

    if(automatic){
      app.toast(`${app.team().name} következik. A bomba indítható.`);
    }
  }
};