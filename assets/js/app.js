var map, featureList;
// Updated search arrays for clinics, hospitals, and pharmacies
var clinicSearch = [],
  hospitalSearch = [],
  pharmacySearch = [];

// Resize the layer control when the window size changes
$(window).resize(function () {
  sizeLayerControl();
});

// Handle sidebar feature row clicks
$(document).on("click", ".feature-row", function (e) {
  $(document).off("mouseout", ".feature-row", clearHighlight);
  sidebarClick(parseInt($(this).attr("id"), 10));
});

// Highlight feature on mouseover (for non-touch devices)
if (!("ontouchstart" in window)) {
  $(document).on("mouseover", ".feature-row", function (e) {
    highlight
      .clearLayers()
      .addLayer(
        L.circleMarker(
          [$(this).attr("lat"), $(this).attr("lng")],
          highlightStyle
        )
      );
  });
}

$(document).on("mouseout", ".feature-row", clearHighlight);

// Modal button handlers
$("#about-btn").click(function () {
  $("#aboutModal").modal("show");
  $(".navbar-collapse.in").collapse("hide");
  return false;
});

$("#legend-btn").click(function () {
  $("#legendModal").modal("show");
  $(".navbar-collapse.in").collapse("hide");
  return false;
});

$("#login-btn").click(function () {
  $("#loginModal").modal("show");
  $(".navbar-collapse.in").collapse("hide");
  return false;
});

$("#list-btn").click(function () {
  animateSidebar();
  return false;
});

$("#nav-btn").click(function () {
  $(".navbar-collapse").collapse("toggle");
  return false;
});

$("#sidebar-toggle-btn").click(function () {
  animateSidebar();
  return false;
});

$("#sidebar-hide-btn").click(function () {
  animateSidebar();
  return false;
});

// Function to animate the sidebar
function animateSidebar() {
  $("#sidebar").animate(
    {
      width: "toggle",
    },
    350,
    function () {
      map.invalidateSize();
    }
  );
}

// Function to set the size of the layer control
function sizeLayerControl() {
  $(".leaflet-control-layers").css("max-height", $("#map").height() - 50);
}

// Function to clear feature highlight
function clearHighlight() {
  highlight.clearLayers();
}

// Function to handle sidebar clicks
function sidebarClick(id) {
  var layer = markerClusters.getLayer(id);
  if (layer) {
    map.setView([layer.getLatLng().lat, layer.getLatLng().lng], 17);
    layer.fire("click");
    /* Hide sidebar and go to the map on small screens */
    if (document.body.clientWidth <= 767) {
      $("#sidebar").hide();
      map.invalidateSize();
    }
  }
}

// Function to synchronize the sidebar with map layers
function syncSidebar() {
  /* Empty sidebar features */
  $("#feature-list tbody").empty();

  /* Loop through markerClusters and add only features which are in the map bounds */
  markerClusters.eachLayer(function (layer) {
    if (map.hasLayer(markerClusters)) {
      if (map.getBounds().contains(layer.getLatLng())) {
        var iconSrc = "";
        var source = "";
        if (
          layer.options.icon.options.iconUrl ===
          "https://png.pngtree.com/png-vector/20190612/ourmid/pngtree-hospitalbuildingclinicmedical--flat-color-icon--vector-ico-png-image_1339045.jpg"
        ) {
          iconSrc =
            "https://png.pngtree.com/png-vector/20190612/ourmid/pngtree-hospitalbuildingclinicmedical--flat-color-icon--vector-ico-png-image_1339045.jpg";
          source = "Clinics";
        } else if (
          layer.options.icon.options.iconUrl ===
          "https://png.pngtree.com/png-vector/20240119/ourmid/pngtree-city-hospital-elements-png-image_11420665.png"
        ) {
          iconSrc =
            "https://png.pngtree.com/png-vector/20240119/ourmid/pngtree-city-hospital-elements-png-image_11420665.png";
          source = "Hospitals";
        } else if (
          layer.options.icon.options.iconUrl ===
          "data:image/jpeg;base64,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"
        ) {
          iconSrc =
            "data:image/jpeg;base64,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";
          source = "Pharmacies";
        }

        $("#feature-list tbody").append(
          '<tr class="feature-row" id="' +
            L.stamp(layer) +
            '" lat="' +
            layer.getLatLng().lat +
            '" lng="' +
            layer.getLatLng().lng +
            '"><td style="vertical-align: middle;"><img width="16" height="18" src="' +
            iconSrc +
            '"></td><td class="feature-name">' +
            layer.feature.properties.name +
            '</td><td style="vertical-align: middle;"><i class="fa fa-chevron-right pull-right"></i></td></tr>'
        );
      }
    }
  });

  /* Update list.js featureList */
  featureList = new List("features", {
    valueNames: ["feature-name"],
  });
  featureList.sort("feature-name", {
    order: "asc",
  });
}

/* Basemap Layers */
var cartoLight = L.tileLayer(
  "https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png",
  {
    maxZoom: 19,
    attribution:
      '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="https://cartodb.com/attributions">CartoDB</a>',
  }
);
var usgsImagery = L.layerGroup([
  L.tileLayer(
    "http://basemap.nationalmap.gov/arcgis/rest/services/USGSImageryOnly/MapServer/tile/{z}/{y}/{x}",
    {
      maxZoom: 15,
    }
  ),
  L.tileLayer.wms(
    "http://raster.nationalmap.gov/arcgis/services/Orthoimagery/USGS_EROS_Ortho_SCALE/ImageServer/WMSServer?",
    {
      minZoom: 16,
      maxZoom: 19,
      layers: "0",
      format: "image/jpeg",
      transparent: true,
      attribution: "Aerial Imagery courtesy USGS",
    }
  ),
]);

