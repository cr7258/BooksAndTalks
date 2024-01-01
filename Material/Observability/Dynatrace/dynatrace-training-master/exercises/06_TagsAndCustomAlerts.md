# Exercise: Custom Properties, Tags, Custom alerts and Alerting profiles

**Note: For this exercise we will use your "Training-<Month>-0XX" environment**

In this exercise you will learn how to:
- add Custom properties to your processes via an environment variable
- apply tags via automatic tagging rules based on Custom Properties
- configure a custom alert, alerting profile and notification based on the previous applied tags

## Add Custom Properties defined by an environment variable

Custom properties have to be defined at start time and are immutable during runtime. 

### Add the environment variable to the application

1. Open the `manifest.yml` file inside the `spring-music` folder.
2. Add the line `DT_CUSTOM_PROP: "Team=Operations Stack=CF"` to the environment variables.

   Example: 

   ```
   ---
   applications:
   - name: spring-music-<D/I number>
     memory: 2G
     instances: 2
     random-route: true
     path: build/libs/spring-music-1.0.jar
     env:
       JBP_CONFIG_SPRING_AUTO_RECONFIGURATION: '{enabled: false}'
       SPRING_PROFILES_ACTIVE: http2
       JBP_CONFIG_OPEN_JDK_JRE: '{ jre: { version: 11.+ } }'
       DT_CUSTOM_PROP: "Team=Operations Stack=CF"                  # add this line, please mind the indentation
   ```

### Redeploy the application

For the change to take affect you need to restage the application. 

Use `cf push` inside the `spring-music` folder to deploy the app (you might have to `cf login --sso` again in case you were logged out before).

### Check the custom properties in Dynatrace

Open your "Training-<Month>-0XX" environment on the [training-cluster](https://sih939.dynatrace-managed.com/login) and verify that your process group contains the properties `Team Operations` and `Stack CF`.

### Create a Tag by defining an automatic tagging rule based on custom properties

Go to "Manage" -> "Settings" -> "Tags" -> "Automatically applied tags" and create a new Tag.
1) Enter the name "Team".
2) "Add a new rule"
3) Select `{ProcessGroup:Environment:Team}` as tag value.
4) Select "Process groups" in the next Drop down ("Rule applies to 'Process groups' of the following technology type"). You do not need to add host group or technologies properties.
5) Add a condition: `Team (Environment)` `exists`
6) To get the tag also on Services and Hosts of this process group, check the two checkboxes below.
7) Click on "Preview", under the "Infrastructure" tab you should see your spring music process group being listed.
8) Click on "Create rule".
9) Save the tagging rule by clicking "Save changes" in the lower right corner.
10) Check that your process group and service was tagged.

## Create a Custom alert

For alerts on metrics and thresholds that you cannot define via Dynatrace's built in anomaly detection, you can define Custom alerts. If the defined thresholds are exceeded Dynatrace will open a Problem for your custom alert (and notify you, if configured). Custom alert thresholds will also be considered in the automatic root cause analysis.

In this example we want to set up a custom alert for client side 4xx errors.

1) Open your browser and access the URL `https://<Your spring-music URL>/album` (you should see a "Whitelabel Error Page").
2) Open your "Training-<Month>-0XX" environment on the [training-cluster](https://sih939.dynatrace-managed.com/login).
3) Select the "Manage" -> "Settings" tab in the Dynatrace UI.
4) Click on "Anomaly detection" and choose "Custom events for alerting".
5) Click "Create custom event for alerting". 
6) In the **Metric** section choose "Services" as Category and "Number of HTTP 4xx errors" as metric. Keep "Value" as aggregation type.

9) Configure the following "Static threshold" in the **Monitoring strategy** section:
   
   "Alert anomalies with a static threshold of **1** **Count (count)**"
   
   "Raise an alert if the metric is **above** the threshold for **1** minutes during any **3** minute period."
   
10) Under "Event description" 
  - Enter any title e.g. "4XX threshold breached".
  - Select "Custom alert" as severity.
11) Save the changes by clicking "Create custom event for alerting".

## Create a Alerting profile

Alerting profiles in Dynatrace are the link between alerts/problems and notifications.
In the Alerting profiles you define which type of problem on which entities you want to be notified about. When configuring a problem notification, you can choose the corresponding alerting profile.

1) Select the "Manage" -> "Settings" tab and choose "Alerting" and "Problem alerting profiles".
2) Click on "Add alerting profile".
3) Type in the name "My profile".
4) Click on "Add severity rule" to define the severity rules for this profile. 
5) Select "Custom" as Problem severity level Severity rule and "0" as delay.
6) Select the "Filter problem by tag" dropdown and choose "Only include entities that have any tags".
7) Click "Add tag" and enter `Team` as Tag key and `Operations` as tag value.
8) Save the alerting profile by clicking "Save changes" in the lower right corner.

## Define a Problem notification

To be notified of problems you have to set up a problem notification.

In this example we will configure an E-Mail alert for the Custom alert you defined previously:

1) Select the "Manage" -> "Settings" tab and choose "Integration".
2) Click on "Problem notification" and "Add notification".
3) Choose "EMail" from the dropdown and enter a display ame e.g. "E-Mail to me".
4) Click on "Add recipient" and enter you e-mail address.
5) Scroll all the way down and choose the previously created alerting profile "My profile" from the drop-down menu (you have to delete the string "Default" and search by typing "My profile").
6) Click on "Send test notification" to make sure the configuration is correct.
7) Save the notification by clicking "Save changes" in the lower right corner.

## Create a problem and get notified

In the next step you will trigger some 404 errors on your application and check that Dynatrace shows the custom alert problem:

1) Open your browser and access the URL `<Your spring-music URL>/album`. Reload the page at least two times.
2) After 4-5 minutes you should receive an E-Mail notification (You might want to use the time to grab a coffee :-)). Afterwards you can open the "Observe and explore" -> "Problems" tab in Dynatrace and check that you see your Custom alert Problem.

**Note:** After a few minutes you will receive another E-Mail, stating that the Problem is resolved now. This is because you didn't trigger errors over a longer period of time.
