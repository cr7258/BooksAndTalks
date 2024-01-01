# Exercise: Process group naming and Custom services

**Note: For this exercise we will use your "Training-<Month>-0XX" environment**

In this exercise you will learn how to:
- name the process group of your spring-music application 
- configure a custom service for a scheduled method inside your spring-music app

## Process group detection via environment variable

Dynatrace automatically detects processes and process groups and tries to give them an intuitive name. 

If you want to change the name you can configure process group naming rules in the UI .

You can set an environment variable of your process called `DT_CLUSTER_ID` to detect this process with the value of this identifier.

The environment variable approach also gives you the possibility to influence process group detection: All processes with the same `DT_CLUSTER_ID` variable will be put in the same process group by Dynatrace.

The following exercise will show how to detect process group via the environment variable.

### Add the environment variable to the application

1. Open the `manifest.yml` file inside the `spring-music` folder.
2. Add the line `DT_CLUSTER_ID: "<choose a process group name, e.g. spring-music-training>"` to the environment variables (you can keep the `DT_CUSTOM_PROP` variable if you added it in the previous exercise).

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
       DT_CLUSTER_ID: "spring-music-training"                       # add this line, please mind the indentation
   ```

### Redeploy the application

For the change to take affect you need to redeploy the application. 

Use `cf push` inside the spring-music folder to deploy the app.

### Execute some requests and find the process group in Dynatrace

**Note For Windows: Open Git Bash to execute the following commands.**

1. Copy the url of your application (you can find it out via the `cf apps` command).
2. Execute a prepared script, that calls some services of your spring-music app by executing
`./scripts/execute_requests.sh https://<URL of your application>` from inside the `spring-music` folder.
3. Open your "Training-<Month>-0XX" environment on the [training-cluster](https://sih939.dynatrace-managed.com/login).
4. Select the "Infrastructure" -> "Technologies and processes" tab in Dynatrace and check if you see your newly named process group (for a while you might still see the old named process group but no new requests will be recorded for it). It might first show up as Technology "Java" and will be grouped under "Tomcat" after a while.


## Custom service configuration

If Dynatrace doesn't detect your service automatically or the automatic detection doesn't fit your needs you can define a custom service based on a Java method for example (it is also possible for .NET, PHP, NodeJS and Go services). 

This is especially useful for worker threads executed in the background of your application that Dynatrace might not show as separate services automatically.

We built a scheduled method in your spring-music application that is executed in the background. The following instructions will explain how to define a custom service entry point for this method.

1. Click on the "Manage" -> "Settings" tab in the Dynatrace UI and choose "Service Detection" -> "Custom service detection".
2. Choose "Define Java services" and enter the name "My scheduled service".
3. Click "Find entry point".
4. Choose the process group name you defined in the previous exercise from the drop down menu and click "Continue".
5. Search for the Java class `org.cloudfoundry.samples.music.web.Scheduler`.
6. Select the found class and click "Continue".
7. Select "Use the selected class" and on click "Continue".
8. Select the method `public void callExternalService` and click "Finish".
9. Click on "Save changes" in the left lower corner.
10. Restart your spring-music app via `cf restart spring-music-<D/I number>`.
11. Open the "Application & Microservices" -> "Services" tab and check that you can see your newly defined service (this might take up to 3 minutes).
