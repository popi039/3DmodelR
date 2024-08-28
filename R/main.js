import * as THREE from 'https://cdn.jsdelivr.net/npm/three@latest/build/three.module.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@latest/examples/jsm/loaders/GLTFLoader.js'; // GLTFLoaderをインポート

// 画面サイズの取得
const windowWidth = window.innerWidth;
const windowHeight = window.innerHeight;

// レンダラーの作成
const canvas = document.getElementById('canvas');
const renderer = new THREE.WebGLRenderer({ canvas: canvas });
renderer.setSize(windowWidth, windowHeight);
renderer.setPixelRatio(window.devicePixelRatio); // デバイスポリッシュの設定

// シーンの作成
const scene = new THREE.Scene();

// テクスチャの読み込みと背景設定
const textureLoader = new THREE.TextureLoader();
textureLoader.load('back.JPG', (texture) => {
    // 背景テクスチャの設定
    scene.background = texture;
});

// カメラの作成
const camera = new THREE.PerspectiveCamera(30, windowWidth / windowHeight, 0.1, 1000);
camera.position.set(0, 20, 50);
camera.lookAt(0, 0, 0);

// ライトの作成
const ambientLight = new THREE.AmbientLight(0x404040, 2); // 強さを2に増加
scene.add(ambientLight);

const pointLight = new THREE.PointLight(0xffffff, 3, 100); // 強さを3に増加
pointLight.position.set(15, 30, 20); // 位置を調整
scene.add(pointLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5); // 強さを1.5に増加
directionalLight.position.set(10, 20, 15).normalize(); // 位置を調整
scene.add(directionalLight);

// マウス制御
const controls = new OrbitControls(camera, renderer.domElement);
controls.zoomSpeed = 1.2; // ズームスピードを調整

// アニメーションミキサーの設定
const mixers = [];
let currentAction1 = null; // 現在のアニメーションアクション1を追跡
let currentAction2 = null; // 現在のアニメーションアクション2を追跡
let currentAction3 = null; // 現在のアニメーションアクション3を追跡

// GLTFLoader のインスタンス化
const loader = new GLTFLoader();
loader.load('nice.glb', function (gltf) {
    const model = gltf.scene;

    // モデルをシーンに追加
    scene.add(model);

    // モデルの位置をX軸に+70、Y軸に-110移動
    model.position.set(70, -110, model.position.z);

    console.log('Model loaded and positioned:', model.position); // デバッグ情報: モデルの位置を確認

    model.traverse((child) => {
        if (child.isMesh) {
            console.log('Mesh found:', child);
        }
    });

    // モデルのバウンディングボックスを取得
    const boundingBox = new THREE.Box3().setFromObject(model);
    const modelCenter = boundingBox.getCenter(new THREE.Vector3());

    // カメラの位置を調整
    const distance = boundingBox.getSize(new THREE.Vector3()).length() * 1.2;
    camera.position.set(modelCenter.x, modelCenter.y + 1.5, modelCenter.z + distance * 0.8);
    camera.lookAt(modelCenter);

    scene.add(model);

    // GLTFファイル内のアニメーションの確認
    console.log(gltf.animations);

    // アニメーションの設定
    gltf.animations.forEach(function (clip) {
        const mixer = new THREE.AnimationMixer(model);
        const action = mixer.clipAction(clip);
        mixers.push(mixer);

        // アニメーション名を変更し、適切なアクションを設定
        if (clip.name === '[保留アクション]') {
            console.log('animation_ok');
            currentAction1 = action;
            action.loop = THREE.LoopRepeat; // ループ設定を繰り返しに変更
            action.play(); // アニメーションを常に再生
        }
        if (clip.name === '[保留アクション].001') {
            console.log('animation1_ok');
            currentAction2 = action;
            action.loop = THREE.LoopOnce; // ループ設定を1回のみに変更
            action.clampWhenFinished = true; // アニメーション終了時に位置をクランプ
        }
        if (clip.name === 'see2') {
            console.log('see2_ok');
            currentAction3 = action;
            action.setEffectiveTimeScale(0.5); // スピードを0.5倍に設定
            action.loop = THREE.LoopRepeat; // ループ設定を繰り返しに変更
            action.play(); // アニメーションを再生
        }
    });
}, undefined, function (error) {
    console.error('An error happened:', error);
});

// アニメーションのトリガー関数
let animationTriggerCount = 0; // アニメーションのトリガー回数を管理する変数
const maxTriggers = 10; // 最大トリガー回数

function triggerAnimation1() {
    if (currentAction2 && animationTriggerCount < maxTriggers) {
        currentAction2.timeScale = 5; // スピードを5倍に設定
        currentAction2.reset(); // アニメーションをリセット
        currentAction2.play(); // アニメーションをリセットして再生
        animationTriggerCount++; // トリガー回数を増加
        console.log(`アニメーションがトリガーされました (${animationTriggerCount}/${maxTriggers})`);
    } else if (animationTriggerCount >= maxTriggers) {
        clearInterval(animationInterval); // 最大トリガー回数に達したらインターバルをクリア
        console.log('アニメーションのトリガー回数の上限に達しました。');
    }
}

// 5秒ごとにアニメーションをトリガーする
let animationInterval = setInterval(triggerAnimation1, 5000); // 5秒ごとに呼び出し

// アニメーション
function animate() {
    requestAnimationFrame(animate);

    renderer.render(scene, camera);

    mixers.forEach(function (mixer) {
        mixer.update(0.01); // deltaTime を更新
    });
}

animate();
