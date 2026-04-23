// Script to rotate Emby Spotlight posters
// -----------------------------------------------------------------------------

console.log("Spotlight Auto-Scroller : Ping-Pong Mode Engaged...");

(function() {
  const ROTATION_SPEED = 8000; // 8 seconds
  let isScrollingRight = true; // State tracker for our current direction
  let spotlightTimer = null;   // Tracker for our interval timer
  let wasSpotlightVisible = false; // Tracker for spotlight visibility state

  // Function to check if an element is in the viewport AND visibly rendered
  function isElementInViewport(el) {
    // If offsetParent is null, the element (or its parent) is display: none
    if (!el || el.offsetParent === null) return false; 
    
    const rect = el.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  }

  // The main logic extracted into a standalone function
  function rotateSpotlight() {
    // 1. Only run if we are actually on the Home Screen
    if (!window.location.href.includes('home')) return;

    // 2. Safely hunt down the actual Spotlight row
    // Emby is an SPA and might keep old, hidden pages in the DOM. 
    // We MUST filter for cards that are actively displayed.
    const allSpotlightCards = document.querySelectorAll('.view-home-home .spotlightCard');
    
    // Find the first card that is actually visible on the screen
    const visibleCard = Array.from(allSpotlightCards).find(card => card.offsetParent !== null);
    
    if (!visibleCard) return; // Exit if we didn't find any visible cards

    const spotlightSection = visibleCard.closest('.verticalSection');
    if (!spotlightSection) return;

    // 3. Check if the spotlight section is visible on screen
    const isVisible = isElementInViewport(spotlightSection);
    if (isVisible !== wasSpotlightVisible) {
      if (isVisible) {
        console.log("Spotlight Auto-Scroller: Spotlight section became visible.");
      } else {
        console.log("Spotlight Auto-Scroller: Spotlight section is no longer visible.");
      }
      wasSpotlightVisible = isVisible;
    }
    if (!isVisible) return;

    // 4. Find the buttons inside this specific, visible section
    const nextBtn = spotlightSection.querySelector('button[data-direction="forwards"]');
    const prevBtn = spotlightSection.querySelector('button[data-direction="backwards"]');
    if (!nextBtn || !prevBtn) return;

    // 5. Look at the PARENT wrappers to see if we hit a wall
    const nextContainer = nextBtn.closest('.scrollbuttoncontainer');
    const prevContainer = prevBtn.closest('.scrollbuttoncontainer');

    const isRightWall = nextContainer && nextContainer.classList.contains('hide');
    const isLeftWall = prevContainer && prevContainer.classList.contains('hide');

    // 6. Ping-Pong Logic
    if (isScrollingRight) {
      if (!isRightWall) {
        console.log("Spotlight Auto-Scroller: Moving Right ->");
        nextBtn.click();
      } else {
        console.log("Spotlight Auto-Scroller: Hit right wall, bouncing Left <-");
        isScrollingRight = false; // Change direction
        prevBtn.click();
      }
    } else {
      if (!isLeftWall) {
        console.log("Spotlight Auto-Scroller: Moving Left <-");
        prevBtn.click();
      } else {
        console.log("Spotlight Auto-Scroller: Hit left wall, bouncing Right ->");
        isScrollingRight = true; // Change direction
        nextBtn.click();
      }
    }
  }

  // Starts the interval if it isn't already running
  function startRotation() {
    if (!spotlightTimer) {
      console.log("Spotlight Auto-Scroller: Window active, starting rotation.");
      spotlightTimer = setInterval(rotateSpotlight, ROTATION_SPEED);
    }
  }

  // Clears the interval to pause rotation
  function stopRotation() {
    if (spotlightTimer) {
      console.log("Spotlight Auto-Scroller: Window inactive, pausing rotation.");
      clearInterval(spotlightTimer);
      spotlightTimer = null;
    }
  }

  // Listen for visibility changes (tab switching, minimizing, etc.)
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      stopRotation();
    } else {
      startRotation();
    }
  });

  // Initialize the script on load
  if (!document.hidden) {
    startRotation();
  } else {
    console.log("Spotlight Auto-Scroller: Loaded in background, waiting for window to become active.");
  }
})();
