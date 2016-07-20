//
// Task Backlog
//
// Check functionality in Safari, Firefox, and IE
// Add captions

var lightbox = {

  flickrApiKey: "f1a836ca91876fec109588c72ecc641d",
  flickrUserID: "145147626@N05",
  photoTotal: 0,

  init: function() {
    window.addEventListener('DOMContentLoaded', lightbox.getPhotosFromAPI, false);
  },

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

  callFlickrAPI: function(elem, callback) {

    var flickrAPICall, xhr, flickrResponse;

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

  parseJSON: function(data) {

    var key, imgSrc, detailPhotoSrc, thumbPhotoSrc, imgObj, farmID, serverID, secretID, originalSecretID, photoID;
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

        imgObjArray.push(photoID);

        imgSrc = "https://farm" + farmID + ".staticflickr.com/" + serverID + "/" + photoID + "_";

        thumbPhotoSrc = imgSrc + secretID + "_q.jpg";
        detailPhotoSrc = imgSrc + secretID + "_b.jpg";

        // in case I feel ambitious and build screen-adaptive photo loading
        detailBigPhotoSrc = imgSrc + originalSecretID + "_o.jpg";

        thumbHTML += "<span class='img' title='' id='" + photoID + "' data-pid='" + key + "'";
        thumbHTML += " data-img='" + detailPhotoSrc + "' style='background-image:url(" + thumbPhotoSrc + ")'></span>";
      }
    }

    // get the total number of photos so we know when next and previous reset
    lightbox.photoTotal = Number(key);

    lightbox.placeHTML(thumbHTML);
    imgObjArray.forEach(lightbox.getCaption);

  },

  // use thumb id as photoid to update title
  getCaption: function(data) {

    var flickrAPIArgs, key, photoInfo, captionText, captionData;

    flickrAPIArgs = {
      "method": "flickr.photos.getInfo",
      "arg": "photo_id=" + data
    };

    captionData = lightbox.callFlickrAPI(flickrAPIArgs, function() {
      photoInfo = JSON.parse(this.responseText);
      captionText = photoInfo.photo.description._content;
      document.getElementById(data).title = captionText;
    });

  },

  // set photo thumbs into container and initiate click and key handlers and thumb container placement
  placeHTML: function(elem) {

    document.getElementById("container").innerHTML = elem;

    lightbox.clickHandler();
    lightbox.keyHandler();
    lightbox.sizeContainer();

  },

  clickHandler: function() {

    document.getElementById("container").addEventListener("click", lightbox.initiateLightbox, false);
    document.getElementById("lightbox").addEventListener("click", lightbox.advanceLightbox, false);

  },

  keyHandler: function() {

    window.addEventListener("keydown", lightbox.keyManipulateLightbox, false);

  },

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

  sizeContainer: function(){

    y = Math.floor((window.innerWidth - 20) / 144); // 100 width + 20 padding + 20 margin + 4 border
    z = y * 144;

    document.getElementById("container").style.width = z;
    window.addEventListener("resize",lightbox.sizeContainer);

  },

  initiateLightbox: function(elem) {

    var photoID, photoHTML;

    if (elem.target !== elem.currentTarget) {

      lightbox.openLightbox();
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

  setHintTimeout: function(){

    setTimeout(function(){
      document.getElementById("hint").style.display = 'none';
    }, 3000);

  }, 

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

  openLightbox: function() {

    document.getElementById("lightbox").classList.add('open');

  },

  closeLightbox: function() {

    document.getElementById("lightbox").classList.remove('open');

  },

  setupArrowIDs: function(elem) {

    var prev, next;

    elem = Number(elem);
    prev = (elem === 0) ? lightbox.photoTotal : elem - 1;
    next = (elem === lightbox.photoTotal) ? 0 : elem + 1;

    document.getElementById("left").dataset.pid = prev;
    document.getElementById("right").dataset.pid = next;

    lightbox.preloadImage(next);
    lightbox.preloadImage(prev);

  },

  preloadImage: function(elem) {

    var nextphotoID, imgOfphotoID;

    // poor man's photo cache to reduce load time for next and previous images
    nextphotoID = document.querySelectorAll("[data-pid='" + elem + "']");
    imgOfphotoID = nextphotoID[0].dataset.img;
    document.getElementById('photocache').innerHTML = "<img src='" + imgOfphotoID + "' />";

  },

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