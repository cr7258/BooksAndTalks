# Dynatrace Training - Agenda
### Day 1
#### Dynatrace Introduction

- Introduction/Presentation of team
- Expectation round
- Why APM?
- Dynatrace as APM solution
- Smartscape to PurePath

#### Server Architecture

- Dynatrace Managed Architecture @ SAP
- ActiveGates and ActiveGate types
- Dynatrace clusters on SAP CP
- Cluster settings

#### OneAgent (Client) Architecture

- Architecture of the OneAgent
- Exercise: "Which agent is used for what?"
- OneAgent on Hosts
- CF: OneAgent in the Diego Cell - limitations 
- (Optional) K8s: OneAgent as DaemonSet or within the container

##### Instrumentation

- OneAgent on Hosts and Docker hosts
- How-To: CF (Using PaaS Agent) 
  - Exercise: Instrument CF App Spring-Music with Dynatrace

### Day 2

#### Traversing Your Stack
- Host Views and Filters
- Technologies Overview
- Process Group vs. Process Group Instance
- Services and PurePaths
- Database monitoring
- Drilldown Analysis for a single Host, PGI, and Service
- Exercise: Traversing your stack

#### Service Analysis Views
- Trending Analysis with the Service Details view
- Understand Dependencies with the Service Flow and Service Backtrace views
- Response Time analysis with the Distribution and Hotspots views
- Diagnose Errors with the Failure Analysis view
- Analyze a single transaction with the PurePath view
- Exercise: Service analysis views

#### Dashboards
- Create your Dashboard
- Manage dashboard access permissions
- Cross-environment dashboards
- Exercise: Create a remote environment dashboard tile

### Day 3

#### Artificial Intelligence and Problems
- Baselining and static thresholds
- Anomaly detection
- Root cause analysis
- Exercise: Find the root cause of a problem
- Anomaly detection settings
- Creating Alerting Profiles
- Configuring notifications and 3rd party integrations
- Creating Maintenance Windows

#### Organizing Your Environment
- Tags and Properties
- Automatic tagging rules
- Using tags: Filter, problem notifications, dashboards 
- Creating management zones
- Exercise: Apply custom properties and create automatic tags, custom alert and alerting profile

### Day 4

#### Configuration Basic
- Entity naming
- Process Group detection
- Deep monitoring
- Custom services
- Exercise: Apply DT_CLUSTERID and create custom service for scheduled method

#### Configuration Advanced
- Request attributes
- Exercise: Request attributes
- External Services
- Exercise: Service detection rules

#### Multidimensional analysis based on request attributes
- Diagnostic tools
- Filters and dimensions

#### Configuration Automation
- Configuration API & DT client
- Exercise: DT client


### Day 5

#### Calculated service metrics
- Define metrics via multidimensional analysis view
- Define metrics via settings page

#### Synthetics
- HTTP Monitors
- Browser (click path) monitor

#### SLIs and SLOs
- Time based SLO
- Request based SLO
- SLO dashboards

#### Extending Dynatrace
- Built-in plugins
- Extension overview
- JMX
- Metrics v2: Ingestion API
