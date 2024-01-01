# Exercise: Service detection rules

**Note: For this exercise we will use your "Training-<Month>-0XX" environment**

In this exercise you will learn how to:
- split external service calls by domain and URL path 
- Rename services based on service properties

Dynatrace offers the possibility to configure the rules that Dynatrace uses to detect a service. Those rules are called _Service detection rules_ and can be configured via the Configuration API.

## Split Requests to public networks

Whenever your service calls one or several external services that are not monitored by Dynatrace in your environment those calls will all be collected in a separate service called "Requests to public networks". 

Often you want to differentiate between different external services for example because you want to directly see which service fails or to get a better overview in the service flow. 
It is possible to split the services that end up in the default service bucket. We will do this in this exercise by defining _Service detection rules_.

### Default behavior
Let's first check how the default behavior looks like:

Your spring-music application executes the following 4 requests in a scheduled method in the [Scheduler](../spring-music/src/main/java/org/cloudfoundry/samples/music/web/Scheduler.java) class:
- GET to https://www.google.com
- GET to https://www.google.com/maps
- GET to https://uaa.cf.eu10.hana.ondemand.com
- GET to https://api.auditlog.cf.eu10.hana.ondemand.com:8081/audit-log

In your "Training-<Month>-0XX" environment on the [training-cluster](https://sih939.dynatrace-managed.com/login) select the "Applications & Microservices" -> "Services" tab in your Environment and click on the service "Requests to public networks".
You should see two top domains on the bottom of the page "google.com" and "ondemand.com". Dynatrace groups all calls by top level domain per default.
Those two domains group the 4 requests mentioned above.

If you configured the custom service "My scheduled service" in the previous exercise, you can also check the Service flow view of this service to see, that it is calling the "Requests to public networks" service.

We now will configure Dynatrace to split all those requests in separate services so that we can differentiate better.

### API Token

As we will use the Configuration API for this, please first create yourself an API-Token:
1. Go to "Manage" -> "Access Tokens".
2. Click on "Generate new token".
3. Give your token a name.
4. Scroll down and search for scopes "Read configuration" and "Write configuration".
5. Select each of the two scopes by marking the check box.
6. Click on "Generate token" in the left lower corner.
7. Copy the token by clicking on "Copy". You will not be able to see the token value again, so make sure to save it for this training (or just create a new one every time). 


### Split by domain

We will first configure Dynatrace to split the two calls to the ondemand.com top level domain. 

1. Open the Configuration API by clicking on the user symbol in the upper right corner.
2. Select "Configuration API". A new tab will open.
3. Scroll down and select "Service - Detection opaque and external web request".
4. Select the first POST request ("Create a new service detection rule") and click on the Authorization button (small lock symbol on the right).
5. Enter your API-Token, click "Authorize" and "Close".
6. Click on "Try it out" and enter the following body (replace the default payload)

   ```json
   {
       "name": "Split ondemand.com by hostname",
       "type": "OPAQUE_AND_EXTERNAL_WEB_REQUEST",
       "description": "",
       "enabled": true,
       "conditions": [
           {
               "attributeType": "TOP_LEVEL_DOMAIN",
               "compareOperations": [
                   {
                       "type": "ENDS_WITH",
                       "negate": false,
                       "ignoreCase": "true",
                       "values": [
                           "ondemand.com"
                       ]
                   }
               ]
           }
       ],
       "publicDomainName": {
           "copyFromHostName": true
       },
       "port": {
           "doNotUseForServiceId": true
       }
   }
   ```
   **Note:** With this rule we tell Dynatrace to use the host name as public domain name for all external services that have a top level domain end with "ondemand.com".
7. Click "Execute" and check that the response code is `201`. Keep this browser tab open.
8. Go back to Dynatrace and check in the "Applications & Microservices" -> "Services" tab that you see two new services (might take a minute or two until they show up). 


### Split by URL path

The remaining two requests to google.com are still grouped in the service "Requests to public networks". 
To being able to differentiate between them we will split them now by their URL path.

1. Create another service detection rule by pasting the following body to the POST request in the Configuration API UI
   ```json
   {
     "type": "OPAQUE_AND_EXTERNAL_WEB_REQUEST",
     "name": "Split google.com by path",
     "description": "",
     "enabled": true,
     "conditions": [
       {
         "attributeType": "TOP_LEVEL_DOMAIN",
         "compareOperations": [
           {
             "type": "ENDS_WITH",
             "negate": false,
             "ignoreCase": true,
             "values": [
               "google.com"
             ]
           }
         ]
       }
     ],
     "contextRoot": {
       "segmentsToCopyFromUrlPath": 1
     },
     "port": {
       "doNotUseForServiceId": true
     }
   }
   ```
   **Note:** With this rule we tell Dynatrace to copy the first segment of the URL path as context root. 
   As the context root is used to differentiate between services, this will create two different services, one for path `/` and one for `/maps`.

2. Click on "Execute" and check that the response code is `201`.
3. Go back to Dynatrace and check in the "Applications & Microservices" -> "Services" tab that you see two additional new services (might take a minute or two until they show up).
 
   **Note:** You will still see the "Requests to public networks" service as only future requests will be grouped in the new services. 
   It will fade out dependent on the time frame selected in Dynatrace.

You will see two new services named "google.com" and "google.com (/maps)".

### Check the result

If you configured the custom service "My scheduled service" in the previous exercise, check its "Service flow view". 

The service flow should now show that "My scheduled service" is calling the 4 configured services instead of the "Requests to public networks" service.
