# CloudWise AZ-900 Question-Bank Audit

**Audit date:** 2026-10-21
**Scope:** Read-only content and source audit of the 36 records currently in src/data/questions.js.
**Disposition:** No application files were changed for this audit.

## 1. Audit scope and methodology

I read the complete current question bank, the bank validator in src/main.js, and README.md. The validator checks required display fields, option structure, unique question IDs and option IDs, and that the answer key names an option. The application uses IDs when it records attempts and resolves revision questions; therefore, all findings below use the existing IDs.

I compared each question’s stem, options, key, explanation, topic, and objective metadata with the official AZ-900 study guide. I used the most specific listed study-guide objective that the question genuinely assesses. A term in an explanation or distractor does not count as meaningful coverage. I checked service behavior against Microsoft Learn pages listed below. I did not execute tests or the build; this is a content audit and only this report was created.

“Correct” in the answer-key column means the key is the best-supported answer in the stated scenario. “Ambiguous” means another option has a material claim to being correct, not merely that the distractor is plausible. “Partially covered” is not a claim that the whole official objective is mastered.

## 2. Sources consulted and verification limitations

### Primary exam-scope source

- [Study guide for Exam AZ-900: Microsoft Azure Fundamentals](https://learn.microsoft.com/en-us/credentials/certifications/resources/study-guides/az-900) — Microsoft lists “Skills measured as of July 20, 2026.” The guide says its bullets illustrate how skills are assessed and that related topics may also appear. The published domain ranges are Cloud Concepts 25–30%, Azure Architecture and Services 35–40%, and Azure Management and Governance 30–35%.

### Microsoft Learn technical sources examined

- [Azure regions overview](https://learn.microsoft.com/en-us/azure/reliability/regions-overview) — regional geography/data-residency boundaries and the fact that some regions belong to sovereign cloud geographies; relevant to Q18.
- [Availability zones overview](https://learn.microsoft.com/en-us/azure/availability-zones/az-overview) — zones are separated groups of datacenters within a region, with independent infrastructure; multi-zone use/configuration varies by service; relevant to Q7 and Q26.
- [Azure Resource Manager overview](https://learn.microsoft.com/en-us/azure/azure-resource-manager/management/overview) — resource groups, scope hierarchy, tags, and ARM templates; relevant to Q2, Q3, Q8, Q19, and Q32.
- [Management groups overview](https://learn.microsoft.com/en-us/azure/governance/management-groups/overview) — management groups provide governance scope above subscriptions; relevant to Q8.
- [Azure Virtual Machines overview](https://learn.microsoft.com/en-us/azure/virtual-machines/overview) — VMs provide control of the computing environment and customers maintain guest OS/software; relevant to Q4 and Q20.
- [Virtual Machine Scale Sets overview](https://learn.microsoft.com/en-us/azure/virtual-machine-scale-sets/overview) — scale sets manage groups of load-balanced VMs and can scale instance counts; relevant to Q21.
- [Azure Functions overview](https://learn.microsoft.com/en-us/azure/azure-functions/functions-overview) — event-driven triggers include processing blob uploads; relevant to Q9.
- [Azure Files overview](https://learn.microsoft.com/en-us/azure/storage/files/storage-files-introduction) — managed shares, SMB/NFS protocols, concurrent mounts; relevant to Q24.
- [Blob access tiers](https://learn.microsoft.com/en-us/azure/storage/blobs/access-tiers-overview) — Archive is offline with flexible latency on the order of hours; relevant to Q25.
- [Azure Storage redundancy](https://learn.microsoft.com/en-us/azure/storage/common/storage-redundancy) — ZRS synchronously copies across three or more availability zones in the primary region; relevant to Q26.
- [Private endpoint overview](https://learn.microsoft.com/en-us/azure/private-link/private-endpoint-overview) — private endpoints use a private IP from a virtual network to connect to a Private Link service; relevant to Q23.
- [Microsoft Entra Conditional Access overview](https://learn.microsoft.com/en-us/entra/identity/conditional-access/overview) — sign-in signals can drive policies that require MFA; relevant to Q27.
- [Azure Policy overview](https://learn.microsoft.com/en-us/azure/governance/policy/overview) and [Deny effect](https://learn.microsoft.com/en-us/azure/governance/policy/concepts/effect-deny) — policy evaluates resources and Deny blocks matching create/update requests; relevant to Q29.
- [Microsoft Purview data governance overview](https://learn.microsoft.com/en-us/purview/data-governance-overview) — Data Map scans assets for metadata and Unified Catalog makes scanned data searchable; relevant to Q30.
- [Azure Cloud Shell overview](https://learn.microsoft.com/en-us/azure/cloud-shell/overview) — browser-accessible, authenticated shell with Azure tools; relevant to Q31.
- [Azure Arc overview](https://learn.microsoft.com/en-us/azure/azure-arc/overview) — projects eligible non-Azure/on-premises resources into Azure Resource Manager; relevant to Q32.
- [Azure Service Health overview](https://learn.microsoft.com/en-us/azure/service-health/overview) — personalized service issue/maintenance information and configurable Service Health alerts; relevant to Q33.
- [Azure Monitor overview](https://learn.microsoft.com/en-us/azure/azure-monitor/fundamentals/overview) — metrics, logs, and Application Insights; relevant to Q12, Q34, and Q35.
- [Log Analytics overview](https://learn.microsoft.com/en-us/azure/azure-monitor/logs/log-analytics-overview) — queries against data in Azure Monitor Logs; relevant to Q34.
- [Application Insights overview](https://learn.microsoft.com/en-us/azure/azure-monitor/app/app-insights-overview) — application performance monitoring and telemetry; relevant to Q35.
- [Cost Management alerts](https://learn.microsoft.com/en-us/azure/cost-management-billing/costs/cost-mgt-alerts-monitor-usage-spending), [Cost Analysis](https://learn.microsoft.com/en-us/azure/cost-management-billing/costs/quick-acm-cost-analysis), and [Azure Reservations](https://learn.microsoft.com/en-us/azure/cost-management-billing/reservations/save-compute-costs-reservations) — budgets/alerts, cost analysis, and reservation commitment/discount scope; relevant to Q11 and Q14.
- [Azure resource tags](https://learn.microsoft.com/en-us/azure/azure-resource-manager/management/tag-resources) — tags are key-value metadata and can be used to group billing data; relevant to Q3.

Microsoft Learn confirms the service behaviors cited in the findings. This report does not certify every possible SKU, region, agreement, or tenant configuration. Those can affect service availability, capabilities, and costs. The guide is the scope authority; the sample bank is not treated as a substitute for it.

## 3. Overall assessment

**Overall decision: needs targeted corrections before treating the bank as a polished learning set.** I found no objectively wrong answer key. Q16 has a meaningful stem ambiguity between scalability and elasticity. Q33 should distinguish the Service Health view from alerts that an administrator must configure. Q9 is keyed correctly, but it can more explicitly require the built-in Blob trigger to make Azure Functions uniquely compelling over event-driven container hosting.

The bank is strongest on introductory cloud concepts, selected Azure resource scopes, a few storage scenarios, and monitoring/governance service recognition. Many stems ask which named service fits a short scenario, which is appropriate for beginners but often tests recognition more than application. Explanations are generally useful and several correctly qualify behavior as configuration-dependent. The bank has some overlap in scalability/cloud benefits, cost concepts, and monitoring, but no large set of exact duplicates.

**Audit tally:** 35 answer keys are correct, 1 is ambiguous (Q16), 0 are incorrect, and 0 remain unverified. Explanation verdicts: 35 accurate and 1 incomplete (Q33); none were found misleading or incorrect. Three questions have recommended content refinements: Q16 and Q33 (P1), and Q9 (P2).

The application and README correctly disclaim comprehensive coverage and predictive exam results. Keep that framing. A 36-question practice bank is a learning aid; it cannot establish comprehensive exam coverage or predict an individual’s official result.

## 4. Complete question-by-question audit table

“Official objective” uses the closest applicable wording from the study guide. “Duplication” refers to substantial overlap in the main learning objective, not shared terminology in distractors.

| ID | Existing topic | Intended learning objective | Official study-guide objective | Answer-key verdict | Explanation verdict | Distractor quality | Clarity | Duplication | Coverage status | Recommended action |
|---:|---|---|---|---|---|---|---|---|---|---|
| 1 | Scalability | Distinguish adding capacity for a larger workload from dynamic elasticity | Benefits of high availability and scalability | Correct | Accurate | Plausible nearby cloud benefits | Clear | Some overlap with Q16 | Adequate | Keep |
| 2 | Resource Groups | Identify resource groups as related-resource containers | Describe Azure resources and resource groups | Correct | Accurate | Relevant Azure scopes | Clear | Low | Adequate | Keep |
| 3 | Resource Tags | Use tags to label resources and support cost analysis | Describe the purpose of tags | Correct | Accurate and appropriately qualified | Relevant governance/cost tools | Clear | Related to Q28, distinct purpose | Adequate | Keep |
| 4 | Shared Responsibility | Apply IaaS responsibility to guest OS updates | Describe the shared responsibility model | Correct | Accurate | Plausible responsibility misconceptions | Clear | Low | Partially covered | Keep; broader service-model responsibility remains a gap |
| 5 | Cloud Models | Recognize a connected on-premises/Azure hybrid arrangement | Define cloud models; identify use cases | Correct | Accurate | Public/private/multicloud are plausible contrasts | Clear | Low | Partially covered | Keep |
| 6 | Cloud Service Types | Select PaaS when developers manage code but not OS/web server | Describe PaaS and its use cases | Correct | Accurate | IaaS/SaaS are close alternatives | Clear | Related to Q17, distinct model | Partially covered | Keep |
| 7 | Availability Zones | Use zones to reduce datacenter-failure impact within one region | Describe availability zones | Correct | Accurate; avoids guaranteeing continuity | Strong nearby architecture alternatives | Clear | Some resilience overlap with Q26 | Adequate | Keep |
| 8 | Subscriptions and Management Groups | Choose management group for governance above multiple subscriptions | Describe management groups and hierarchy | Correct | Accurate | All options are plausible governance scopes | Clear | Related to Q19, different scope | Adequate | Keep |
| 9 | Compute Services | Select Functions for code triggered by a Blob Storage upload | Compare compute types; describe serverless | Correct | Accurate | VM/App Service/Container Apps are plausible | Mostly clear | Low | Partially covered | Revise stem to emphasize a native Blob trigger; do not change key |
| 10 | Resource Locks | Protect a VM from deletion with a scoped CanNotDelete lock | Describe resource locks | Correct | Accurate with scope/authorization caveat | Plausible neighboring controls | Clear | Distinct from Q29 | Adequate | Keep |
| 11 | Cost Management | Estimate planned costs, then configure a budget and alerts | Explore pricing calculator; cost management capabilities | Correct | Accurate; appropriately avoids exact-spend promise | Alternatives test tool roles | Clear | Related to Q28, distinct | Adequate | Keep |
| 12 | Monitoring Tools | Identify Monitor for telemetry and configured CPU alerts | Azure Monitor and alerts | Correct | Accurate; says configuration might be needed | Advisor/Service Health/Resource Health are close | Clear | Related to Q33–35, distinct | Adequate | Keep |
| 13 | Cloud Computing and Consumption | Combine network-delivered computing with measured-use pricing | Define cloud computing; consumption-based model | Correct | Accurate | Contrasts fixed-capacity and SLA misconception | Clear | Related to Q14, distinct | Adequate | Keep |
| 14 | Cloud Pricing Models | Evaluate reservation commitment against predictable eligible usage | Compare cloud pricing models | Correct | Accurate and qualified by eligibility/terms | Plausible pricing misconceptions | Clear | Related to Q11, distinct | Partially covered | Keep; pricing comparison is narrow |
| 15 | Public and Private Cloud Use Cases | Identify private cloud from single-organization dedication | Define cloud models; identify use cases | Correct | Accurate | Public/hybrid/multicloud are meaningful contrasts | Clear | Related to Q5, distinct | Partially covered | Keep |
| 16 | Cloud Benefits | Select benefits for access during component failure and adding capacity | Benefits of high availability/scalability; reliability/elasticity distinction | **Ambiguous** | Accurate definitions, but do not cure the stem | Two answer pairs are plausibly relevant | Not sufficiently specific | Overlaps Q1 | Revise | Revise wording to distinguish manual capacity growth from dynamic elasticity and specify availability |
| 17 | SaaS Use Case | Identify a complete provider-hosted email application as SaaS | Describe SaaS and service-type use cases | Correct | Accurate | Service-model alternatives are plausible | Clear | Related to Q6, distinct | Partially covered | Keep |
| 18 | Sovereign Regions | Recognize sovereign-region context for national/regulatory needs | Describe sovereign regions | Correct | Accurate, with availability caveat | Regions, pairs, and zones are plausible contrasts | Clear | Low | Partially covered | Keep; regions and pairs still lack direct coverage |
| 19 | Subscriptions and Resource Hierarchy | Identify subscription as management/billing boundary | Describe subscriptions and hierarchy | Correct | Accurate and qualified on billing detail | Nearby hierarchy scopes | Clear | Related to Q2/Q8 | Adequate | Keep |
| 20 | Compute Types | Choose VM for guest OS and installed-software control | Compare compute types; describe VM options | Correct | Accurate | Containers, Functions, App Service are relevant | Clear | Some overlap with Q4 | Partially covered | Keep |
| 21 | VM Scale Sets and Application Hosting | Identify VM Scale Sets for managing/scaling a group of load-balanced VMs | Describe VM Scale Sets | Correct | Accurate; scaling configuration caveat helps | Availability sets/AVD/single VM are relevant | Clear | Related to Q7, distinct | Adequate | Keep |
| 22 | Subnets | Recognize subnet as a subdivision of VNet address space | Describe virtual networking and subnets | Correct | Accurate | Peering/NSG/VPN are nearby concepts | Clear | Low | Partially covered | Keep; VNet, peering, DNS, VPN Gateway, and ExpressRoute remain gaps |
| 23 | Private Endpoints | Identify private endpoint for private-IP connectivity to supported service | Define public and private endpoints | Correct | Accurate; notes DNS/access controls | Public endpoint/VPN/ExpressRoute are plausible | Clear | Low | Adequate | Keep |
| 24 | Azure Storage Services | Choose Azure Files for a mountable managed file share | Compare Azure Storage services | Correct | Accurate; protocol caveat is useful | Blob/Queue/Table are valid contrasts | Clear | Low | Partially covered | Keep; only one storage use case is tested |
| 25 | Blob Access Tiers | Choose Archive for rarely accessed data tolerating hours of retrieval | Describe storage tiers | Correct | Accurate; useful offline/rehydration/cost note | Hot/Cool/Cold are plausible | Clear | Low | Partially covered | Keep; optional addition of minimum-retention nuance |
| 26 | Storage Redundancy | Select ZRS for zone-spanning replication within primary region | Describe redundancy options | Correct | Accurate and avoids continuity guarantee | LRS/GRS/RA-GRS are strong contrasts | Clear | Related to Q7, distinct service | Adequate | Keep |
| 27 | Conditional Access | Apply MFA conditionally based on sign-in location | Describe Microsoft Entra Conditional Access | Correct | Accurate; policy/configuration caveat | MFA/RBAC/passwordless are plausible | Clear | Low | Partially covered | Keep; other identity/security objectives are not covered |
| 28 | Azure Cost Factors | Identify use, region, and outbound transfer as cost factors | Describe factors that affect costs | Correct | Accurate and appropriately qualified | Irrelevant options are clear, not strong distractors | Clear | Related to Q3/Q11, distinct | Adequate | Optional distractor improvement |
| 29 | Azure Policy, Locks, and RBAC | Use an allowed-locations Deny policy to reject noncompliant deployment | Describe Azure Policy | Correct | Accurate | Locks/RBAC/alerts distinguish enforcement roles | Clear | Related to Q10 | Adequate | Keep |
| 30 | Microsoft Purview | Identify catalog/metadata discovery for supported sources | Describe Microsoft Purview | Correct | Accurate; configuration/source caveat is useful | Policy/Defender/Monitor are nearby platform services | Clear | Low | Adequate | Keep |
| 31 | Azure Command-Line Tools | Recognize browser-accessible Cloud Shell with Azure tools | Describe Cloud Shell, CLI, and PowerShell | Correct | Accurate | Local CLI/PowerShell and portal are plausible | Clear | Low | Partially covered | Keep; CLI and PowerShell roles are not separately tested |
| 32 | Azure Arc | Identify Arc for centralized management of eligible non-Azure servers | Describe Azure Arc | Correct | Accurate | Migrate/ARM template/Monitor are useful contrasts | Clear | Low | Adequate | Keep; IaC and ARM templates remain untested |
| 33 | Azure Service Health | Identify personalized service issue/maintenance information | Describe Azure Service Health | Correct | Incomplete on how notifications are received | Advisor/Monitor/Resource Health are strong contrasts | Mostly clear | Related to Q12/Q34/Q35, distinct | Revise | State that notifications require configured Service Health alerts |
| 34 | Log Analytics | Query collected Azure Monitor log data | Describe Log Analytics | Correct | Accurate; collection/retention caveat is useful | App Insights/metrics/Service Health are plausible | Clear | Related to Q12/Q35, distinct | Adequate | Keep |
| 35 | Application Insights | Select application telemetry/APM for requests, failures, performance | Describe Application Insights | Correct | Accurate; instrumentation/configuration caveat is useful | Log Analytics/Service Health/Advisor are plausible | Clear | Related to Q12/Q34, distinct | Adequate | Keep |
| 36 | Predictability | Identify forecasted performance/cost insight as predictability | Benefits of reliability and predictability | Correct | Accurate; states estimates are not guarantees | Other cloud benefits are plausible | Clear | Related to Q1/Q16, distinct | Adequate | Keep |

## 5. Detailed findings for questions requiring attention

### Q16 — Ambiguous distinction among availability, reliability, scalability, and elasticity

**Issue:** The stem says a service should “remain accessible when a component fails and … add capacity as demand grows.” The keyed pair, high availability and scalability, is reasonable. But the alternate “Reliability and elasticity” is also defensible: reliability is related to continued dependable operation, and capacity added in response to demand can describe elasticity unless the stem distinguishes manual from dynamic adjustment.

**Why it matters:** This item asks for a pair, so a learner can select a conceptually reasonable pair and still be marked wrong. That weakens the intended distinction and may teach that these terms are interchangeable.

**Technical understanding:** The study guide lists high availability and scalability together, and reliability and predictability together as separate benefit objectives. The current Q1 explanation usefully distinguishes scaling capacity from dynamically adding/removing it. A similar distinction is needed here. The guide does not itself define the fine-grained terms, so the review applies ordinary Azure architecture usage rather than treating the objective titles as formal definitions.

**Recommendation:** Keep ID 16 and its intended high-availability/scalability objective. Clarify the scenario so it specifically asks about maintaining service access through component failures and manually increasing capacity to handle a larger workload. That makes elasticity a clearly weaker alternative. Do not change the answer key without new evidence.

**Sources:** [AZ-900 study guide](https://learn.microsoft.com/en-us/credentials/certifications/resources/study-guides/az-900); [Azure availability zones](https://learn.microsoft.com/en-us/azure/availability-zones/az-overview).

### Q33 — Explain that Service Health notifications require configured alerts

**Issue:** The stem asks for notifications about service incidents and maintenance, while the explanation says Service Health provides a personalized view. It does not explain that the notifications are delivered by setting up Service Health alerts.

**Why it matters:** A beginner could infer that selecting the service automatically sends notifications. This is a small but relevant configuration detail, not an incorrect key.

**Technical understanding:** Microsoft describes Service Health as a personalized view of issues and planned maintenance. It says users can receive notifications through preferred channels by setting up Service Health alerts.

**Recommendation:** Preserve ID 33 and key B. Add a short clause that administrators configure Service Health alerts to receive notifications.

**Source:** [Azure Service Health overview](https://learn.microsoft.com/en-us/azure/service-health/overview).

### Q9 — Make Functions’ advantage over event-driven containers explicit

**Issue:** Azure Functions is the best answer because Microsoft documents Blob Storage triggers for uploaded files. Azure Container Apps is also an application-hosting option and can support event-driven workloads, so the distinction currently relies on “best fits” and the explanation’s “built-in function trigger model.”

**Why it matters:** Distractors should be plausible, but they should be clearly wrong for the stated requirement. The stem can make the intended service-specific capability explicit without making the item tricky.

**Technical understanding:** Microsoft documents Functions as event-driven, with integrated triggers including running code when a file is uploaded or changed in Blob Storage. The Functions documentation also lists Container Apps as a possible hosting option for containerized function apps, so container hosting is not categorically incapable of running functions.

**Recommendation:** Preserve ID 9 and key B. Specify that the team wants a native Blob Storage trigger and does not want to package/manage a containerized application. Avoid saying Container Apps cannot respond to events.

**Source:** [Azure Functions overview](https://learn.microsoft.com/en-us/azure/azure-functions/functions-overview).

### Q18 — Sovereign-region rationale is supported, but no guarantee should be inferred

**Issue:** The question asks which region type to investigate and the explanation cautions that service availability differs and compliance obligations must be checked. This is a good qualification. It does not promise that sovereign regions automatically satisfy all requirements.

**Technical understanding:** Microsoft’s regions overview states some regions belong to sovereign cloud geographies, available to customers in areas with stringent data-residency regulations, and notes that services/features can be limited. This supports the key and the explanation’s caution. A specific sovereign environment must still be evaluated against the organization’s actual requirements.

**Recommendation:** Keep ID 18 and key A. Do not generalize this question into legal advice or imply that every sovereign region meets every organization’s requirements.

**Source:** [Azure regions overview](https://learn.microsoft.com/en-us/azure/reliability/regions-overview).

### Q25 — Optional retention-period detail

**Issue:** The Archive answer is right for rarely accessed blobs when hours of retrieval latency is acceptable. The explanation mentions rehydration and possible retrieval costs but omits the current 180-day minimum recommended storage duration.

**Why it matters:** The omission does not make the answer misleading for this beginner scenario. Retention period is useful if the item is intended to compare total storage economics.

**Recommendation:** P2 only. Keep as-is for a recognition-level question, or add the 180-day minimum-retention caveat if cost comparison is later made part of the objective.

**Source:** [Blob access tiers](https://learn.microsoft.com/en-us/azure/storage/blobs/access-tiers-overview).

### Q28 — Distractors are less educational than the stem

**Issue:** The stem and keyed answer correctly identify usage, location/rates, and outbound data transfer as relevant cost factors. The other choices—tags, number of zones, and RBAC user count—are mostly unrelated to a direct Azure usage charge.

**Why it matters:** The keyed answer is still clear, but the item rewards eliminating obviously unrelated options rather than distinguishing plausible cost drivers.

**Recommendation:** P2. In a future content pass, use distractors based on plausible misconceptions such as assuming data transfer is always free, that location never changes price, or that resource tags change the bill.

**Source:** The official guide identifies cost factors as an objective; the reviewed sources in this audit did not include a specific price sheet for every service, region, and agreement. The explanation correctly avoids claiming a universal exact price.

## 6. Official-objective coverage matrix

The current study guide’s objective groups and wording below are from its “Skills measured as of July 20, 2026” section. “Covered” means meaningfully assessed at least once; it does not mean comprehensive mastery.

| Official objective group | Status | Direct questions | Important remaining gaps |
|---|---|---|---|
| Define cloud computing; shared responsibility; cloud models and use cases; consumption-based model; pricing models; serverless | Partially covered | Q4, Q5, Q6, Q9, Q13, Q14, Q15, Q17 | Serverless is only approached through Functions; shared responsibility is only IaaS guest OS; pricing comparison is one reservation scenario; public-cloud use case is not directly tested |
| Benefits: high availability/scalability; reliability/predictability; security/governance; manageability | Partially covered | Q1, Q7, Q16, Q36 | Q16 needs wording clarification; reliability is not directly isolated; security/governance and manageability benefits are not tested |
| IaaS, PaaS, SaaS and use cases | Partially covered | Q4, Q6, Q17, Q20 | No balanced comparison item across all three responsibility boundaries; IaaS appears mainly through OS control/responsibility |
| Regions, region pairs, sovereign regions; zones; datacenters; resources/resource groups; subscriptions; management groups; hierarchy | Partially covered | Q2, Q7, Q8, Q18, Q19 | Sovereign regions are directly tested; region pairs and Azure regions are only distractors/explanatory mentions; datacenters are described in Q7 but not independently assessed; full hierarchy is split across items |
| Compute types; VM options/resources; application hosting; virtual networking; endpoints | Partially covered | Q7, Q9, Q20, Q21, Q22, Q23 | Containers are weakly covered as distractors; availability sets and Virtual Desktop are distractors only; VM resources are absent; web apps/hosting comparison is absent; VNet purpose, peering, Azure DNS, VPN Gateway, ExpressRoute are absent |
| Azure Storage services, tiers, redundancy, account options/types, file-moving tools, migration options | Partially covered | Q24, Q25, Q26, Q32 | Only Azure Files is directly compared; only Archive and ZRS are assessed; storage account options/types, AzCopy, Storage Explorer, File Sync, Azure Migrate, and Data Box are not meaningfully tested (Azure Migrate appears only as a distractor in Q32) |
| Directory services, authentication, external identities, Conditional Access, RBAC, Zero Trust, defense-in-depth, Defender for Cloud | Partially covered | Q10, Q27, Q29 | Conditional Access is direct; RBAC/locks/policy are mainly distinguished in other objectives. Entra ID/Domain Services, SSO/MFA/passwordless, external identities, Zero Trust, defense-in-depth, and Defender for Cloud are not directly assessed |
| Cost factors, pricing calculator, Cost Management, tags | Covered, but narrow | Q3, Q11, Q28 | Core concepts are present; broader Cost Analysis, forecasts, and agreement-specific pricing behavior are not tested |
| Purview, Policy, resource locks | Covered | Q10, Q29, Q30 | One item each; these are introductory recognition/selection scenarios |
| Portal, Cloud Shell, CLI, PowerShell; Arc; IaC; ARM/templates | Partially covered | Q31, Q32 | Cloud Shell and Arc are tested; portal is a distractor, CLI/PowerShell are bundled with Cloud Shell rather than independently compared; IaC and ARM templates appear only as distractors |
| Advisor, Service Health, Monitor, Log Analytics, alerts, Application Insights | Partially covered | Q12, Q33, Q34, Q35 | Service Health, Monitor, Log Analytics, alerts, and Application Insights are present; Advisor appears only as a distractor and is not tested |

## 7. Domain distribution and coverage analysis

Current application distribution:

| Application domain | Questions | Share of 36 | Study-guide exam range |
|---|---:|---:|---:|
| Cloud Concepts | 10 | 27.8% | 25–30% |
| Azure Architecture and Services | 14 | 38.9% | 35–40% |
| Azure Management and Governance | 12 | 33.3% | 30–35% |

The counts happen to fall within Microsoft’s published weight ranges. That does not make this sample representative of the official exam’s exact question mix: Microsoft publishes ranges for skill weightings, not an exact per-exam count. Topic-level coverage remains uneven, especially networking, identity/security, storage migration, and Azure management/deployment tools.

The bank has clusters around cloud benefits (Q1/Q16/Q36), cost (Q3/Q11/Q28), and monitoring (Q12/Q33–35). These are not exact duplicates: the items target different subskills, but the next content plan should avoid adding more recognition-only questions in these clusters before filling absent objectives.

## 8. P0, P1, and P2 findings

### P0 — Must fix

- **None identified.** No confirmed wrong answer key or materially false service behavior was found.

### P1 — Should fix

- **Q16:** Ambiguous benefit pair. Clarify the workload/capacity behavior so scalability and elasticity do not both fit.
- **Q33:** Add that Service Health notifications require configured alerts.
- **Coverage gaps:** No direct coverage for most networking services (peering, DNS, VPN Gateway, ExpressRoute), the broader identity/security objectives, storage migration/file movement, VM resources, Azure Advisor, or infrastructure as code/ARM templates. These are content-planning gaps, not reasons to change existing keys.

### P2 — Optional improvement

- **Q9:** Explicitly require a native Blob Storage trigger to distinguish Functions from container-hosting alternatives.
- **Q25:** Add Archive’s minimum-retention nuance only if retention economics are in scope.
- **Q28:** Replace unrelated distractors with plausible but incorrect cost misconceptions.
- **Q1/Q16/Q36:** Keep the distinct learning goals, but avoid repeating broad cloud-benefit recognition in future additions.
- **Q12/Q33–35:** Retain the useful monitoring-service distinctions; future questions should test a specific scenario rather than repeat name-to-description matching.

## 9. Recommended revision order

1. Clarify Q16 while preserving its ID and intended high-availability/scalability objective.
2. Clarify Q33 alert configuration while preserving its ID and Service Health key.
3. Sharpen Q9’s Blob-trigger requirement if the item is revised.
4. When planning a future expansion, prioritize direct assessment of networking services, identity/security, storage movement/migration, IaC/ARM templates, Azure Advisor, and cloud reliability/manageability/security benefits.
5. Consider Q28 distractor refinement and Q25 retention detail only after the P1 work.

Do not renumber or reuse IDs in a later edit; saved practice history may refer to them.

## 10. Final decision

**Needs targeted corrections.** The current bank is a useful beginner learning aid with no confirmed answer-key errors and generally sound explanations. Resolve Q16’s ambiguity and add the Q33 alert-configuration nuance before presenting the content as polished. Its coverage remains incomplete relative to the current official study guide, particularly in networking, identity/security, storage migration, and management/deployment tools. Keep the existing disclaimer that it is not comprehensive and does not predict exam results.
