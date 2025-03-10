import * as THREE from 'three';
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass";

export default class Sketch {
	static get PLANET_PARAMS() {
		return (
			[
				{
					name: "mercury",
					size: "2441",
					texture: 'images/mercury.jpg',
					rotationSpeed: 0.05,
					revolutionSpeed: 0.01,
					distance: 390,
				},
				{
					name: "venus",
					size: "6052",
					texture: 'images/venus.jpg',
					rotationSpeed: 0.05,
					revolutionSpeed: 0.008,
					distance: 720,
				},
				{
					name: "earth",
					size: "6378",
					texture: 'images/earth.png',
					rotationSpeed: 0.05,
					revolutionSpeed: 0.006,
					distance: 1000,
					satellite: "moon",
				},
				{
					name: "mars",
					size: "3396",
					texture: 'images/mars.jpg',
					rotationSpeed: 0.05,
					revolutionSpeed: 0.004,
					distance: 1520,
				},
				{
					name: "jupiter",
					size: "71492",
					texture: 'images/jupiter.jpg',
					rotationSpeed: 0.05,
					revolutionSpeed: 0.002,
					distance: 5200,
				},
				{
					name: "saturn",
					size: "60268",
					texture: 'images/saturn.jpg',
					rotationSpeed: 0.05,
					revolutionSpeed: 0.0008,
					distance: 9540,
					satellite: "saturnSatellites",
				},
				{
					name: "uranus",
					size: "25559",
					texture: 'images/uranus.jpg',
					rotationSpeed: 0.05,
					revolutionSpeed: 0.0006,
					distance: 19190,
				},
				{
					name: "neptune",
					size: "24764",
					texture: 'images/neptune.jpg',
					rotationSpeed: 0.05,
					revolutionSpeed: 0.0004,
					distance: 30070,
				},
			]
		)
	}

	static get SATELLITE_PARAMS() {
		// 月のマテリアルとジオメトリ
		const moonGeometry = new THREE.SphereGeometry(Sketch.filterPlanetSize(1738), 32, 32);
		const moonMaterial = new THREE.MeshStandardMaterial({ map: new THREE.TextureLoader().load('images/moon.jpg') });

		// 土星の衛星のマテリアルとジオメトリ
		const saturnSatellitesGeometry = new THREE.TorusGeometry( 2000, 500, 2, 200 );
		const saturnSatellitesMaterial = new THREE.MeshStandardMaterial({ color:0xcdb07a  });

		return (
			[
				{
					name: "moon",
					material: moonMaterial,
					geometry: moonGeometry,
					planet: "earth",
					rotationSpeed: 0.02,
					revolutionSpeed: 0.1,
					distance: 800,
				},
				{
					name: "saturnSatellites",
					material: saturnSatellitesMaterial,
					geometry: saturnSatellitesGeometry,
					planet: "saturn",
					rotationSpeed: 0.0,
					revolutionSpeed: 0,
					distance: 0,
				},
			]
		);
	}

