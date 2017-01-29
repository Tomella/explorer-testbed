
function showGeoJson() {
   var bbox = [140, -20, 148, -10]; // Melb [144.3, -38.7, 145.3, -37.7]; // mt kos.[147.8, -37, 148.8, -36];
   var resx = 600;
   var resy = 600;
   var area = new Elevation.CswGeoJsonLoader({
      template: "http://services.ga.gov.au/site_9/services/DEM_SRTM_1Second_over_Bathymetry_Topography/MapServer/WCSServer?SERVICE=WCS&VERSION=1.0.0&REQUEST=GetCoverage&coverage=1&CRS=EPSG:4326&BBOX=${bbox}&FORMAT=GeoTIFF&RESX=${resx}&RESY=${resy}&RESPONSE_CRS=EPSG:4326&HEIGHT=${height}&WIDTH=${width}",
      bbox: bbox,
      resolutionX: resx
   });
   
   var state = {};
   var element = document.getElementById("target");

   area.load().then(res => {
      var max = -Infinity;
      var min = Infinity;

      var maxX = -Infinity;
      var minX = Infinity;

      var maxY = -Infinity;
      var minY = Infinity;

      res.features.forEach((feature) => {
         let pt = feature.geometry.coordinates;
         maxX = Math.max(maxX, pt[0]);
         minX = Math.min(minX, pt[0]);

         maxY = Math.max(maxY, pt[1]);
         minY = Math.min(minY, pt[1]);

         max = Math.max(max, pt[2]);
         min = Math.min(min, pt[2]);
      });

      var midX = minX + (maxX - minX) / 2;
      var midY = minY + (maxY - minY) / 2;
      let range = max - min;

      let bbox = element.getBoundingClientRect();
      let w = bbox.width;
      let h = bbox.height;

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

		let scatterPlot = state.container = new THREE.Object3D();
		state.scene.add(scatterPlot);

		var pointGeo = new THREE.Geometry();
      res.features.forEach( (feature, i) => {
         var point = feature.geometry.coordinates;
         var x = point[0];
         var y = point[1];
         var z = point[2];
         var p = new THREE.Vector3((x - midX) * 1500, (y - midY) * 1500, (z - min) / 2 - 550);
			pointGeo.vertices.push(p);
			pointGeo.colors.push(new THREE.Color().setRGB(
					hexToRgb(colour(""+i)).r / 255, hexToRgb(colour(""+i)).g / 255,
					hexToRgb(colour(""+i)).b / 255));

      });
		if(res.length) {
			pointGeo.computeBoundingSphere();
			if(pointGeo.boundingSphere.radius < 5) {
				console.log("Overriding bounding sphere radius" + pointGeo.boundingSphere.radius);
				pointGeo.boundingSphere.radius = 5;
			}
		}

      var mat = new THREE.PointsMaterial({
			vertexColors : THREE.VertexColors,
			size : 1
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