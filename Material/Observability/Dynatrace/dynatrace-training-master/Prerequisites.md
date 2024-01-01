## Prerequisites

### Java JDK

Make sure a JDK is installed on your machine. We recommend Java 11 but any version from 8 to 17 should work.

### GIT

Make sure you have git installed on your machine or install it:

- For Windows: If you do not have git installed yet, install [Git Bash](https://gitforwindows.org/), then you can skip the next step.

- For Mac: Choose one of the options described [here](https://git-scm.com/book/en/v1/Getting-Started-Installing-Git#Installing-on-Mac).

### Bash (Windows only)

Install [Git Bash](https://gitforwindows.org/). **Please execute all following commands in the Git Bash.**

### Cloud Foundry CLI

Install the Cloud Foundry Command Line Interface (CLI) by following [this](https://docs.cloudfoundry.org/cf-cli/install-go-cli.html) guide.

### Cloud Foundry Account

For the training you should be able to deploy a test application to Cloud Foundry. To do this you need a space inside Cloud Foundry in which you can deploy the application.

* For SAP internal users (e.g. all trainees)
    * If you do not have access to a Cloud Foundry space, you will be provided with one by our team.

      Use the command that is provided in the prerequisites E-Mail to log on.

    * If you already have access to a Cloud Foundry space and want to use it, that is also fine. Make sure that:
        1. you are allowed to deploy applications (your user needs the `SpaceDeveloper` role assigned for the space).
        2. you are able to log into your space via the `cf login --sso` command.

- For external users (e.g trainers), please request a Cloud foundry Trial account:

    1. Go to the [Cloud Cockpit](https://account.hanatrial.ondemand.com/register) and request a Trail account by clicking the "Cloud Foundry Trial" tile.

    2. Go to your trial account, select the subaccount "trial" and copy the "API Endpoint" information (should something like `https://api.cf.us10.hana.ondemand.com`).

    3. Login to Cloud Foundry from the command line via:

        - `cf login -a <API Endpoint> --sso`
        - open the link provided in the output in a browser to get a one time passcode
        - when promted enter your E-Mail address and Two-Factor-Authentication token
        - copy the "Temporary Authentication Code" and paste it in the command line

    4. Check that you can execute the command `cf apps` without error message.


### Download, build and deploy the spring-music application to Cloud Foundry

0. (Windows only) Open Git Bash in a folder on which you have write permissions.

1. Clone this repository by executing `git clone https://github.wdf.sap.corp/apm/dynatrace-training.git`.

   **Note 1:** Make sure you are inside a folder on which you have write permissions.

   **Note 2:** If you get a SSL certificate error message, use the flag `-c http.sslVerify=false` for the git command.

   **Note 3:** If you get any kind of authentication error, please try using a "Personal Access Token" when cloning the repository.

   Create a "Personal Access Token" via on github via Settings -> Developer settings -> Personal Access (or click [here](https://github.wdf.sap.corp/settings/tokens)) and clone the repository via `git clone https://<personal access token>@github.wdf.sap.corp/apm/dynatrace-training.git`

2. The repository contains a spring-music application. Go the application folder via

    ```
    cd dynatrace-training
    cd spring-music
    ```

3. Java Version

    By default, the application will be built and deployed using Java 11 compatibility.
If you want to use Java 8 or 17, you will need to update two things.

* In `build.gradle`, change the `targetCompatibility` Java version:

    ~~~
    java {
       ...
       sourceCompatibility = JavaVersion.VERSION_11
       targetCompatibility = JavaVersion.VERSION_11
    }
    ~~~
    Set `targetCompatibility` to `JavaVersion.VERSION_1_8` for Java 8 or `JavaVersion.VERSION_17` for Java 17.


* In `manifest.yml`, change the Java buildpack JRE version:

    ~~~
        JBP_CONFIG_OPEN_JDK_JRE: '{ jre: { version: 11.+ } }'
    ~~~

    Set the version to `17.+` for Java 17 or delete the whole line for Java 8.


4. Inside this folder execute the following command to build the application:

 - `./gradlew clean assemble`

   **Note**: If you get an error like :`Couldn't find tools.jar` make sure you have a JDK installed, not a JRE.

5. To make sure the build succeeded, check that the folder `build/libs` contains a file named `spring-music-1.0.jar`.
6. Open the `manifest.yml` in the `spring-music` folder and replace the placeholder in the `name` with your D/I number.
7. Login to your Cloud Foundry space (that you set up in the previous step) via `cf login --sso`
8. Deploy the application by executing `cf push` (make sure you are in the `spring-music` folder when executing the command).

### Validation
Please check that you do not have any problems with following steps:
* [ ] `git version`
* [ ] `cf apps`
* [ ] Check that you have a `spring-music-1-0.jar` within your `dynatrace-training/spring-music/build/libs` folder
