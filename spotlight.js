// Script to rotate Emby Spotlight posters
// -----------------------------------------------------------------------------

console.log("Spotlight Auto-Scroller : Ping-Pong Mode Engaged...");

(function() {
  const ROTATION_SPEED = 8000; // 8 seconds
  let isScrollingRight = true; // State tracker for our current direction

  setInterval(() => {
    // 1. Only run if we are actually on the Home Screen
    if (!window.location.href.includes('home')) return;

    // 2. Safely hunt down the actual Spotlight row
    const spotlightCards = document.querySelectorAll('.view-home-home .spotlightCard');
    if (spotlightCards.length === 0) return; 
    
    const spotlightSection = spotlightCards[0].closest('.verticalSection');
    if (!spotlightSection) return;

    // 3. Find the buttons
    const nextBtn = spotlightSection.querySelector('button[data-direction="forwards"]');
    const prevBtn = spotlightSection.querySelector('button[data-direction="backwards"]');
    if (!nextBtn || !prevBtn) return;

    // 4. Look at the PARENT wrappers to see if we hit a wall
    const nextContainer = nextBtn.closest('.scrollbuttoncontainer');
    const prevContainer = prevBtn.closest('.scrollbuttoncontainer');
    
    const isRightWall = nextContainer && nextContainer.classList.contains('hide');
    const isLeftWall = prevContainer && prevContainer.classList.contains('hide');

    // 5. Ping-Pong Logic
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
  }, ROTATION_SPEED);
})();
