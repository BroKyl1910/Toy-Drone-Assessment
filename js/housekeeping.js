$(window).ready(()=>{
    var historyWrapper = $('.history-wrapper')[0];
    var height = historyWrapper.clientHeight;
    $(historyWrapper).css('max-height', height+"px");
});