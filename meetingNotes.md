
# Jan 9th 2025 meeting
## Summary
* Since we are about 10 days away from application opening, we are in crunch time mode now.
* We will prioritize on features that is needed first. Targets:
    + Before application opens(Jan 19th) finish these:
        - user registration workflow
        - user logins via oauth and email link
        - Application to hackathon workflow
        - send emails upon registration and application
        - Team formation is cancelled for now

    + 1 week after application opens finish:
        - Table to view, sort, and export applicants
        - select applicants to update their status
        - select applicants with certain status and send them emails to confirm (rejected, accepted, accepted wave 2 etc)

    + Finish before Journeyhacks starts(Feb 12th):
        - event checksin (morning checkin, food, side events etc) by scanning QR code
        - monitoring screen/table to track who is signed in
        - event schedule/calendar display
        - tools to create and update displays.
        - polish and address feedbacks.

* Considering the time crunch, slight ux issues, and slightly jank ui is acceptable for *internal use*. 
    + The applicants tables for example, its a W is our tool is marginally more convinient than manual excel.

* Push changes live quicker: features that isn't done or integrated can still be pushed if they don't conflict.
    + have a testing route at `src/app/test/(feature_name)/page.tsx`, to demo, test, and document features not yet integrated. 

* We'll have more frequent meetings, every other two days perhaps.
    + next meeting is at **Jan 12th, Sunday**


## Progress updates and todos

### Chris
* Previously Worked on the authentications, Oauth
* TODO:
    * User Sign up workflow
    * User login workflow
    * Define Authenticated routes and public routes (ie, redirect to login)


### Brendan
* Significant progress in QR codes and event workflows and interfaces.
* TODO:
    * Push QRcode/event related progress to dev, with a url route to test and demo the feature.
    * Push email sending api to dev
    * Contact Kevin to check progress on frontend table
    * Investigate [Tanstack Table](https://tanstack.com/table/latest) to display applicant data
        * Using dummy data for now
        * Check styling methods for tanstack tables, doesn't need to be perfect, functionalities first.


### Scott
* TODO:
    * Push any component related progress so far to dev.
    * Look into existing progress in application form
    * implement backend api and related db tables
        + Application question will be very similar to [last year's journey hacks](https://docs.google.com/forms/d/1F-n-e8yssNN2moMlv756SsrmNqvO3nLVmIkj9IcbjkA/edit?ts=67737de2)(asking Christina for access permission)

### Ray
* Worked with Christina and Ayana on the Journeyhacks public site, mostly done.
    + preview at https://preview--journeyhacks.netlify.app/
    + Waiting for feedback from designers 
    + waiting for finalized info from logistics.
* Progress on a json schema based customizable application form component, and related input components.
    + supported input types:
        - text line
        - text area
        - checkbox
        - multicheckbox
        - radio buttons
        - see `src/lib/hacker_application/types.ts`
    + not started on backend yet.

* TODO:
    + finish functionalities of application frontend, add more polish in sub-components used.
    + work with Scott to integrate application form with a backend api
    + implement 6-digit id generator, for user's display id. (primary key for user table will be sequential numbers)
    + work with Keyaan and Brian to have Journeyhacks site finialized and deployed.
        - site content, such as dates, links, Q&A.
        - Metadatas, SEO? discord link previews

### Christina
* TODO:
    + review the journeyhacks site to make adjustments as needed.
    + do quality assurance and provide assistance to make the ui look more like the designs.
        + for the components needed for our initial release, before the application opens.
    + import/define the needed global theme/constant to make the ui look more unified.
        - :shrug: however you do it in tailwind.


Again, next progress update meeting is on ***7pm, Jan 12th, Sunday***. 
