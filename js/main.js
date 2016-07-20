//
// Task Backlog
//
// Wide screen adaptive display
// Lazy load for thumbs
// Tagging and array filtering by location
// 

var lightbox = {

  flickrApiKey: "f1a836ca91876fec109588c72ecc641d",
  flickrUserID: "145147626@N05",
  photoTotal: 0,

  init: function() {
    window.addEventListener('DOMContentLoaded', lightbox.getPhotosFromAPI, false);
  },

  // construct args for photo-getting API call
  getPhotosFromAPI: function() {

    var flickrAPIArgs, photoData;

    flickrAPIArgs = {
      "method": "flickr.people.getPhotos",
      "arg": "user_id=" + lightbox.flickrUserID
    };

    photoData = lightbox.callFlickrAPI(flickrAPIArgs, function() {
      photoData = JSON.parse(this.responseText);
      lightbox.parseJSON(photoData.photos.photo);
    });

  },

  // Flickr API call workhorse
  callFlickrAPI: function(elem, callback) {

    var flickrAPICall, xhr;

    // using template literals would be pretty sweet here, WOULDN'T IT IE 11
    flickrAPICall = "https://api.flickr.com/services/rest/?method=" + elem.method;
    flickrAPICall += "&extras=original_format&api_key=" + lightbox.flickrApiKey + "&";
    flickrAPICall += elem.arg + "&format=json&nojsoncallback=?";

    xhr = new XMLHttpRequest();
    xhr.open("GET", flickrAPICall, true);
    xhr.onreadystatechange = function() {
      if (xhr.readyState === 4 && xhr.status === 200) {
        callback.apply(xhr);
      } else {
        //  console.log(xhr.status);
        //  console.log(xhr.readyState);
      }
    };
    xhr.send();

  },

  // assembling photo URLs from the data response
  parseJSON: function(data) {

    var key, imgObj, farmID, serverID, originalSecretID, photoID, photoTitle, imgSrc, thumbPhotoSrc, detailPhotoSrc, detailBigPhotoSrc;
    var thumbHTML = '';
    var imgObjArray = [];

    for (key in data) {
      if (data.hasOwnProperty(key)) {

        // Flickr's recommended action to create photo source URLs
        // In this case, to use small images for thumbs and larger for the lightbox
        // https://www.flickr.com/services/api/misc.urls.html
        imgObj = data[key];
        farmID = imgObj.farm;
        serverID = imgObj.server;
        secretID = imgObj.secret;
        originalSecretID = imgObj.originalsecret;
        photoID = imgObj.id;
        photoTitle = imgObj.title;

        imgObjArray.push(photoID);

        imgSrc = "https://farm" + farmID + ".staticflickr.com/" + serverID + "/" + photoID + "_";

        thumbPhotoSrc = imgSrc + secretID + "_q.jpg";
        detailPhotoSrc = imgSrc + secretID + "_b.jpg";

        // in case one feels ambitious and builds screen-adaptive photo loading
        detailBigPhotoSrc = imgSrc + originalSecretID + "_o.jpg";

        thumbHTML += "<span class='img' title='" + photoTitle + "' id='" + photoID + "' data-pid='" + key + "'";
        thumbHTML += " data-img='" + detailPhotoSrc + "' style='background-image:url(" + thumbPhotoSrc + ")'></span>";
      }
    }

    // get the total number of photos so we know when next and previous reset
    lightbox.photoTotal = Number(key);

    // situate the HTML and captions
    lightbox.placeHTML(thumbHTML);

  },

  // set photo thumbs into container and initiate click and key handlers and thumb container placement
  placeHTML: function(elem) {

    document.getElementById("container").innerHTML = elem;

    // set event listeners for clicking or keypressing
    document.getElementById("container").addEventListener("click", lightbox.initiateLightbox, false);
    document.getElementById("lightbox").addEventListener("click", lightbox.advanceLightbox, false);
    window.addEventListener("keydown", lightbox.keyManipulateLightbox, false);

    // set width of container element for nicer display
    lightbox.sizeContainer();

  },

  // keypress handlers 
  keyManipulateLightbox: function(e) {

    e = e || window.event;

    if (e.which === 39) {
      lightbox.placeUpcomingPhoto("right");
      // if a user presses an arrow key, hide hint
      document.getElementById("hint").style.display = 'none';
    } else if (e.which === 37) {
      lightbox.placeUpcomingPhoto("left");
      document.getElementById("hint").style.display = 'none';
    } else if (e.which === 27) {
      lightbox.closeLightbox();
    }
  },

  // calculate container width based on number of possible squares
  sizeContainer: function() {

    var potentialSquares, measuredWidth;

    potentialSquares = Math.floor((window.innerWidth - 20) / 144); // 100 width + 20 padding + 20 margin + 4 border
    measuredWidth = (potentialSquares * 144);
    document.getElementById("container").style.width = measuredWidth + "px";
    window.addEventListener("resize", lightbox.sizeContainer);

  },

  // make lightbox visible and place first image
  initiateLightbox: function(elem) {

    var photoID, photoHTML;

    if (elem.target !== elem.currentTarget) {

      document.getElementById("lightbox").classList.add('open');

      photoID = elem.target.dataset.pid;

      photoHTML = "<div class='lightboxphotoelem' data-pid='" + photoID + "' ";
      photoHTML += "style='background-image:url(" + elem.target.dataset.img + ")' ></div>";

      document.getElementById("lightboxphotoholder").innerHTML = photoHTML;
      document.getElementById("lightboxcaption").innerHTML = elem.target.title;

      lightbox.setupArrowIDs(photoID);
      lightbox.setHintTimeout();
    }

    elem.stopPropagation();

  },

  // poor man's ux hinting for keypress events
  setHintTimeout: function() {

    setTimeout(function() {
      document.getElementById("hint").style.display = 'none';
    }, 3000);

  },

  // click functionality within lightbox
  advanceLightbox: function(elem) {

    var clickedItem;

    if (elem.target !== elem.currentTarget) {

      clickedItem = elem.target.classList[0];
      if (clickedItem === 'next' || clickedItem === 'prev') {
        lightbox.placeUpcomingPhoto(elem);
      } else if (clickedItem === 'close') {
        lightbox.closeLightbox();
      }
    }
    elem.stopPropagation();

  },

  // remove class that makes lightbox visible
  closeLightbox: function() {

    document.getElementById("lightbox").classList.remove('open');

  },

  // place next and previous ids on arrows (and preload next images)
  setupArrowIDs: function(elem) {

    var prev, next;

    elem = Number(elem);
    prev = (elem === 0) ? lightbox.photoTotal : elem - 1;
    next = (elem === lightbox.photoTotal) ? 0 : elem + 1;

    document.getElementById("left").dataset.pid = prev;
    document.getElementById("right").dataset.pid = next;

    lightbox.preloadImage(prev);
    lightbox.preloadImage(next);

  },

  // poor man's photo cache to reduce load time for next and previous images  
  // I considered setInterval to preload all but past a certain number of images that would become too heavy
  preloadImage: function(elem) {

    var nextphotoID, imgOfphotoID;

    nextphotoID = document.querySelectorAll("[data-pid='" + elem + "']");
    imgOfphotoID = nextphotoID[0].dataset.img;
    document.getElementById('photocache').innerHTML = "<img src='" + imgOfphotoID + "' />";

  },

  // depending on the element clicked or key pressed advance to the next photo
  placeUpcomingPhoto: function(elem) {

    var photoID, elemOfphotoID, imgOfphotoID, newPhotoHTML;

    if (typeof elem === 'string') { // keydown event doesn't transfer mouseclick object
      photoID = document.getElementById(elem).dataset.pid;
    } else if (elem.target.dataset.pid) { // clicking on div
      photoID = elem.target.dataset.pid;
    } else { // clicking on arrow span within div
      photoID = elem.target.parentNode.dataset.pid;
    }

    elemOfphotoID = document.querySelectorAll("[data-pid='" + photoID + "']");
    imgOfphotoID = elemOfphotoID[0].dataset.img;

    newPhotoHTML = "<div class='lightboxphotoelem' data-pid='" + photoID + "' ";
    newPhotoHTML += "style='background-image:url(" + imgOfphotoID + ")' ></div>";
    document.getElementById('lightboxphotoholder').insertAdjacentHTML('afterbegin', newPhotoHTML);
    document.getElementById("lightboxcaption").innerHTML = elemOfphotoID[0].title;

    // remove second element
    window.setTimeout(function() {
      document.getElementsByClassName("lightboxphotoelem")[1].outerHTML = '';
    }, 100);

    lightbox.setupArrowIDs(photoID);

  }
};

(function() {
  "use strict";
  lightbox.init();
})();