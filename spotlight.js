// Script to rotate Emby Spotlight posters (Screensaver Safe)
// -----------------------------------------------------------------------------

console.log("Spotlight Auto-Scroller : Ping-Pong Mode Engaged...");

(function() {
  const ROTATION_SPEED = 8000; // 8 seconds
  let isScrollingRight = true; // State tracker for our current direction
  let spotlightTimer = null;   // Tracker for our interval timer

  // Function to check if an element is in the viewport AND visibly rendered
  function isElementInViewport(el) {
    if (!el || el.offsetParent === null) return false; 
    
    const rect = el.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  }

  // Helper to click buttons without alerting Emby's global idle timer
  function silentClick(btn, container) {
    // 1. Trap the click before it bubbles up to the document level
    const silencer = (e) => {
      if (!e.isTrusted) { // Only trap our automated, untrusted clicks
        e.stopPropagation(); 
      }
      container.removeEventListener('click', silencer); // Clean up the trap
    };
    
    container.addEventListener('click', silencer);

    // 2. Dispatch a synthetic MouseEvent instead of btn.click()
    // Native .click() causes the browser to focus the element, resetting the timer.
    btn.dispatchEvent(new MouseEvent('click', {
      view: window,
      bubbles: true, // Let it bubble just enough to trigger Emby's carousel logic
      cancelable: true
    }));
  }

  // The main logic extracted into a standalone function
  function rotateSpotlight() {
    if (!window.location.href.includes('home')) return;

    const allSpotlightCards = document.querySelectorAll('.view-home-home .spotlightCard');
    const visibleCard = Array.from(allSpotlightCards).find(card => card.offsetParent !== null);
    
    if (!visibleCard) return; 

    const spotlightSection = visibleCard.closest('.verticalSection');
    if (!spotlightSection) return;

    if (!isElementInViewport(spotlightSection)) return;

    const nextBtn = spotlightSection.querySelector('button[data-direction="forwards"]');
    const prevBtn = spotlightSection.querySelector('button[data-direction="backwards"]');
    if (!nextBtn || !prevBtn) return;

    const nextContainer = nextBtn.closest('.scrollbuttoncontainer');
    const prevContainer = prevBtn.closest('.scrollbuttoncontainer');

    const isRightWall = nextContainer && nextContainer.classList.contains('hide');
    const isLeftWall = prevContainer && prevContainer.classList.contains('hide');

    // Ping-Pong Logic using our new silentClick()
    if (isScrollingRight) {
      if (!isRightWall) {
        console.log("Spotlight Auto-Scroller: Moving Right ->");
        silentClick(nextBtn, spotlightSection);
      } else {
        console.log("Spotlight Auto-Scroller: Hit right wall, bouncing Left <-");
        isScrollingRight = false; 
        silentClick(prevBtn, spotlightSection);
      }
    } else {
      if (!isLeftWall) {
        console.log("Spotlight Auto-Scroller: Moving Left <-");
        silentClick(prevBtn, spotlightSection);
      } else {
        console.log("Spotlight Auto-Scroller: Hit left wall, bouncing Right ->");
        isScrollingRight = true; 
        silentClick(nextBtn, spotlightSection);
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
