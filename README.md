# javascript-lightbox
A pure JavaScript lightbox gallery using photos from Flickr

# What is it?
A web page that shows a grid of photo thumbnails; when a thumbnail is clicked, the photo should be displayed in a lightbox view, with the ability to move to the next / previous photos and display the photo title.

- Access a public photo API and successfully retrieve data from it;
- Display that data on a page;
- Update the UI of a page without refreshing;
- Build a polished user experience you'd be proud to ship; and
- Do all of the above using only native JavaScript (no libraries such as jQuery, although CSS preprocessors are fine).

Runs in the latest versions of Chrome, Safari, Firefox and IE. (Courtesy of browsehappy.com: Chrome 51, Firefox 47, Safari 9.1, IE 11)

# Taskrunning
You can use Grunt as a taskrunner on this project to compile the LESS stylesheet to CSS and to detect errors in JavaScript. For help getting started, see the [Grunt website](http://gruntjs.com/getting-started). Available commands for this project are ```grunt jshint``` ```grunt less``` and ```grunt watch```.

# Potential task backlog and considerations 
As with any codebase, possibilities for augmentation are infinite!
- SEO and deeplinking: currently, there's no way to deep link, which makes sharing a single photo impossible. Additional functionality could be added to manipulate ```history``` and update the URL with ```pushState()```. Also, sharing on social networks would require a separate file that dynamically displays unique meta data for each shared image.
- Adaptive photo display: larger cinema style screens will distort the image at its current 1024 size called. I chose to keep the image small as Flickr isn't a CDN, but detecting ```window.width``` and supplying a larger photo would be easy enough.
- Lazy loading: measuring the ```offsetTop``` of each thumb and only calling those above the "fold" of the site would reduce initial page weight, with the next group of images only being loaded ```onscroll```.