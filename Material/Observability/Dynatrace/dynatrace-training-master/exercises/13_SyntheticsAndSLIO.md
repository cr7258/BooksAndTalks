# Exercise: Synthetic checks and SLI/O definition

**Note: For this exercise we will use your "Training-<Month>-0XX" environment**

In this exercise you will learn how to:
- configure a synthetic HTTP monitor
- configure your SLI/Os 
- display those in a dashboard 
- observe a problem when the HTTP monitor fails and how this influences your defined SLO 
With Synthetic checks Dynatrace offers the possibility to test your UI or HTTP endpoint with simulated users. 
Based on those checks you can define your SLI/Os in Dynatrace and display them in a central dashboard.

## Configure a HTTP monitor

When defining a synthetic check in Dynatrace you go get to choose between a "browser monitor" and a "HTTP monitor".
In this exercise we will create a HTTP monitor which checks the health of our spring music application by calling an exposed API (/health) of our spring music application.
Feel free to try out the other option (recording a browser monitor) after the training in your training environment. 

1) Click on "Applications & Microservices" -> "Synthetic" tab on the right hand side.
2) Click on "Create a synthetic monitor" and choose "Create a HTTP monitor".
3) Enter a name for your monitor e.g. "spring-music (/health)"
4) Afterwards add a new HTTP request to monitor by clicking "Add HTTP request".
   - Type the HTTP request URL: `https://<Your spring-music URL>/actuator/health` (if you forgot the URL, check the route of your application with `cf apps`)
   - Name: keep like it is or rename it
   - HTTP method: GET
5) Click on "Add HTTP request" 
6) Scroll down and enable "Set rules for response validation"
   - Configure the following validation: **Pass if** text contains **UP**
7) Click on "Next"
8) Configure an interval of 5 minutes and choose **one** public location you like

   **Note: Public and private locations on SAP clusters are subject to a charge (more information on our [website](https://github.wdf.sap.corp/pages/apm/advanced/charging)). 
On our training cluster there are only public locations available and they can be tried out without a fee but please use reasonable intervals and number of locations.**

9) Click on "Next".
10) You will see an overview on which you can for example check how many "Estimated synthetic actions per month" this check will cause. The number is influencing the cost of your synthetic monitor.
11) Click on "Create HTTP monitor". It can take up to 5 Minutes until the first execution is triggered.

## Configure SLO

While configuring an SLO, you can create a time based SLO or a request based SLO. In this exercise, you will create a time/window based SLO on the HTTP monitor you created in the previous step. Feel free to create a calculated service metric on for example, response time fastness as shown during the demo and define an SLO based on it after the training as an additional exercise.

1) Choose "Cloud Automation" -> "Service level objectives" tab on the left hand side and click on the 'Add new SLO' option
2) Choose 'Synthetic availability' from the 'Monitor a client-side objective' options
3) Name the SLO 'Availability (/health)' and optionally add a custom description
4) Click on the dropdown and choose the metric "builtin:synthetics.http.availability.location.total" in the metric expression box
5) Delete any predefined filter if there is any under "Define a filter".
6) Define the SLO target (Failure - 99.95 , Warning - 99.97 and Timeframe - 1w) under "Add success criteria"
7) Check your settings and click on "Save".

You should now see an overview of the SLO you created , when you click on SLOs in the left pane.

## View created SLO in dashboard

You are able to use the created SLO in a dashboard to gain insights into it's compliance. 

1) Go to "Observe and explore" -> "Dashboards" > "Create dashboard" and give your dashboard an appropriate name e.g. 'SLO monitor'. Click on "Create"
2) Search for the "Service-level objective" tile on the right hand side and drag and drop it to your dashboard.
3) In the 'select a SLO' drop down on the right hand side, select the SLO you just created (e.g. Availability (/health)).
4) Select a time frame of 1 week.
5) Click on "Done"

You should be able to view in the tile details of the objective you just created.

## Stop your spring music application

1) If not done in a previous exercise, log in to Cloud Foundry (via `cf login --sso`).
2) Stop your application via `cf stop spring-music-<D/I number>`.

Stopping the application will lead to a failure of the HTTP monitor.

After a while (max 7 minutes) you should see a problem opening up for your HTTP monitor.
If you wait a bit longer afterwards you will see your error budget decreasing in the SLO dashboard and the numbers turning orange (Warning state) and then even red (Bad state).
