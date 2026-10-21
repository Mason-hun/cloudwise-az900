
export const questions = [
  {
    id: 1,
    domain: "Cloud Concepts",
    topic: "Scalability",
    objective: "Describe the benefit of scalability in the cloud",
    text: "An application can handle a larger workload after administrators increase its available compute capacity. Which cloud benefit does this describe?",
    options: [
      { id: "a", text: "High availability" },
      { id: "b", text: "Scalability" },
      { id: "c", text: "Elasticity" },
      { id: "d", text: "Disaster recovery" }
    ],
    correctAnswer: "b",
    explanation:
      "Scalability is the ability of a system to handle increased workload by adding capacity. Elasticity is the ability to add or remove capacity dynamically as demand changes. High availability focuses on keeping services accessible, while disaster recovery focuses on recovering after disruptive events."
  },
  {
    id: 2,
    domain: "Azure Architecture and Services",
    topic: "Resource Groups",
    objective: "Describe the purpose of Azure resource groups",
    text: "A team wants to manage several Azure resources together as one logical unit. Which Azure feature is designed for this purpose?",
    options: [
      { id: "a", text: "An Azure subscription" },
      { id: "b", text: "Azure regions" },
      { id: "c", text: "Resource groups" },
      { id: "d", text: "Management groups" }
    ],
    correctAnswer: "c",
    explanation:
      "Resource groups are logical containers for related Azure resources. They help organize and manage those resources together. A subscription is a broader management and billing boundary, and a management group organizes subscriptions for governance. A region is a geographic deployment area."
  },
  {
    id: 3,
    domain: "Azure Management and Governance",
    topic: "Resource Tags",
    objective: "Describe the purpose of tags",
    text: "An organization wants to label Azure resources by department so it can organize resources and analyze costs. Which feature can help?",
    options: [
      { id: "a", text: "Resource tags" },
      { id: "b", text: "Azure Policy" },
      { id: "c", text: "Resource groups" },
      { id: "d", text: "Cost Management budgets" }
    ],
    correctAnswer: "a",
    explanation:
      "Tags are name-value pairs that add organizational metadata to Azure resources. They can support filtering, reporting, and cost analysis, although applying tags alone does not automatically enforce budgets or allocate costs perfectly."
  },
  {
    id: 4,
    domain: "Cloud Concepts",
    topic: "Shared Responsibility",
    objective: "Apply the shared responsibility model to IaaS guest operating systems",
    text: "A company migrates a virtual machine to Azure using infrastructure as a service (IaaS). Who is responsible for installing operating system updates on that virtual machine?",
    options: [
      { id: "a", text: "Microsoft only, because Azure manages all software in the cloud" },
      { id: "b", text: "The customer, because IaaS still leaves operating system management with the customer" },
      { id: "c", text: "The cloud provider, because it manages the hypervisor beneath the VM" },
      { id: "d", text: "The customer for application configuration, but the provider for the guest operating system" }
    ],
    correctAnswer: "b",
    explanation:
      "In the shared responsibility model for IaaS, the provider manages the physical datacenter and host infrastructure, while the customer manages the guest operating system, its updates, applications, and data. Managing the hypervisor does not make Microsoft responsible for patching the VM's guest operating system."
  },
  {
    id: 5,
    domain: "Cloud Concepts",
    topic: "Cloud Models",
    objective: "Identify a hybrid cloud use case",
    text: "A hospital has chosen to retain some patient systems in its own datacenter and run analytics workloads in Azure, with the two environments connected. Which cloud model describes this arrangement?",
    options: [
      { id: "a", text: "Public cloud only" },
      { id: "b", text: "Private cloud only" },
      { id: "c", text: "Hybrid cloud" },
      { id: "d", text: "Multicloud, because two environments are involved" }
    ],
    correctAnswer: "c",
    explanation:
      "A hybrid cloud combines on-premises (or private cloud) resources with a public cloud such as Azure. Public cloud would place workloads with a cloud provider, and private cloud would keep them in a dedicated environment. Multicloud means using more than one public cloud provider, not combining on-premises systems with Azure."
  },
  {
    id: 6,
    domain: "Cloud Concepts",
    topic: "Cloud Service Types",
    objective: "Identify a PaaS use case",
    text: "A development team wants to deploy a web application without managing virtual machines, the operating system, or the web server, while still writing and updating the application code. Which cloud service type best matches this need?",
    options: [
      { id: "a", text: "Infrastructure as a service (IaaS)" },
      { id: "b", text: "Platform as a service (PaaS)" },
      { id: "c", text: "Software as a service (SaaS)" },
      { id: "d", text: "On-premises virtualization" }
    ],
    correctAnswer: "b",
    explanation:
      "PaaS provides a managed platform for building and running applications, so the customer focuses on code rather than servers and operating systems. IaaS still requires the customer to manage the OS and runtime. SaaS delivers a complete application that the customer uses rather than builds. On-premises virtualization is not a cloud service type."
  },
  {
    id: 7,
    domain: "Azure Architecture and Services",
    topic: "Availability Zones",
    objective: "Describe how availability zones can reduce the impact of datacenter failures",
    text: "A company wants to reduce the impact of a datacenter failure on an Azure application while keeping its deployment in one geographic region. Which construct can help?",
    options: [
      { id: "a", text: "An availability set, which distributes Azure VMs across fault and update domains within a datacenter" },
      { id: "b", text: "Availability zones in a region that supports them" },
      { id: "c", text: "A region pair, which supports some multi-region deployment approaches" },
      { id: "d", text: "A single zonal deployment, pinned to one availability zone" }
    ],
    correctAnswer: "b",
    explanation:
      "Availability zones are separated groups of one or more datacenters within a region, with independent power, cooling, and networking. Deploying a workload across zones can help reduce the impact of a datacenter or zone failure, but the service and application must be configured to use multiple zones and remain resilient. Availability sets address VM fault and update domains; region pairs are a multi-region concept."
  },
  {
    id: 8,
    domain: "Azure Architecture and Services",
    topic: "Subscriptions and Management Groups",
    objective: "Identify management groups as a governance scope above multiple subscriptions",
    text: "An enterprise has several Azure subscriptions and wants to apply governance policies to all of them from a higher-level scope. Which Azure construct is designed for this?",
    options: [
      { id: "a", text: "Resource groups, which organize resources within a subscription" },
      { id: "b", text: "Subscriptions, which provide management and billing boundaries" },
      { id: "c", text: "Management groups" },
      { id: "d", text: "Azure Policy initiatives, which group policy definitions" }
    ],
    correctAnswer: "c",
    explanation:
      "Management groups sit above subscriptions and provide a governance scope for applying policy and access control across multiple subscriptions. Resource groups organize resources inside a subscription, subscriptions provide management and billing boundaries, and policy initiatives group policy definitions rather than subscriptions."
  },
  {
    id: 9,
    domain: "Azure Architecture and Services",
    topic: "Compute Services",
    objective: "Identify Azure Functions as an option for event-driven code",
    text: "A team wants a short piece of code to run automatically in response to an Azure Blob Storage upload, without provisioning or managing a VM for the function. Which Azure compute option best fits?",
    options: [
      { id: "a", text: "Azure Virtual Machines" },
      { id: "b", text: "Azure Functions" },
      { id: "c", text: "Azure Container Apps" },
      { id: "d", text: "Azure App Service" }
    ],
    correctAnswer: "b",
    explanation:
      "Azure Functions supports event-triggered code, including Blob Storage triggers, without requiring you to provision a VM for each function. Container Apps and App Service are also application-hosting options, but the built-in function trigger model is the closest fit to this event-driven scenario."
  },
  {
    id: 10,
    domain: "Azure Management and Governance",
    topic: "Resource Locks",
    objective: "Describe the purpose of resource locks",
    text: "An administrator wants to block deletion of a production virtual machine while a protection setting remains applied at the applicable scope. Which feature should they use?",
    options: [
      { id: "a", text: "A CanNotDelete resource lock" },
      { id: "b", text: "An RBAC role assignment that grants VM management permissions" },
      { id: "c", text: "A VM backup policy that retains recovery points" },
      { id: "d", text: "An Azure Policy allowed-locations rule" }
    ],
    correctAnswer: "a",
    explanation:
      "A CanNotDelete lock blocks deletion operations on the resource within the lock's scope while the lock remains applied. It does not grant permissions, and lock changes are still subject to authorization. RBAC governs who may perform management actions, backups retain recovery points but do not prevent resource deletion, and allowed-locations policy governs deployment regions."
  },
  {
    id: 11,
    domain: "Azure Management and Governance",
    topic: "Cost Management",
    objective: "Explore the pricing calculator and describe cost management capabilities",
    text: "A finance team wants to estimate Azure costs before deployment, then configure a budget threshold and associated alerts for tracked spending. Which pair of tools supports these tasks?",
    options: [
      { id: "a", text: "The Azure pricing calculator, then Azure Cost Management budgets" },
      { id: "b", text: "Azure Cost Management budgets for the estimate, then Cost Analysis for budget alerts" },
      { id: "c", text: "The pricing calculator for the estimate, then Cost Analysis without a budget for threshold alerts" },
      { id: "d", text: "Azure Advisor cost recommendations for the estimate, then a pricing calculator to alert on actual spend" }
    ],
    correctAnswer: "a",
    explanation:
      "The Azure pricing calculator can estimate costs for a planned configuration. Azure Cost Management budgets let teams set budget amounts and configure alerts based on actual or forecasted costs; alerts are notifications tied to configured thresholds and are not a guarantee of exact spend at delivery. The other pairs do not provide both pre-deployment cost estimation and budget monitoring."
  },
  {
    id: 12,
    domain: "Azure Management and Governance",
    topic: "Monitoring Tools",
    objective: "Describe Azure Monitor and Azure Monitor alerts",
    text: "An operations team wants to collect metrics and logs from Azure resources and create an alert when a web app's CPU usage stays high. Which service is designed for this?",
    options: [
      { id: "a", text: "Azure Advisor" },
      { id: "b", text: "Azure Service Health" },
      { id: "c", text: "Azure Monitor" },
      { id: "d", text: "Azure Resource Health" }
    ],
    correctAnswer: "c",
    explanation:
      "Azure Monitor is the broad monitoring service for collecting and analyzing resource metrics and logs and evaluating configured alert rules. The relevant data sources, diagnostic settings, and alert rule might need to be configured. Advisor gives recommendations, Service Health reports Azure service issues and maintenance, and Resource Health reports the status of individual resources."
  },
  {
    id: 13,
    domain: "Cloud Concepts",
    topic: "Cloud Computing and Consumption",
    objective: "Define cloud computing and describe the consumption-based model",
    text: "Which description best combines cloud computing with its consumption-based model?",
    options: [
      { id: "a", text: "Using computing resources delivered over a network and paying according to measured usage" },
      { id: "b", text: "Owning fixed-capacity servers and paying the same amount regardless of usage" },
      { id: "c", text: "Using a fixed monthly cloud subscription price for a resource package regardless of measured compute use" },
      { id: "d", text: "Using a service-level agreement to determine which resources are provisioned" }
    ],
    correctAnswer: "a",
    explanation: "Cloud computing delivers computing services over a network, often the internet. In a consumption-based model, charges are based on measured resource use rather than solely on an upfront purchase of fixed capacity. Actual charges depend on the services, usage, and pricing terms."
  },
  {
    id: 14,
    domain: "Cloud Concepts",
    topic: "Cloud Pricing Models",
    objective: "Compare cloud pricing models",
    text: "A company has predictable compute usage and is comparing pay-as-you-go pricing with a reservation that requires a commitment for a set term. What is the main tradeoff it should evaluate?",
    options: [
      { id: "a", text: "Whether predictable eligible usage justifies the term commitment and its reduced flexibility" },
      { id: "b", text: "Whether the reservation removes charges for every Azure service used by the company" },
      { id: "c", text: "Whether pay-as-you-go requires the company to own physical Azure servers" },
      { id: "d", text: "Whether a reservation can be applied to any service regardless of its terms" }
    ],
    correctAnswer: "a",
    explanation: "A reservation is a commitment-based option for eligible usage and can offer a lower rate than pay-as-you-go, subject to its terms. The company should compare its expected usage and commitment details because the reservation does not cover every service or charge and can reduce flexibility."
  },
  {
    id: 15,
    domain: "Cloud Concepts",
    topic: "Public and Private Cloud Use Cases",
    objective: "Identify an appropriate use case for a private cloud",
    text: "A company needs cloud infrastructure dedicated to its organization. The infrastructure can be hosted in its own facility or by a provider. Which deployment model best matches this requirement?",
    options: [
      { id: "a", text: "Public cloud, where provider infrastructure is shared among customers" },
      { id: "b", text: "Private cloud, dedicated to a single organization" },
      { id: "c", text: "Hybrid cloud, combining private infrastructure with public cloud services" },
      { id: "d", text: "Multicloud, using public cloud services from multiple providers" }
    ],
    correctAnswer: "b",
    explanation: "A private cloud is dedicated to a single organization and can be hosted on-premises or by a provider. Public cloud uses provider infrastructure shared among customers. Hybrid cloud combines private/on-premises resources with public cloud, while multicloud uses services from multiple cloud providers."
  },
  {
    id: 16,
    domain: "Cloud Concepts",
    topic: "Cloud Benefits",
    objective: "Distinguish high availability from scalability",
    text: "An architect wants a service to remain accessible when a component fails and to add capacity as demand grows. Which pair of cloud benefits is most directly relevant?",
    options: [
      { id: "a", text: "High availability and scalability" },
      { id: "b", text: "Reliability and predictability" },
      { id: "c", text: "Reliability and elasticity" },
      { id: "d", text: "Manageability and consumption-based pricing" }
    ],
    correctAnswer: "a",
    explanation: "High availability aims to keep a service accessible, including through designs that reduce the impact of component failures. Scalability is the ability to handle increased workload by adding capacity. Elasticity more specifically describes dynamically matching capacity to changing demand."
  },
  {
    id: 17,
    domain: "Cloud Concepts",
    topic: "SaaS Use Case",
    objective: "Identify an appropriate use case for SaaS",
    text: "A small business wants staff to use a complete, provider-hosted email application without operating its own servers or building the application. Which service type best fits?",
    options: [
      { id: "a", text: "IaaS, where the business would provision and manage a virtual machine for email" },
      { id: "b", text: "PaaS, where the business would deploy and maintain its own email application code" },
      { id: "c", text: "SaaS, where staff use a complete provider-hosted email application" },
      { id: "d", text: "A private cloud hosting model, which describes deployment infrastructure rather than the email application's service type" }
    ],
    correctAnswer: "c",
    explanation: "SaaS provides a complete application for users to consume. The provider manages the underlying service infrastructure and application platform, while the customer still manages aspects such as user access and data use. IaaS and PaaS offer different levels of customer control and management."
  },
  {
    id: 18,
    domain: "Azure Architecture and Services",
    topic: "Sovereign Regions",
    objective: "Recognize the purpose of Azure sovereign regions",
    text: "A government organization must evaluate Azure environments designed for a specific national or governmental community, with distinct compliance requirements. Which type of Azure region should it investigate?",
    options: [
      { id: "a", text: "A sovereign region" },
      { id: "b", text: "A general Azure region selected only for proximity" },
      { id: "c", text: "A region pair selected for disaster recovery" },
      { id: "d", text: "An availability zone within a region" }
    ],
    correctAnswer: "a",
    explanation: "Some Azure regions belong to sovereign cloud geographies for customers with stringent data-residency or regulatory requirements. Available services and features can differ from public Azure regions, so the organization must verify that a particular region meets its obligations."
  },
  {
    id: 19,
    domain: "Azure Architecture and Services",
    topic: "Subscriptions and Resource Hierarchy",
    objective: "Describe the role of an Azure subscription",
    text: "An administrator needs a container that provides a management and billing boundary for Azure resource groups and resources. Which scope fits this need?",
    options: [
      { id: "a", text: "A management group" },
      { id: "b", text: "A subscription" },
      { id: "c", text: "A resource group" },
      { id: "d", text: "An Azure region" }
    ],
    correctAnswer: "b",
    explanation: "An Azure subscription is a management and billing boundary that contains resource groups and resources. Management groups organize subscriptions above them; resource groups organize resources within a subscription. Billing details depend on the organization's agreement and billing account."
  },
  {
    id: 20,
    domain: "Azure Architecture and Services",
    topic: "Compute Types",
    objective: "Describe the control provided by Azure virtual machines",
    text: "A team has a legacy application that requires a customized guest operating system and control over installed software. Which compute choice gives the team the most direct control over that operating system?",
    options: [
      { id: "a", text: "Azure Virtual Machines" },
      { id: "b", text: "Azure Container Instances" },
      { id: "c", text: "Azure Functions" },
      { id: "d", text: "Azure App Service" }
    ],
    correctAnswer: "a",
    explanation: "Azure Virtual Machines provide virtualized computing where the customer manages the guest operating system and installed software. Azure Container Instances runs containerized workloads, Azure Functions runs event-driven code, and Azure App Service provides managed application hosting; these options don't provide the same guest operating system control as a VM."
  },
  {
    id: 21,
    domain: "Azure Architecture and Services",
    topic: "VM Scale Sets and Application Hosting",
    objective: "Describe Azure Virtual Machine Scale Sets",
    text: "An online service runs on multiple identical virtual machines and needs to scale the number of VM instances as demand changes. Which Azure option is designed to manage a group of load-balanced VMs?",
    options: [
      { id: "a", text: "Azure Virtual Machine Scale Sets" },
      { id: "b", text: "Availability sets, which distribute VMs across fault and update domains" },
      { id: "c", text: "Azure Virtual Desktop, which provides virtual desktop infrastructure" },
      { id: "d", text: "A single Azure virtual machine" }
    ],
    correctAnswer: "a",
    explanation: "Virtual Machine Scale Sets let you create and manage a group of load-balanced VMs and can support scaling the instance count. The scaling behavior depends on configuration and workload. Availability sets distribute VMs across fault and update domains, Azure Virtual Desktop provides virtual desktop infrastructure, and a single VM doesn't provide scale-set management."
  },
  {
    id: 22,
    domain: "Azure Architecture and Services",
    topic: "Subnets",
    objective: "Describe the purpose of subnets in an Azure virtual network",
    text: "An organization wants to divide an Azure virtual network address space into smaller network segments for different application tiers. Which feature provides those subdivisions?",
    options: [
      { id: "a", text: "Subnets" },
      { id: "b", text: "Virtual network peering" },
      { id: "c", text: "A network security group" },
      { id: "d", text: "An Azure VPN Gateway" }
    ],
    correctAnswer: "a",
    explanation: "Subnets divide a virtual network's address space into smaller segments where resources can be organized and network rules applied. Subnets are part of virtual network design; they are not the same as resource groups, management groups, or physical availability zones."
  },
  {
    id: 23,
    domain: "Azure Architecture and Services",
    topic: "Private Endpoints",
    objective: "Describe the purpose of a private endpoint",
    text: "A company wants a private IP address in its virtual network for connecting to a supported Azure service, instead of reaching that service through its public endpoint. Which feature should it consider?",
    options: [
      { id: "a", text: "A private endpoint" },
      { id: "b", text: "A public endpoint" },
      { id: "c", text: "An Azure VPN Gateway" },
      { id: "d", text: "An ExpressRoute circuit" }
    ],
    correctAnswer: "a",
    explanation: "A private endpoint is a network interface with a private IP from your virtual network that connects to a supported Private Link service. A public endpoint uses public network addressing; VPN Gateway and ExpressRoute provide network connectivity options, but neither creates the service's private endpoint. DNS configuration and access controls still matter."
  },
  {
    id: 24,
    domain: "Azure Architecture and Services",
    topic: "Azure Storage Services",
    objective: "Compare Azure Storage services and identify appropriate use cases",
    text: "A team needs a managed file share that can be mounted by multiple servers using familiar file-sharing protocols. Which Azure Storage service is the best fit?",
    options: [
      { id: "a", text: "Azure Files" },
      { id: "b", text: "Azure Blob Storage" },
      { id: "c", text: "Azure Queue Storage" },
      { id: "d", text: "Azure Table Storage" }
    ],
    correctAnswer: "a",
    explanation: "Azure Files provides managed file shares accessible through supported file-sharing protocols. Blob Storage is object storage, Queue Storage holds messages, and Table Storage is a NoSQL key-attribute store. Exact protocol support depends on the share configuration and platform."
  },
  {
    id: 25,
    domain: "Azure Architecture and Services",
    topic: "Blob Access Tiers",
    objective: "Describe Azure Storage access tiers",
    text: "A company stores old records that are rarely accessed and can tolerate hours for retrieval when needed. Which Blob Storage tier is designed for this usage pattern?",
    options: [
      { id: "a", text: "Hot" },
      { id: "b", text: "Cool" },
      { id: "c", text: "Cold" },
      { id: "d", text: "Archive" }
    ],
    correctAnswer: "d",
    explanation: "The Archive tier is an offline tier intended for rarely accessed blob data with flexible retrieval latency, typically on the order of hours. Retrieval requires rehydration and can incur costs; it is not suited to data that needs immediate online access."
  },
  {
    id: 26,
    domain: "Azure Architecture and Services",
    topic: "Storage Redundancy",
    objective: "Distinguish zone-redundant storage from other Azure Storage redundancy options",
    text: "A workload needs storage data replicated across availability zones in its primary Azure region to improve resilience to a zone failure. Which redundancy option matches this goal?",
    options: [
      { id: "a", text: "Locally redundant storage (LRS), which replicates within one physical datacenter" },
      { id: "b", text: "Zone-redundant storage (ZRS), which replicates across zones in the primary region" },
      { id: "c", text: "Geo-redundant storage (GRS), which replicates to a secondary region" },
      { id: "d", text: "Read-access geo-redundant storage (RA-GRS), which permits reads from the secondary region" }
    ],
    correctAnswer: "b",
    explanation: "ZRS synchronously replicates supported storage data across availability zones in the primary region. Availability and service support vary by region and storage type; ZRS is a redundancy choice and does not by itself guarantee an application continues without interruption."
  },
  {
    id: 27,
    domain: "Azure Architecture and Services",
    topic: "Conditional Access",
    objective: "Describe how Microsoft Entra Conditional Access applies sign-in conditions",
    text: "An administrator wants a policy that requires multifactor authentication when users sign in from an untrusted location. Which Azure identity capability can evaluate sign-in conditions and apply that requirement?",
    options: [
      { id: "a", text: "Microsoft Entra Conditional Access" },
      { id: "b", text: "Microsoft Entra multifactor authentication by itself, without a sign-in policy" },
      { id: "c", text: "Azure role-based access control (RBAC), which assigns permissions to Azure resources" },
      { id: "d", text: "Microsoft Entra passwordless authentication methods" }
    ],
    correctAnswer: "a",
    explanation: "Conditional Access evaluates sign-in signals and applies configured access decisions, such as requiring MFA under specified conditions. The outcome depends on policies, licensing, and tenant configuration. MFA methods provide an authentication factor, passwordless methods provide sign-in methods, and RBAC governs authorization to Azure resources rather than evaluating sign-in location conditions."
  },
  {
    id: 28,
    domain: "Azure Management and Governance",
    topic: "Azure Cost Factors",
    objective: "Identify how usage, location, and outbound data transfer can affect Azure costs",
    text: "A team moved the same workload to a region with different service rates and began transferring more data out of Azure. Which cost factors should it compare to explain a change in charges?",
    options: [
      { id: "a", text: "The service usage, applicable rates for each region, and outbound data transfer" },
      { id: "b", text: "Only the resource tags and management group names" },
      { id: "c", text: "Only the number of availability zones in each region" },
      { id: "d", text: "Only the number of users assigned Azure RBAC roles" }
    ],
    correctAnswer: "a",
    explanation: "Azure costs can depend on the selected services, resource usage, location, and data transfer. Cost Management tools can help analyze charges and budgets, but the exact bill depends on current rates, agreements, and workload details. Tags help organize costs but are not themselves a usage charge."
  },
  {
    id: 29,
    domain: "Azure Management and Governance",
    topic: "Azure Policy, Locks, and RBAC",
    objective: "Describe Azure Policy and distinguish governance controls from access control",
    text: "A company wants Azure to reject deployments of resources in regions outside its approved list, while permitting deployments in allowed regions. Which control should it assign with an effect that blocks noncompliant deployments?",
    options: [
      { id: "a", text: "An Azure Policy allowed-locations rule with the Deny effect" },
      { id: "b", text: "A CanNotDelete resource lock applied to the subscription" },
      { id: "c", text: "An RBAC role that permits deployment actions" },
      { id: "d", text: "An Azure Monitor alert for deployments in unapproved regions" }
    ],
    correctAnswer: "a",
    explanation: "Azure Policy evaluates resource properties against assigned rules. An allowed-locations policy using the Deny effect blocks noncompliant create or update requests while allowing compliant locations. RBAC controls who may perform actions, locks protect resources from specified operations, and Monitor alerts report conditions rather than enforcing this deployment rule."
  },
  {
    id: 30,
    domain: "Azure Management and Governance",
    topic: "Microsoft Purview",
    objective: "Describe the purpose of Microsoft Purview in Azure",
    text: "A data governance team wants to scan supported data sources, capture metadata, and make data assets discoverable in a catalog. Which service should it investigate?",
    options: [
      { id: "a", text: "Microsoft Purview" },
      { id: "b", text: "Azure Policy, which evaluates Azure resource properties against organizational rules" },
      { id: "c", text: "Microsoft Defender for Cloud, which provides security posture and threat protection capabilities" },
      { id: "d", text: "Azure Monitor, which collects and analyzes resource telemetry" }
    ],
    correctAnswer: "a",
    explanation: "Microsoft Purview data governance capabilities can scan supported sources for metadata and make data assets discoverable through catalog experiences. Scanning, source support, and available governance features depend on configuration and the Purview solution. Policy governs Azure resources, Defender for Cloud focuses on cloud security posture and protection, and Monitor analyzes telemetry."
  },
  {
    id: 31,
    domain: "Azure Management and Governance",
    topic: "Azure Command-Line Tools",
    objective: "Describe the purpose of Azure Cloud Shell",
    text: "An administrator using a browser wants an interactive shell with Azure tools available without installing the command-line tools on the local computer. Which option best fits?",
    options: [
      { id: "a", text: "Azure Cloud Shell, which provides a browser-accessible shell with Azure CLI and Azure PowerShell" },
      { id: "b", text: "Azure CLI installed locally, which requires a local command-line environment" },
      { id: "c", text: "Azure PowerShell installed locally, which requires a local PowerShell environment" },
      { id: "d", text: "The Azure portal ARM template editor, which defines resources but isn't an interactive terminal" }
    ],
    correctAnswer: "a",
    explanation: "Azure Cloud Shell is a browser-accessible shell for managing Azure resources and provides Azure CLI and Azure PowerShell environments. The portal is the browser-based management interface; Cloud Shell is the interactive command-line environment available from it."
  },
  {
    id: 32,
    domain: "Azure Management and Governance",
    topic: "Azure Arc",
    objective: "Describe how Azure Arc extends Azure management to eligible non-Azure servers",
    text: "An organization wants an eligible server to remain in its datacenter while appearing in Azure Resource Manager for centralized inventory and management. Which service is designed for this?",
    options: [
      { id: "a", text: "Azure Arc" },
      { id: "b", text: "Azure Migrate, which assesses and migrates workloads to Azure" },
      { id: "c", text: "An ARM template, which defines Azure resource deployments" },
      { id: "d", text: "Azure Monitor, which collects and analyzes telemetry" }
    ],
    correctAnswer: "a",
    explanation: "Azure Arc can project eligible on-premises or other non-Azure servers into Azure Resource Manager for centralized inventory and management while the servers remain where they are. Azure Migrate supports assessment and migration, ARM templates define Azure deployments, and Azure Monitor analyzes telemetry rather than onboarding servers into the management plane."
  },
  {
    id: 33,
    domain: "Azure Management and Governance",
    topic: "Azure Service Health",
    objective: "Describe the purpose of Azure Service Health",
    text: "An administrator wants notifications about Azure service incidents and planned maintenance that could affect the regions and services their organization uses. Which service should they consult?",
    options: [
      { id: "a", text: "Azure Advisor, which recommends ways to improve resource deployments" },
      { id: "b", text: "Azure Service Health, which provides personalized service issue and maintenance information" },
      { id: "c", text: "Azure Monitor, which collects and analyzes telemetry from resources" },
      { id: "d", text: "Azure Resource Health, which reports the health of individual resources" }
    ],
    correctAnswer: "b",
    explanation: "Azure Service Health provides a personalized view of Azure service issues, planned maintenance, and health advisories relevant to services and regions an organization uses. Advisor gives deployment recommendations; Azure Monitor analyzes telemetry; Resource Health reports the health of individual resources."
  },
  {
    id: 34,
    domain: "Azure Management and Governance",
    topic: "Log Analytics",
    objective: "Describe Log Analytics as part of Azure Monitor",
    text: "An analyst wants to query collected log data across Azure resources to investigate a pattern over the past week. Which Azure Monitor capability is designed for interactive log queries?",
    options: [
      { id: "a", text: "Log Analytics" },
      { id: "b", text: "Application Insights, which focuses on application telemetry" },
      { id: "c", text: "Azure Monitor metrics, which explores numeric performance measurements" },
      { id: "d", text: "Azure Service Health, which reports service incidents and planned maintenance" }
    ],
    correctAnswer: "a",
    explanation: "Log Analytics provides a workspace and query experience for analyzing collected log data in Azure Monitor. The data must be sent to an appropriate workspace and retained according to configuration; it does not automatically contain every resource log."
  },
  {
    id: 35,
    domain: "Azure Management and Governance",
    topic: "Application Insights",
    objective: "Describe Azure Monitor Application Insights",
    text: "A development team wants telemetry about a web application's requests, failures, and performance to help diagnose issues in the running application. Which tool is the best fit?",
    options: [
      { id: "a", text: "Application Insights" },
      { id: "b", text: "Log Analytics, which queries collected log records" },
      { id: "c", text: "Azure Service Health, which reports service incidents and planned maintenance" },
      { id: "d", text: "Azure Advisor, which recommends deployment improvements" }
    ],
    correctAnswer: "a",
    explanation: "Application Insights is an application performance monitoring capability in Azure Monitor for collecting and analyzing application telemetry. Instrumentation and configuration affect which telemetry is available; it does not replace platform service health reporting."
  },
  {
    id: 36,
    domain: "Cloud Concepts",
    topic: "Predictability",
    objective: "Describe the benefit of predictability in the cloud",
    text: "A company wants to use historical usage data and forecasting tools to estimate future cloud spending and resource needs. Which cloud benefit most directly describes gaining insight into expected performance and costs?",
    options: [
      { id: "a", text: "Predictability" },
      { id: "b", text: "Scalability" },
      { id: "c", text: "Reliability" },
      { id: "d", text: "High availability" }
    ],
    correctAnswer: "a",
    explanation: "Predictability is the ability to estimate expected performance and costs using available information such as historical usage and forecasting. These estimates are not guarantees. Scalability concerns handling increased workload by adding capacity; reliability and availability concern dependable service operation."
  }
];
