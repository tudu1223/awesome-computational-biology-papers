# Awesome Computational Biology Papers

A curated reading list for single-cell and spatial omics, perturbation modeling, gene regulation, and machine learning for genomics and proteins.

这是一份面向计算生物学研究的阅读索引。每条包含原始标题、发表年份与期刊或会议，以及一句中文导读。预印本标为 **预印本**，已发表的工作优先链接到正式版本。

## 目录

- [单细胞与多组学](#single-cell)
- [扰动建模与虚拟细胞](#perturbation)
- [基因调控网络与功能推断](#regulation)
- [空间组学](#spatial)
- [基因组与蛋白质建模](#genomics-proteins)
- [基础方法与分析工具](#methods)

<a name="single-cell"></a>

## 单细胞与多组学 · Single-cell and multi-omics

- **2026 · Genome Research** — High-fidelity bidirectional translation between single-cell transcriptomes and DNA methylomes with scBOND. scBOND 研究如何在单细胞转录组与 DNA 甲基化组之间双向预测。 [论文](https://doi.org/10.1101/gr.281350.125)
- **2026 · Cell** — An emergent disease-associated motor neuron state precedes cell death in ALS. 用纵向单细胞多组学追踪 ALS 模型中的运动神经元状态变化。 [论文](https://doi.org/10.1016/j.cell.2026.05.047)
- **2025 · bioRxiv · 预印本** — Biological Reasoning with Reinforcement Learning through Natural Language Enables Generalizable Zero-Shot Cell Type Annotations. 评估推理语言模型能否根据标记基因进行零样本细胞类型注释。 [论文](https://doi.org/10.1101/2025.06.17.659642) · [代码](https://github.com/cristea-lab/BioReasoning_Paper)
- **2023 · bioRxiv · 预印本** — Boosting Single-Cell RNA Sequencing Analysis with Simple Neural Attention. scANNA 将简单的神经注意力用于单细胞 RNA 测序分析，并考察模型关注的基因。 [论文](https://doi.org/10.1101/2023.05.29.542760)
- **2022 · Nature Biotechnology** — Multi-omics single-cell data integration and regulatory inference with graph-linked embedding. GLUE 以调控先验图连接不同组学的特征，用于细胞对齐与调控关系推断。 [论文](https://doi.org/10.1038/s41587-022-01284-4) · [代码](https://github.com/gao-lab/GLUE)

<a name="perturbation"></a>

## 扰动建模与虚拟细胞 · Perturbation modeling and virtual cells

- **2026 · Cell** — UniPert-G2CP bridges genetic and chemical screens from molecular representation to phenotype modeling. 在共享表示中建模遗传和化学扰动，研究如何利用遗传筛选数据预测药物响应。 [论文](https://doi.org/10.1016/j.cell.2026.06.005)
- **2026 · bioRxiv · 预印本** — A pretrained unified model enables cellular functional profile prediction and multi-objective virtual drug screening. InsilicoCell 预训练多模态、多任务模型，用于细胞功能谱预测和虚拟药物筛选。 [论文](https://doi.org/10.64898/2026.08.25.746866) · [代码](https://github.com/Bin-Chen-Lab/insilicoCell)
- **2026 · bioRxiv · 预印本** — SCALE: Scalable Conditional Atlas-Level Endpoint transport for virtual cell perturbation prediction. 从未扰动细胞和给定条件预测受扰动后的细胞状态分布。 [论文](https://doi.org/10.64898/2026.03.17.712536)
- **2026 · bioRxiv · 预印本** — TwinCell: Large Causal Cell Model for Reliable and Interpretable Therapeutic Target Prioritisation. 结合单细胞表示与多组学互作网络，对可能驱动疾病状态改变的上游调控因子排序。 [论文](https://doi.org/10.64898/2026.01.29.702072)

<a name="regulation"></a>

## 基因调控网络与功能推断 · Gene regulation and function

- **2026 · Nature Genetics** — Mapping enhancer–gene regulatory interactions from single-cell data. scE2G 根据单细胞染色质可及性等数据预测细胞类型特异的增强子与靶基因连接。 [论文](https://doi.org/10.1038/s41588-026-02695-8)
- **2026 · bioRxiv · 预印本** — Gene function prediction from bulk coexpression is bounded by cell-type-level signal. 分析细胞类型组成对 bulk 共表达信号及基因功能预测的影响。 [论文](https://doi.org/10.64898/2026.08.31.748380)
- **2026 · bioRxiv · 预印本** — Multimodal physical evidence uncovers interpretable gene regulatory networks for perturbation prediction. VitaGRN 用多模态生物物理证据构建调控网络，并评估其在扰动预测中的表现。 [论文](https://doi.org/10.64898/2026.06.05.729520)
- **2024 · Scientific Reports** — Inferring gene regulatory networks with graph convolutional network based on causal feature reconstruction. 将转移熵和特征重构结合到图卷积网络中，用于推断调控边。 [论文](https://doi.org/10.1038/s41598-024-71864-8)
- **2023 · Nature Communications** — Inference of cell type-specific gene regulatory networks on cell lineages from single cell omic datasets. scMTNI 整合单细胞组学数据，沿细胞谱系推断细胞类型特异的调控网络。 [论文](https://doi.org/10.1038/s41467-023-38637-9) · [代码](https://github.com/Roy-lab/scMTNI)
- **2020 · Nature Methods** — Benchmarking algorithms for gene regulatory network inference from single-cell transcriptomic data. BEELINE 在统一评估框架下比较单细胞转录组调控网络推断方法。 [论文](https://doi.org/10.1038/s41592-019-0690-6) · [代码](https://github.com/Murali-group/Beeline)

<a name="spatial"></a>

## 空间组学 · Spatial omics

- **2026 · Genome Medicine** — TiRank prioritizes phenotypic niches in tumor microenvironment for clinical biomarker discovery. 用迁移学习联系 bulk、单细胞和空间转录组数据，对肿瘤微环境中的表型生态位排序。 [论文](https://doi.org/10.1186/s13073-026-01604-2) · [代码](https://github.com/LenisLin/TiRank)
- **2026 · bioRxiv · 预印本** — Connecting spatial regions to clinical phenotypes by transferring knowledge from bulk gene expression data. SpacePhenotyper 将 bulk 表达与临床表型的关联迁移到空间转录组数据。 [论文](https://doi.org/10.64898/2025.12.12.693322) · [代码](https://github.com/ncbi/SpacePhenotyper)
- **2023 · Briefings in Bioinformatics** — SpaRx: elucidate single-cell spatial heterogeneity of drug responses for personalized treatment. 将预测的药物响应映射到组织空间，分析细胞间和区域间的异质性。 [论文](https://doi.org/10.1093/bib/bbad338)
- **2020 · Cell Research** — Reconstruction of cell spatial organization from single-cell RNA sequencing data based on ligand-receptor mediated self-assembly. CSOmap 使用配体与受体表达信息重建细胞的相对空间排布。 [论文](https://doi.org/10.1038/s41422-020-0353-2)

<a name="genomics-proteins"></a>

## 基因组与蛋白质建模 · Genomics and protein modeling

- **2026 · Nature** — Advancing regulatory variant effect prediction with AlphaGenome. 从 DNA 序列预测多种调控读出，并评估遗传变异对这些读出的影响。 [论文](https://doi.org/10.1038/s41586-025-10014-0)
- **2026 · Cell** — A complete diploid human genome benchmark for personalized genomics. 提供 HG002 的双单倍型组装基准，用于评估人类基因组组装和变异准确性。 [论文](https://doi.org/10.1016/j.cell.2026.06.016)
- **2026 · Cell** — Expanding the scope of protein language modeling to protein-protein interactions with MSA Pairformer. 用多序列比对学习蛋白质表示，并评估模型对互作界面和界面变异效应的预测。 [论文](https://doi.org/10.1016/j.cell.2026.06.029)
- **2026 · AAAI** — TrinityDNA: A Bio-Inspired Foundational Model for Efficient Long-Sequence DNA Modeling. 面向长 DNA 序列表示与注释的基因组基础模型。 [论文](https://doi.org/10.1609/aaai.v40i33.39980)
- **2026 · BMC Genomics** — DSS-PPI: a self-supervised graph learning framework for protein-protein interaction prediction via multimodal sequence semantics. 将蛋白质序列表征与自监督图学习结合，用于预测蛋白质互作。 [论文](https://doi.org/10.1186/s12864-026-12762-3)
- **2026 · arXiv · 预印本** — Molecular Prior Networks. 研究如何在标注数据有限时预测小分子与蛋白质靶标的结合亲和力。 [论文](https://arxiv.org/abs/2611.05103)
- **2021 · Nature** — Highly accurate protein structure prediction with AlphaFold. 从氨基酸序列预测蛋白质三维结构，并在 CASP14 中评估预测准确度。 [论文](https://doi.org/10.1038/s41586-021-03819-2) · [代码](https://github.com/google-deepmind/alphafold)

<a name="methods"></a>

## 基础方法与分析工具 · Methods and tools

- **2018 · ICLR** — Graph Attention Networks. 用注意力对邻居信息加权，是理解图注意力层的基础论文。 [论文](https://arxiv.org/abs/1710.10903)
- **2018 · IEEE Transactions on Neural Networks and Learning Systems** — Applications of Deep Learning and Reinforcement Learning to Biological Data. 回顾深度学习和强化学习在生物数据分析中的早期应用。 [论文](https://doi.org/10.1109/TNNLS.2018.2790388)
- **2017 · NeurIPS** — Inductive Representation Learning on Large Graphs. GraphSAGE 通过采样、聚合邻居特征，为训练时未见的节点生成表示。 [论文](https://papers.nips.cc/paper_files/paper/2017/hash/5dd9db5e033da9c6fb5ba83c7a7ebea9-Abstract.html)
- **2017 · ICML** — Neural Message Passing for Quantum Chemistry. 将多种分子图模型归纳为消息传递框架，并用于分子性质预测。 [论文](https://proceedings.mlr.press/v70/gilmer17a.html)
- **2017 · ICLR** — Semi-Supervised Classification with Graph Convolutional Networks. 介绍用于图上半监督节点分类的图卷积网络。 [论文](https://arxiv.org/abs/1609.02907)
- **2012 · OMICS: A Journal of Integrative Biology** — clusterProfiler: an R Package for Comparing Biological Themes Among Gene Clusters. 提供基因集功能富集和多组基因列表比较的 R 工具。 [论文](https://doi.org/10.1089/omi.2011.0118)

**实践教程** · [Scanpy 3k PBMC 预处理与聚类](https://scanpy.readthedocs.io/en/stable/tutorials/basics/clustering-2017.html)涵盖质控、归一化、降维、聚类和标记基因分析，对应官方文档中的旧版工作流。

## 贡献

欢迎提交 Issue 或 Pull Request 补充论文或修正链接。请提供正式标题、年份、来源链接、一句导读，以及可核验的作者代码链接（如有）。同一工作保留一个条目。

目录组织参考 [OmicsML/awesome-foundation-model-single-cell-papers](https://github.com/OmicsML/awesome-foundation-model-single-cell-papers)。
