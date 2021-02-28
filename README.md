# streamerCalendar
Public Port of HoloCal, in a modifiable config for every streamer

This is in a super-beta stage where I am reaching out to VTubers and taking inputs from them to modify this template.
_I advise not to use it in its current form_, as things are still being finalised and edited, along with some performance changes.

If you want to test it out, you can hit me up on Discord: @Sant268#1878

peace <3 (surely I need to make this ReadMe more, **professional** later on) 

In it's current scuffed form, it uses:
- Fullcalendar (not premium) mainly for it's basic organization of the calendar, and Timezone support
- Bootswatch Theme for _Dark Mode_
- A **lot** of JQuery Modification to inject content by manual params
- Google Calendar as a source for Data (Events) Entry

--------------------------------------------------------------------------------------------------------------------
## Manual Config steps

**How to set this whole Project up on your own:**
Step 1: Grab an API Key for Google Calendar API, and the Calendar Keys
For this step, I'll recommend following the tutorial [here](https://fullcalendar.io/docs/google-calendar), in the FullCalendar Docs. The API Key you receive should be pasted in the `googleCalendarApiKey` field provided in config.js

The above link also mentions how you can set up the Google Calendar yourself, which will come in handy for:

Step 2: Adding the Calendars to config.js
The `calendarSets` takes in "objects" as an input, which can be set up in this fashion:

    
    {
      "uid": "unique name,say the streamer name",
      "displayName": "For internal purposes only",
      "eventObjs": [
        {
          "googleCalendarId": "<the google calendar key (NOT API) from Step 1>",
          "classNames": "identifier for which type of stream it is",
          "color": "some HTML5 color here, for weekView",
          "extendedProps": {
            "id": "short_identifier",
            "img": "img/image_name_here.png",
            "url": "https://www.youtube.com/c/channel_name/live"
          },
          "textColor": "black"
	   },
        {
		        /* similar object but for another type of event */
	     }]};

**Since this step is a major hinderance to any non-technical streamer setting this up by themselves, I am looking to simplify this step, by making an HTML form which would generate this entire config.js**

Step 3: Assuming that the Config parameters are set up, the config.js will be compatible with the rest of the codebase to feature as a personalized Stream Calendar
The step here, would be for deployment to a host of your choice. 
There are multiple choices, like Heroku/Netlify/Vercel (which I used) for setting this up.

Future modifications which I am planning to add are to customize color schemes for the buttons, and make this process much more accessible
