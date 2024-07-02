document.addEventListener('DOMContentLoaded', function () {
  var config = STREAM_CALENDAR_CONFIG; // load global variable set by config.js

  document.title = config.documentTitle ? config.documentTitle : 'Stream Calendar';
  
  if ( config.siteIconUrl ) {
    let e = document.createElement( 'link' );
    e.setAttribute( 'rel', 'icon' );
    e.setAttribute( 'href', config.siteIconUrl );
    document.head.appendChild( e );
  }

  if ( config.alertHTML ) {
    let alert_content = document.getElementById('alert-content');
    alert_content.innerHTML = config.alertHTML;
  }
  else{
    let alert = document.getElementById('alert');
    alert.style.display = 'none';
  }

  if ( config.footerHTML ) {
    let footer_content = document.getElementById('footer-content');
    footer_content.innerHTML = config.footerHTML;
  }
  else {
    let footer = document.getElementById('footer');
    footer.style.display = 'none';
  }

  let calendarSets = config.calendarSets;

  // Dynamically load global site tag (gtag.js) - Google Analytics
  if ( config.googleAnalyticsId ){
    let s = document.createElement('script');
    s.setAttribute('src', 'https://www.googletagmanager.com/gtag/js?id=' + config.googleAnalyticsId );
    s.async = true;
    document.head.appendChild(s);

    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { 
      dataLayer.push(arguments); 
    };
    window.gtag('js', new Date());
    window.gtag('config', config.googleAnalyticsId);
  }

  // Dynamically load Google Translate
  if ( config.enableGoogleTranslate === true ){
    window.googleTranslateElementInit = function() {
      new google.translate.TranslateElement({
        pageLanguage: 'en',
        includedLanguages: 'de,nl,es,it,fr,ja,zh-TW,zh-CN',
        layout: google.translate.TranslateElement.InlineLayout.SIMPLE
      }, 'google_translate_element');
    };

    let s = document.createElement('script');
    s.setAttribute('src', 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit' );
    document.head.appendChild(s);
  }

  // var initialTimeZone = 'UTC'; //local not working
  const getEventTimeFormat = function() {
    let is12Hour = (localStorage.getItem('hour12') === 'flag');
    return {
      hour: is12Hour ? 'numeric' : '2-digit',
      minute: '2-digit',
      meridiem: is12Hour,
      hour12: is12Hour
    };
  };

  const getSlotLabelFormat = function() {
    let is12Hour = (localStorage.getItem('hour12') === 'flag');
    return {
      hour: is12Hour ? 'numeric' : '2-digit',
      minute: '2-digit',
      meridiem: is12Hour ? 'short' : false,
      hour12: is12Hour,
      omitZeroMinute: is12Hour
    };
  };

  const getRandomIntInclusive = function(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1) + min);
  }
  
  const isCalendarShown = function ( calName ){
    let calendarsHiddenStr = localStorage.getItem("calendarsHidden");
    if (!calendarsHiddenStr){
      return true;
    } 
    let calendarsHidden = JSON.parse( calendarsHiddenStr );
    return ( calendarsHidden[ calName ] ? false : true );
  };

  const setCalendarShown = function ( calName, newVal ){
    let calendarsHiddenStr = localStorage.getItem("calendarsHidden");
    let calendarsHidden = ( calendarsHiddenStr ?  JSON.parse( calendarsHiddenStr ) : {} );
    if ( newVal === false ){
      calendarsHidden[ calName ] = true;
    }
    else{
      delete calendarsHidden[ calName ];
    }
    localStorage.setItem( "calendarsHidden", JSON.stringify( calendarsHidden ) );
  };
  
  const getEventSources = function () {
    let eventObjs = [];
    for (var i = 0; i < calendarSets.length; i++){
      let setName = calendarSets[i].uid;
      let alwaysShown = calendarSets[i].hideToggleButton ? true : false;
      let setEventObjs = calendarSets[i].eventObjs;
      if (alwaysShown || isCalendarShown(setName)){
        eventObjs.push(...setEventObjs);
      }
    }
    return eventObjs;
  };

  const lastView = localStorage.getItem( 'lastView' );

  var timeZoneSelectorEl = document.getElementById('time-zone-selector');
  var loadingEl = document.getElementById('loading');
  var calendarEl = document.getElementById('calendar');
  var calendar = new FullCalendar.Calendar(calendarEl, {
    displayEventEnd: false,
    themeSystem: "bootstrap",
    contentHeight: "auto",
    firstDay : 1,
    initialView: lastView ? lastView : 'listWeek',
    views:
    {
      listWeek:
      {
        duration: { days: config.daysToShow }
      }
    },
    googleCalendarApiKey: config.googleCalendarApiKey, //gcal api here
    // timeZone: initialTimeZone,
    customButtons: {
      reload: {
        text: 'Refresh Events',
        bootstrapFontAwesome: 'fa-refresh',
        click: function() {
          reloadCalendarEvents()
        }
      }
    },
    headerToolbar: {
      left: 'prev,next today reload',
      center: 'title',
      right: 'listWeek,timeGridWeek,timeGridDay' //listWeek,timeGridWeek,timeGridDay,
    },
    navLinks: true, // can click day/week names to navigate views
    editable: false,
    selectable: false,
    nowIndicator: true,
    eventTimeFormat: getEventTimeFormat(),
    slotLabelFormat: getSlotLabelFormat(),
    expandRows: true,
    //lazyFetching: true,
    slotDuration: "00:30:00",
    // events should not show up on two different days unless it goes at least 9 hours into the second day
    nextDayThreshold: '09:00:00',  
    dayMaxEvents: true,
    eventSources: getEventSources(),
    eventDidMount: function (info) {
      //console.log(info);
      //i got stuff todo here. chotto matte
      if (info.view.type == "listWeek") {
        var imgCell = info.el.insertCell(0);
        var ic = document.createElement('img');
        //console.log(info);
        ic.src = info.event.source.internalEventSource.extendedProps.extendedProps.img;
        imgCell.appendChild(ic);
        var button = document.createElement("button");
        button.setAttribute("class", "btn btn-sm");

        var url = info.event._def.extendedProps.location; //location has link for the stream. mayybe IFTTT or volunteers
        if ( !url ) {
          // If no URL for the event, fall back to the calendar-level default URL
          url = info.event.source.internalEventSource.extendedProps.extendedProps.url; 
        }
        var formUrl = info.event._def.extendedProps.description;

        if( url && url.indexOf('//') < 0 ) {
          url = 'https://' + url;
        }

        if( formUrl && formUrl.indexOf('//') < 0 ) {
          formUrl = 'https://' + formUrl;
        }

        /* if (url) {
          button.title = url;
        } */

        if (url && url.includes("twitch.tv")) {
          button.classList.add("twitch");
          button.innerHTML = `<i class="fa fa-twitch" aria-hidden="true"></i>`;
        }
        else if (url && ( url.includes("twitter.com") || url.includes("/x.com") )) {
          button.classList.add("twitter");
          button.innerHTML = `<i class="fa fa-twitter" aria-hidden="true"></i>`;
        }
        else if (url && ( url.includes("youtube.com") || url.includes("youtu.be") )) {
          button.classList.add("btn-danger");
          button.innerHTML = `<i class="fa fa-youtube-play" aria-hidden="true"></i>`;
        }
        else {
          button.classList.add("btn-secondary");
          button.innerHTML = `<i class="fa fa-external-link" aria-hidden="true"></i>`;
        }

        var tstr = Date.parse(info.event.startStr);
        var timeTo = tstr - Date.now();
        var eta = info.el.insertCell(4);
        var linkCell = info.el.insertCell(5);
        
        // Add button for link
        if ( url ) {
          linkCell.appendChild(button);
          button.onclick = function () {
            window.open( url ); 
          };
        }

        if ( url && formUrl ) {
          linkCell.appendChild( document.createTextNode(' ') );
        }
        
        // Add second button for form
        if ( formUrl ) {
          var button2 = document.createElement("button");
          button2.setAttribute("class", "btn btn-sm btn-dark");
          button2.innerHTML = `<i class="fa fa-pencil-square" aria-hidden="true"></i>`;
          // button2.title = formUrl;
          linkCell.appendChild( button2 );
          button2.onclick = function () {
            window.open( formUrl );
          };
        }

        if (timeTo > 0) {
          var hours = (timeTo / (1000 * 60 * 60)).toFixed(1);
          var h = parseInt(hours)
          var m = ((hours * 60) % 60).toFixed(0);
          var etaText = document.createTextNode(h + "h" + m + "m to go!");
          eta.appendChild(etaText);
        }
        else if (timeTo > -3600000){
          var btext = document.createTextNode("Started in the last hour");
          eta.appendChild(btext);
        }
        else if(timeTo > -7200000)
        {
          var btext = document.createTextNode("Started ~2 hours ago");
          eta.appendChild(btext);
        }
        else {
          var btext = document.createTextNode("Missed it!");
          eta.appendChild(btext);
        }
      }
    },
    eventContent : function (event) {
      let flag = /\p{Extended_Pictographic}/u.test(event.event._def.title);
      if(!flag) {
        event.event._def.title = event.event.source.internalEventSource.extendedProps.extendedProps.icon + event.event._def.title;
      }
    },
    eventClick: function (info) {
      //	console.log(info);
      if (info.view.type == "listWeek") {
        info.jsEvent.preventDefault(); //preventing opening Google Calendar
        //console.log(info.el);
      }
      if (info.view.type == "timeGridWeek" || info.view.type === "timeGridDay") {
        info.jsEvent.preventDefault();
        info.el.style.borderColor = 'black';
        var url = info.event._def.extendedProps.location; //location has link for the stream. mayybe IFTTT or volunteers
        if ( !url ) {
          // If no URL for the event, fall back to the calendar-level default URL
          url = info.event.source.internalEventSource.extendedProps.extendedProps.url; 
        }
        if ( url ) {
          if( url.indexOf('//') < 0 ) {
            url = 'https://' + url;
          } 
          window.open( url );
        }
      }
    },
    datesSet: function ( dateInfo ) {
      localStorage.setItem( "lastView", dateInfo.view.type );
    },
    viewDidMount: function ( arg ) {
      localStorage.setItem( "lastView", arg.view.type );
    },
    viewWillUnmount: function () {

    },
    dayHeaderDidMount: function (arg) { //i am terrible fml
      if (arg.view.type === 'listWeek' ) {
        var tableHeader = arg.el;
        var defaultColumns = 3; //default, including the reference dot
        var extraColumnHeaders = ['Topic', 'ETA (local)', 'Stream'];
        //columns I need
        var maxCol = defaultColumns + extraColumnHeaders.length;
        //total columns
        for (var i = 0; i < maxCol - defaultColumns; i++) {
          var columnHeaderElement = document.createElement('th');
          columnHeaderElement.innerHTML = '<div class="fc-list-day-cushion fc-cell-shaded"><a class="fc-list-day-text">' +
            extraColumnHeaders[i] + '</a></div>';
          tableHeader.append(columnHeaderElement);
        }
      }
    },
    dayHeaderWillUnmount: function (arg) {
      
    },
    loading: function (bool) {
      if (bool && config.loadingImages && config.loadingImages.length){
        let imageIdx = getRandomIntInclusive(0, config.loadingImages.length - 1);
        loadingEl.firstChild.src = config.loadingImages[imageIdx].url;
        loadingEl.childNodes[0].setAttribute("width", config.loadingImages[imageIdx].width);
        loadingEl.childNodes[0].setAttribute("height",config.loadingImages[imageIdx].height);
        loadingEl.style.display = 'inline'; // show
        //console.log(loadingEl)
      }
      else{
        loadingEl.style.display = 'none'; // hide
      }
    },
  });

  const reloadCalendarEvents = function() {
    // Clear all existing event sources
    let oldEventSources = calendar.getEventSources();
    for (let i=0; i<oldEventSources.length; i++){
      oldEventSources[i].remove();
    }

    // Regenerate the list of event sources and re-add them
    let newEventSources = getEventSources();
    for (let i=0; i<newEventSources.length; i++){
      calendar.addEventSource(newEventSources[i]);
    }
  };

  const reloadCalendarTimeFormat = function () {
    // Regenerate the eventTimeFormat and slotLabelFormat options
    calendar.setOption('eventTimeFormat', getEventTimeFormat());
    calendar.setOption('slotLabelFormat', getSlotLabelFormat());
  };

  const renderConfigButtons = function() {
    // Set name for 12/24 hr button
    if (localStorage.getItem("hour12") == "flag") {
      $("#12hr").html("Switch to 24hr");
    } else {
      $("#12hr").html("Switch to 12hr");
    }

    // Dynamically generate buttons to hide/show each calendar set
    let toggleButtonsArea = document.getElementById('calendar-toggle-buttons');
    toggleButtonsArea.innerHTML = '';
    if (calendarSets.length > 1) { // only show toggle buttons if at least 2 calendar sets
      for (let i=0; i<calendarSets.length; i++){
        if (calendarSets[i].hideToggleButton) continue; // skip this button if it is marked as hidden

        let setName = calendarSets[i].uid;
        let displayName = calendarSets[i].displayName;
        let setEventObjs = calendarSets[i].eventObjs;
        let buttonId = "toggle-calendar-" + setName;
        let buttonText;
        if (isCalendarShown(setName)){
          buttonText = "Hide " + displayName;
        }
        else{
          buttonText = "Show " + displayName;
        }
        let button = document.createElement("button");
        button.setAttribute("type", "button");
        button.setAttribute("class", "btn btn-info");
        button.setAttribute("id", buttonId );
        button.innerHTML = buttonText;
        toggleButtonsArea.appendChild( document.createTextNode(' ') );
        toggleButtonsArea.appendChild( button );
  
        $("#" + buttonId).click(function () {
          if (isCalendarShown(setName)) {
            setCalendarShown(setName, false);
            reloadCalendarEvents();
          }
          else{
            setCalendarShown(setName, true);
            if (setEventObjs && setEventObjs.length){
              for (let j=0; j<setEventObjs.length; j++){
                calendar.addEventSource(setEventObjs[j]);
              }
            }
          }
          renderConfigButtons();
        });
      }
    }
  };

  $("#12hr").click(function () {
    if (localStorage.getItem("hour12") == "flag") {
      localStorage.removeItem("hour12");
    }
    else {
      localStorage.setItem("hour12", "flag");
    }
    renderConfigButtons();
    reloadCalendarTimeFormat();
  });

  $("#clrs").click(function () {
    localStorage.removeItem("hour12");
    localStorage.removeItem("calendarsHidden");
    renderConfigButtons();
    reloadCalendarEvents();
    reloadCalendarTimeFormat();
  });

  renderConfigButtons();
  calendar.render();

  // load the list of available timezones, build the <select> options
  FullCalendar.requestJson('GET', './timezones.json', {}, function (timeZones) {
    timeZones.forEach(function (timeZone) {
      var optionEl;
      if (timeZone !== 'UTC') { // UTC is already in the list
        optionEl = document.createElement('option');
        optionEl.value = timeZone;
        optionEl.innerText = timeZone;
        timeZoneSelectorEl.appendChild(optionEl);
      }
    });
  }, function () {
    // failure
    console.error("timezone-fail");
    //callback to console
  });

  // when the timezone selector changes, dynamically change the calendar option
  timeZoneSelectorEl.addEventListener('change', function () {
    calendar.setOption('timeZone', this.value);
  });

  // override style of btn-primary based on config
  if (config.useAlternateButtonStyle === true){
    var sheet = document.createElement('style');
    sheet.innerHTML = `.btn-primary {
      background-color: #648181 !important; 
      border-color: #7DB7AB !important;
    }`;
    document.body.appendChild(sheet);
  }

  if (window.matchMedia("(orientation: portrait)").matches) {
    calendar.setOption('slotDuration', "00:15:00");
  }

  // Periodically reload the calendar
  const CALENDAR_RELOAD_MINUTES = 5;
  setInterval( function () {
    reloadCalendarEvents();
  }, 60000 * CALENDAR_RELOAD_MINUTES );
});
