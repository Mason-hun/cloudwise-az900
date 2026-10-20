
export const questions = [
  {
    id: 1,
    domain: "Cloud Concepts",
    topic: "Scalability",
    text: "A company needs to increase or decrease its cloud resources as demand changes. Which cloud benefit does this describe?",
    options: [
      { id: "a", text: "High availability" },
      { id: "b", text: "Scalability" },
      { id: "c", text: "Disaster recovery" },
      { id: "d", text: "Fault tolerance" }
    ],
    correctAnswer: "b",
    explanation:
      "Scalability is the ability to adjust resources to meet changing demand. High availability focuses on keeping services accessible, disaster recovery focuses on recovering after disruptive events, and fault tolerance focuses on continuing operation when a component fails."
  },
  {
    id: 2,
    domain: "Azure Architecture and Services",
    topic: "Resource Groups",
    text: "A team wants to manage several Azure resources together as one logical unit. Which Azure feature is designed for this purpose?",
    options: [
      { id: "a", text: "Availability zones" },
      { id: "b", text: "Azure regions" },
      { id: "c", text: "Resource groups" },
      { id: "d", text: "Microsoft Entra ID users" }
    ],
    correctAnswer: "c",
    explanation:
      "Resource groups are logical containers for related Azure resources. They help organize and manage those resources together. Regions are geographic areas, availability zones are physically separate locations within supported regions, and Microsoft Entra ID manages identity and access."
  },
  {
    id: 3,
    domain: "Azure Management and Governance",
    topic: "Resource Tags",
    text: "An organization wants to label Azure resources by department so it can organize resources and analyze costs. Which feature can help?",
    options: [
      { id: "a", text: "Resource tags" },
      { id: "b", text: "Availability sets" },
      { id: "c", text: "Virtual network peering" },
      { id: "d", text: "Azure availability zones" }
    ],
    correctAnswer: "a",
    explanation:
      "Tags are name-value pairs that add organizational metadata to Azure resources. They can support filtering, reporting, and cost analysis, although applying tags alone does not automatically enforce budgets or allocate costs perfectly."
  },
  {
    id: 4,
    domain: "Cloud Concepts",
    topic: "Shared Responsibility",
    text: "A company migrates a virtual machine to Azure using infrastructure as a service (IaaS). Who is responsible for installing operating system updates on that virtual machine?",
    options: [
      { id: "a", text: "Microsoft only, because Azure manages all software in the cloud" },
      { id: "b", text: "The customer, because IaaS still leaves operating system management with the customer" },
      { id: "c", text: "The local internet service provider that connects users to Azure" },
      { id: "d", text: "An Azure region pair, which automatically patches every virtual machine" }
    ],
    correctAnswer: "b",
    explanation:
      "In the shared responsibility model, Microsoft secures the physical datacenter, host infrastructure, and the hypervisor for IaaS. The customer remains responsible for the guest operating system, updates, application software, and data. Region pairs support disaster recovery planning; they do not take over OS patching for customer virtual machines."
  },
  {
    id: 5,
    domain: "Cloud Concepts",
    topic: "Cloud Models",
    text: "A hospital must keep some patient systems in its own datacenter for regulatory reasons, but it also wants to run analytics workloads in Azure and connect the two environments. Which cloud model is this?",
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
    topic: "Regions and Availability Zones",
    text: "A company wants an Azure application to keep running if one datacenter fails, while remaining in the same geographic region. Which Azure construct is designed for this?",
    options: [
      { id: "a", text: "A single resource group in one datacenter" },
      { id: "b", text: "Availability zones in a region that supports them" },
      { id: "c", text: "Management groups" },
      { id: "d", text: "Resource tags" }
    ],
    correctAnswer: "b",
    explanation:
      "Availability zones are physically separate datacenters within a supported Azure region. Deploying across zones can help an application survive a datacenter-level failure without leaving the region. Resource groups and tags organize resources; they do not provide datacenter isolation. Management groups organize subscriptions for governance."
  },
  {
    id: 8,
    domain: "Azure Architecture and Services",
    topic: "Subscriptions and Management Groups",
    text: "An enterprise has several Azure subscriptions and wants to apply governance policies to all of them from a higher-level scope. Which Azure construct is designed for this?",
    options: [
      { id: "a", text: "Resource groups" },
      { id: "b", text: "Availability zones" },
      { id: "c", text: "Management groups" },
      { id: "d", text: "Azure regions" }
    ],
    correctAnswer: "c",
    explanation:
      "Management groups sit above subscriptions in the Azure hierarchy and can apply policies and access control across many subscriptions. Resource groups contain resources inside a subscription. Regions and availability zones are physical deployment locations, not governance scopes."
  },
  {
    id: 9,
    domain: "Azure Architecture and Services",
    topic: "Compute Services",
    text: "A team needs to run short pieces of code only when a file is uploaded. They do not want to manage servers or keep a virtual machine running between events. Which Azure compute option best fits this scenario?",
    options: [
      { id: "a", text: "Azure Virtual Machines" },
      { id: "b", text: "Azure Functions" },
      { id: "c", text: "Azure Virtual Network" },
      { id: "d", text: "Azure VPN Gateway" }
    ],
    correctAnswer: "b",
    explanation:
      "Azure Functions is a serverless compute service for event-driven code. You do not need to manage servers or keep a virtual machine running between events. Virtual machines require you to manage servers. Azure Virtual Network and Azure VPN Gateway are networking services, not compute hosts for application code."
  },
  {
    id: 10,
    domain: "Azure Management and Governance",
    topic: "Resource Locks",
    text: "An administrator wants to prevent accidental deletion of a production virtual machine, even by users who otherwise have permission to manage it. Which feature should they apply?",
    options: [
      { id: "a", text: "A CanNotDelete resource lock" },
      { id: "b", text: "A resource tag named Production" },
      { id: "c", text: "An availability set" },
      { id: "d", text: "Azure DNS" }
    ],
    correctAnswer: "a",
    explanation:
      "Resource locks can block deletion (CanNotDelete) or block most changes (ReadOnly), including for users who have management permissions, until the lock is removed. Tags add metadata but do not prevent deletion. Availability sets improve VM resiliency within a datacenter. Azure DNS provides name resolution."
  },
  {
    id: 11,
    domain: "Azure Management and Governance",
    topic: "Cost Management",
    text: "A finance team wants to estimate Azure costs before deploying resources, then later create a budget and receive alerts when actual spending approaches a limit. Which pair of tools supports this?",
    options: [
      { id: "a", text: "The Azure pricing calculator, then Azure Cost Management budgets" },
      { id: "b", text: "Azure Service Health, then availability zones" },
      { id: "c", text: "Azure VPN Gateway, then ExpressRoute" },
      { id: "d", text: "Resource locks, then Azure DNS" }
    ],
    correctAnswer: "a",
    explanation:
      "The Azure pricing calculator estimates costs before you deploy. Azure Cost Management, including budgets and cost analysis, helps track actual spend and alert you as costs approach a threshold. Service Health reports Azure platform issues, availability zones improve resiliency, and the other options are networking or governance features rather than cost tools."
  },
  {
    id: 12,
    domain: "Azure Management and Governance",
    topic: "Monitoring Tools",
    text: "An operations team wants to collect metrics and logs from Azure resources and create an alert when a web app's CPU usage stays high. Which service is designed for this?",
    options: [
      { id: "a", text: "Azure Monitor" },
      { id: "b", text: "Azure Policy" },
      { id: "c", text: "Resource locks" },
      { id: "d", text: "Management groups" }
    ],
    correctAnswer: "a",
    explanation:
      "Azure Monitor collects metrics and logs and can raise alerts when conditions you define are met. Azure Policy enforces resource standards, resource locks prevent changes or deletion, and management groups organize subscriptions. Those tools do not collect performance metrics or fire CPU alerts."
  }
];