/* Overlay Layers */
var highlight = L.geoJson(null);
var highlightStyle = {
  stroke: false,
  fillColor: "#00FFFF",
  fillOpacity: 0.7,
  radius: 10,
};

/* Single marker cluster layer to hold all clusters */
var markerClusters = new L.MarkerClusterGroup({
  spiderfyOnMaxZoom: true,
  showCoverageOnHover: false,
  zoomToBoundsOnClick: true,
  disableClusteringAtZoom: 16,
});

/* Clinic Layer */
var clinics = L.geoJson(null, {
  onEachFeature: function (feature, layer) {
    // Determine representative LatLng based on geometry type
    var latlng;
    if (layer.getLatLng) {
      // Point geometry
      latlng = layer.getLatLng();
    } else if (layer.getBounds) {
      // Polygon or LineString
      latlng = layer.getBounds().getCenter();
    } else if (feature.geometry && feature.geometry.type === "Point") {
      // Fallback for Point
      latlng = L.latLng(
        feature.geometry.coordinates[1],
        feature.geometry.coordinates[0]
      );
    } else {
      console.log("No valid geometry for clinic feature:", feature);
      return;
    }

    // Create a marker at the representative LatLng
    var marker = L.marker(latlng, {
      icon: L.icon({
        iconUrl:
          "https://png.pngtree.com/png-vector/20190612/ourmid/pngtree-hospitalbuildingclinicmedical--flat-color-icon--vector-ico-png-image_1339045.jpg", // Ensure this path is correct
        iconSize: [24, 28],
        iconAnchor: [12, 28],
        popupAnchor: [0, -25],
      }),
      title: feature.properties.name,
      riseOnHover: true,
    });

    // Bind popup with feature information
    var address =
      feature.properties["addr:street"] ||
      feature.properties.address ||
      "Address not available";
    console.log("Feature properties:", feature.properties); // Debugging output
    var content =
      "<table class='table table-striped table-bordered table-condensed'>" +
      "<tr><th>Name</th><td>" +
      (feature.properties.name || "N/A") +
      "</td></tr>" +
      "<tr><th>Type</th><td>" +
      (feature.properties.amenity || "N/A") +
      "</td></tr>" +
      "<tr><th>Address</th><td>" +
      address +
      "</td></tr>" +
      "<tr><th>Operator</th><td>" +
      (feature.properties["operator:type"] || "N/A") +
      "</td></tr>" +
      "<tr><th>Emergency</th><td>" +
      (feature.properties.emergency || "N/A") +
      "</td></tr>" +
      "<tr><th>Beds</th><td>" +
      (feature.properties.beds || "N/A") +
      "</td></tr>" +
      "<tr><th>Staff (Doctors)</th><td>" +
      (feature.properties["staff_count:doctors"] || "N/A") +
      "</td></tr>" +
      "<tr><th>Staff (Nurses)</th><td>" +
      (feature.properties["staff_count:nurses"] || "N/A") +
      "</td></tr>" +
      "<tr><th>Opening Hours</th><td>" +
      (feature.properties.opening_hours || "N/A") +
      "</td></tr>" +
      "<tr><th>Emergency Opening Hours</th><td>" +
      (feature.properties["opening_hours:emergency"] || "N/A") +
      "</td></tr>" +
      "<tr><th>Source</th><td>" +
      (feature.properties.source || "N/A") +
      "</td></tr>" +
      "</table>";
    marker.bindPopup(content);

    // Add click event to show modal
    marker.on("click", function (e) {
      $("#feature-title").html(feature.properties.name);
      $("#feature-info").html(content);
      $("#featureModal").modal("show");
      highlight.clearLayers().addLayer(L.circleMarker(latlng, highlightStyle));
    });

    // Add the marker to markerClusters
    markerClusters.addLayer(marker);

    // Add to feature list for sidebar and search
    $("#feature-list tbody").append(
      '<tr class="feature-row" id="' +
        L.stamp(marker) +
        '" lat="' +
        latlng.lat +
        '" lng="' +
        latlng.lng +
        '"><td style="vertical-align: middle;"><img width="16" height="18" src="https://png.pngtree.com/png-vector/20190612/ourmid/pngtree-hospitalbuildingclinicmedical--flat-color-icon--vector-ico-png-image_1339045.jpg"></td><td class="feature-name">' +
        feature.properties.name +
        '</td><td style="vertical-align: middle;"><i class="fa fa-chevron-right pull-right"></i></td></tr>'
    );

    // Add to search array
    clinicSearch.push({
      name: feature.properties.name,
      address: address,
      source: "Clinics",
      id: L.stamp(marker),
      lat: latlng.lat,
      lng: latlng.lng,
    });
  },
});
$.getJSON("data/clinics.geojson", function (data) {
  // Ensure the path is correct
  clinics.addData(data);
  markerClusters.addLayer(clinics); // Add clinics to markerClusters
  map.addLayer(markerClusters); // Ensure markerClusters is added to the map
});

