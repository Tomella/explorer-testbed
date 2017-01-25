/**
Licensed to the Apache Software Foundation (ASF) under one
or more contributor license agreements.  See the NOTICE file
distributed with this work for additional information
regarding copyright ownership.  The ASF licenses this file
to you under the Apache License, Version 2.0 (the
"License"); you may not use this file except in compliance
with the License.  You may obtain a copy of the License at

  http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing,
software distributed under the License is distributed on an
"AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, either express or implied.  See the License for the
specific language governing permissions and limitations
under the License.
*/

"use strict";

/*
var point = [148.26, -36.46];

var elevation = new Elevation.CswPointElevationLoader("http://services.ga.gov.au/site_9/services/DEM_SRTM_1Second_over_Bathymetry_Topography/MapServer/WCSServer?SERVICE=WCS&VERSION=1.0.0&REQUEST=GetCoverage&coverage=1&CRS=EPSG:4326&BBOX=${bbox}&FORMAT=GeoTIFF&RESX=${resx}&RESY=${resy}&RESPONSE_CRS=EPSG:4326&HEIGHT=${height}&WIDTH=${width}", point);

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

function showTerrain() {

   var bbox = [147.8, -37, 148.8, -36];
   var resx = 500;

   var area = new Elevation.CswTerrainLoader("http://services.ga.gov.au/site_9/services/DEM_SRTM_1Second_over_Bathymetry_Topography/MapServer/WCSServer?SERVICE=WCS&VERSION=1.0.0&REQUEST=GetCoverage&coverage=1&CRS=EPSG:4326&BBOX=${bbox}&FORMAT=GeoTIFF&RESX=${resx}&RESY=${resy}&RESPONSE_CRS=EPSG:4326&HEIGHT=${height}&WIDTH=${width}", bbox, resx);
   var state = {};
   var element = document.getElementById("target");

   area.load().then(function (res) {
      var max = res.reduce(function (a, b) {
         return Math.max(a, b);
      }, 0);

      var bbox = element.getBoundingClientRect();
      var w = bbox.width;
      var h = bbox.height;

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
      lights[2].position.set(-100, -200, -100);
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

function hexToRgb(hex) {
   // TODO rewrite with vector output
   var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
   return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
   } : null;
}
"use strict";

var prepareTIFF = function prepareTIFF() {
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
   area.addEventListener("header", function (event) {
      resx = event.data.width;
      resy = event.data.height;
      console.log("Resolution x = " + resx);
   });

   area.load().then(function (res) {
      var max = res.reduce(function (a, b) {
         return Math.max(a, b);
      }, 0);
      var min = res.reduce(function (a, b) {
         return Math.min(a, b);
      }, 0);
      var range = max - min;

      var bbox = element.getBoundingClientRect();
      var w = bbox.width;
      var h = bbox.height;

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
      lights[2].position.set(-100, -200, -100);
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
"use strict";

function showGeoJson() {
   var bbox = [140, -20, 148, -10]; // Melb [144.3, -38.7, 145.3, -37.7]; // mt kos.[147.8, -37, 148.8, -36];
   var resx = 600;
   var resy = 600;
   var area = new Elevation.CswGeoJsonLoader("http://services.ga.gov.au/site_9/services/DEM_SRTM_1Second_over_Bathymetry_Topography/MapServer/WCSServer?SERVICE=WCS&VERSION=1.0.0&REQUEST=GetCoverage&coverage=1&CRS=EPSG:4326&BBOX=${bbox}&FORMAT=GeoTIFF&RESX=${resx}&RESY=${resy}&RESPONSE_CRS=EPSG:4326&HEIGHT=${height}&WIDTH=${width}", bbox, resx);
   var state = {};
   var element = document.getElementById("target");

   area.load().then(function (res) {
      var max = -Infinity;
      var min = Infinity;

      var maxX = -Infinity;
      var minX = Infinity;

      var maxY = -Infinity;
      var minY = Infinity;

      res.features.forEach(function (feature) {
         var pt = feature.geometry.coordinates;
         maxX = Math.max(maxX, pt[0]);
         minX = Math.min(minX, pt[0]);

         maxY = Math.max(maxY, pt[1]);
         minY = Math.min(minY, pt[1]);

         max = Math.max(max, pt[2]);
         min = Math.min(min, pt[2]);
      });

      var midX = minX + (maxX - minX) / 2;
      var midY = minY + (maxY - minY) / 2;
      var range = max - min;

      var bbox = element.getBoundingClientRect();
      var w = bbox.width;
      var h = bbox.height;

      state.scene = new THREE.Scene();

      state.camera = new THREE.PerspectiveCamera(45, w / h, 1, 25000);

      state.camera.position.z = 7882;
      state.camera.position.x = -67;
      state.camera.position.y = 6337;

      state.renderer = new THREE.WebGLRenderer({
         antialias: true
      });
      state.renderer.setSize(w, h);
      state.renderer.setClearColor(0x222222, 1.0);
      element.appendChild(state.renderer.domElement);

      var scatterPlot = state.container = new THREE.Object3D();
      state.scene.add(scatterPlot);

      var pointGeo = new THREE.Geometry();
      res.features.forEach(function (feature, i) {
         var point = feature.geometry.coordinates;
         var x = point[0];
         var y = point[1];
         var z = point[2];
         var p = new THREE.Vector3((x - midX) * 1500, (y - midY) * 1500, (z - min) / 2 - 550);
         pointGeo.vertices.push(p);
         pointGeo.colors.push(new THREE.Color().setRGB(hexToRgb(colour("" + i)).r / 255, hexToRgb(colour("" + i)).g / 255, hexToRgb(colour("" + i)).b / 255));
      });
      if (res.length) {
         pointGeo.computeBoundingSphere();
         if (pointGeo.boundingSphere.radius < 5) {
            console.log("Overriding bounding sphere radius" + pointGeo.boundingSphere.radius);
            pointGeo.boundingSphere.radius = 5;
         }
      }

      var mat = new THREE.PointsMaterial({
         vertexColors: THREE.VertexColors,
         size: 1
      });

      var points = new THREE.Points(pointGeo, mat);
      scatterPlot.add(points);

      // Make it flat
      scatterPlot.rotation.x = -Math.PI / 2;

      //resizer = THREEExt.WindowResize(state.renderer, state.camera, element);
      //scatterPlot = state.container = new THREE.Object3D();
      //state.scene.add(scatterPlot);
      var orbit = new THREE.OrbitControls(state.camera, state.renderer.domElement);
      addLights(state.scene);
      render();
   });

   window.state = state;

   function render() {
      requestAnimationFrame(render);
      state.renderer.render(state.scene, state.camera);
   }

   function colour(i) {
      return "#34ff23";
   }

   function addLights(scene) {
      //scene.add(new THREE.AmbientLight(0x333333));
      var lights = [];
      lights[0] = new THREE.PointLight(0xeeeeee, 1, 0);
      lights[1] = new THREE.PointLight(0xeeeeee, 1, 0);
      lights[2] = new THREE.PointLight(0xeeeeee, 1, 0);

      lights[0].position.set(0, 200, 0);
      lights[1].position.set(100, 200, 100);
      lights[2].position.set(-100, -200, -100);
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
"use strict";

function showPoints() {
   var bbox = [142, -21, 148, -15]; // Melb [144.3, -38.7, 145.3, -37.7]; // mt kos.[147.8, -37, 148.8, -36];
   var resx = 500;
   var resy = 500;
   var area = new Elevation.CswXyzLoader("http://services.ga.gov.au/site_9/services/DEM_SRTM_1Second_over_Bathymetry_Topography/MapServer/WCSServer?SERVICE=WCS&VERSION=1.0.0&REQUEST=GetCoverage&coverage=1&CRS=EPSG:4326&BBOX=${bbox}&FORMAT=GeoTIFF&RESX=${resx}&RESY=${resy}&RESPONSE_CRS=EPSG:4326&HEIGHT=${height}&WIDTH=${width}", bbox, resx);
   var state = {};
   var element = document.getElementById("target");

   area.load().then(function (res) {
      var max = -Infinity;
      var min = Infinity;

      var maxX = -Infinity;
      var minX = Infinity;

      var maxY = -Infinity;
      var minY = Infinity;

      res.forEach(function (pt) {
         maxX = Math.max(maxX, pt.x);
         minX = Math.min(minX, pt.x);

         maxY = Math.max(maxY, pt.y);
         minY = Math.min(minY, pt.y);

         max = Math.max(max, pt.z);
         min = Math.min(min, pt.z);
      });

      var midX = minX + (maxX - minX) / 2;
      var midY = minY + (maxY - minY) / 2;
      var range = max - min;

      var bbox = element.getBoundingClientRect();
      var w = bbox.width;
      var h = bbox.height;

      state.scene = new THREE.Scene();

      state.camera = new THREE.PerspectiveCamera(45, w / h, 1, 20000);

      state.camera.position.z = 7882;
      state.camera.position.x = -67;
      state.camera.position.y = 6337;

      state.renderer = new THREE.WebGLRenderer({
         antialias: true
      });
      state.renderer.setSize(w, h);
      state.renderer.setClearColor(0x222222, 1.0);
      element.appendChild(state.renderer.domElement);

      var scatterPlot = state.container = new THREE.Object3D();
      state.scene.add(scatterPlot);

      var pointGeo = new THREE.Geometry();
      res.forEach(function (point, i) {
         var x = point.x;
         var y = point.y;
         var z = point.z;
         var p = new THREE.Vector3((x - midX) * 1500, (y - midY) * 1500, (z - min) / 2 - 550);
         pointGeo.vertices.push(p);
         pointGeo.colors.push(new THREE.Color().setRGB(hexToRgb(colour("" + i)).r / 255, hexToRgb(colour("" + i)).g / 255, hexToRgb(colour("" + i)).b / 255));
      });
      if (res.length) {
         pointGeo.computeBoundingSphere();
         if (pointGeo.boundingSphere.radius < 5) {
            console.log("Overriding bounding sphere radius" + pointGeo.boundingSphere.radius);
            pointGeo.boundingSphere.radius = 5;
         }
      }

      var mat = new THREE.PointsMaterial({
         vertexColors: THREE.VertexColors,
         size: 1
      });

      var points = new THREE.Points(pointGeo, mat);
      scatterPlot.add(points);

      // Make it flat
      scatterPlot.rotation.x = -Math.PI / 2;

      //resizer = THREEExt.WindowResize(state.renderer, state.camera, element);
      //scatterPlot = state.container = new THREE.Object3D();
      //state.scene.add(scatterPlot);
      var orbit = new THREE.OrbitControls(state.camera, state.renderer.domElement);
      addLights(state.scene);
      render();
   });

   window.state = state;

   function render() {
      requestAnimationFrame(render);
      state.renderer.render(state.scene, state.camera);
   }

   function colour(i) {
      return "#34ff23";
   }

   function addLights(scene) {
      //scene.add(new THREE.AmbientLight(0x333333));
      var lights = [];
      lights[0] = new THREE.PointLight(0xeeeeee, 1, 0);
      lights[1] = new THREE.PointLight(0xeeeeee, 1, 0);
      lights[2] = new THREE.PointLight(0xeeeeee, 1, 0);

      lights[0].position.set(0, 200, 0);
      lights[1].position.set(100, 200, 100);
      lights[2].position.set(-100, -200, -100);
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