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

    flickrAPIArgs = {"method":"flickr.people.getPhotos", "arg":"user_id=" + lightbox.flickrUserID};

    photoData = lightbox.callFlickrAPI(flickrAPIArgs, function(){
      photoData  = JSON.parse(this.responseText);
      lightbox.parseJSON(photoData.photos.photo);      
    });

  },

  callFlickrAPI: function(elem, callback){

    var flickrAPICall, xhr, flickrResponse;
 //   console.log(elem);

    // using template literals would be pretty sweet here, WOULDN'T IT IE 11
    flickrAPICall =  "https://api.flickr.com/services/rest/?method=" + elem.method;
    flickrAPICall += "&extras=original_format&api_key=" + lightbox.flickrApiKey + "&";
    flickrAPICall +=  elem.arg + "&format=json&nojsoncallback=?";

    xhr = new XMLHttpRequest();
    xhr.open("GET", flickrAPICall, true);
    xhr.onreadystatechange = function() {
      if (xhr.readyState === 4 && xhr.status === 200) {
        callback.apply(xhr);
      } else {
      //  console.log(xhr.status);
     //   console.log(xhr.readyState);
      }
    };
    xhr.send();

  },

  parseJSON: function(data) {

    var key, imgSrc, detailPhotoSrc, thumbPhotoSrc, imgObj, farmID, serverID, secretID, originalSecretID, photoID;
    var thumbHTML = '';

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

        imgSrc = "https://farm" + farmID + ".staticflickr.com/" + serverID + "/" + photoID + "_";

        thumbPhotoSrc = imgSrc + secretID + "_q.jpg";
        detailPhotoSrc = imgSrc + originalSecretID + "_o.jpg";


        thumbHTML += "<div class='img' title='' id='" + photoID + "' data-pid='" + key + "'";
        thumbHTML += " data-img='" + detailPhotoSrc + "' style='background-image:url(" + thumbPhotoSrc + ")'></div>";
      }
    }

    // get the total number of photos so we know when next and previous reset
    lightbox.photoTotal = Number(key);

    lightbox.placeHTML(thumbHTML);
    //lightbox.getCaptions();

  },

  getCaptions: function(){
      // for each thumb, use id as photoid and apply title
        flickrAPIArgs = {"method":"flickr.photos.getInfo", "arg":"photo_id=" + data};

        photoData = lightbox.callFlickrAPI(flickrAPIArgs, function(){
          photoData  = JSON.parse(this.responseText);
          var desc =  photoData.photo.description._content;
        });


  },

  placeHTML: function(elem) {

    document.getElementById("container").innerHTML = elem;

    lightbox.clickHandler();
    lightbox.keyHandler();

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
    } else if (e.which === 37) {
      lightbox.placeUpcomingPhoto("left");
    } else if (e.which === 27) {
      lightbox.closeLightbox();
    }
  },

  initiateLightbox: function(elem) {

    var photoID, photoHTML;

    if (elem.target !== elem.currentTarget) {

      lightbox.openLightbox();
      photoID = elem.target.dataset.pid;

      photoHTML =  "<div class='lightboxphotoelem' data-pid='" + photoID + "' ";
      photoHTML += "style='background-image:url(" + elem.target.dataset.img + ")' ></div>";

      document.getElementById("lightboxphotoholder").innerHTML = photoHTML;

      lightbox.setupArrowIDs(photoID);

    }

    elem.stopPropagation();

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

  preloadImage: function(elem){

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
    newPhotoHTML =  "<div class='lightboxphotoelem' data-pid='" + photoID + "' ";
    newPhotoHTML += "style='background-image:url(" + imgOfphotoID + ")' ></div>";
    document.getElementById('lightboxphotoholder').insertAdjacentHTML('afterbegin', newPhotoHTML);

    // remove second element
    window.setTimeout(function(){
      document.getElementsByClassName("lightboxphotoelem")[1].remove();
    }, 750);

    lightbox.setupArrowIDs(photoID);

  }
};

(function() {
  "use strict";
  lightbox.init();
})();