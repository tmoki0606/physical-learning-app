document.addEventListener("DOMContentLoaded", () => {
    const schoolSelect = document.getElementById("schoolSelect");
    const gradeSelect = document.getElementById("gradeSelect");
    const subjectSelect = document.getElementById("subjectSelect");
    const addRoutineBtn = document.getElementById("addRoutineBtn"); // HTMLのIDに合わせました

    // 共通の科目更新関数（学校と学年の状態を見て科目を書き換える）
    const updateSubjects = () => {
        const selectedSchool = schoolSelect.value;
        const selectedGrade = gradeSelect.value;

        // 科目のセレクトボックスを一度空にする
        subjectSelect.innerHTML = "";
        let subjects = [];

        // 学校と学年によって科目を分岐
        if (selectedSchool === "elementary") {
            subjects = [
                { value: "japanese", text: "国語" },
                { value: "math", text: "算数" },
                { value: "science", text: "理科" },
                { value: "social", text: "社会" },
            ];
        } else if (selectedSchool === "junior-high") {
            subjects = [
                { value: "japanese", text: "国語" },
                { value: "math", text: "数学" },
                { value: "science", text: "理科" },
                { value: "social", text: "社会" },
                { value: "english", text: "英語" }
            ];
        } else if (selectedSchool === "high") {
            if (selectedGrade === "1") {
                subjects = [
                    { value: "math1", text: "数学I" },
                    { value: "mathA", text: "数学A" },
                    { value: "english-word", text: "英語：単語" },
                    { value: "english-grammar", text: "英語：文法" },
                    { value: "english-reading", text: "英語：長文" }
                ];
            } else if (selectedGrade === "2") {
                subjects = [
                    { value: "math1", text: "数学I" },
                    { value: "mathA", text: "数学A" },
                    { value: "math2", text: "数学II" },
                    { value: "mathB", text: "数学B" },
                    { value: "english-word", text: "英語：単語" },
                    { value: "english-grammar", text: "英語：文法" },
                    { value: "english-reading", text: "英語：長文" }
                ];
            } else if (selectedGrade === "3") {
                subjects = [
                    { value: "math1", text: "数学I" },
                    { value: "mathA", text: "数学A" },
                    { value: "math2", text: "数学II" },
                    { value: "mathB", text: "数学B" },
                    { value: "math3", text: "数学III" },
                    { value: "mathC", text: "数学C" },
                    { value: "english-word", text: "英語：単語" },
                    { value: "english-grammar", text: "英語：文法" },
                    { value: "english-reading", text: "英語：長文" }
                ];
            }
        }

        // 科目のoptionタグをループで作る
        subjects.forEach(sub => {
            const option = document.createElement("option");
            option.value = sub.value;
            option.textContent = sub.text;
            subjectSelect.appendChild(option);
        });
    };

    // 1. 学校が切り替わったときに動く関数
    schoolSelect.addEventListener("change", () => {
        const selectedSchool = schoolSelect.value;
        
        // 学年のセレクトボックスを一度空にする
        gradeSelect.innerHTML = "";

        let maxGrade = 3; 
        if (selectedSchool === "elementary") {
            maxGrade = 6; 
        }

        // 学年のoptionタグをループで作る
        for (let i = 1; i <= maxGrade; i++) {
            const option = document.createElement("option");
            option.value = i;
            option.textContent = `${i}年`;
            gradeSelect.appendChild(option);
        }

        // 学年が新しく生成された後に、科目を更新する
        updateSubjects();
    });

    // 2. 学年が切り替わったときにも科目を更新する
    gradeSelect.addEventListener("change", () => {
        updateSubjects();
    });
    
    // ページを読み込んだ最初にも一度科目を正しくセットする
    updateSubjects();

    // 3. 「決定」ボタンをクリックしたときの画面遷移処理
    addRoutineBtn.addEventListener('click', () => {
        const school = schoolSelect.value;
        const grade = gradeSelect.value;
        const subject = subjectSelect.value;

        // 次のページ（例: test.html）へパラメータ付きで移動
        window.location.href = `test.html?school=${school}&grade=${grade}&subject=${subject}`;
    });
});