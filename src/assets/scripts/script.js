import * as THREE from 'three';
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

export default class Sketch {
	static get PLANET_PARAMS() {
		return (
			[
				{
					name: "mercury",
					size: "1",
					texture: 'images/mercury.jpg',
					rotationSpeed: 0.05,
					revolutionSpeed: 0.01,
					distance: 30,
				},
				{
					name: "venus",
					size: "3",
					texture: 'images/venus.jpg',
					rotationSpeed: 0.05,
					revolutionSpeed: 0.008,
					distance: 60,
				},
				{
					name: "earth",
					size: "3",
					texture: 'images/earth.png',
					rotationSpeed: 0.05,
					revolutionSpeed: 0.006,
					distance: 90,
					satellite: "moon",
				},
				{
					name: "mars",
					size: "1.5",
					texture: 'images/mars.jpg',
					rotationSpeed: 0.05,
					revolutionSpeed: 0.004,
					distance: 120,
				},
				{
					name: "jupiter",
					size: "33",
					texture: 'images/jupiter.jpg',
					rotationSpeed: 0.05,
					revolutionSpeed: 0.002,
					distance: 200,
				},
				{
					name: "saturn",
					size: "27",
					texture: 'images/saturn.jpg',
					rotationSpeed: 0.05,
					revolutionSpeed: 0.0008,
					distance: 250,
				},
				{
					name: "uranus",
					size: "12",
					texture: 'images/uranus.jpg',
					rotationSpeed: 0.05,
					revolutionSpeed: 0.0006,
					distance: 300,
				},
				{
					name: "neptune",
					size: "12",
					texture: 'images/neptune.jpg',
					rotationSpeed: 0.05,
					revolutionSpeed: 0.0004,
					distance: 350,
				},
			]
		)
	}

	static get SATELLITE_PARAMS() {
		const moonMaterial = new THREE.MeshStandardMaterial({ map: new THREE.TextureLoader().load('images/moon.jpg') });
		const moonGeometry = new THREE.SphereGeometry(2, 32, 32);

		return (
			[
				{
					name: "moon",
					material: moonMaterial,
					geometry: moonGeometry,
					planet: "earth",
					rotationSpeed: 0.02,
					revolutionSpeed: 0.1,
					distance: 10,
				}
			]
		);
	}

	constructor(options) {
		this.container = options.dom;
		this.width = window.innerWidth;
		this.height = window.innerHeight;

		// レンダラ
		this.renderer = new THREE.WebGLRenderer();
		this.renderer.setClearColor(new THREE.Color(0x000000));
		this.renderer.setSize(this.width, this.height);
		this.container.appendChild(this.renderer.domElement);

		// シーン
		this.scene = new THREE.Scene();

		// シーンにフォグを追加
		this.scene.fog = new THREE.Fog(new THREE.Color(0x000000), 1, 1500);


		// カメラ
		this.camera = new THREE.PerspectiveCamera(
			60,
			window.innerWidth / window.innerHeight,
			0.1,
			5000,
		);
		this.camera.position.set(10,30,100);
		this.camera.lookAt(new THREE.Vector3(0.0, 0.0, 0.0));

		// コントロール
		this.controls = new OrbitControls(this.camera, this.renderer.domElement);

		 // ヘルパー
		const axesBarLength = 20.0;
		this.axesHelper = new THREE.AxesHelper(axesBarLength);
		// this.scene.add(this.axesHelper);

		this.addObjects();
		this.addLight()
		this.render();

		// リサイズイベント
		window.addEventListener('resize', () => {
			this.renderer.setSize(window.innerWidth, window.innerHeight);
			this.camera.aspect = window.innerWidth / window.innerHeight;
			this.camera.updateProjectionMatrix();
		}, false);

		// キーの押下や離す操作を検出できるようにする
		window.addEventListener('keydown', (keyEvent) => {
			// スペースキーが押されている場合はフラグを立てる
			switch (keyEvent.key) {
				case ' ':
					this.isDown = true;
					break;
				case 'c':
					this.controls.reset();
					// this.mesh.rotation.y = 0;
					break;
				default:
			}
		}, false);

		window.addEventListener('keyup', (keyEvent) => {
				// なんらかのキーが離された操作で無条件にフラグを下ろす
				this.isDown = false;
		}, false);
	}

