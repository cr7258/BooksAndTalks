## 9 月 27 日 周三

### 11:00am

[SIG集群生命周期：Kubespray的新功能 | SIG Cluster Lifecycle: What's New in Kubespray - Kay Yan, DaoCloud](https://kccncosschn2023.sched.com/event/1PTJt/sigzhong-shi-chang-potodaepkubesprayzha-xia-sig-cluster-lifecycle-whats-new-in-kubespray-kay-yan-daocloud?iframe=no&w=100%&sidebar=yes&bg=no)

Kubespray 基于 Ansible 构建，管理 Kubernetes 集群的生命周期（创建，销毁，扩容，升级等等），还可以安装 CNI, Ingress 等组件。

里面提到用 KubeVirt 来创建 VM 进行 CI 测试，Kubevirt 是利用 Kubernetes 管理虚拟机的项目。

Kubean 是基于 [kubespray](https://github.com/kubernetes-sigs/kubespray) 构建的集群生命周期管理工具，用 CRD 声明式的方式来管理。



[使用KubeRay和Kueue在Kubernetes中托管Sailing Ray工作负载 | Sailing Ray Workloads with KubeRay and Kueue in Kubernetes - Jason Hu, Volcano Engine & Kante Yin, DaoCloud](https://kccncosschn2023.sched.com/event/1PTGw/zhi-kuberayrekueuenanokubernetesfa-sailing-raydu-zhe-sailing-ray-workloads-with-kuberay-and-kueue-in-kubernetes-jason-hu-volcano-engine-kante-yin-daocloud?iframe=no&w=100%&sidebar=yes&bg=no)

Kueue 批量 Job 调度 + KubeRray 管理 Ray（统一计算框架）



[不受CNI限制的网络性能加速器，使用eBPF技术 | CNI-Agnostic Network Performance Accelerator with eBPF - Mengxin Liu, Alauda & Yizhou Xu, Intel](https://kccncosschn2023.sched.com/event/1PTG4/cnizha-zha-jie-zhang-xia-fu-jdaelszhi-ebpf-cni-agnostic-network-performance-accelerator-with-ebpf-mengxin-liu-alauda-yizhou-xu-intel?iframe=no&w=100%&sidebar=yes&bg=no)

利用 eBPF bypass TCP/IP 协议栈，可以听听实现原理。里面提到的开源项目很久没有更新了：https://github.com/intel/istio-tcpip-bypass/tree/main 但是看了下代码量很少，可以作为学习 eBPF 的项目。



**[开发、构建并部署使用WebAssembly的轻量级人工智能服务 | Develop, Build & Deploy Lightweight AI Services with WebAssembly - Kinfey Lo, Microsoft; Vivian Hu, Second State; Jianbai Ye](https://kccncosschn2023.sched.com/event/1R598/zhu-ya-zhi-webassemblyzha-si-hao-wa-xia-develop-build-deploy-lightweight-ai-services-with-webassembly-kinfey-lo-microsoft-vivian-hu-second-state-jianbai-ye?iframe=no&w=100%&sidebar=yes&bg=no)**

在这个实践教程中，我们将介绍基于Wasm的人工智能服务的基础知识和架构。参与者将学习如何创建PyTorch和TensorFlow推理函数，以及如何在Rust中扩展大语言模型（如ChatGPT）。我们还将讨论如何使用诸如K8s之类的工具部署人工智能推理函数。



### 11:50am

[controller-runtime每天的新功能--使您的Operator更高效 | What's New on Controller-Runtime of the Day -- Make Your Operator More Efficient - Siyu Wang, Alibaba Cloud](https://kccncosschn2023.sched.com/event/1PTKQ/controller-runtimezha-xia-zha-operatorpan-whats-new-on-controller-runtime-of-the-day-make-your-operator-more-efficient-siyu-wang-alibaba-cloud?iframe=no&w=100%&sidebar=yes&bg=no)

Controller-runtime 新功能：多集群，Cache, ControllerMesh（可以控制控制器的灰度发布）



[Istio 毕业后的下一步 | Next Hop of Istio After Graduation - Zhonghu Xu, Huawei](https://kccncosschn2023.sched.com/event/1PTKi/istio-zha-next-hop-of-istio-after-graduation-zhonghu-xu-huawei?iframe=no&w=100%&sidebar=yes&bg=no)

简单介绍：Ambient Mesh, [支持 1.28 新的 Sidecar Container](https://istio.io/latest/blog/2023/native-sidecars/)，Gateway API 



**[KubeVirt v1.0：从终端用户的角度来看意味着什么 | KubeVirt v1.0: What It Means from an End-User Perspective - Howard Zhang, ARM](https://kccncosschn2023.sched.com/event/1PTKr/kubevirt-v10daepying-guo-zhi-zha-liu-tao-biqu-kubevirt-v10-what-it-means-from-an-end-user-perspective-howard-zhang-arm?iframe=no&w=100%&sidebar=yes&bg=no)**

使用 Kubernetes 管理虚拟机。



[在OpenTelemetry中平衡成本和质量：采样策略的评估 | Balancing Cost and Quality in OpenTelemetry: An Evaluation of Sampling Policies - Zhu Jiekun, Quwan](https://kccncosschn2023.sched.com/event/1PTFF/nanoopentelemetrygai-retafu-hao-daepqi-ji-ru-zha-bing-balancing-cost-and-quality-in-opentelemetry-an-evaluation-of-sampling-policies-zhu-jiekun-quwan?iframe=no&w=100%&sidebar=yes&bg=no)



[中国移动云的服务网格探索 | The Service Mesh Exploration of China Mobile Cloud - Haiwen Zhang, China Mobile](https://kccncosschn2023.sched.com/event/1PTGS/wezhe-zha-jie-meng-the-service-mesh-exploration-of-china-mobile-cloud-haiwen-zhang-china-mobile?iframe=no&w=100%&sidebar=yes&bg=no)



### 1:55pm

**[Prometheus介绍和深入剖析 | Prometheus Intro and Deep Dive - Josh Abreu & Richard Hartmann, Grafana Labs](https://kccncosschn2023.sched.com/event/1PTKu?iframe=no)**



[Kyverno 游乐场：让策略测试变得轻松愉快，享受整个过程！ | Kyverno Playground: Make Policy Testing a Breeze and Enjoy the Process! - Shuting Zhao, Nirmata](https://kccncosschn2023.sched.com/event/1PTKZ/kyverno-pencedaepmatsu-ji-ru-mao-si-daelshui-xiao-daeg-kyverno-playground-make-policy-testing-a-breeze-and-enjoy-the-process-shuting-zhao-nirmata?iframe=no&w=100%&sidebar=yes&bg=no)

策略管理引擎，例如阻止不合格的资源部署，验证容器镜像等等



[教程: 一个关于在Kubernetes周围的CNCF/OSS可观测性解决方案的搭车者指南 | Tutorial: A Hitchhiker's Guide to CNCF/OSS Observability Solutions Around Kubernetes - Matthias Haeussler, Novatec Consulting & Tiffany Jernigan, VMware](https://kccncosschn2023.sched.com/event/1PTII/xiao-nanokubernetestoyuzha-cncfossqi-ji-zha-wu-ke-tutorial-a-hitchhikers-guide-to-cncfoss-observability-solutions-around-kubernetes-matthias-haeussler-novatec-consulting-tiffany-jernigan-vmware?iframe=no&w=100%&sidebar=yes&bg=no)

现场演示教程: 我们将从仅查询Kubernetes API并以易于理解的用户界面（例如Skooner、k9s）提供输出的工具开始，然后介绍基于sidecar和eBPF的服务网格（例如Istio/Kiali、Cillium/Hubble UI），最后介绍应用程序端的日志记录和监控（例如OpenTelemetry、fluentd、Jaeger、Grafana）。



### 2:45pm

**[项目更新和深入探讨：containerd | Project Update and Deep Dive: Containerd - Wei Fu, Microsoft & Iceber Gu, DaoCloud](https://kccncosschn2023.sched.com/event/1PTKB?iframe=no)**

[Sandbox API](https://github.com/containerd/containerd/issues/4131), NRI(**Node Resource Interface**), 



[后利用被入侵的ETCD | Post-Exploiting a Compromised ETCD - Luis Toro Puig, NCC Group](https://kccncosschn2023.sched.com/event/1PTG1?iframe=no)

通过 Etcd 篡改 K8S 数据



[Envoy网关：云原生时代的API网关 | Envoy Gateway: The API Gateway in the Cloud Native Era - Xunzhuo Liu, Tencent & Huabing Zhao, Tetrate](https://kccncosschn2023.sched.com/event/1PTF0/envoyjie-daep-chang-zha-apijie-envoy-gateway-the-api-gateway-in-the-cloud-native-era-xunzhuo-liu-tencent-huabing-zhao-tetrate?iframe=no&w=100%&sidebar=yes&bg=no)



### 3:50pm

**[Dapr中WebAssembly的现状和未来 | The State and Future of WebAssembly in Dapr - Loong Dai, Intel](https://kccncosschn2023.sched.com/event/1PTKo?iframe=no)**

 Dapr绑定API允许开发人员将外部资源连接到逻辑或存储，而无需依赖特殊的SDK或库。例如，可以将类似Kafka的输入绑定到类似Amazon Kinesis的输出进行处理。 本次演讲详细介绍了Dapr的HTTP中间件和输出绑定，以及如何使用WebAssembly进行配置。

[SIG-Scheduling 介绍与深入探讨 | SIG-Scheduling Intro & Deep Dive - Qingcan Wang, Shopee & Kante Yin, DaoCloud](https://kccncosschn2023.sched.com/event/1PTKH?iframe=no)



[基于生产案例详细解析和重现Istio访问日志的各种应答标记 | Detailed Parse and Reproduce Response Flags of Istio Access Log Based on Production Use Case - Chaomeng Zhang, Huawei](https://kccncosschn2023.sched.com/event/1PTHc?iframe=no)

服务网格的访问日志在运维工作中发挥着非常关键的作用。特别是访问日志在HTTP响应码外提供应答标记Response Flags，通过针对性的标记提供有用的额外信息，帮助运维人员提高故障诊断的效率。但是Envoy社区官方文档中对应答标记的介绍非常简单，Istio社区也没有资料介绍这部分内容。在实际使用中当用户遇到包含DC、UF、UH等应答标记的日志时，很难找到权威材料参考来解决具体问题。
在本次演讲中，超盟将重现10多种生产中常碰到的应答标记的实践案例，解析每个标记的含义、产生场景，并介绍如何基于这些应答标记进行故障诊断和问题定界，进而解决案例中这些应答标记表示的问题。此外，还将解析生产用例中访问日志的6个有用的时间字段的含义，并介绍如何基于这些时间字段定界服务网格的延时相关问题。



[在任何基础设施上使用OpenFunction运行无服务器工作负载 | Run Serverless Workloads on Any Infrastructure with OpenFunction - Benjamin Huo & Wang YiFei, QingCloud Technologies](https://kccncosschn2023.sched.com/event/1PTIs?iframe=no)



[教程: 从猫到狮子：使用Tekton和构建安全、大规模CI/CD平台的实用指南 | Tutorial: From Cat to Lion: A Practical Guide to Building Secure, Large-Scale CI/CD Platforms with Tekton - Engin Diri, Pulumi](https://kccncosschn2023.sched.com/event/1PTJ1?iframe=no)



### 4:40pm

**[使用Cilium进行网络的扩展和扩容、可观测性和安全性 | Scaling up and Scaling Out Networking, Observability, and Security with Cilium - Bill Mulligan, Isovalent & Jaff Cheng, Trip.com](https://kccncosschn2023.sched.com/event/1PTJe?iframe=no)**



[多集群警报：一种基于Kubernetes的方法 | Multi-Cluster Alerting: A Kubernetes-Native Approach - Junot Xiang & Wanjun Lei, QingCloud](https://kccncosschn2023.sched.com/event/1PTJA?iframe=no)

在这个演示中，我们将揭示一个符合多集群和多租户警报和通知要求的Kubernetes原生解决方案。我们的全面方法涵盖了指标、事件、审计和日志的警报，同时确保与alertmanager兼容。 对于指标，我们提供了适用于不同警报范围的分层RuleGroups CRDs，同时保持与Prometheus规则定义的兼容性。 我们还为Kubernetes事件和审计事件开发了特定的规则定义和评估器（即rulers），它们共享相同的规则评估引擎。 我们的通知实现，名为notification-manager，提供了许多通知渠道和基本功能，如路由、过滤、聚合和通过CRDs进行静默。它不仅如此，还提供了全面的通知历史记录、多集群和多租户支持。这些功能有助于轻松集成各种警报来源。



[待处理Pod的积极方面：应用生命周期工具包 | The Positive Side of Pending Pods: A Toolkit for App Lifecycle - Aayush Sharma, WeMakeDevs](https://kccncosschn2023.sched.com/event/1PTGk?iframe=no)



## 9 月 28 日 周四

### 11:00 am

[Chaos Mesh：概述、实践与未来 | Chaos Mesh: Overview, Practice and Future - Zhou Zhiqiang, Individual; Cwen Yin, PingCAP; Xianglin Gao, Tencent](https://kccncosschn2023.sched.com/event/1PTKK?iframe=no)

混沌测试



[导航Kubernetes云提供商 | Navigating Kubernetes Cloud Provider - Pengfei Ni, Microsoft](https://kccncosschn2023.sched.com/event/1PTKN?iframe=no)



**[基于WebAssembly的FaaS框架，具备分布式机器学习能力 | WebAssembly-Based FaaS Framework with Distributed Machine Learning Capabilities - Wilson Wang, ByteDance & Michael Yuan, Second State](https://kccncosschn2023.sched.com/event/1PTF3?iframe=no)**

基于 WasmEdge 构建 Fass 框架



### 11:50am

**[Crossplane介绍和深入剖析 - 云原生控制平面框架 | Crossplane Intro and Deep Dive - The Cloud Native Control Plane Framework - Ying Mo, IBM](https://kccncosschn2023.sched.com/event/1PTKl?iframe=no)**

比如可以用 crossplane 管理 AWS 上的 S3 对象存储，数据库等等资源



[Kubernetes SIG节点介绍和深入探讨 | Kubernetes SIG Node Intro and Deep Dive - Paco Xu, DaoCloud & Xiongxiong Yuan, Gitlab China](https://kccncosschn2023.sched.com/event/1PTJk?iframe=no)

1. Pod 生命周期： PLEG 
2. 驱逐和节点关闭：优雅关机，断电恢复
3. 资源管理： cgroup v2，Swap ，VPA，DRA



[蚂蚁集团跨多个集群交付资源的自动化和无风险解决方案 | An Automated and Riskless Solution to Deliver Resources Accross Multiple Clusters in Ant Group - Yikun Wang & Jun Zhang, Ant Group](https://kccncosschn2023.sched.com/event/1PTI6?iframe=no)

Rollout和SelfHeal Controller将观察工作负载并触发渐进式交付，同时对失败的任务进行自愈。引入Controller Mesh的能力来支持大规模集群的水平扩展操作员。



### 1:55pm



[为您自己的工作负载和流量定制渐进式交付 | Customize Progressive Delivery for Your Own Workload and Traffic - Zhang Zhen & Mingshan Zhao, Alibaba Cloud](https://kccncosschn2023.sched.com/event/1PTKE/kek-zha-du-zhe-rehao-mao-customize-progressive-delivery-for-your-own-workload-and-traffic-zhang-zhen-mingshan-zhao-alibaba-cloud?iframe=no&w=100%&sidebar=yes&bg=no)

OpenKruise Rollout是OpenKruise的一个新的子项目，旨在简化渐进式交付的过程。独特的非侵入性和Git-ops友好的设计极大地降低了采用成本。本次演讲探讨了OpenKruise Rollout的内部框架，以支持多个工作负载和流量管理系统（是的，您也可以逐步推出Daemonset和Statefulset！）。对于平台运营商，您将学习如何使用新的基于Lua的脚本系统轻松定制自己的流量实现。本次演讲适合对安全高效的应用程序发布感兴趣的任何人，或者因其CD流水线的独特性和限制而无法使用渐进式交付工具的任何人。



**[生产环境下的CNI实时迁移 | Live CNI Migration in Production Environments - Yike Wang and Yanzhao Li, VMware](https://kccncosschn2023.sched.com/event/1RTBY?iframe=no)**



### 2:45pm

[深入研究：KWOK | Deep Dive: KWOK - Shiming Zhang, DaoCloud & Hao Liang, Tencent](https://kccncosschn2023.sched.com/event/1PTJn?iframe=no)

大规模模拟 Kubelet



**[如何在大型集群中加速 Pod 的启动？ | How Can Pod Start-up Be Accelerated on Nodes in Large Clusters? - Paco Xu, DaoCloud & Byron Wang, Birentech](https://kccncosschn2023.sched.com/event/1PTFR?iframe=no)**

1. API：
   控制器管理器创建Pod的时间，
   KCM：PV和PVC绑定以及Webhooks。 
2. 调度：
   GPU拓扑感知，节点负载感知。
3. 来自kubelet方面的节点级别：
   镜像拉取，Sidecar，API QPS和Burs，事件驱动PLEG，
   限流，磁盘和卷驱动程序，静态CPU策略，容器运行时。
4. GPU管理：
   拓扑不仅仅是NUMA，共享和监控。
5. 数据负载：
   数据预加载和本地存储或分布式存储。
6. 可观察性：
   如何检查为什么Pod启动缓慢？



[扩展Kubernetes与CRDs时需要了解的设计约定 | Design Conventions You Need to Know When Extending Kubernetes with CRDs - Hongcai Ren, Huawei](https://kccncosschn2023.sched.com/event/1PTHo?iframe=no)