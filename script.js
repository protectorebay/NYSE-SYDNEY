// SYDNEY Session Timer v2.2
// Holiday engine intentionally omitted.
// Session:
// Pre Market:    07:00 - 10:00
// Regular:       10:00 - 16:00
// Closing Phase: 16:00 - 16:10
// Time Zone: Australia/Sydney

const timer = document.getElementById("sessionTimer");
const alertSound = new Audio("alert.mp3");

let alertPlayed = false;
let currentState = "";

function formatTime(ms){
    const total=Math.max(0,Math.floor(ms/1000));
    const h=Math.floor(total/3600);
    const m=Math.floor((total%3600)/60);
    const s=total%60;
    return String(h).padStart(2,"0")+":"+
           String(m).padStart(2,"0")+":"+
           String(s).padStart(2,"0");
}

function playAlertOnce(){
    if(alertPlayed) return;
    alertPlayed=true;
    alertSound.currentTime=0;
    alertSound.play().catch(()=>{});
}

function render(statusClass,statusText,phaseClass,phaseText,action,left,pulse){
    const pulseClass=pulse?" pulse":"";
    let html="SYDNEY SESSION • ";
    html+='<span class="'+statusClass+pulseClass+'">'+statusText+"</span>";
    if(phaseText){
        html+=' <span class="'+phaseClass+pulseClass+'">('+phaseText+")</span>";
    }
    html+=" • "+action+" "+formatTime(left);
    timer.innerHTML=html;
}

function stateChanged(newState){
    if(currentState!==newState){
        currentState=newState;
        alertPlayed=false;
    }
}

function updateTimer(){

    const now=new Date();

    const sydney=new Date(now.toLocaleString("en-US",{
        timeZone:"Australia/Sydney"
    }));

    const day=sydney.getDay();

    const open=new Date(sydney);
    open.setHours(7,0,0,0);

    const preEnd=new Date(sydney);
    preEnd.setHours(10,0,0,0);

    const regularEnd=new Date(sydney);
    regularEnd.setHours(16,0,0,0);

    const close=new Date(sydney);
    close.setHours(16,10,0,0);

    if(day===0 || day===6){
        let next=new Date(open);
        if(day===6) next.setDate(next.getDate()+2);
        else next.setDate(next.getDate()+1);

        const left=next-sydney;
        stateChanged("weekend");
        if(left<=60000) playAlertOnce();
        render("weekend","WEEKEND","","","OPENS IN",left,left<=60000);
        return;
    }

    if(sydney<open || sydney>=close){
        let next=new Date(open);
        if(sydney>=close) next.setDate(next.getDate()+1);

        const left=next-sydney;
        stateChanged("closed");
        if(left<=60000) playAlertOnce();
        render("closed","CLOSED","","","OPENS IN",left,left<=60000);
        return;
    }

    if(sydney<preEnd){
        const left=preEnd-sydney;
        stateChanged("premarket");
        if(left<=60000) playAlertOnce();
        render("open","OPEN","premarket","PRE MARKET","REGULAR MARKET IN",left,left<=60000);
        return;
    }

    if(sydney<regularEnd){
        const left=regularEnd-sydney;
        stateChanged("regular");
        if(left<=60000) playAlertOnce();
        render("open","OPEN","","","CLOSING PHASE IN",left,left<=60000);
        return;
    }

    const left=close-sydney;
    stateChanged("closing");
    if(left<=60000) playAlertOnce();

    render("open","OPEN","postmarket","CLOSING PHASE","CLOSES IN",left,left<=60000);
}

updateTimer();
setInterval(updateTimer,1000);
