window.HELP_IMPROVE_VIDEOJS = false;

var INTERP_BASE = "./static/interpolation/stacked";
var NUM_INTERP_FRAMES = 240;

var interp_images = [];
function preloadInterpolationImages() {
  for (var i = 0; i < NUM_INTERP_FRAMES; i++) {
    var path = INTERP_BASE + '/' + String(i).padStart(6, '0') + '.jpg';
    interp_images[i] = new Image();
    interp_images[i].src = path;
  }
}

function setInterpolationImage(i) {
  var image = interp_images[i];
  image.ondragstart = function() { return false; };
  image.oncontextmenu = function() { return false; };
  $('#interpolation-image-wrapper').empty().append(image);
}


$(document).ready(function() {
    // Check for click events on the navbar burger icon
    $(".navbar-burger").click(function() {
      // Toggle the "is-active" class on both the "navbar-burger" and the "navbar-menu"
      $(".navbar-burger").toggleClass("is-active");
      $(".navbar-menu").toggleClass("is-active");

    });

    var options = {
			slidesToScroll: 1,
			slidesToShow: 3,
			loop: true,
			infinite: true,
			autoplay: false,
			autoplaySpeed: 3000,
    }

		// Initialize all div with carousel class
    var carousels = bulmaCarousel.attach('.carousel', options);

    // Loop on each carousel initialized
    for(var i = 0; i < carousels.length; i++) {
    	// Add listener to  event
    	carousels[i].on('before:show', state => {
    		console.log(state);
    	});
    }

    // Access to bulmaCarousel instance of an element
    var element = document.querySelector('#my-element');
    if (element && element.bulmaCarousel) {
    	// bulmaCarousel instance is available as element.bulmaCarousel
    	element.bulmaCarousel.on('before-show', function(state) {
    		console.log(state);
    	});
    }

    /*var player = document.getElementById('interpolation-video');
    player.addEventListener('loadedmetadata', function() {
      $('#interpolation-slider').on('input', function(event) {
        console.log(this.value, player.duration);
        player.currentTime = player.duration / 100 * this.value;
      })
    }, false);*/
    preloadInterpolationImages();

    $('#interpolation-slider').on('input', function(event) {
      setInterpolationImage(this.value);
    });
    setInterpolationImage(0);
    $('#interpolation-slider').prop('max', NUM_INTERP_FRAMES - 1);

    bulmaSlider.attach();

    initSidebarScrollspy();

})

// Highlights whichever section is currently in view in the fixed sidebar
// TOC. Plain IntersectionObserver rather than a scroll listener — no
// per-frame math, and it keeps working correctly regardless of how tall
// any given section turns out to be.
function initSidebarScrollspy() {
  var links = document.querySelectorAll('#sidebar-toc a[href^="#"]');
  if (!links.length) return;

  var linkByTargetId = {};
  var sections = [];
  links.forEach(function(link) {
    var id = link.getAttribute('href').slice(1);
    var section = document.getElementById(id);
    if (section) {
      linkByTargetId[id] = link;
      sections.push(section);
    }
  });

  var setActive = function(id) {
    links.forEach(function(link) { link.classList.remove('is-active'); });
    var active = linkByTargetId[id];
    if (active) active.classList.add('is-active');
  };

  var observer = new IntersectionObserver(function(entries) {
    // Prefer the entry nearest the top of the viewport among those
    // currently intersecting, so scrolling past a short section doesn't
    // leave the previous, taller one marked active.
    var visible = entries.filter(function(e) { return e.isIntersecting; });
    if (!visible.length) return;
    visible.sort(function(a, b) { return a.boundingClientRect.top - b.boundingClientRect.top; });
    setActive(visible[0].target.id);
  }, { rootMargin: '-96px 0px -70% 0px', threshold: 0 });

  sections.forEach(function(section) { observer.observe(section); });
}
