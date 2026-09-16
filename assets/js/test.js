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

// マイコンから最後に受信した角度
let lastSensorAngle = null;

// Web画面上で使用する連続した角度
let visualAngle = 0;


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
        // ユーザーに接続するシリアルポートを選んでもらう
        port = await navigator.serial.requestPort();

        // Arduino側と同じ通信速度で開く
        await port.open({
            baudRate: 115200
        });

        statusText.textContent = "接続済み";
        connectButton.disabled = true;

        // シリアルデータの読み取りを開始
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

            // バイトデータを文字列へ変換
            receiveBuffer += decoder.decode(
                value,
                { stream: true }
            );

            /*
             * シリアルデータは、
             * 1行単位で届くとは限らない。
             *
             * そのため改行で分割し、
             * 完成した行だけを処理する。
             */
            const lines = receiveBuffer.split("\n");

            // 最後の未完成部分を次回まで残す
            receiveBuffer = lines.pop();

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
        lastSensorAngle = 0;
        visualAngle = 0;

        updatePuzzleRotation();

        return;
    }

    // ANGLE以外のメッセージは無視
    if (!line.startsWith("ANGLE,")) {
        return;
    }

    // 「ANGLE,25.3」の25.3部分を取り出す
    const parts = line.split(",");
    const receivedAngle = Number(parts[1]);

    // 数値として読み取れなかった場合は無視
    if (!Number.isFinite(receivedAngle)) {
        return;
    }

    // 最初の角度を受信した場合
    if (lastSensorAngle === null) {
        lastSensorAngle = receivedAngle;
        visualAngle = receivedAngle;

        updatePuzzleRotation();

        return;
    }

    // 前回受信した角度との差
    let difference =
        receivedAngle - lastSensorAngle;

    /*
     * 360度をまたいだ場合の補正
     *
     * 例：
     * 前回 358度
     * 今回   3度
     *
     * 通常の引き算では-355度になるが、
     * 実際には+5度回転している。
     */
    if (difference > 180) {
        difference -= 360;
    } else if (difference < -180) {
        difference += 360;
    }

    // 画面用の連続角度に変化量を追加
    visualAngle += difference;

    // 今回のセンサ角度を保存
    lastSensorAngle = receivedAngle;

    updatePuzzleRotation();
}


// ==================================================
// パズル画面を回転
// ==================================================

function updatePuzzleRotation() {
    // マイコンの角度とは符号を逆にした画面用角度
    const screenAngle = -visualAngle;

    angleValue.textContent =
        screenAngle.toFixed(1);

    puzzleStage.style.transform =
        `rotate(${screenAngle}deg)`;
}
