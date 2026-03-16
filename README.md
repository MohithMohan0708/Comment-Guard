# Comment Guard — Documentation Index

Welcome to the Comment Guard documentation. This guide covers every aspect of the project — from architecture to deployment.

## 📖 Documentation

| # | Document | Description |
|---|---|---|
| 01 | [Project Overview](01-project-overview.md) | What is Comment Guard, key features, tech stack, project structure |
| 02 | [System Architecture](02-system-architecture.md) | Architecture diagram, detection pipeline flowchart, request flow |
| 03 | [Datasets](03-datasets.md) | Training data, word lists, augmentation strategy, train/test split |
| 04 | [Preprocessing](04-preprocessing.md) | Text cleaning steps, code-mix filtering, label normalization |
| 05 | [MuRIL BERT Model](05-muril-bert-model.md) | What is MuRIL, why we use it, model specs, language support |
| 06 | [Tokenizer](06-tokenizer.md) | WordPiece tokenization, parameters, visual examples |
| 07 | [Training Pipeline](07-training-pipeline.md) | Training workflow, hyperparameters, overfitting prevention |
| 08 | [Evaluation Metrics](08-evaluation-metrics.md) | Accuracy, precision, recall, F1, confusion matrix explained |
| 09 | [API Reference](09-api-reference.md) | Backend endpoints, request/response formats, setup |
| 10 | [Extension Guide](10-extension-guide.md) | Chrome extension installation, usage, troubleshooting |

## Quick Start

1. **Start the backend**: `cd backend && python main.py`
2. **Load the extension**: Open `chrome://extensions/` → Enable Developer Mode → Load Unpacked → Select `extension/` folder
3. **Test it**: Navigate to YouTube or Instagram and type a comment

For detailed instructions, see the [Extension Guide](10-extension-guide.md).
