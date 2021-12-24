const STREAM_CALENDAR_CONFIG = {
  "documentTitle": "Stream Calendar",
  "siteIconUrl": "image-url-here.png",
  "alertHTML": "",
  "footerHTML": "Made with ♥ by <a href=\"https://ko-fi.com/sant268\">Sant268</a>",
  //footer fulfills the attribution, but can be removed. 
  "daysToShow": 7,
  "useAlternateButtonStyle": false,
  "enableGoogleTranslate": true,
  "googleAnalyticsId": "",
  "googleCalendarApiKey": "",
  "loadingImages": [
    {
      "url": "image-url-here.png",
      "width": "0px",
      "height": "0px"
    }
  ],
  "calendarSets": [
    {
      "uid": "default",
      "displayName": "Default Set",
      "hideToggleButton": false,
      "eventObjs": [
        {
          "googleCalendarId": "your-calendar-id@group.calendar.google.com",
          "classNames": "firstcalendar",
          "color": "sienna",
          "extendedProps": {
            "id": "firstcalendar",
            "icon": "📅",
            "img": "image-url-here.png",
            "url": "https://www.youtube.com/channel/your-channel-id"
          },
          "textColor": "white"
        }
      ]
    }
  ]
};
