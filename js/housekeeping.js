var historyWrapper;
var commandWrapper;
var commandInputWrapper;

$(window).ready(()=>{
    historyWrapper = $('.history-wrapper')[0];
    commandWrapper = $('.command-wrapper')[0];
    commandInputWrapper = $('.command-input-wrapper')[0]; 
    setHistoryMaxHeight();
});

$(window).resize(()=>{
    setHistoryMaxHeight();
});

function setHistoryMaxHeight(){
    var height = commandWrapper.clientHeight - commandInputWrapper.clientHeight;
    $(historyWrapper).css('max-height', height+"px");
}