document.addEventListener("DOMContentLoaded", () => {
    // DOM要素の参照を取得
    const revelSelect = document.getElementById("revelSelect");
    const addRoutineBtn = document.getElementById("addRoutineBtn");

    // 必要な要素がHTML内に存在するか安全対策としてチェック
    if (!revelSelect || !addRoutineBtn) {
        console.error("エラー: 必要なフォーム要素（revelSelect または addRoutineBtn）が見つかりません。");
        return;
    }

    // ローカルストレージに前回選択したレベルが保存されている場合は自動選択
    const SAVED_LEVEL_KEY = "selected_test_level";
    const savedLevel = localStorage.getItem(SAVED_LEVEL_KEY);
    if (savedLevel) {
        // 保存された値がセレクトボックスの選択肢にあるか確認してセット
        const optionExists = Array.from(revelSelect.options).some(opt => opt.value === savedLevel);
        if (optionExists) {
            revelSelect.value = savedLevel;
        }
    }

    /**
     * 選択したレベルを取得し、次のテスト画面（test.html）へ遷移する関数
     */
    const startTest = () => {
        const selectedLevel = revelSelect.value;

        // 次回利用時の利便性のために選択レベルをブラウザに保存
        try {
            localStorage.setItem(SAVED_LEVEL_KEY, selectedLevel);
        } catch (e) {
            console.warn("ローカルストレージへの書き込みに失敗しました:", e);
        }

        // URLパラメータを作成（URLエンコード処理を含めて安全に生成）
        const params = new URLSearchParams({
            level: selectedLevel
        });

        // テスト画面へ遷移（例: select.html?level=1）
        window.location.href = `select.html?${params.toString()}`;
    };

    // スタートボタンをクリックした時のイベント
    addRoutineBtn.addEventListener("click", (event) => {
        event.preventDefault(); // フォーム送信等のデフォルト動作を防止
        startTest();
    });

    // セレクトボックスでEnterキーを押した時にもスタートできるように対応
    revelSelect.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
            event.preventDefault();
            startTest();
        }
    });
});