
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
  }
];
