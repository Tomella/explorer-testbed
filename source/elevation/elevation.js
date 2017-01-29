/*
var point = [148.26, -36.46];

var elevation = new Elevation.CswPointElevationLoader({
   template: "http://services.ga.gov.au/site_9/services/DEM_SRTM_1Second_over_Bathymetry_Topography/MapServer/WCSServer?SERVICE=WCS&VERSION=1.0.0&REQUEST=GetCoverage&coverage=1&CRS=EPSG:4326&BBOX=${bbox}&FORMAT=GeoTIFF&RESX=${resx}&RESY=${resy}&RESPONSE_CRS=EPSG:4326&HEIGHT=${height}&WIDTH=${width}",
   point: point
});

elevation.load().then(res => {
   console.log(res);
});

elevation.point = [148.2625, -36.4575];

elevation.load().then(res => {
   console.log(res);
});

elevation.point = [148.2629, -36.4575];

elevation.load().then(res => {
   console.log(res);
});

elevation.point = [148.264359, -36.414251];

elevation.load().then(res => {
   console.log(res);
});

// Geehi 36.4151802,148.2630508,20.5z
elevation.point = [148.26359, -36.45584];

elevation.load().then(res => {
   console.log(res);
});
*/
// Melbourne
//var bbox = [144.3, -38.7, 145.3, -37.7];


function testPathElevation() {
   var pather = new Elevation.CswPathElevationLoader({
      template: "http://services.ga.gov.au/site_9/services/DEM_SRTM_1Second_over_Bathymetry_Topography/MapServer/WCSServer?SERVICE=WCS&VERSION=1.0.0&REQUEST=GetCoverage&coverage=1&CRS=EPSG:4326&BBOX=${bbox}&FORMAT=GeoTIFF&RESX=${resx}&RESY=${resy}&RESPONSE_CRS=EPSG:4326&HEIGHT=${height}&WIDTH=${width}",
      path: [[144.914, -38.351], [144.942, -38.342], [144.951, -38.354]],
      count: 200,
      line: true
   });
   var state = {};

   pather.load().then(res => {

      let element = document.getElementById("target");
      let bbox = element.getBoundingClientRect();
      let w = bbox.width;
      let h = bbox.height;


      var max = -Infinity;
      var min = Infinity;

      var maxX = -Infinity;
      var minX = Infinity;

      var maxY = -Infinity;
      var minY = Infinity;

      res.geometry.coordinates.forEach(coord => {
         let pt = {
            x: coord[0],
            y: coord[1],
            z: coord[2]
         };

         maxX = Math.max(maxX, pt.x);
         minX = Math.min(minX, pt.x);

         maxY = Math.max(maxY, pt.y);
         minY = Math.min(minY, pt.y);

         max = Math.max(max, pt.z);
         min = Math.min(min, pt.z);
      });

      var midX = minX + (maxX - minX) / 2;
      var midY = minY + (maxY - minY) / 2;
      let range = max - min;

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

      let scatterPlot = state.container = new THREE.Object3D();
      state.scene.add(scatterPlot);

      var pointGeo = new THREE.Geometry();


      res.geometry.coordinates.forEach((coords, i) => {
         var x = coords[0];
         var y = coords[1];
         var z = coords[2];
         var p = new THREE.Vector3((x - midX) * 10000, (y - midY) * 10000, (z - min) / 4 - 550);
         pointGeo.vertices.push(p);
         pointGeo.colors.push(new THREE.Color().setRGB(
            hexToRgb("#34ff23").r / 255, hexToRgb("#34ff23").g / 255,
            hexToRgb("#34ff23").b / 255));

      });
      if (res.length) {
         pointGeo.computeBoundingSphere();
         if (pointGeo.boundingSphere.radius < 5) {
            console.log("Overriding bounding sphere radius" + pointGeo.boundingSphere.radius);
            pointGeo.boundingSphere.radius = 5;
         }
      }

      var mat = new THREE.LineBasicMaterial({
	      color: 0x0000ff
      });

      var line = new THREE.Line(pointGeo, mat);
      scatterPlot.add(line);

      // Make it flat
      scatterPlot.rotation.x = -Math.PI / 2;




      //resizer = THREEExt.WindowResize(state.renderer, state.camera, element);
      //scatterPlot = state.container = new THREE.Object3D();
      //state.scene.add(scatterPlot);

      var orbit = new THREE.OrbitControls(state.camera, state.renderer.domElement);
      addLights(state.scene);
      render();
   });


   function addLights(scene) {
      //scene.add(new THREE.AmbientLight(0x333333));
      var lights = [];
      lights[0] = new THREE.PointLight(0xffffff, 1, 0);
      lights[1] = new THREE.PointLight(0xffffff, 1, 0);
      lights[2] = new THREE.PointLight(0xffffff, 1, 0);

      lights[0].position.set(0, 200, 0);
      lights[1].position.set(100, 200, 100);
      lights[2].position.set(- 100, - 200, - 100);
      state.scene.add(lights[0]);
      state.scene.add(lights[1]);
      state.scene.add(lights[2]);
   }


   function render() {
      requestAnimationFrame(render);
      state.renderer.render(state.scene, state.camera);
   }

   window.addEventListener('resize', function () {
      state.camera.aspect = window.innerWidth / window.innerHeight;
      state.camera.updateProjectionMatrix();
      state.renderer.setSize(window.innerWidth, window.innerHeight);
   }, false);
}


function showTerrain() {

   var bbox = [147.8, -37, 148.8, -36];
   var resx = 500;

   var area = new Elevation.CswTerrainLoader({
      template: "http://services.ga.gov.au/site_9/services/DEM_SRTM_1Second_over_Bathymetry_Topography/MapServer/WCSServer?SERVICE=WCS&VERSION=1.0.0&REQUEST=GetCoverage&coverage=1&CRS=EPSG:4326&BBOX=${bbox}&FORMAT=GeoTIFF&RESX=${resx}&RESY=${resy}&RESPONSE_CRS=EPSG:4326&HEIGHT=${height}&WIDTH=${width}",
      bbox: bbox,
      resolutionX: resx
   });

   var state = {};
   var element = document.getElementById("target");


   area.load().then(res => {
      var max = res.reduce((a, b) => Math.max(a, b), 0);

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
         vertice.z = res[i] * 0.02;
      });
      // We want some shadows
      geometry.computeFaceNormals();
      geometry.computeVertexNormals();


      var material = new THREE.MeshPhongMaterial({
         color: 0x156289,
         emissive: 0x072534,
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
      lights[0] = new THREE.PointLight(0xffffff, 1, 0);
      lights[1] = new THREE.PointLight(0xffffff, 1, 0);
      lights[2] = new THREE.PointLight(0xffffff, 1, 0);

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

function hexToRgb(hex) { // TODO rewrite with vector output
   var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
   return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
   } : null;
}