var lightbox = {

  flickrApiKey: "f1a836ca91876fec109588c72ecc641d",
  flickrUserID: "145147626@N05",
  photoTotal: 0,

  init: function() {

    window.addEventListener("DOMContentLoaded", lightbox.getPhotosFromAPI, false);

  },

  // construct args for photo-getting API call
  getPhotosFromAPI: function() {

    var flickrAPIArgs, photoData;

    flickrAPIArgs = {
      "method": "flickr.people.getPhotos",
      "arg": "user_id=" + lightbox.flickrUserID
    };

    lightbox.callFlickrAPI(flickrAPIArgs, function() {
      photoData = JSON.parse(this.responseText);
      lightbox.parseJSON(photoData.photos.photo);
    });

  },

  // Flickr API call workhorse
  callFlickrAPI: function(elem, callback) {

    var flickrAPICall, xhr;

    flickrAPICall = "https://api.flickr.com/services/rest/?method=" + elem.method;
    flickrAPICall += "&extras=original_format&api_key=" + lightbox.flickrApiKey + "&";
    flickrAPICall += elem.arg + "&format=json&nojsoncallback=?";

    xhr = new XMLHttpRequest();
    xhr.open("GET", flickrAPICall, true);
    xhr.onreadystatechange = function() {
      if (xhr.readyState === 4 && xhr.status === 200) {
        callback.apply(xhr);
      } else {
        //console.log("xhr.status: " + xhr.status + " & xhr.readyState: " + xhr.readyState);
      }
    };
    xhr.send();

  },

  // assembling photo URLs from the data response
  parseJSON: function(data) {

    var key, imgObj, imgSrc, thumbPhotoSrc, detailPhotoSrc, detailBigPhotoSrc;
    var thumbHTML = '';

    for (key in data) {
      if (data.hasOwnProperty(key)) {

        // Flickr's recommended action to create photo source URLs https://www.flickr.com/services/api/misc.urls.html
        imgObj = data[key];

        imgSrc = "https://farm" + imgObj.farm + ".staticflickr.com/" + imgObj.server + "/" + imgObj.id + "_";

        thumbPhotoSrc = imgSrc + imgObj.secret + "_q.jpg";
        detailPhotoSrc = imgSrc + imgObj.secret + "_b.jpg";

        // in case one feels ambitious and builds screen-adaptive photo loading
        detailBigPhotoSrc = imgSrc + imgObj.originalsecret + "_o.jpg";

        thumbHTML += "<li class='img' title='" + imgObj.title + "' id='" + imgObj.id + "' data-pid='" + key + "'";
        thumbHTML += " data-img='" + detailPhotoSrc + "' style='background-image:url(" + thumbPhotoSrc + ")'></li>";
      }
    }

    lightbox.photoTotal = Number(key);
    lightbox.placeHTML(thumbHTML);

  },

  // set photo thumbs into container and set event listeners for clicking or keypressing
  placeHTML: function(elem) {

    document.getElementById("container").innerHTML = elem;

    document.getElementById("container").addEventListener("click", lightbox.openLightbox, false);
    document.getElementById("lightbox").addEventListener("click", lightbox.advanceLightbox, false);
    window.addEventListener("keydown", lightbox.keyManipulateLightbox, false);

  },

  // add visibility class, add hint, call photo
  openLightbox: function(elem) {

    document.getElementById("lightbox").classList.add('open');
    lightbox.setHintTimeout();
    lightbox.placeUpcomingPhoto(elem);

  },

    // remove class that makes lightbox visible
  closeLightbox: function() {

    document.getElementById("lightbox").classList.remove('open');

  },

  // hide hint!
  hideHint: function(){

      document.getElementById("hint").style.display = 'none';

  },

  // keypress handlers for moving photos and hiding hint
  keyManipulateLightbox: function(e) {

    e = e || window.event;

    lightbox.hideHint();

    if (e.which === 39) {
      lightbox.placeUpcomingPhoto("right");
    } else if (e.which === 37) {
      lightbox.placeUpcomingPhoto("left");
    } else if (e.which === 27) {
      lightbox.closeLightbox();
    }
  },

  // poor man's ux hinting for keypress events
  setHintTimeout: function() {

    setTimeout(function() { lightbox.hideHint(); }, 3000);

  },

  // click functionality within lightbox
  advanceLightbox: function(elem) {

    var clickedItem;

    if (elem.target !== elem.currentTarget) {

      // account for clicking on arrow div or arrow span
      clickedItem = elem.target.id || elem.target.className;

      if (clickedItem === "right" || clickedItem === "left") {
        lightbox.placeUpcomingPhoto(clickedItem);
      } else if (clickedItem === "close") {
        lightbox.closeLightbox();
      }
    }
    elem.stopPropagation();

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
  preloadImage: function(elem) {

    var nextphotoID, imgOfphotoID;

    nextphotoID = document.querySelectorAll("[data-pid='" + elem + "']");
    imgOfphotoID = nextphotoID[0].dataset.img;
    document.getElementById('photocache').innerHTML = "<img src='" + imgOfphotoID + "' />";

  },

  // advance to the next photo
  placeUpcomingPhoto: function(elem) {

    var newPID, newestPhotoID, newPhotoSrc, newPhotoHTML;

    // if elem is a next/prev string, select arrow element, else use elem passed through first click
    newPID = (typeof elem === "string") ? document.getElementById(elem).dataset.pid : elem.target.dataset.pid;

    newestPhotoID = document.querySelectorAll("[data-pid='" + newPID + "']");
    newPhotoSrc = newestPhotoID[0].dataset.img;

    newPhotoHTML = "<div class='lightboxphotoelem' data-pid='" + newPID + "' ";
    newPhotoHTML += "style='background-image:url(" + newPhotoSrc + ")' ></div>";

    document.getElementById('lightboxphotoholder').insertAdjacentHTML('afterbegin', newPhotoHTML);
    document.getElementById("lightboxcaption").innerHTML = newestPhotoID[0].title;

    // remove second photo element on a delay 
    window.setTimeout(function() {
      document.getElementsByClassName("lightboxphotoelem")[1].outerHTML = '';
    }, 100);

    lightbox.setupArrowIDs(newPID);

  }

};

(function() {
  "use strict";
  lightbox.init();
})();