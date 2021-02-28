document.addEventListener('DOMContentLoaded', function () {
  var config = STREAM_CALENDAR_CONFIG; // load global variable set by config.js

  document.title = config.documentTitle ? config.documentTitle : 'Stream Calendar';

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
  let timeVar = {
    hour: '2-digit',
    minute: '2-digit',
    meridiem: false,
    hour12: false
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
  
  let eventObjs = [];
  for (var i = 0; i < calendarSets.length; i++){
    let setName = calendarSets[i].uid;
    let setEventObjs = calendarSets[i].eventObjs;
    if (isCalendarShown(setName)){
      eventObjs.push(...setEventObjs);
    }
  }

  localStorage.setItem("loadonce", "false");
  var timeZoneSelectorEl = document.getElementById('time-zone-selector');
  var loadingEl = document.getElementById('loading');
  var calendarEl = document.getElementById('calendar');
  var calendar = new FullCalendar.Calendar(calendarEl, {
    themeSystem: "bootstrap",
    contentHeight: "auto",
    initialView: 'listWeek',
    views:
    {
      listWeek:
      {
        duration: { days: config.daysToShow }
      }
    },
    googleCalendarApiKey: config.googleCalendarApiKey, //gcal api here
    // timeZone: initialTimeZone,
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'listWeek,timeGridWeek' //listWeek,timeGridWeek,timeGridDay,
    },
    navLinks: true, // can click day/week names to navigate views
    editable: false,
    selectable: false,
    nowIndicator: true,
    eventTimeFormat: timeVar,
    expandRows: true,
    //lazyFetching: true,
    slotDuration: "00:20:00",
    dayMaxEvents: true,
    eventSources: [
      ...eventObjs
    ],
    eventDidMount: function (info, element) {
      //console.log(info);
      //i got stuff todo here. chotto matte
      if (localStorage.getItem("hour12") == "flag") {
        //eventTimeFormat: 
        //console.log(calendar.getOption('eventTimeFormat'))
        calendar.setOption('eventTimeFormat', { hour: 'numeric', minute: '2-digit' })
      }
      if (info.view.type == "listWeek") {
        var imgCell = info.el.insertCell(0);
        var ic = document.createElement('img');
        //console.log(info);
        ic.src = info.event.source.internalEventSource.extendedProps.extendedProps.img;
        imgCell.appendChild(ic);
        var button = document.createElement("button");
        // button.innerText = "Click!"

        var button2 = document.createElement("button");
        button.setAttribute("class", "btn btn-sm");
        var url = info.event._def.extendedProps.location;

        var formtoggle = false;
        if (info.event._def.extendedProps.description !== null && typeof info.event._def.extendedProps.description !== 'undefined') {
          formtoggle = true;
          var form = info.event._def.extendedProps.description;
          var button2 = document.createElement("button");
          button2.setAttribute("class", "btn btn-sm btn-dark");
          button2.innerHTML = `<i class="fa fa-pencil-square" aria-hidden="true"></i>`;
        }

        if (url && url.includes("twitch.tv")) {
          button.classList.add("twitch")
          button.innerHTML = `<i class="fa fa-twitch" aria-hidden="true"></i>`;
        }
        else {
          button.classList.add("btn-danger")
          button.innerHTML = `<i class="fa fa-youtube-play" aria-hidden="true"></i>`;
        }

        var tstr = Date.parse(info.event.startStr);
        var timeTo = tstr - Date.now();
        var eta = info.el.insertCell(4);
        var linkCell = info.el.insertCell(5);
        linkCell.appendChild(button);
        if (formtoggle) {
          linkCell.appendChild(button2);
        }
        if (timeTo > 0) {
          var hours = (timeTo / (1000 * 60 * 60)).toFixed(1);
          var h = parseInt(hours)
          var m = ((hours * 60) % 60).toFixed(0);
          var etaText = document.createTextNode(h + "h" + m + "m to go!");
          eta.appendChild(etaText);
        }
        else {
          var btext = document.createTextNode("missed it!");
          eta.appendChild(btext);
        }
        button2.onclick = function () {
          window.open(info.event._def.extendedProps.description)
        }
        button.onclick = function () {
          if (info.event._def.extendedProps.location === null || typeof info.event._def.extendedProps.location === 'undefined') {
            window.open(info.event.source.internalEventSource.extendedProps.extendedProps.url);
          }
          else {
            window.open(info.event._def.extendedProps.location); //location has link for the stream. mayybe IFTTT or volunteers
          }
        };
      }
    },
    eventClick: function (info) {
      //	console.log(info);
      if (info.view.type == "listWeek") {
        info.jsEvent.preventDefault(); //preventing opening Google Calendar
      }
      if (info.view.type == "timeGridWeek") {
        info.el.style.borderColor = 'red';
        if (info.event._def.extendedProps.location === null || typeof info.event._def.extendedProps.location === 'undefined') {
          window.open(info.event.source.internalEventSource.extendedProps.extendedProps.url);
        }
        else {
          window.open(info.event._def.extendedProps.location); //location has link for the stream. mayybe IFTTT or volunteers
        }
      }
    },
    viewWillUnmount: function () {
      localStorage.setItem("loadonce", "false");
    },
    dayHeaderDidMount: function (arg) { //i am terrible fml
      if (arg.view.type === 'listWeek' && localStorage.getItem("loadonce") == "false") {
        localStorage.setItem("loadonce", "true");
        var tableHeader = $(".fc-list-day");
        var defaultColumns = 3; //default, including the reference dot
        var extraColumnHeaders = ['Topic', 'ETA(local)', 'Stream'];
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
      localStorage.setItem("loadonce", "false");
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

  const reloadCalendar = function(){
    window.location.reload(); // TODO: replace with just calendar reload
  };

  const renderConfigButtons = function(){
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
        toggleButtonsArea.appendChild( button );
  
        $("#" + buttonId).click(function () {
          if (isCalendarShown(setName)) {
            setCalendarShown(setName, false);
            reloadCalendar();
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
    reloadCalendar();
  });

  $("#clrs").click(function () {
    localStorage.removeItem("hour12");
    localStorage.removeItem("calendarsHidden");
    renderConfigButtons();
    reloadCalendar();
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
  
});