/* Hospital Layer */
var hospitals = L.geoJson(null, {
  onEachFeature: function (feature, layer) {
    // Determine representative LatLng based on geometry type
    var latlng;
    if (layer.getLatLng) {
      // Point geometry
      latlng = layer.getLatLng();
    } else if (layer.getBounds) {
      // Polygon or LineString
      latlng = layer.getBounds().getCenter();
    } else if (feature.geometry && feature.geometry.type === "Point") {
      // Fallback for Point
      latlng = L.latLng(
        feature.geometry.coordinates[1],
        feature.geometry.coordinates[0]
      );
    } else {
      console.log("No valid geometry for hospital feature:", feature);
      return;
    }

    // Create a marker at the representative LatLng
    var marker = L.marker(latlng, {
      icon: L.icon({
        iconUrl:
          "https://png.pngtree.com/png-vector/20240119/ourmid/pngtree-city-hospital-elements-png-image_11420665.png", // Ensure this path is correct
        iconSize: [24, 28],
        iconAnchor: [12, 28],
        popupAnchor: [0, -25],
      }),
      title: feature.properties.name,
      riseOnHover: true,
    });

    // Bind popup with feature information
    var address = feature.properties["addr:street"] || "Address not available";
    var content =
      "<table class='table table-striped table-bordered table-condensed'>" +
      "<tr><th>Name</th><td>" +
      feature.properties.name +
      " (" +
      (feature.properties["name:en"] || "N/A") +
      ")</td></tr>" +
      "<tr><th>Address</th><td>" +
      address +
      ", " +
      (feature.properties["addr:housenumber"] || "N/A") +
      ", " +
      (feature.properties["addr:postcode"] || "N/A") +
      "</td></tr>" +
      "<tr><th>Emergency Services</th><td>" +
      (feature.properties.emergency || "N/A") +
      "</td></tr>" +
      "<tr><th>Email</th><td><a href='mailto:" +
      (feature.properties.email || "N/A") +
      "'>" +
      (feature.properties.email || "N/A") +
      "</a></td></tr>" +
      "<tr><th>Website</th><td><a class='url-break' href='" +
      (feature.properties.website || "#") +
      "' target='_blank'>" +
      (feature.properties.website || "N/A") +
      "</a></td></tr>" +
      "<tr><th>Phone</th><td>" +
      (feature.properties.phone || "N/A") +
      "</td></tr>" +
      "<tr><th>Opening Hours</th><td>" +
      (feature.properties["opening_hours"] || "N/A") +
      "</td></tr>" +
      "<tr><th>Internet Access</th><td>" +
      (feature.properties.internet_access || "N/A") +
      "</td></tr>" +
      "</table>";
    marker.bindPopup(content);

    // Add click event to show modal
    marker.on("click", function (e) {
      $("#feature-title").html(feature.properties.name);
      $("#feature-info").html(content);
      $("#featureModal").modal("show");
      highlight.clearLayers().addLayer(L.circleMarker(latlng, highlightStyle));
    });

    // Add the marker to markerClusters
    markerClusters.addLayer(marker);

    // Add to feature list for sidebar and search
    $("#feature-list tbody").append(
      '<tr class="feature-row" id="' +
        L.stamp(marker) +
        '" lat="' +
        latlng.lat +
        '" lng="' +
        latlng.lng +
        '"><td style="vertical-align: middle;"><img width="16" height="18" src="https://png.pngtree.com/png-vector/20240119/ourmid/pngtree-city-hospital-elements-png-image_11420665.png"></td><td class="feature-name">' +
        feature.properties.name +
        '</td><td style="vertical-align: middle;"><i class="fa fa-chevron-right pull-right"></i></td></tr>'
    );

    // Add to search array
    hospitalSearch.push({
      name: feature.properties.name,
      address: address,
      source: "Hospitals",
      id: L.stamp(marker),
      lat: latlng.lat,
      lng: latlng.lng,
    });
  },
});
$.getJSON("data/hospitals.geojson", function (data) {
  // Ensure the path is correct
  hospitals.addData(data);
  markerClusters.addLayer(hospitals); // Add hospitals to markerClusters
  map.addLayer(markerClusters); // Ensure markerClusters is added to the map
});

