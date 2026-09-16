// ==================================================
// HTML要素の取得
// ==================================================

const connectButton =
    document.getElementById("connectButton");

const statusText =
    document.getElementById("status");

const angleValue =
    document.getElementById("angleValue");

const puzzleStage =
    document.getElementById("puzzleStage");


// ==================================================
// シリアル通信用の変数
// ==================================================

let port = null;
let reader = null;

// 分割して届いた文字列を一時的に保存
let receiveBuffer = "";


// ==================================================
// 角度管理用の変数
// ==================================================

// マイコンから受信した累積角度
let cumulativeAngle = 0;


// ==================================================
// 接続ボタン
// ==================================================

connectButton.addEventListener("click", async () => {
    // Web Serialに対応しているか確認
    if (!("serial" in navigator)) {
        statusText.textContent =
            "このブラウザはWeb Serialに対応していません";

        return;
    }

    try {
        // 接続するシリアルポートを選択
        port = await navigator.serial.requestPort();

        // Arduino側と同じ通信速度で開く
        await port.open({
            baudRate: 115200
        });

        statusText.textContent = "接続済み";
        connectButton.disabled = true;

        // シリアルデータの読み取り開始
        readSerialData();

    } catch (error) {
        console.error(error);

        statusText.textContent =
            "接続できませんでした";
    }
});


// ==================================================
// シリアルデータの読み取り
// ==================================================

async function readSerialData() {
    const decoder = new TextDecoder();

    reader = port.readable.getReader();

    try {
        while (true) {
            const { value, done } =
                await reader.read();

            if (done) {
                break;
            }

            // 受信したデータを文字列へ変換
            receiveBuffer += decoder.decode(
                value,
                { stream: true }
            );

            // 改行ごとにデータを分割
            const lines = receiveBuffer.split("\n");

            // 最後の未完成データを次回まで保存
            receiveBuffer = lines.pop();

            // 完成した行を順番に処理
            for (const line of lines) {
                processSerialLine(line.trim());
            }
        }

    } catch (error) {
        console.error(error);

        statusText.textContent =
            "通信中にエラーが発生しました";

    } finally {
        reader.releaseLock();
        reader = null;
    }
}


// ==================================================
// マイコンから届いた1行を処理
// ==================================================

function processSerialLine(line) {
    console.log("受信:", line);

    // RESET命令を受信した場合
    if (line.startsWith("RESET")) {
        cumulativeAngle = 0;

        updatePuzzleRotation();

        return;
    }

    // ANGLE以外のメッセージは無視
    if (!line.startsWith("ANGLE,")) {
        return;
    }

    // 「ANGLE,370.5」の370.5部分を取得
    const parts = line.split(",");
    const receivedAngle = Number(parts[1]);

    // 正しい数値でなければ無視
    if (!Number.isFinite(receivedAngle)) {
        return;
    }

    // マイコンから届いた累積角度を保存
    cumulativeAngle = receivedAngle;

    // パズルへ反映
    updatePuzzleRotation();
}


// ==================================================
// パズル画面を回転
// ==================================================

function updatePuzzleRotation() {
    /*
     * マイコン側と画面側の回転方向を合わせるため、
     * 累積角度の符号を反転する
     */
    const screenAngle = -cumulativeAngle;

    /*
     * 数値表示用の角度だけ一周以内に収める
     *
     *  370度 →  10度
     * -370度 → -10度
     */
    let displayAngle = screenAngle % 360;

    // -0.0と表示されるのを防ぐ
    if (Math.abs(displayAngle) < 0.05) {
        displayAngle = 0;
    }

    // 画面上の数値表示
    angleValue.textContent =
        displayAngle.toFixed(1);

    /*
     * パズルの回転には累積角度を使用する
     *
     * 表示用角度を使用すると、
     * 360度から0度に変わるときに
     * 逆回転する可能性がある
     */
    puzzleStage.style.transform =
        `rotate(${screenAngle}deg)`;
}
