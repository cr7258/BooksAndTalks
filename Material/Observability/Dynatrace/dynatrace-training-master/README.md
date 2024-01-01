# Dynatrace Training
## Agenda
### Day 1
#### Dynatrace Introduction

- Introduction/Presentation of team
- Expectation round
- Why Dynatrace
- What is Dynatrace
- Smartscape to PurePath
- PurePaths are the bricks of the house

#### Server Architecture

- Dynatrace Managed Architecture @ SAP
- ActiveGate vs Cluster ActiveGate
- Dynatrace clusters on SAP CP
- Cluster settings

#### OneAgent (Client) Architecture

- Architecture of the OneAgent
- Exercise: "Which agent is used for what?"
- OneAgent on Hosts
- CF: OneAgent in the Diego Cell - limitations 
- K8s: OneAgent as DaemonSet or within the container

##### Instrumentation

- OneAgent on Hosts and Docker hosts
- How-To: CF (Using PaaS Agent) 
  - Exercise: Instrument CF App Spring-Music with Dynatrace
- How-To: K8s 
  - Using the OneAgent as DaemonSet
  - Using the PaaSAgent in Container
  - Using an Active Gate

#### Traversing Your Stack
- Overview of OneAgents in Deployment Status
- Host Views and Filters
- Technologies Overview
- Process Group vs. Process Group Instance (2 instances)
- Services and PurePaths
- Service Views and Filters
- Database monitoring
- Drilldown Analysis for a single Host, PGI, and Service
- Smartscape Topology for dependency analysis
- Exercise

#### Service Analysis Views
- Trending Analysis with the Service Details view
- Understand Dependencies with the Service Flow and Service Backtrace views
- Response Time analysis with the Distribution and Hotspots views
- Diagnose Errors with the Failure Analysis view
- Analyze a single transaction with the PurePath view
- Exercise

#### Dashboards
- Create your Dashboard
- Manage dashboard access permissions

### Day 2

#### Artificial Intelligence and Problems
- Baselining and static thresholds
- Anomaly detection
- Combine alerting and event correlation to create Problems
- Analyze Problems and drill down to root cause
- Exercise
- Creating Alerting Profiles
- Email notification and 3rd party integrations
- Creating Maintenance Windows

#### Organizing Your Environment
- Create manual or automatic tags
- Using tags as a filter
- Using tags for problem notifications
- Using tags for creating relevant dashboards 
- Create Management Zone filters to be used in dashboards
- Exercise: Apply DT_TAGS and create custom alert and alerting profile

#### Configuration
- Create Host Groups to separate your data
- Process Group detection, naming
- Service merging, naming and custom services
- Exercise: Apply DT_CLUSTERID and create custom service for scheduled method
- Request attributes
- Configuration API

#### Extend Dynatrace
- JMX
- Agent plugins
- Active Gate plugins
- API (Custom devices and Events API)

#### Outlook
- Synthetic monitoring
- Discuss the Licensing model
- DT Client
- Opaque Services

