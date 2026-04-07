# Comment Guard — Documentation Index

Welcome to the Comment Guard documentation. This guide covers every aspect of the project — from architecture to deployment.

## 📖 Documentation

| # | Document | Description |
|---|---|---|
| 01 | [Project Overview](Project_Overview.md) | What is Comment Guard, key features, tech stack, project structure |
| 02 | [System Architecture](Project_Overview.md#system-architecture) | Architecture diagram, detection pipeline flowchart, request flow |
| 03 | [Datasets](Project_Overview.md#datasets-used) | Training data, word lists, augmentation strategy, train/test split |
| 04 | [Preprocessing](Project_Overview.md#preprocessing) | Text cleaning steps, code-mix filtering, label normalization |
| 05 | [MuRIL BERT Model](Project_Overview.md#muril-bert-model) | What is MuRIL, why we use it, model specs, language support |
| 06 | [Tokenizer](Project_Overview.md#tokenizer) | WordPiece tokenization, parameters, visual examples |
| 07 | [Performance Metrics](Project_Overview.md#performance-metrics) | Accuracy, precision, recall, and evaluation results |
| 08 | [Extension Guide](EXTENSION_LOAD_GUIDE.md) | Chrome extension installation, usage, troubleshooting |
| 09 | [Implementation Summary](IMPLEMENTATION_SUMMARY.md) | Current state, final checklist, and cloud deployment guide |
| 10 | [Test Cases](Test_Cases.md) | Sample toxic and non-toxic test cases for verification |

## Quick Start

1. **Load the extension**: 
   - Extract `CommentGuard-v2.1.zip` (or use the `extension/` folder in this repository)
   - Open `chrome://extensions/`
   - Enable **Developer Mode**
   - Click **Load Unpacked**
   - Select the `extension/` folder
2. **Test it**: Navigate to YouTube or Instagram and type a comment

*Note: The extension automatically connects to the live backend hosted on Hugging Face Spaces (https://tejesh916k-comment-guard-api.hf.space), so you don't need to run it locally.*

For detailed instructions, see the [Extension Guide](EXTENSION_LOAD_GUIDE.md).
