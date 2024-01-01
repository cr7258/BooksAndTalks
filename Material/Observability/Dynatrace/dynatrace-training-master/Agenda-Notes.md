# Dynatrace Training


## Agenda

### Day 1

#### Dynatrace Introduction

- Introduction/Presentation of team
- Expectation round
- Why Dynatrace
- What is Dynatrace
- Smartscape to PurePath (Away-Cluster)
- PurePaths are the bricks of the house

#### Architecture

##### Cluster (Server) 

- Dynatrace Managed Architecture @ SAP
- ActiveGate vs Cluster ActiveGate
- Dynatrace clusters on SAP CP
- Cluster settings (Data retention times)

##### OneAgent (Client)

- Review the architecture of the OneAgent
- Network Monitoring
- Exercise: "Which agent is used for what?" (Away-Cluster)
- Full stack vs Infra only vs PaaS
- CF: OneAgent in the Diego Cell - limitations 
- K8s: 
    - OneAgent as DaemonSet
    - Using the PaaSAgent in Container
    - Using an Active Gate

#### Instrumentation
- How-To: OneAgent on Hosts
- How-To: OneAgent on Docker hosts
- How-To: CF (Using PaaS Agent) 
  - Exercise: Instrument CF App Spring-Music with Dynatrace (SIH-Cluster - individual environment)
- How-To: K8s 
  - Live Demo: Using the OneAgent as DaemonSet

#### Traversing Your Stack (SIH-Cluster - individual environment)
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


### Day 2

#### Service Analysis Views (SIH-Cluster - shared environment)
- Trending Analysis with the Service Details view
- Understand Dependencies with the Service Flow and Service Backtrace views
- Response Time analysis with the Distribution and Hotspots views
- Diagnose Errors with the Failure Analysis view (using Spring Music error endpoint)
- Analyze a single transaction with the PurePath view
- (Exercise - trigger delay or error rate)

#### Artificial Intelligence and Problems (SIH-Cluster - shared environment)
- Baselining and static thresholds
- Anomaly detection
- Combine alerting and event correlation to create Problems
- Analyze Problems and drill down to root cause
- (Exercise - trigger delay or error rate)
- Creating Alerting Profiles
- Email notification and 3rd party integrations
- Creating Maintenance Windows

#### Organizing Your Environment (SIH-Cluster - individual environment)
- Create manual or automatic tags
- Using tags as a filter
- Using tags for problem notifications
- Using tags for creating relevant dashboards 
- Exercise: Apply DT_TAGS and create custom alert and alerting profile
- Create Host Groups to separate your data
- Create Management Zone filters to be used in dashboards
- Define permissions for each of the Management Zones

#### Configuration
- Process Group detection, naming
- Service merging, naming and custom services
- Exercise: Apply DT_CLUSTERID and create custom service for scheduled method
- Request attributes
- Configuration API

#### Dashboards
- Modify your “Home” dashboard
- Create role-relevant dashboards
- Manage dashboard access permissions

#### Extend Dynatrace
- JMX
- Agent plugins
- Active Gate plugins
- API (Custom devices and Events API)

#### Outlook
- AWS, Azure... Cloud Watch
- Synthetic monitoring
- Discuss the Licensing model

