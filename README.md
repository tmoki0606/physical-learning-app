# physical-learning-app

物理デバイスと連携して学習を行うWebアプリケーションです。

## プロジェクト構成

```text
physical-learning-app/
├─ assets/
│  ├─ css/
│  │  └─ select.css
│  └─ js/
│     └─ select.js
├─ docs/
│  ├─ DEVELOPMENT_RULES.md
│  └─ COMMUNICATION_SPEC.md
├─ firmware/
│  └─ （マイコン用プログラム）
├─ pages/
│  └─ select.html
├─ README.md
└─ index.html
```

## 各ディレクトリ・ファイルの役割

- `index.html`
  - GitHub Pagesで最初に表示するスタート画面

- `pages/`
  - 各画面のHTMLファイルを配置

- `assets/css/`
  - 各画面で使用するCSSファイルを配置

- `assets/js/`
  - 各画面で使用するJavaScriptファイルを配置

- `firmware/`
  - マイコンへ書き込むプログラムを配置

- `docs/`
  - 開発ルールや通信仕様などのドキュメントを配置

## 開発ルール

詳細は以下を参照してください。

- `docs/DEVELOPMENT_RULES.md`

## マイコンとの通信仕様

詳細は以下を参照してください。

- `docs/COMMUNICATION_SPEC.md`

## GitHub Pages

公開URLは以下の形式を想定しています。

```text
https://<USERNAME>.github.io/physical-learning-app/
```