/* Pharmacy Layer */
var pharmacies = L.geoJson(null, {
  onEachFeature: function (feature, layer) {
    // Determine representative LatLng based on geometry type
    var latlng;
    if (layer.getLatLng) {
      // Point geometry
      latlng = layer.getLatLng();
    } else if (layer.getBounds) {
      // Polygon or LineString
      latlng = layer.getBounds().getCenter();
    } else if (feature.geometry && feature.geometry.type === "Point") {
      // Fallback for Point
      latlng = L.latLng(
        feature.geometry.coordinates[1],
        feature.geometry.coordinates[0]
      );
    } else {
      console.log("No valid geometry for pharmacy feature:", feature);
      return;
    }

    // Create a marker at the representative LatLng
    var marker = L.marker(latlng, {
      icon: L.icon({
        iconUrl:
          "data:image/jpeg;base64,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", // Ensure this path is correct
        iconSize: [24, 28],
        iconAnchor: [12, 28],
        popupAnchor: [0, -25],
      }),
      title: feature.properties.name,
      riseOnHover: true,
    });

    // Bind popup with feature information
    var address =
      feature.properties["addr:street"] ||
      feature.properties["addr:city"] ||
      "Address not available";
    var content =
      "<table class='table table-striped table-bordered table-condensed'>" +
      "<tr><th>Name</th><td>" +
      feature.properties.name +
      "</td></tr>" +
      "<tr><th>Address</th><td>" +
      address +
      "</td></tr>" +
      "<tr><th>Operating Hours</th><td>" +
      (feature.properties.opening_hours || "N/A") +
      "</td></tr>" +
      "<tr><th>Emergency Dispensing</th><td>" +
      (feature.properties.dispensing || "N/A") +
      "</td></tr>" +
      "<tr><th>Building Levels</th><td>" +
      (feature.properties["building:levels"] || "N/A") +
      "</td></tr>" +
      "<tr><th>Wheelchair Accessible</th><td>" +
      (feature.properties.wheelchair === "yes" ? "Yes" : "No") +
      "</td></tr>" +
      "</table>";
    marker.bindPopup(content);

    // Add click event to show modal
    marker.on("click", function (e) {
      $("#feature-title").html(feature.properties.name);
      $("#feature-info").html(content);
      $("#featureModal").modal("show");
      highlight.clearLayers().addLayer(L.circleMarker(latlng, highlightStyle));
    });

    // Add the marker to markerClusters
    markerClusters.addLayer(marker);

    // Add to feature list for sidebar and search
    $("#feature-list tbody").append(
      '<tr class="feature-row" id="' +
        L.stamp(marker) +
        '" lat="' +
        latlng.lat +
        '" lng="' +
        latlng.lng +
        '"><td style="vertical-align: middle;"><img width="16" height="18" src="data:image/jpeg;base64,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"></td><td class="feature-name">' +
        feature.properties.name +
        '</td><td style="vertical-align: middle;"><i class="fa fa-chevron-right pull-right"></i></td></tr>'
    );

    // Add to search array
    pharmacySearch.push({
      name: feature.properties.name,
      address: address,
      source: "Pharmacies",
      id: L.stamp(marker),
      lat: latlng.lat,
      lng: latlng.lng,
    });
  },
});
$.getJSON("data/phamarcies.geojson", function (data) {
  // Ensure the path is correct
  pharmacies.addData(data);
  markerClusters.addLayer(pharmacies); // Add pharmacies to markerClusters
  map.addLayer(markerClusters); // Ensure markerClusters is added to the map
});

// Initialize the Leaflet map
map = L.map("map", {
  zoom: 10,
  center: [8.986389, 7.552222], // Updated center coordinates to match the data's region
  layers: [cartoLight, markerClusters, highlight],
  zoomControl: false,
  attributionControl: false,
});

/* Layer control listeners that allow for a single markerClusters layer */
map.on("overlayadd", function (e) {
  if (e.layer === theaterLayer) {
    markerClusters.addLayer(theaters);
    syncSidebar();
  }
  if (e.layer === museumLayer) {
    markerClusters.addLayer(museums);
    syncSidebar();
  }
});

map.on("overlayremove", function (e) {
  if (e.layer === theaterLayer) {
    markerClusters.removeLayer(theaters);
    syncSidebar();
  }
  if (e.layer === museumLayer) {
    markerClusters.removeLayer(museums);
    syncSidebar();
  }
});

/* Filter sidebar feature list to only show features in current map bounds */
map.on("moveend", function (e) {
  syncSidebar();
});

/* Clear feature highlight when map is clicked */
map.on("click", function (e) {
  highlight.clearLayers();
});

/* Attribution control */
function updateAttribution(e) {
  var attribution = "";
  $.each(map._layers, function (index, layer) {
    if (layer.getAttribution) {
      attribution += layer.getAttribution() + ", ";
    }
  });
  // Remove trailing comma and space
  attribution = attribution.replace(/, $/, "");
  $("#attribution").html(attribution);
}
map.on("layeradd", updateAttribution);
map.on("layerremove", updateAttribution);

var attributionControl = L.control({
  position: "bottomright",
});
attributionControl.onAdd = function (map) {
  var div = L.DomUtil.create("div", "leaflet-control-attribution");
  div.innerHTML =
    "<span class='hidden-xs'>Developed by <a href='http://bryanmcbride.com'>bryanmcbride.com</a> | </span><a href='#' onclick='$(\"#attributionModal\").modal(\"show\"); return false;'>Attribution</a>";
  return div;
};
map.addControl(attributionControl);

// Add zoom control to the bottom right
var zoomControl = L.control
  .zoom({
    position: "bottomright",
  })
  .addTo(map);

/* GPS enabled geolocation control set to follow the user's location */
var locateControl = L.control
  .locate({
    position: "bottomright",
    drawCircle: true,
    follow: true,
    setView: true,
    keepCurrentZoomLevel: true,
    markerStyle: {
      weight: 1,
      opacity: 0.8,
      fillOpacity: 0.8,
    },
    circleStyle: {
      weight: 1,
      clickable: false,
    },
    icon: "fa fa-location-arrow",
    metric: false,
    strings: {
      title: "My location",
      popup: "You are within {distance} {unit} from this point",
      outsideMapBoundsMsg: "You seem located outside the boundaries of the map",
    },
    locateOptions: {
      maxZoom: 18,
      watch: true,
      enableHighAccuracy: true,
      maximumAge: 10000,
      timeout: 10000,
    },
  })
  .addTo(map);

/* Larger screens get expanded layer control and visible sidebar */
if (document.body.clientWidth <= 767) {
  var isCollapsed = true;
} else {
  var isCollapsed = false;
}

