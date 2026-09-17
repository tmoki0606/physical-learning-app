// 1. URLのクエリパラメータからレベル(revel / level / school)を取得（指定がなければ default で revel1）
const urlParams = new URLSearchParams(window.location.search);
const revel = urlParams.get('revel') || urlParams.get('level') || urlParams.get('school') || 'revel1';

// 2. レベルとテーマの表示名マップ
const revelNames = {
    "revel1": "初級",
    "revel2": "中級",
    "revel3": "上級"
};

const subjectNames = {
    "2*2": "2×2",
    "3*3": "3×3",
    "4*4": "4×4",
    "5*5": "5×5",
    "6*6": "6×6",
};

// 3. データ定義（レベル ＞ テーマ ＞ 単元リスト）
const unitDatabase = {
    "revel1": {
        "2*2": ["マス目"],
        "3*3": ["マス目"],
    },
    "revel2": {
        "4*4": ["マス目"],
        "5*5": ["マス目"]
    },
    "revel3": {
        "5*5": "5×5",
        "6*6": "6×6",
    }
};

// 4. 画面描画処理
function renderPage() {
    const pageTitle = document.getElementById('page-title');
    const selectionInfo = document.getElementById('selection-info');
    const unitContainer = document.getElementById('unit-container');

    const revelText = revelNames[revel] || revel;

    // タイトルと選択情報の更新
    if (pageTitle) pageTitle.textContent = `${revelText} - 単元選択`;
    if (selectionInfo) selectionInfo.textContent = `選択中のコース：${revelText}`;

    if (!unitContainer) return;
    unitContainer.innerHTML = ""; // 初期化

    // 指定されたレベルのデータが存在する場合
    if (unitDatabase[revel]) {
        // カードを並べる枠を作成
        const cardsWrapper = document.createElement('div');
        cardsWrapper.className = 'cards-wrapper';

        // 各テーマ（flower, morning, viewなど）をループ
        Object.keys(unitDatabase[revel]).forEach(subjectKey => {
            const categoryName = subjectNames[subjectKey] || subjectKey;
            const units = unitDatabase[revel][subjectKey];

            // 単元ごとにカードを作成
            units.forEach(unitName => {
                const div = document.createElement('div');
                div.className = 'unit-card';
                
                // 「ひまわり（花）」のような形式で表示
                div.textContent = `${unitName}（${categoryName}）`;
                
                // クリックで puzzle.html にレベル情報のみ渡して遷移
                div.addEventListener('click', () => {
                    const nextPage = 'pages/puzzle.html';
                    window.location.href = `${nextPage}?revel=${encodeURIComponent(revel)}`;
                });

                cardsWrapper.appendChild(div);
            });
        });

        unitContainer.appendChild(cardsWrapper);
    } else {
        unitContainer.innerHTML = "<p class='error-msg'>該当するデータが見つかりません。</p>";
    }
}

// デモ用ボタンのクリック処理（URLに revel のみをセットしてリロード）
function setParams(r) {
    const currentUrl = new URL(window.location.href);
    currentUrl.searchParams.set('revel', r);
    currentUrl.searchParams.delete('subject'); // 不要なパラメータを削除
    window.location.href = currentUrl.toString();
}

// DOM読み込み完了時に実行
document.addEventListener('DOMContentLoaded', renderPage);