	addObjects() {
		// 太陽
		this.sunTexture = new THREE.TextureLoader().load('images/sun.jpg');
		this.sunGeometry = new THREE.SphereGeometry( 10, 32, 32 );
		this.sunMaterial = new THREE.MeshBasicMaterial({ map: this.sunTexture });
		this.sunMesh = new THREE.Mesh(this.sunGeometry, this.sunMaterial);
		this.scene.add(this.sunMesh);

		// 衛星の生成
		Sketch.SATELLITE_PARAMS.forEach((satellite) => {
			this[satellite.name + "Group"] = new THREE.Group();
			this[satellite.name + "Mesh"] = new THREE.Mesh(satellite.geometry, satellite.material);
			this[satellite.name + "Group"].add(this[satellite.name + "Mesh"]);
		});

		// 惑星の生成
		Sketch.PLANET_PARAMS.forEach((planet) => {
			this[planet.name + "Group"] = new THREE.Group();
			this[planet.name + "Texture"] = new THREE.TextureLoader().load(planet.texture);
			this[planet.name + "Geometry"] = new THREE.SphereGeometry( planet.size, 32, 32 );
			this[planet.name + "Material"] = new THREE.MeshStandardMaterial({ map: this[planet.name + "Texture"] });
			this[planet.name + "Mesh"] = new THREE.Mesh(this[planet.name + "Geometry"], this[planet.name + "Material"]);
			planet.satellite ? this[planet.name + "Group"].add(this[planet.name + "Mesh"],this[planet.satellite + "Group"]) : this[planet.name + "Group"].add(this[planet.name + "Mesh"]);
			this.scene.add(this[planet.name + "Group"]);
		})

		// 小さい星
		this.starGeometry = new THREE.SphereGeometry( 0.1, 32, 32 );
		this.starMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
		for (let i = 0; i <= 20000; ++i) {
			this.starMesh = new THREE.Mesh(this.starGeometry, this.starMaterial);
			// 座標をランダムに散らす
			this.starMesh.position.x = (Math.random() * 2.0 - 1.0) * 500;
			this.starMesh.position.y = (Math.random() * 2.0 - 1.0) * 500;
			this.starMesh.position.z = (Math.random() * 2.0 - 1.0) * 500;
			// シーンに追加する
			this.scene.add(this.starMesh);
		}
	}

	addLight() {
		// ポイントライト
		this.pointLight = new THREE.PointLight(0xffffff, 3, 400);
		this.pointLight.position.set( 0,0,0);
		this.scene.add(this.pointLight);

		// ポイントライトヘルパー
		const pointLightHelper = new THREE.PointLightHelper(this.pointLight, 15);
		// this.scene.add(pointLightHelper);


		// アンビエントライト（環境光）
		this.ambientLight = new THREE.AmbientLight(0x555555,1);
		this.scene.add(this.ambientLight);
	}

	render() {
		// 恒常ループ
		requestAnimationFrame(this.render.bind(this));

		// コントロールを更新
		this.controls.update();

		// 太陽の自転
		this.sunMesh.rotation.y += 0.01;

		Sketch.SATELLITE_PARAMS.forEach((satellite) => {
			// 衛星の公転速度
			this[satellite.name + "Group"].rotation.y += satellite.revolutionSpeed;
			// 衛星の公転の中心（惑星の太陽からの位置）
			const planetDistance = Sketch.PLANET_PARAMS.find(planet => planet.name === satellite.planet).distance;
			this[satellite.name + "Group"].position.set(0, 0, planetDistance);
			// 衛星の自転速度
			this[satellite.name + "Mesh"].rotation.y += satellite.rotationSpeed;
			// 衛星の惑星からの距離
			this[satellite.name + "Mesh"].position.set(0.0, 0.0, satellite.distance);
		})

		Sketch.PLANET_PARAMS.forEach((planet) => {
			// 惑星の公転速度
			this[planet.name + "Group"].rotation.y += planet.revolutionSpeed;
			// 惑星の自転速度
			this[planet.name + "Mesh"].rotation.y += planet.rotationSpeed;
			// 太陽からの距離
			this[planet.name + "Mesh"].position.set(0.0, 0.0, planet.distance);
		})

		// 描画フェーズ
		this.renderer.render(this.scene, this.camera);
	}
}

new Sketch({
	dom: document.getElementById("container")
});