var baseLayers = {
  "Street Map": cartoLight,
  "Aerial Imagery": usgsImagery,
};

/* Define grouped overlays for clinics, hospitals, and pharmacies */
var groupedOverlays = {
  "Points of Interest": {
    "<img src='https://png.pngtree.com/png-vector/20190612/ourmid/pngtree-hospitalbuildingclinicmedical--flat-color-icon--vector-ico-png-image_1339045.jpg' width='24' height='28'>&nbsp;Clinics":
      clinics,
    "<img src='https://png.pngtree.com/png-vector/20240119/ourmid/pngtree-city-hospital-elements-png-image_11420665.png' width='24' height='28'>&nbsp;Hospitals":
      hospitals,
    "<img src='data:image/jpeg;base64,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' width='24' height='28'>&nbsp;Pharmacies":
      pharmacies,
  },
};

/* Add layer control to the map */
var layerControl = L.control
  .groupedLayers(baseLayers, groupedOverlays, {
    collapsed: isCollapsed,
  })
  .addTo(map);

/* Highlight search box text on click */
$("#searchbox").click(function () {
  $(this).select();
});

/* Prevent hitting enter from refreshing the page */
$("#searchbox").keypress(function (e) {
  if (e.which == 13) {
    e.preventDefault();
  }
});

/* Re-enable mouseout event after the feature modal is hidden */
$("#featureModal").on("hidden.bs.modal", function (e) {
  $(document).on("mouseout", ".feature-row", clearHighlight);
});

