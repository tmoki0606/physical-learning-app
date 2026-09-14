# 開発ルール

このプロジェクトを複数人で編集するための基本ルールをまとめる。

## 1. 推奨ファイル構成（例）

```text
repository/
├─ index.html
│
├─ pages/
│  ├─ start.html
│  ├─ puzzle.html
│  └─ result.html
│
├─ assets/
│  ├─ css/
│  │  ├─ common.css
│  │  ├─ start.css
│  │  ├─ puzzle.css
│  │  └─ result.css
│  │
│  ├─ js/
│  │  ├─ common.js
│  │  ├─ start.js
│  │  ├─ puzzle.js
│  │  └─ result.js
│  │
│  └─ images/
│
├─ firmware/
│  └─ main/
│     └─ main.ino
│
├─ docs/
│  ├─ DEVELOPMENT_RULES.md
│  └─ COMMUNICATION_SPEC.md
│
├─ README.md
└─ .gitignore
```

## 2. 各フォルダの役割

- `index.html`
  - GitHub Pagesで最初に表示するトップ画面。
  - スタートボタンなどを配置する。

- `pages/`
  - トップ画面以外のHTMLを置く。
  - 例：条件選択画面、問題画面、結果画面。

- `assets/css/`
  - CSSファイルを置く。
  - 複数画面で共通するデザインは `common.css` にまとめる。
  - 各画面固有のデザインは画面名と同じCSSファイルにする。

- `assets/js/`
  - JavaScriptファイルを置く。
  - 共通処理は `common.js` にまとめる。
  - 各画面固有の処理は画面名と同じJSファイルにする。

- `assets/images/`
  - Webアプリで使用する画像を置く。

- `firmware/`
  - マイコンに書き込むプログラムを置く。
  - Webアプリ用コードとは分離して管理する。

- `docs/`
  - 開発ルール、通信仕様、設計メモなどを置く。

## 3. パスの書き方

### 基本方針

GitHub Pagesでは、このプロジェクトは通常、

```text
https://tmoki0606.github.io/REPOSITORY_NAME/
```

のようなURLで公開される。

そのため、次のようなパスは原則使用しない。

```html
<link rel="stylesheet" href="/assets/css/common.css">
```

この書き方では、

```text
https://tmoki0606.github.io/assets/css/common.css
```

を参照してしまい、リポジトリ名の部分が抜ける。

### 推奨方法

各HTMLでGitHub Pages上のリポジトリを基準にする場合は、`<base>` を使用する。

```html
<head>
    <base href="/physical-learning-app/">
</head>
```

その上で、CSSやJavaScriptは次のように記述する。

```html
<link rel="stylesheet" href="assets/css/common.css">
<script src="assets/js/common.js"></script>
```

別ページへのリンクも同じ基準で記述する。

```html
<a href="pages/select.html">スタート</a>
```

### 注意

`REPOSITORY_NAME` は実際のGitHubリポジトリ名に置き換えること。

リポジトリ名を変更した場合は、各HTMLの `<base>` も変更する必要がある。

## 4. HTMLの命名

HTMLファイル名は英小文字を使用する。

例：

```text
index.html
select.html
puzzle.html
result.html
```

スペース、日本語、意味の分かりにくい略称は基本的に使用しない。

## 5. CSSの命名

画面ごとのCSSはHTMLと同じ名前にする。

```text
select.html
↓
select.css
```

複数ページで共通して使用するスタイルは `common.css` に記述する。

## 6. JavaScriptの命名

JavaScriptも対応するHTMLと同じ名前にする。

```text
puzzle.html
↓
puzzle.js
```

複数画面で共通して使用する関数は `common.js` に記述する。

## 7. マイコン側プログラム

マイコン用コードは `firmware/` 以下に置く。

例：

```text
firmware/
└─ main/
   └─ main.ino
```

Webアプリ側のJavaScriptとマイコン側のプログラムは直接混在させない。

## 8. 通信仕様

Webアプリとマイコン間で送受信するデータ形式は、

```text
docs/COMMUNICATION_SPEC.md
```

に記述する。

通信方式をUSB SerialからBluetoothへ変更しても、可能な限りデータ形式自体は共通化する。

例：

```text
MOVE_X,120
MOVE_Y,-35
ROTATE,42
```

実際の通信仕様は試作段階で確定する。

## 9. Git運用

原則として、安定して動作するコードを `main` ブランチに置く。

作業量が増えた場合は、機能ごとにブランチを作成する。

例：

```text
feature/ui
feature/puzzle
feature/bluetooth
feature/firmware
```

複数人が同じファイルを同時に編集しないようにする。

## 10. 編集時のルール

- ファイル名やフォルダ名は勝手に変更しない。
- 共通ファイルを変更する場合は、他の画面への影響を確認する。
- マイコンとの通信形式を変更する場合は `COMMUNICATION_SPEC.md` も更新する。
- 動作確認後にGitHubへ反映する。
- 不要になったファイルを残さない。
- 一時ファイルやIDE固有ファイルは `.gitignore` に追加する。
