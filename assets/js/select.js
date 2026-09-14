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
    "flower": "花",
    "view": "景色",
    "morning": "朝"
};

// 3. データ定義（レベル ＞ テーマ ＞ 単元リスト）
const unitDatabase = {
    "revel1": {
        "flower": ["ひまわり", "朝顔"],
        "morning": ["朝日", "洗面所"],
        "view": ["山", "海", "空"]
    },
    "revel2": {
        "flower": ["チューリップ", "コスモス"],
        "view": ["森林", "湖畔"],
        "morning": ["散歩", "朝食"]
    },
    "revel3": {
        "flower": ["バラ"],
        "view": ["オーロラ", "渓谷"],
        "morning": ["ラジオ体操"]
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
                    const nextPage = 'puzzle.html';
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
