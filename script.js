// NYSE Session Timer v2.0
// Holiday engine intentionally omitted.
// Session: 08:00-17:00 America/New_York

const SESSION_OPEN_HOUR = 8;
const SESSION_CLOSE_HOUR = 17;

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

    let html='NEW YORK SESSION • ';

    html+='<span class="'+statusClass+pulseClass+'">'+statusText+'</span>';

    if(phaseText){
        html+=' <span class="'+phaseClass+pulseClass+'">('+phaseText+')</span>';
    }

    html+=' • '+action+' '+formatTime(left);

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

    const ny=new Date(now.toLocaleString("en-US",{
        timeZone:"America/New_York"
    }));

    const day=ny.getDay();

    const open=new Date(ny);
    open.setHours(8,0,0,0);

    const preEnd=new Date(ny);
    preEnd.setHours(9,30,0,0);

    const regularEnd=new Date(ny);
    regularEnd.setHours(16,0,0,0);

    const close=new Date(ny);
    close.setHours(17,0,0,0);

    // WEEKEND
    if(day===6 || day===0){

        let next=new Date(open);

        if(day===6) next.setDate(next.getDate()+2);
        else next.setDate(next.getDate()+1);

        const left=next-ny;

        stateChanged("weekend");

        if(left<=60000) playAlertOnce();

        render(
            "weekend",
            "WEEKEND",
            "",
            "",
            "OPENS IN",
            left,
            left<=60000
        );

        return;
    }

    // CLOSED
    if(ny<open || ny>=close){

        let next=new Date(open);

        if(ny>=close){
            next.setDate(next.getDate()+1);
        }

        const left=next-ny;

        stateChanged("closed");

        if(left<=60000) playAlertOnce();

        render(
            "closed",
            "CLOSED",
            "",
            "",
            "OPENS IN",
            left,
            left<=60000
        );

        return;
    }

    // PRE MARKET
    if(ny<preEnd){

        const left=preEnd-ny;

        stateChanged("premarket");

        if(left<=60000) playAlertOnce();

        render(
            "open",
            "OPEN",
            "premarket",
            "PRE MARKET",
            "REGULAR MARKET IN",
            left,
            left<=60000
        );

        return;
    }

    // REGULAR
    if(ny<regularEnd){

        const left=regularEnd-ny;

        stateChanged("regular");

        if(left<=60000) playAlertOnce();

        render(
            "open",
            "OPEN",
            "",
            "",
            "POST MARKET IN",
            left,
            left<=60000
        );

        return;
    }

    // POST MARKET

    const left=close-ny;

    stateChanged("postmarket");

    if(left<=60000) playAlertOnce();

    render(
        "open",
        "OPEN",
        "postmarket",
        "POST MARKET",
        "CLOSES IN",
        left,
        left<=60000
    );

}

updateTimer();
setInterval(updateTimer,1000);