	constructor(options) {
		this.container = options.dom;
		this.width = window.innerWidth;
		this.height = window.innerHeight;

		// シーン
		this.scene = new THREE.Scene();

		// シーンにフォグを追加
		this.scene.fog = new THREE.Fog(new THREE.Color(0x000000), 1, Sketch.filterDistance(70000));


		// カメラ
		this.camera = new THREE.PerspectiveCamera(
			60,
			window.innerWidth / window.innerHeight,
			0.1,
			100000,
		);
		this.camera.position.set(2000,2000,15000);
		this.camera.lookAt(new THREE.Vector3(0.0, 0.0, 0.0));

		// レンダラ
		this.renderer = new THREE.WebGLRenderer();
		this.renderer.setClearColor(new THREE.Color(0x000000));
		this.renderer.setSize(this.width, this.height);
		this.renderer.shadowMap.enabled = true;
		this.container.appendChild(this.renderer.domElement);

		this.renderPass = new RenderPass(this.scene, this.camera);

		this.bloomPass = new UnrealBloomPass(
			new THREE.Vector2(this.width, this.height),
			0.8,
			0.8,
			0.0,
		);

		// コントロール
		this.controls = new OrbitControls(this.camera, this.renderer.domElement);

		 // ヘルパー
		const axesBarLength = 20000.0;
		this.axesHelper = new THREE.AxesHelper(axesBarLength);
		// this.scene.add(this.axesHelper);

		this.effectComposer = new EffectComposer(this.renderer);
		this.effectComposer.addPass(this.renderPass);
		this.effectComposer.addPass(this.bloomPass);
		this.effectComposer.setSize(this.width, this.height);

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

	static filterDistance(distance) {
		return Math.pow(distance*100, 0.75) + 1000;
	}

	static filterPlanetSize(size,mode) {
		if (mode == "isSun") {
			return Math.pow(size, 0.55);
		} else {
			return Math.pow(size, 0.65);
		}
	}

	addObjects() {
		// 太陽
		this.sunTexture = new THREE.TextureLoader().load('images/sun.jpg');
		this.sunGeometry = new THREE.SphereGeometry( Sketch.filterPlanetSize(696000,"isSun"), 32, 32 );
		this.sunMaterial = new THREE.MeshStandardMaterial({color: new THREE.Color(0xfbb245)});
		this.sunMaterial.emissiveMap = this.sunTexture;
		this.sunMaterial.emissive = new THREE.Color(0xfbb245);
		this.sunMaterial.emissiveIntensity = 1.0;
		this.sunMesh = new THREE.Mesh(this.sunGeometry, this.sunMaterial);
		this.scene.add(this.sunMesh);

		// 衛星の生成
		Sketch.SATELLITE_PARAMS.forEach((satellite) => {
			this[satellite.name + "Group"] = new THREE.Group();
			this[satellite.name + "Mesh"] = new THREE.Mesh(satellite.geometry, satellite.material);
			this[satellite.name + "Mesh"].castShadow = true;
			this[satellite.name + "Mesh"].receiveShadow = true;
			this[satellite.name + "Group"].add(this[satellite.name + "Mesh"]);

			// 土星の衛星を90度回転させる
			if (satellite.name === "saturnSatellites") {
				this[satellite.name + "Mesh"].rotation.x = Math.PI / 2; // 90度回転
			}
		});

		// 惑星の生成
		Sketch.PLANET_PARAMS.forEach((planet) => {
			const filteredSize = Sketch.filterPlanetSize(planet.size)

			this[planet.name + "Group"] = new THREE.Group();
			this[planet.name + "Texture"] = new THREE.TextureLoader().load(planet.texture);
			this[planet.name + "Geometry"] = new THREE.SphereGeometry( filteredSize, 32, 32 );
			this[planet.name + "Material"] = new THREE.MeshStandardMaterial({ map: this[planet.name + "Texture"],metalness: 0.5,roughness: 0.5 });
			this[planet.name + "Mesh"] = new THREE.Mesh(this[planet.name + "Geometry"], this[planet.name + "Material"]);
			this[planet.name + "Mesh"].castShadow = true;
			this[planet.name + "Mesh"].receiveShadow = true;
			planet.satellite ? this[planet.name + "Group"].add(this[planet.name + "Mesh"],this[planet.satellite + "Group"]) : this[planet.name + "Group"].add(this[planet.name + "Mesh"]);
			this.scene.add(this[planet.name + "Group"]);
		})

		// 小さい星
		// 形状データを作成
		const SIZE = Sketch.filterDistance(30070);
		// 配置する個数
		const LENGTH = 2000;
		// 頂点情報を格納する配列
		const vertices = [];
		for (let i = 0; i < LENGTH; i++) {
			const x = SIZE * (Math.random() * 2.0 - 1.0);
			const y = SIZE * (Math.random() * 2.0 - 1.0);
			const z = SIZE * (Math.random() * 2.0 - 1.0);

			vertices.push(x, y, z);
		}

		// 形状データを作成
		this.starsGeometry = new THREE.BufferGeometry();
		this.starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));

		// マテリアルを作成
		this.starsMaterial = new THREE.PointsMaterial({ size: 1, color: 0xffffff });

		// 物体を作成
		this.starsMesh = new THREE.Points(this.starsGeometry, this.starsMaterial);
		this.scene.add(this.starsMesh);
	}

	addLight() {
		// ポイントライト
		this.pointLight = new THREE.PointLight(0xffffff, 1, Sketch.filterDistance(40000));
		this.pointLight.position.set(0, 0, 0);
		this.pointLight.castShadow = true;
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
			// 衛星の公転の中心（惑星から太陽までの位置）
			const planetDistance = Sketch.filterDistance(Sketch.PLANET_PARAMS.find(planet => planet.name === satellite.planet).distance);
			this[satellite.name + "Group"].position.set(0, 0, planetDistance);
			// 衛星の自転速度
			this[satellite.name + "Mesh"].rotation.y += satellite.rotationSpeed;
			// 惑星から衛星までの距離
			this[satellite.name + "Mesh"].position.set(0.0, 0.0, satellite.distance);
		})

		Sketch.PLANET_PARAMS.forEach((planet) => {
			// 惑星の公転速度
			this[planet.name + "Group"].rotation.y += planet.revolutionSpeed;
			// 惑星の自転速度
			this[planet.name + "Mesh"].rotation.y += planet.rotationSpeed;
			// 太陽から惑星までの距離
			this[planet.name + "Mesh"].position.set(0.0, 0.0, Sketch.filterDistance(planet.distance));
		})

		// 描画フェーズ
		this.effectComposer.render();
	}
}

new Sketch({
	dom: document.getElementById("container")
});
