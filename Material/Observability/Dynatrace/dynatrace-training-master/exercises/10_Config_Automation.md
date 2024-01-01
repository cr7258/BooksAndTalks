# Exercise: Configuration Automation
Goal: use Github to import configuration. This could be integrated into a pipeline. 

## Install the Dynatrace-Client
Dependent on your OS, choose one of the following descriptions to install the Dynatrace-Client:

### Mac
```
brew tap cp-core/apm https://github.wdf.sap.corp/hcpperf/homebrew-apm
brew install dynatrace-client   
dt version
```
### Windows

1. Create a folder like `C:\Program Files\dynatrace`
2. Download [nexus-milestones-latest-windows-artifact](https://nexusmil.wdf.sap.corp:8443/nexus/service/local/artifact/maven/content?r=deploy.milestones&g=com.sap.golang.github.wdf.sap.corp.hcpperf&a=dynatrace-go&c=windows-amd64&v=LATEST&p=tar.gz)
3. Extract zip file to a folder like `C:\Program Files\dynatrace`
4. Rename the `dynatrace-go.exe` file to `dt.exe`
4. Add this folder to the PATH variable of your computer/user.
    1. Type into the windows start search bar `Environment Variables` & select the corresponding entry
    2. Click on `Environment Variables`
    3. Select `Path` > `Edit` > `New` 
    4. Provide the folder created in Step 1., e.g. `C:\Program Files\dynatrace`
6. In order to validate that the installation worked open a new terminal and type `dt version` this should print the current dt client version

## Exercise
The Dynatrace-Client is a CLI developed by the Performance & APM team. You can find its source code in the [dynatrace-go Github repository](https://github.wdf.sap.corp/hcpperf/dynatrace-go). The CLI enables you to manage your Dynatrace configuration. It is capable to extract and import configuration from Dynatrace. Please use the Dynatrace-Client CLI and try to answer the following questions:

1. Login to your Dynatrace Environment using the Dynatrace-Client.
2. Which configuration objects can the Dynatrace-Client handle?
3. Which dashboards exists within your Training-XX environment?

If you need more help or information, scroll down.
<br/><br/>
<br/><br/>
<br/><br/>
<br/><br/>
<br/><br/>
<br/><br/>
<br/><br/>
<br/><br/>
<br/><br/>
<br/><br/>
<br/><br/>
<br/><br/>
<br/><br/>
<br/><br/>
<br/><br/>
<br/><br/>
<br/><br/>
<br/><br/>
<br/><br/>
<br/><br/>
<br/><br/>


## Login to your Dynatrace Environment using the Dynatrace-Client
1. Open your Dynatrace environment
   1. `Settings` > `Integration` > `Dynatrace API` > `Generate token`
   2. Add Read Configuration,  Write configuration & Access Problem and event feed , metrics, and topology from API/V1 scopes
   3. `Generate`
   4. `>` `Copy` token 
2. Open a terminal
3. `dt env login --token <token> --url <url> --alias participant-env`
   * `token`: Token which was created in the previous step.
   * `url`: Url to your Dynatrace environment in following format: `https://sih939.dynatrace-managed.com/e/11111111-2222-3333-4444-555555555555`
   * `alias`: Can be used to manage multiple user sessions. You can provide any string which is meaningful to you. You could also skip this parameter.

## Which configuration objects can the Dynatrace-Client handle?
The Dynatrace-Client provides help information for all provided commands. You can use this help by using the `--help` flag. You can ask the Dynatrace-Client which configuration commands it provides by using 

`dt environment get config --help`

## Which dashboards exists within your Training-XX environment?
The Dynatrace-Client provides a readable overview for the supported entities. In order to see which dashboards exist within an environment you can use:

`dt environment get config dashboards`

This should provide an overview in following format:
* Name: Name of the dashboard
* Owner: Who created the dashboard
* Management Zone: Management Zone assigned to the dashboard
* ID: Used to uniquely identify the dashboard, allows transport of entities across environments.
```
name                                   owner    management zone  id
-----------------------------------------------------------------------------------------------------
Demo                                   d060171                   c3cdebaf-9db4-45b3-baca-da0af70b2b4b
New dashboard (Dec 10, 2019 16:23:59)  d060171                   858e6f27-367c-414f-8fa9-12974103d7b7
Training Overview                      d062111                   49397ac4-b813-4e9b-bd2d-310085f1063c
```
Selecting a single entry can be achieved by using the `--id` flag.

`dt environment get config dashboards --id c3cdebaf-9db4-45b3-baca-da0af70b2b4b`
```
name                                   owner    management zone  id
-----------------------------------------------------------------------------------------------------
Demo                                   d060171                   c3cdebaf-9db4-45b3-baca-da0af70b2b4b
```

You could receive different output formats by providing `--output` flag. 
 
 `dt environment get config dashboards --output json`
 
Storing received configuration to a folder can be achieved by using the `--dir` flag

 `dt environment get config dashboards --dir .`
 
