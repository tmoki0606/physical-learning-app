// 1. URLのクエリパラメータを取得する
        const urlParams = new URLSearchParams(window.location.search);
        const school = urlParams.get('school');
        const grade = urlParams.get('grade');
        const subject = urlParams.get('subject');

        // 2. 学校・学年・科目の表示名を整えるためのデータ
        const schoolNames = {
            "elementary": "小学生",
            "junior-high": "中学生",
            "high": "高校生"
        };

        const subjectNames = {
            "japanese": "国語",
            "math": "算数/数学",
            "science": "理科",
            "social": "社会",
            "english": "英語",
            "math1": "数学I",
            "mathA": "数学A",
            "math2": "数学II",
            "mathB": "数学B",
            "math3": "数学III",
            "mathC": "数学C",
            "english-word": "英語：単語",
            "english-grammar": "英語：文法",
            "english-reading": "英語：長文"
        };

        // 3. 各科目ごとの「単元リスト」データ定義
        // ここに「高校数学Iなら二次関数」「数学Aなら確率」などの詳細を設定します
        const unitDatabase = {
            "high": {
                "1": {
                    "math1": ["数と式", "二次関数", "図形と計量", "データの分析"],
                    "mathA": ["場合の数と確率", "図形の性質", "整数の性質"],
                    "english-word": ["基本英単語 1-100", "基本英単語 101-200"],
                    "english-grammar": ["文型の基礎", "時制", "助動詞"],
                    "english-reading": ["短文読解入門", "会話文の理解"]
                },
                "2": {
                    "math1": ["数と式", "二次関数", "図形と計量", "データの分析"],
                    "mathA": ["場合の数と確率", "図形の性質", "整数の性質"],
                    "math2": ["式と証明", "複素数と方程式", "図形と方程式", "三角関数", "指数関数・対数関数", "微分法と積分法"],
                    "mathB": ["数列", "統計的な推測"],
                    "english-word": ["標準英単語 1-100", "標準英単語 101-200"],
                    "english-grammar": ["不定詞・動名詞", "分詞", "関係代名詞"],
                    "english-reading": ["標準レベル長文：論説", "標準レベル長文：物語"]
                }
            },
            "junior-high": {
                "1": {
                    "math": ["正負の数", "文字式", "方程式", "比例・反比例", "平面図形", "空間図形", "データの活用"],
                    "japanese": ["文法・漢字", "小説の読解", "説明文の読解"],
                    "science": ["身の回りの現象（光・音・力）", "植物の世界", "身の回りの物質"],
                    "social": ["世界の地理", "日本の地理", "古代までの日本"],
                    "english": [ "be動詞(am・is・are)", "一般動詞","動名詞","助動詞(can・may)",]
                }
            }
            // 必要に応じて小学生(elementary)などのデータも追加できます
        };

        // 4. 画面への反映処理
        const pageTitle = document.getElementById('page-title');
        const selectionInfo = document.getElementById('selection-info');
        const unitContainer = document.getElementById('unit-container');

        if (school && grade && subject) {
            // 選択された条件のテキストを表示
            const schoolText = schoolNames[school] || school;
            const subjectText = subjectNames[subject] || subject;
            
            pageTitle.textContent = `${schoolText} ${grade}年 - ${subjectText}`;
            selectionInfo.textContent = `選択中：${schoolText} / ${grade}年生 / ${subjectText}`;

            // 該当する単元リストを取り出す
            let units = [];
            if (unitDatabase[school] && unitDatabase[school][grade] && unitDatabase[school][grade][subject]) {
                units = unitDatabase[school][grade][subject];
            }

            // 単元を描画
            if (units.length > 0) {
                units.forEach(unitName => {
                    const div = document.createElement('div');
                    div.className = 'unit-card';
                    div.textContent = unitName;
                    unitContainer.appendChild(div);
                });
            } else {
                unitContainer.innerHTML = "<p>該当する単元データがまだ登録されていません。</p>";
            }

        } else {
            pageTitle.textContent = "エラー";
            selectionInfo.textContent = "";
            unitContainer.innerHTML = "<p>正しく選択が行われていません。スタート画面からやり直してください。</p>";
        }