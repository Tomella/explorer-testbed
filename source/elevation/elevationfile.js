
var prepareTIFF = function () {
   var files = document.getElementById("tiff-file").files;
   var file = files[0];

   if (files.length < 1 || file.type !== 'image/tiff') {
      return;
   }
   loadOn(file);
};



function loadOn(file) {
   var bbox = [147.8, -37, 148.8, -36];
   var resx = 500;
   var resy = 500;
   var loader = new Elevation.FileLoader(file, { blockSize: 1024 * 1024 * 16 });
   var area = new Elevation.TerrainLoader({ loader: loader });
   var state = {};
   var element = document.getElementById("target");

   // We don't know what file someone will pick so we wait to hear how big it is.
   area.addEventListener("header", event => {
      resx = event.data.width;
      resy = event.data.height;
      console.log("Resolution x = " + resx);
   });

   area.load().then(res => {
      var max = res.reduce((a, b) => Math.max(a, b), 0);
      var min = res.reduce((a, b) => Math.min(a, b), 0);
      let range = max - min;

      let bbox = element.getBoundingClientRect();
      let w = bbox.width;
      let h = bbox.height;

      state.scene = new THREE.Scene();

      state.camera = new THREE.PerspectiveCamera(45, w / h, 1, 10000);
      state.camera.position.z = 500;
      state.camera.position.x = 0;
      state.camera.position.y = 633;

      state.renderer = new THREE.WebGLRenderer({
         antialias: true
      });
      state.renderer.setSize(w, h);
      state.renderer.setClearColor(0x555555, 1.0);
      element.appendChild(state.renderer.domElement);

      var geometry = new THREE.PlaneGeometry(resx, resx, resx - 1, resx - 1);

      geometry.vertices.forEach(function (vertice, i) {
         vertice.z = res[i] / range * 40;
      });
      // We want some shadows
      geometry.computeFaceNormals();
      geometry.computeVertexNormals();


      var material = new THREE.MeshPhongMaterial({
         color: 0x158962,
         emissive: 0x073425,
         side: THREE.DoubleSide,
         shading: THREE.FlatShading
      });
      var plane = new THREE.Mesh(geometry, material);
      // Make it flat
      plane.rotation.x = -Math.PI / 2;



      //resizer = THREEExt.WindowResize(state.renderer, state.camera, element);
      //scatterPlot = state.container = new THREE.Object3D();
      //state.scene.add(scatterPlot);
      state.scene.add(plane);
      var orbit = new THREE.OrbitControls(state.camera, state.renderer.domElement);
      addLights(state.scene);
      render();
   });

   function render() {
      requestAnimationFrame(render);
      state.renderer.render(state.scene, state.camera);
   }


   function addLights(scene) {
      //scene.add(new THREE.AmbientLight(0x333333));
      var lights = [];
      lights[0] = new THREE.PointLight(0xeeeeee, 1, 0);
      lights[1] = new THREE.PointLight(0xeeeeee, 1, 0);
      lights[2] = new THREE.PointLight(0xeeeeee, 1, 0);

      lights[0].position.set(0, 200, 0);
      lights[1].position.set(100, 200, 100);
      lights[2].position.set(- 100, - 200, - 100);
      state.scene.add(lights[0]);
      state.scene.add(lights[1]);
      state.scene.add(lights[2]);
   }

   window.addEventListener('resize', function () {
      state.camera.aspect = window.innerWidth / window.innerHeight;
      state.camera.updateProjectionMatrix();
      state.renderer.setSize(window.innerWidth, window.innerHeight);
   }, false);
}