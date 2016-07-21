var lightbox = {

  flickrApiKey: "f1a836ca91876fec109588c72ecc641d",
  flickrUserID: "145147626@N05",
  photoTotal: 0,
  prevPhotoPID: 0,
  nextPhotoPID: 0,

  init: function() {

    window.addEventListener("DOMContentLoaded", lightbox.getPhotosFromAPI, false);

  },

  getPhotosFromAPI: function() {  // construct args for photo-getting API call

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

  callFlickrAPI: function(elem, callback) {   // Flickr API call workhorse

    var flickrAPICall, xhr;

    flickrAPICall = "https://api.flickr.com/services/rest/?method=" + elem.method + "&extras=original_format";
    flickrAPICall += "&api_key=" + lightbox.flickrApiKey + "&" + elem.arg + "&format=json&nojsoncallback=?";

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

  parseJSON: function(elem) {  // assembling photo URLs from the data response

    var key, imgObj, imgSrc, thumbPhotoSrc, detailPhotoSrc, detailBigPhotoSrc;
    var thumbHTML = '';

    for (key in elem) {
      if (elem.hasOwnProperty(key)) {

        // Flickr's recommended action to create photo  URLs https://www.flickr.com/services/api/misc.urls.html
        imgObj = elem[key];

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
    lightbox.placeThumbsHTML(thumbHTML);

  },

  placeThumbsHTML: function(elem) {  // set thumbs in container and set event listeners

    document.getElementById("container").innerHTML = elem;
    document.getElementById("container").addEventListener("click", lightbox.openLightbox, false);
    document.getElementById("lightbox").addEventListener("click", lightbox.advanceLightbox, false);
    window.addEventListener("keydown", lightbox.advanceLightbox, false);

  },

  openLightbox: function(elem) {  // add visibility class, add hint timeout, call photo

    var firstSelectedPID;

    if (elem.target.localName === "li") {
      document.getElementById("lightbox").classList.add('open');

      firstSelectedPID = elem.target.dataset.pid;
      lightbox.placeUpcomingPhoto(firstSelectedPID);

      setTimeout(function() {      // timeout for poor man's ux hinting for keypress events
        document.getElementById("hint").style.display = 'none';
      }, 3000);
    }

  },

  advanceLightbox: function(elem) {  // click and arrow functionality within lightbox

    var clickedItem;

    elem = elem || window.event;

    if (elem.target !== elem.currentTarget) {

      clickedItem = elem.target.id || elem.target.className;  // account for clicking on arrow div or arrow span

      if (clickedItem === "right" || elem.which === 39) {
        lightbox.placeUpcomingPhoto(lightbox.nextPhotoPID);
      } else if (clickedItem === "left" || elem.which === 37) {
        lightbox.placeUpcomingPhoto(lightbox.prevPhotoPID);
      } else if (clickedItem === "close" || elem.which === 27) {
        document.getElementById("lightbox").classList.remove('open');
      }

    }
    elem.stopPropagation();

  },

  setupNextPrevIDs: function(elem) {  // set next and previous IDs and preload photos

    elem = Number(elem);
    lightbox.prevPhotoPID = (elem === 0) ? lightbox.photoTotal : elem - 1;
    lightbox.nextPhotoPID = (elem === lightbox.photoTotal) ? 0 : elem + 1;

    lightbox.preloadImage(lightbox.prevPhotoPID);
    lightbox.preloadImage(lightbox.nextPhotoPID);

  },

  preloadImage: function(elem) {  // poor man's photo cache to reduce load time for next/previous images  

    var upcomingPhotoElem, upcomingPhotoSrc;

    upcomingPhotoElem = document.querySelectorAll("[data-pid='" + elem + "']");
    upcomingPhotoSrc = upcomingPhotoElem[0].dataset.img;
    document.getElementById('photocache').innerHTML = "<img src='" + upcomingPhotoSrc + "' />";

  },

  placeUpcomingPhoto: function(elem) {  // determine and place upcoming photo 

    var newestPhotoID, newPhotoSrc, newPhotoHTML;

    newestPhotoID = document.querySelectorAll("[data-pid='" + elem + "']");
    newPhotoSrc = newestPhotoID[0].dataset.img;

    newPhotoHTML = "<div class='lightboxphotoelem' data-pid='" + elem + "' ";
    newPhotoHTML += "style='background-image:url(" + newPhotoSrc + ")' ></div>";

    document.getElementById('lightboxphotoholder').insertAdjacentHTML('afterbegin', newPhotoHTML);
    document.getElementById("lightboxcaption").innerHTML = newestPhotoID[0].title;

    // remove second photo element on a delay 
    window.setTimeout(function() {
      document.getElementsByClassName("lightboxphotoelem")[1].outerHTML = '';
    }, 100);

    lightbox.setupNextPrevIDs(elem);
  }

};

(function() {
  "use strict";
  lightbox.init();
})();