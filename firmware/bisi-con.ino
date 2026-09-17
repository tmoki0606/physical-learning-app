#include <LSM6DS3.h>
#include <Wire.h>

// ==================================================
// IMUの設定
// ==================================================

// XIAO nRF52840 Sense内蔵IMU
LSM6DS3 imu(I2C_MODE, 0x6A);


// ==================================================
// 角度計算用の変数
// ==================================================

// 起動後に回転した累積角度
float cumulativeAngleZ = 0.0;

// 静止中に発生するジャイロの誤差
float gyroOffsetZ = 0.0;

// 前回角度を計算した時刻
unsigned long previousCalculationTime = 0;

// 前回シリアルへ送信した時刻
unsigned long previousSendTime = 0;


// ==================================================
// 設定値
// ==================================================

// 角度を計算する間隔
// 10000マイクロ秒 = 10ミリ秒
const unsigned long calculationInterval = 10000UL;

// シリアルへ送信する間隔
// 20000マイクロ秒 = 20ミリ秒
const unsigned long sendInterval = 20000UL;

// この値未満の角速度をノイズとして無視
// 単位：度/秒
const float gyroDeadZone = 1.0;


// ==================================================
// 初期設定
// ==================================================

void setup() {
  Serial.begin(115200);

  // シリアル接続を最大3秒待つ
  unsigned long waitStart = millis();

  while (!Serial && millis() - waitStart < 3000) {
  }

  // IMUを開始
  if (imu.begin() != 0) {
    Serial.println("ERROR: IMUを開始できませんでした");

    while (true) {
      delay(1000);
    }
  }

  Serial.println("IMUを初期化しました");
  Serial.println("補正中は机に置いたまま動かさないでください");

  delay(1000);

  // 静止時のジャイロ誤差を測定
  calibrateGyro();

  cumulativeAngleZ = 0.0;

  // 時刻を初期化
  previousCalculationTime = micros();
  previousSendTime = micros();

  Serial.println("計測開始");
  Serial.println("20msごとに累積角度を送信します");
  Serial.println("rを送信すると角度を0度に戻します");

  // 初期角度
  Serial.println("ANGLE,0.0");
}


// ==================================================
// 繰り返し処理
// ==================================================

void loop() {
  unsigned long currentTime = micros();


  // --------------------------------------------------
  // 10msごとに角度を計算
  // --------------------------------------------------

  if (
    currentTime - previousCalculationTime
    >= calculationInterval
  ) {
    // 実際に経過した時間を秒へ変換
    float deltaTime =
        (currentTime - previousCalculationTime)
        / 1000000.0;

    previousCalculationTime = currentTime;

    // Z軸周りの角速度を取得
    // 単位：度/秒
    float gyroZ = imu.readFloatGyroZ();

    // 静止時の誤差を引く
    gyroZ -= gyroOffsetZ;

    // 小さな揺れやノイズを無視
    if (abs(gyroZ) < gyroDeadZone) {
      gyroZ = 0.0;
    }

    // 累積角度を更新
    //
    // 360度を超えても0度には戻さない
    cumulativeAngleZ += gyroZ * deltaTime;
  }


  // --------------------------------------------------
  // 20msごとに現在の累積角度を送信
  // --------------------------------------------------

  if (
    currentTime - previousSendTime
    >= sendInterval
  ) {
    previousSendTime = currentTime;

    Serial.print("ANGLE,");
    Serial.println(cumulativeAngleZ, 1);
  }


  // --------------------------------------------------
  // シリアルからのリセット命令
  // --------------------------------------------------

  if (Serial.available() > 0) {
    char command = Serial.read();

    if (command == 'r' || command == 'R') {
      cumulativeAngleZ = 0.0;

      Serial.println("RESET,0.0");
      Serial.println("ANGLE,0.0");
    }
  }
}


// ==================================================
// ジャイロの補正
// ==================================================

void calibrateGyro() {
  const int sampleCount = 500;
  float total = 0.0;

  // 約2秒間、静止状態のZ軸角速度を測定
  for (int i = 0; i < sampleCount; i++) {
    total += imu.readFloatGyroZ();
    delay(4);
  }

  // 測定値の平均を補正値として保存
  gyroOffsetZ = total / sampleCount;

  Serial.print("ジャイロ補正値：");
  Serial.println(gyroOffsetZ, 4);
}