/* Typeahead search functionality */
$(document).one("ajaxStop", function () {
  $("#loading").hide();
  sizeLayerControl();

  featureList = new List("features", { valueNames: ["feature-name"] });
  featureList.sort("feature-name", { order: "asc" });

  // Initialize Bloodhound for Clinics
  var clinicsBH = new Bloodhound({
    name: "Clinics",
    datumTokenizer: function (d) {
      return Bloodhound.tokenizers.whitespace(d.name);
    },
    queryTokenizer: Bloodhound.tokenizers.whitespace,
    local: clinicSearch,
    limit: 10,
  });

  // Initialize Bloodhound for Hospitals
  var hospitalsBH = new Bloodhound({
    name: "Hospitals",
    datumTokenizer: function (d) {
      return Bloodhound.tokenizers.whitespace(d.name);
    },
    queryTokenizer: Bloodhound.tokenizers.whitespace,
    local: hospitalSearch,
    limit: 10,
  });

  // Initialize Bloodhound for Pharmacies
  var pharmaciesBH = new Bloodhound({
    name: "Pharmacies",
    datumTokenizer: function (d) {
      return Bloodhound.tokenizers.whitespace(d.name);
    },
    queryTokenizer: Bloodhound.tokenizers.whitespace,
    local: pharmacySearch,
    limit: 10,
  });

  // Initialize Bloodhound for GeoNames
  var geonamesBH = new Bloodhound({
    name: "GeoNames",
    datumTokenizer: function (d) {
      return Bloodhound.tokenizers.whitespace(d.name);
    },
    queryTokenizer: Bloodhound.tokenizers.whitespace,
    remote: {
      url: "http://api.geonames.org/searchJSON?username=bootleaf&featureClass=P&maxRows=5&countryCode=NG&name_startsWith=%QUERY",
      filter: function (data) {
        return $.map(data.geonames, function (result) {
          return {
            name: result.name + ", " + result.adminCode1,
            lat: result.lat,
            lng: result.lng,
            source: "GeoNames",
          };
        });
      },
      ajax: {
        beforeSend: function (jqXhr, settings) {
          settings.url +=
            "&east=" +
            map.getBounds().getEast() +
            "&west=" +
            map.getBounds().getWest() +
            "&north=" +
            map.getBounds().getNorth() +
            "&south=" +
            map.getBounds().getSouth();
          $("#searchicon")
            .removeClass("fa-search")
            .addClass("fa-refresh fa-spin");
        },
        complete: function (jqXHR, status) {
          $("#searchicon")
            .removeClass("fa-refresh fa-spin")
            .addClass("fa-search");
        },
      },
    },
    limit: 10,
  });

  // Initialize all Bloodhound engines
  clinicsBH.initialize();
  hospitalsBH.initialize();
  pharmaciesBH.initialize();
  geonamesBH.initialize();

  /* Instantiate the typeahead UI */
  $("#searchbox")
    .typeahead(
      {
        minLength: 3,
        highlight: true,
        hint: false,
      },
      {
        name: "Clinics", // Updated category
        displayKey: "name",
        source: clinicsBH.ttAdapter(),
        templates: {
          header:
            "<h4 class='typeahead-header'><img src='assets/img/https://png.pngtree.com/png-vector/20190612/ourmid/pngtree-hospitalbuildingclinicmedical--flat-color-icon--vector-ico-png-image_1339045.jpg' width='24' height='28'>&nbsp;Clinics</h4>",
          suggestion: Handlebars.compile(
            ["{{name}}<br>&nbsp;<small>{{address}}</small>"].join("")
          ),
        },
      },
      {
        name: "Hospitals", // New category
        displayKey: "name",
        source: hospitalsBH.ttAdapter(),
        templates: {
          header:
            "<h4 class='typeahead-header'><img src='https://png.pngtree.com/png-vector/20240119/ourmid/pngtree-city-hospital-elements-png-image_11420665.png' width='24' height='28'>&nbsp;Hospitals</h4>",
          suggestion: Handlebars.compile(
            ["{{name}}<br>&nbsp;<small>{{address}}</small>"].join("")
          ),
        },
      },
      {
        name: "Pharmacies", // New category
        displayKey: "name",
        source: pharmaciesBH.ttAdapter(),
        templates: {
          header:
            "<h4 class='typeahead-header'><img src='data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBwgHBgkIBwgKCgkLDRYPDQwMDRsUFRAWIB0iIiAdHx8kKDQsJCYxJx8fLT0tMTU3Ojo6Iys/RD84QzQ5OjcBCgoKDQwNGg8PGjclHyU3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3N//AABEIAJQAlAMBIgACEQEDEQH/xAAbAAABBQEBAAAAAAAAAAAAAAAEAAECAwYHBf/EAE0QAAEDAgMCCQcHCAcJAAAAAAEAAgMEEQUSIRMxBjNBUVJhcaHRFBYiMlSBkQcVI5Si0uEkQnJzdJKTsiU0Q1NjsfA1RFVkgoOzwcL/xAAZAQEAAwEBAAAAAAAAAAAAAAAAAgMEAQX/xAApEQACAgIBAwEIAwAAAAAAAAAAAQIRAxIEITFRQRMUFSNSU2GhBTKB/9oADAMBAAIRAxEAPwDsKMg4oe9LYx9HvKoe90by1jrNG4ICVVvao0/GD3qUI2ubaXdbcpSsEbczNCgLX+qexBDkU9q86F1x2IjYx9HvKAeHi29ioqeMHYmc9zHZWuIA0AU4miUEyekb2QEabjD2K+Ti3folVytETQ5mhvbeqhI9zg0uNibEICtHR8W3sCjsY+j3lDmR7SQHWANgEA9RxnuUqX1j2J4WCRuZ9yd17pSjZWMfo3QFk/FOQnOrGPc94a51wSr9hHa2XvKAmNyFn41ybayA6OsrYmNkYHPF3HlQA106L2MfR7ykgKvKD0R8U4i2vp5iL8ihsH83erGSNjbkde4QEf6ubD0syWczeha3WlJ9MfQB0TMa6J2Z40QEjT5RfOdNdyYVB6I+KmZ2EEC9z1KrYyc3egJCHOM97ZtUi4wHKPSvrcqTZGsaGuvcaIHFcQgpAHyElxFmsG8/gupWRlJRVsMzmc5SLW1unMOQZ8xOXWyyxx+sLyYIomt7C4+9EU3CWTVlbE0tOmeMG49y7ozOuZib7mg8oPRHxTinDgHZjrqqIQJ42yQua5jhcEFEtmY1oab3GiiaU77EM5gOQely3SBM5t6ttUz2mVxcwG25PHeE3fuOiHRzFsvTDr25OdN5QbeqPipPlbI0sbe5VWwk5u9AWCnv+cm2hhOQC9uVTE7ANb/BVuY6VxewXB5UA/lB6I+KSjsX8yZAFZm84+KFl1lcQNCq0ZBxQ96ArpjlzX07VVV11Iy8clVAx4Iu10rQR7iVZUj02LjuKYZQzYpWyS07XyPqJC5ziSScxUox2M/I5EcCTl6nVBX0Vx+W0u/++b4ov50w72+l/jN8Vxf5ow72Rnel80Yd7JGp+yZm+JY/DOvPxChc9xFbS2uf7ZuvesrO+bEKqSVjHvJ/NaCco5AsYzCsPjkY8Usd2uBG/kK3WD4kMPnkldGZM7QNDblupKDj1KcnJhyGo9ketwUhlidVbWJ7LhtszSL715GJUlS7EKosp5XNMriCGEgi602E4o3EjKGxOZs7E3N73v4ISq4Rsp6iWA0znbNxaXZwL2UE3sXzx4nhinLoA8G8QbSzS09VI2OI6gyHKGu5RqvWOIUOY/ltLa5/tm+K55wpdHPRzCRgLZprhru3N/6Wfgw7DZW/1OMOG8aqUse3Uqxc2OKOsup2mnxKgbHrXUo1/vm+KafEqBwGWupT/wB5viuO/NGHeyR96XzRh3skfeueyZZ8SxeGdkpZopnB8EscrAbFzHhwHwR2ZvSHxXO/k5pKelq6/wAnjEYfC3MATrY6f5rbcirkqdGzDlWWGyHIN9x+CJgIEYvpv39qtG5CT8c7/XIuFoVnb0h8UkEkgDNkzohDyOLZHNboBzFQqK7yenlnlAEcTC9xAvoBcrmtT8pTZcepKmBtUzC2xuFTTmOPNI43sQb8mnKOVAdPh9K5frbnXKK+3l9Xu4+T+YraVGKw4rwYir6EyshqXAZX6OFiQQbdYXhXKuxL1PK/kHs1HweBcJXutBc869OOKkbhMUtQBnftACM2YkHS3J23VjlRghgc3VmN0R9FVNyiKV1raNceVa+uoacmuZS5DPmhDWBltlcgaHrTSUNLLJF5O2JzIqhsUojJ9Jp0u7ruubl3ukl2YBhOKHDTKWxCUSW3uta3uKAxCsiMs1VO5sTXvLjc3t1da9p9HRMrW7Rg2McT5JcmbKdbC1ze/gmqKGmnqqQ0GlM4lkjgT+adT7wo2rstliyaat9jnmJ1/ls9xpGzRg5e0oQPyOzNdYhdSNJS1FVSStMYp5HOje2Jxy5hcgX6wqpYgKum8ow4U8UrjHlbJrrax9yluip8WXqzBQVDZhvGYbwrbhajERGyqfFC0tZH6Gp1cRylD3POVJOzPLFTqwngBrX1Q5DENPet3smdELnkb3MkY9pIc1wII5Fvdu8cjVRkXWz1+BL5evggXvv6x+KuhY17MzhcnlKQpwRqSoGQwksaAQOdVm8v2TOiElR5Q/otSQDGncQQcpBGo5+5YbEeDuFRYjLAzC6MDMMobC0b7dXWug54+k34rLYtgGGV3Cmkqqik2sronyZs7tXMMWU6HkuVm5OB5opKVFuLIsbtqzzflDxJ3B/g/QwYdRxMh2oZdzbRxADdYW1PiudjhhXncKO36J+8u8MYxzXNnaLHkeN65VitTUfPFfDTugiihmygbAOJuL779a2QTqkYc6hduNmd88MQ5qP9w/eSPDHEC0AikIG4FjtPtL2dtXe0U/1UeKW2rvaKf6qPFWay8me8f0I8jz0xO5N6UONrnK7X7SYcM8SbfL5KL77NcL/aXsbau9op/qo8UttXe0U/1UeKayO7Q+n9nj+eWJWIPktjyZXfeSHDPEmizTStHMGu+8vY21d7RT/VR4pjV1sRY98lNI3O0Fnk1rguA33601fkXD6P2eP544jly/kmXfbK7f8AvJzwyxJxu40pI3EhxI+0tm4QNcQdmCOcBNen/wALuSn5KvbY/tmMPDHECbkUlzvOQ/eS88MQ5qP9w/eWz/J/8LuTtELvVEZ7AClPycebF9sxQ4Y17XA2ot+gyO16vWXb8OdLW4fS1UkRgfPCyR0T75oy5oJaey9l4PBWKI1cuaOMgNB1aNNVrg9nTb8VXO7o3cdwcNoqisVDRoQVAsdK4vbYA85VeR/Qd8ERC5rWAOIBHIVA0Ffk7+dvxSV+0j6bfikgA7dSocf6bw/9mqP5ol6hYzoN+C8er04QUgbpanntbthQHo1PrN7CuS4h/tzFv2n/AOQtrwkxybD3NpqS22e3O6RwzZB1X5VhZXukxGue83c6RjnHnJjamDLGWRxXoZOQx0kDVVU0VZHDG0Frrbxe90d2LYZqEkmcXBpLW5iNzb2uh6OqFUHuEZaGm2pQBKqqfUH6yP8AnarVVUeo39ZH/O1cfYLudA4KYLhVXgkVRVYZQzTPklLpJKdjnOO0dvJF0ViOGYDStyMwXDXSuGjRSR6dyG4PV4pODVOxnpTOfLYc30jtV62HULg/ymr1mdqAeT8Vm/LNu11GIBh3BXCR9NVYTQGR25ppY/R7l5fCvDKDD6vCnUNFTUznySteYIWszDZk2NhrqtpLIyJhe9wa0byVh+FNa6rxHDLC0bXy5Qd59A6rsbbsjm1hjcQ7gvx1T+rH+a9629ZbBsRpsNqS+sc5scgy5g24HbZbClmpquES07o5Yz+c2xUZzW9X1I8N/KX+hDdyEnH0rlEudf1nfFEQNDoxmAJ136rhrBbdSdG7NnQb8EkANt39XwWX4UY6MKx7DWCmMsk1NPY57AHMzfy7mlanyd3OFzLhZWR4twuwuOmB+gimYHu0DjvNurRVZp6RfXqck6R62IxtxGpNRUNLZHNDSGu0FgslV1EFLidZHI+xzssMpNxs2rXt5NLHmWB4SNczG6kua4B2UtNjqMoWT+Mk3kk2Y59X1A5KmWWYSGR2YG7Duy9i9SHEqcxM2spz29L0Dv8AcF4uYdfwKYkEHfr1FezZBxNLt49kZSSGDlII7ivEbVOZNLIwbMSNIsOTTRX4jVtkZHHGczLBztDqeZBvlbJK6SUWuDoxp5tAEbOKLNGNw7FXUeo39ZH/ADtVYrqWw+mG7mKZ1TDO6OKF+d7pY7NAOvphSbRGmdI4EULThMVTL6TjLKWjm+kctJNKyGMvkIa0byvD4JTRwcGIJJHWaHy/+RyZ7p8VqcrNI28+5v4rNVvqbHJQVR7saaafFKgRxgiMahp3DrK8jhSyCCqwqnhOaRskpkd17Mr26mqjo4vJaL1vz5OVZrGontqMLlPquklAJ5foypozZH0ku7ogxjH3D2hwHOFbQTOwatbUwucKZ3ozsvoGk+t7t6hDvPYrXtD2uadzgQV4nOm4clyX4HGdQTNrGKeVxayRrnDUhrgSE7nujdkZ6oXPYy/DMRhq6ZjmxstnIO8X1B9y3tNNBXs29LMySM8oK2cbkrKnfRm6MrLNu/q+CSl5O7nCS1EirE6rY0M0kRGcN0XI63EsLi4TUEsdTC2KnZKyZzdzXWIsV1pwa5pa4BwO8HcVUzAsGlGeTCcPc5xJc40zCSb9ioyYd5236EWrMZV1kdNhs9cPpI4oXSjKfWAbff1rK+erQTaicOyf8F2GpoqQAM8lp8paWluybYjda1kLDgeDvfY4Rh9v2WPwUeLg9hb8lcsEZf2OU+ew9jd/H/BLz2Hsbv4/4LrruD+CBp/ofDvqrPBC/MuEcuE4d9Vj8Fs3ZD3TF4OV+ew9jd/H/BP57D2N38f8F1yLAMFcxpOD4dcj2Vngqp8CwZrwG4Rh4FvZY/BN2PdMXg5R57D2R/1j8E3nqDp5E49s/wCC6xDgWDPfY4Rh509lj8Fa/g/ggjcRg+Hbj/urPBN2PdMXg5PRcPPJqGKlfQlwjLiLTgb3E9HrsvSd8qAbTbCDCdk3lLam5P2VvRgmD/8ACcO+qx+CJZwfwQsaTg+HE29lZ4LmxascV2OXx/KDEHAuwxzmjk8otf7KjjXygMxN9EfmwRNpXPIAnve7cvR03rpk2B4M2SwwjDhp7LH4J4MCwZ7jmwjD9P8AlY/BNjixRSaruc3wDhGzFMQNL5MYiY3PDtoHbiOrrWiv1rYMwnDKQOkpMOpIHkWLooGtJHNoFDYw8sUf7oWDk8R5p72cWFRVRMhI5gjdnIy2N+xQ4F1DosaZG13oSsIeB1C4K3zaanA0giH/AEBDyRxsldkY1tuYAKrHwZQmpbdiSx0wvbM6SSDTr0iwOsOYISbjXBLbSdLuVscbZG53AknfqgGpdcylUD6PRQk+hIEel96ZjnSuDXm45UBWL3HajbDmVToWAXA3dapE0nS7kA0mkh7SraYAtJIG9OyJr2hzhcnXeoSEwutGbAi6AsqRZgI0N0OzjG9oVkZdK7LIbttdWOiY1pcBYgXGqAtsOYIJ18zu0qW2k6Xcrmwsc0OINzrvQCpgCw9qjU6BtudRe50TssZsN6eO8zrSagaoCuLjG9qMsOZUyRNY0uaLOG43VW2k6XcgIHeiacDZg2HKnEDCBcd6qe90Tyxhs0IAmw5gkhNtJ0u5JAQRcHFN96SSAqqt7ewqNPxg96SSAKf6p7ECORJJAGQ8W3sVFTxg7EkkAqbjD2IiTinfolMkgAkdHxbewJJIAao433KVL6x7EkkBbPxTkIeVJJAHN3ISfjXJJICCSSSA/9k=' width='24' height='28'>&nbsp;Pharmacies</h4>",
          suggestion: Handlebars.compile(
            ["{{name}}<br>&nbsp;<small>{{address}}</small>"].join("")
          ),
        },
      },
      {
        name: "GeoNames",
        displayKey: "name",
        source: geonamesBH.ttAdapter(),
        templates: {
          header:
            "<h4 class='typeahead-header'><img src='assets/img/globe.png' width='25' height='25'>&nbsp;GeoNames</h4>",
        },
      }
    )
    .on("typeahead:selected", function (obj, datum) {
      if (datum.source === "Clinics") {
        // Updated source check
        map.setView([datum.lat, datum.lng], 17);
        if (markerClusters.getLayer(datum.id)) {
          markerClusters.getLayer(datum.id).fire("click");
        }
      }
      if (datum.source === "Hospitals") {
        // New source check
        map.setView([datum.lat, datum.lng], 17);
        if (markerClusters.getLayer(datum.id)) {
          markerClusters.getLayer(datum.id).fire("click");
        }
      }
      if (datum.source === "Pharmacies") {
        // New source check
        map.setView([datum.lat, datum.lng], 17);
        if (markerClusters.getLayer(datum.id)) {
          markerClusters.getLayer(datum.id).fire("click");
        }
      }
      if (datum.source === "GeoNames") {
        map.setView([datum.lat, datum.lng], 14);
      }
      if ($(".navbar-collapse").height() > 50) {
        $(".navbar-collapse").collapse("hide");
      }
    })
    .on("typeahead:opened", function () {
      $(".navbar-collapse.in").css(
        "max-height",
        $(document).height() - $(".navbar-header").height()
      );
      $(".navbar-collapse.in").css(
        "height",
        $(document).height() - $(".navbar-header").height()
      );
    })
    .on("typeahead:closed", function () {
      $(".navbar-collapse.in").css("max-height", "");
      $(".navbar-collapse.in").css("height", "");
    });

  // Adjust typeahead container styles
  $(".twitter-typeahead").css("position", "static");
  $(".twitter-typeahead").css("display", "block");
});

// Leaflet patch to make layer control scrollable on touch browsers
var container = $(".leaflet-control-layers")[0];
if (!L.Browser.touch) {
  L.DomEvent.disableClickPropagation(container).disableScrollPropagation(
    container
  );
} else {
  L.DomEvent.disableClickPropagation(container);
}
