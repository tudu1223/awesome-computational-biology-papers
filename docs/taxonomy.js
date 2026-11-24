export const themes = {
  "single-cell": {
    name: ["Single-cell and multi-omics", "单细胞与多组学"],
    description: ["Cell representations, multi-omics integration and reference atlases.", "细胞表示、多组学整合及参考图谱。"],
    art: ["a", "left"],
    topics: {
      foundations: ["Foundation models and annotation", "基础模型与细胞注释"],
      integration: ["Integration and representation", "组学整合与表示学习"],
      atlases: ["Atlases and data resources", "图谱与数据资源"],
    },
  },
  perturbation: {
    name: ["Perturbation and virtual cells", "扰动建模与虚拟细胞"],
    description: ["Response prediction, perturbation screens and generalization.", "细胞响应预测、扰动筛选及泛化评估。"],
    art: ["a", "right"],
    topics: {
      models: ["Response models", "扰动响应模型"],
      screens: ["Perturbation atlases and datasets", "扰动图谱与数据集"],
      benchmarks: ["Evaluation and baselines", "评估基准与对照"],
    },
  },
  regulation: {
    name: ["Gene regulation", "基因调控网络"],
    description: ["Regulatory networks, enhancer–gene links and gene function.", "调控网络、增强子与靶基因，以及基因功能。"],
    art: ["b", "left"],
    topics: {
      networks: ["Network inference and gene function", "网络推断与基因功能"],
      enhancers: ["Enhancers and regulatory elements", "增强子与调控元件"],
      regulons: ["Regulons and transcription factors", "调控子与转录因子"],
      benchmarks: ["Evaluation and interpretation", "评估与解读"],
    },
  },
  spatial: {
    name: ["Spatial omics", "空间组学"],
    description: ["Tissue maps, spatial measurement, deconvolution and modeling.", "组织图谱、空间测量、解卷积及建模。"],
    art: ["b", "right"],
    topics: {
      assays: ["Measurement and atlases", "空间测量与图谱"],
      mapping: ["Mapping and deconvolution", "空间映射与解卷积"],
      models: ["Spatial modeling and analysis", "空间建模与分析"],
      benchmarks: ["Spatial evaluation and best practices", "空间组学评估与最佳实践"],
    },
  },
  "genomics-proteins": {
    name: ["Genomics and proteins", "基因组与蛋白质建模"],
    description: ["Sequence-to-function models, molecular structure and reference genomes.", "序列到功能模型、分子结构及参考基因组。"],
    art: ["c", "left"],
    topics: {
      sequence: ["Genomic sequence models", "基因组序列模型"],
      proteins: ["Protein structure and interactions", "蛋白质结构与相互作用"],
      transcriptome: ["Transcriptome modeling", "转录组建模"],
      references: ["Reference genomes and benchmarks", "参考基因组与基准"],
    },
  },
  methods: {
    name: ["Core methods and tools", "基础方法与工具"],
    description: ["Graph learning, analysis workflows and comparative evaluation.", "图学习、分析流程及比较评估。"],
    art: ["c", "right"],
    topics: {
      graphs: ["Graph learning", "图学习"],
      dynamics: ["Trajectory and cell dynamics", "细胞轨迹与动态"],
      statistics: ["Statistics and gene sets", "统计方法与基因集分析"],
      workflows: ["Workflows and tools", "分析流程与工具"],
      benchmarks: ["Benchmarks and reviews", "评估基准与综述"],
    },
  },
};

export const kinds = {
  article: ["Journal article", "期刊论文"],
  preprint: ["Preprint", "预印本"],
  review: ["Review", "综述"],
  conference: ["Conference paper", "会议论文"],
};

export const sources = {
  editorial: {
    name: ["Editorial reading list", "精选导读"],
    description: ["Papers selected for the original bilingual reading list, with short reading notes.", "源自已有双语精选目录，并附简短导读。"],
    url: "https://github.com/tudu1223/awesome-computational-biology-papers/blob/main/README.zh-CN.md",
  },
  pubmed: {
    name: ["PubMed and Crossref", "PubMed 与 Crossref"],
    description: ["Topic-specific searches and targeted DOI checks broaden coverage of methods, datasets and evaluation.", "通过专题检索与 DOI 核验，扩展方法、数据资源和评估文献的覆盖。"],
    url: "https://pubmed.ncbi.nlm.nih.gov/",
  },
  omicsml: {
    name: ["OmicsML discovery", "OmicsML 文献线索"],
    description: ["Selected scholarly records discovered through the OmicsML single-cell foundation model bibliography.", "从 OmicsML 的单细胞基础模型文献目录发现并筛选的条目。"],
    url: "https://github.com/OmicsML/awesome-foundation-model-single-cell-papers",
  },
};
