const header = document.querySelector(".site-header");
const menuToggle = document.querySelector(".menu-toggle");
const mobileMenu = document.querySelector(".mobile-menu");
const mobileLinks = document.querySelectorAll(".mobile-menu a");
const heroSection = document.querySelector(".hero-section");
const marketSection = document.querySelector(".market-section");
const marketStage = document.querySelector(".market-stage");
const stepItems = document.querySelectorAll(".step-item");
const stepPreviewImage = document.querySelector("#step-preview-image");
const introLoader = document.querySelector("[data-intro-loader]");
const introPercent = introLoader?.querySelector("[data-intro-percent]");
const introBars = introLoader
  ? Array.from(introLoader.querySelectorAll(".intro-loader-bars span"))
  : [];
const heroTerminalScroll = document.querySelector(".hero-terminal-scroll");
const terminalTransitionLayer = document.querySelector(
  ".terminal-transition-layer"
);
const terminalPreviewSection = document.querySelector(
  ".terminal-preview-section"
);
const terminalPreviewStage = document.querySelector(".terminal-preview-stage");
const terminalPreviewIn = document.querySelector(".terminal-preview-in");
const mobileMarketTerminal = document.querySelector(".mobile-market-terminal");
const marketRoadmap = document.querySelector(".market-roadmap");
const marketRoadmapSticky = document.querySelector(".market-roadmap-sticky");
const marketRoadmapSteps = Array.from(
  document.querySelectorAll(".workflow-row span")
);
const marketRoadmapCards = Array.from(
  document.querySelectorAll(".feature-grid article")
);
const userAgent = navigator.userAgent || "";
const isAndroidMobile = /Android/i.test(userAgent);
const isSamsungDevice = /SamsungBrowser|Samsung|SM-/i.test(userAgent);
document.documentElement.classList.toggle("is-android-mobile", isAndroidMobile);
document.documentElement.classList.toggle("is-samsung-device", isSamsungDevice);

function viewportHeight() {
  return isAndroidMobile &&
    window.visualViewport &&
    window.visualViewport.height
    ? window.visualViewport.height
    : window.innerHeight;
}

function setViewportVars() {
  document.documentElement.style.setProperty(
    "--app-vh",
    viewportHeight().toFixed(2) + "px"
  );
}

setViewportVars();
window.addEventListener("resize", setViewportVars);
if (window.visualViewport) {
  window.visualViewport.addEventListener("resize", () => {
    setViewportVars();
    window.requestAnimationFrame(() =>
      window.dispatchEvent(new Event("resize"))
    );
  });
}

let heroImageSwapProgress = 0;
let marketImageSwapProgress = 0;
let sectionTransitionStartRect = null;
function setTerminalImageSwap() {
  if (!heroTerminalScroll) return;

  const progress = Math.max(heroImageSwapProgress, marketImageSwapProgress);
  heroTerminalScroll.style.setProperty(
    "--section2-image-out-opacity",
    (1 - progress).toFixed(3)
  );
  heroTerminalScroll.style.setProperty(
    "--section2-image-in-opacity",
    progress.toFixed(3)
  );
}

function setHeaderState() {
  if (!header) return;
  header.dataset.scrolled = String(window.scrollY > 12);
}

function setMenuOpen(open) {
  if (!menuToggle || !mobileMenu || !header) return;
  menuToggle.setAttribute("aria-expanded", String(open));
  header.dataset.menuOpen = String(open);
  mobileMenu.hidden = !open;
  document.body.classList.toggle("menu-open", open);
}

setHeaderState();
window.addEventListener("scroll", setHeaderState, { passive: true });

let heroIntroComplete = false;
let heroAutoRevealStarted = false;

function shouldAutoRevealHero() {
  if (!heroSection || heroAutoRevealStarted) return false;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches)
    return false;
  if (window.location.hash && window.location.hash !== "#top") return false;

  return window.scrollY < 8;
}

function easeInOutSine(progress) {
  return -(Math.cos(Math.PI * progress) - 1) / 2;
}

function scrollToHeroReveal() {
  if (!shouldAutoRevealHero()) return;

  heroAutoRevealStarted = true;

  const sectionTop = heroSection.getBoundingClientRect().top + window.scrollY;
  const scrollableDistance = Math.max(
    heroSection.offsetHeight - viewportHeight(),
    1
  );
  const isMobileReveal = window.matchMedia("(max-width: 720px)").matches;
  const targetProgress = isMobileReveal ? 0.62 : 0.46;
  const maxScroll = Math.max(
    document.documentElement.scrollHeight - viewportHeight(),
    0
  );
  const targetY = Math.min(
    sectionTop + scrollableDistance * targetProgress,
    maxScroll
  );
  const startY = window.scrollY;
  const distance = targetY - startY;
  const duration = 2600;
  const startedAt = performance.now();
  const previousScrollBehavior = document.documentElement.style.scrollBehavior;
  document.documentElement.style.scrollBehavior = "auto";
  let cancelled = false;

  function cleanup() {
    document.documentElement.style.scrollBehavior = previousScrollBehavior;
    window.removeEventListener("wheel", cancelAutoReveal);
    window.removeEventListener("keydown", cancelAutoReveal);
    window.removeEventListener("mousedown", cancelAutoReveal);
    window.removeEventListener("touchstart", cancelAutoReveal);
  }

  function cancelAutoReveal() {
    cancelled = true;
    cleanup();
  }

  window.addEventListener("wheel", cancelAutoReveal, {
    passive: true,
    once: true,
  });
  window.addEventListener("keydown", cancelAutoReveal, { once: true });
  window.addEventListener("mousedown", cancelAutoReveal, { once: true });
  window.addEventListener("touchstart", cancelAutoReveal, {
    passive: true,
    once: true,
  });

  function tick(now) {
    if (cancelled) return;

    const elapsed = now - startedAt;
    const progress = Math.min(elapsed / duration, 1);
    window.scrollTo(0, startY + distance * easeInOutSine(progress));
    setHeroPhase();
    setHeaderState();

    if (progress < 1) {
      window.requestAnimationFrame(tick);
    } else {
      cleanup();
    }
  }

  window.requestAnimationFrame(tick);
}

function setHeroPhase() {
  if (!heroSection) return;

  const rect = heroSection.getBoundingClientRect();
  const scrollableDistance = Math.max(
    heroSection.offsetHeight - viewportHeight(),
    1
  );
  const progress = Math.min(Math.max(-rect.top / scrollableDistance, 0), 1);
  const gradientProgress = heroIntroComplete ? smoothstep(0, 0.6, progress) : 0;
  const gradientClear = heroIntroComplete
    ? 78.85 - 78.85 * gradientProgress
    : 100;
  const contentFadeIn = heroIntroComplete
    ? smoothstep(0.08, 0.45, progress)
    : 0;

  let phase;
  if (heroIntroComplete && progress > 0.2) {
    phase = "content";
  } else if (heroIntroComplete) {
    phase = "prehero";
  } else {
    phase = "loader";
  }

  const bgCrossfade = heroIntroComplete ? smoothstep(0.1, 0.45, progress) : 0;
  const overlayOpacity = heroIntroComplete ? smoothstep(0, 0.4, progress) : 0;
  heroSection.style.setProperty(
    "--hero-gradient-clear",
    `${gradientClear.toFixed(2)}%`
  );
  heroSection.style.setProperty(
    "--hero-overlay-opacity",
    overlayOpacity.toFixed(3)
  );
  heroSection.style.setProperty(
    "--hero-content-opacity",
    contentFadeIn.toFixed(3)
  );
  heroSection.style.setProperty(
    "--hero-content-in-opacity",
    contentFadeIn.toFixed(3)
  );
  heroSection.style.setProperty(
    "--hero-bg-content-opacity",
    bgCrossfade.toFixed(3)
  );
  heroSection.style.setProperty(
    "--hero-bg-loader-opacity",
    (1 - bgCrossfade).toFixed(3)
  );
  heroSection.style.setProperty(
    "--hero-overlay-loader-opacity",
    (1 - bgCrossfade).toFixed(3)
  );

  setTerminalImageSwap();

  if (heroSection.dataset.heroPhase !== phase) {
    heroSection.dataset.heroPhase = phase;
  }
}

function completeHeroIntro() {
  if (!heroSection) return;
  heroIntroComplete = true;
  setHeroPhase();
}

function setIntroProgress(progress) {
  if (!introLoader) return;

  const clampedProgress = Math.min(Math.max(progress, 0), 1);
  const startScale = window.matchMedia("(max-width: 720px)").matches
    ? 1.28
    : 1.36;
  const scale = startScale - (startScale - 1) * clampedProgress;
  const percent = Math.round(clampedProgress * 100);
  const activeBars = percent === 0 ? 0 : Math.ceil(percent / 20);

  introLoader.style.setProperty("--intro-scale", scale.toFixed(3));
  if (introPercent) {
    introPercent.textContent = `${percent}%`;
  }

  introBars.forEach((bar, index) => {
    bar.classList.toggle("is-active", index < activeBars);
  });
}

function completeIntroLoader() {
  if (!introLoader) {
    completeHeroIntro();
    document.body.classList.remove("intro-loading");
    document.body.classList.remove("intro-revealing");
    scrollToHeroReveal();
    return;
  }

  setIntroProgress(1);
  completeHeroIntro();
  document.body.classList.add("intro-revealing");
  introLoader.dataset.state = "complete";

  window.setTimeout(() => {
    introLoader.remove();
    document.body.classList.remove("intro-loading");
    document.body.classList.remove("intro-revealing");
    scrollToHeroReveal();
  }, 560);
}

function runIntroLoader() {
  if (!introLoader) {
    window.setTimeout(completeIntroLoader, 800);
    return;
  }

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;
  const duration = prefersReducedMotion ? 700 : 2300;
  const startedAt = performance.now();
  let pageReady = document.readyState === "complete";
  let completed = false;

  if (!pageReady) {
    window.addEventListener(
      "load",
      () => {
        pageReady = true;
      },
      { once: true }
    );
  }

  function tick(now) {
    if (completed) return;

    const elapsed = now - startedAt;
    const progress = pageReady
      ? Math.min(elapsed / duration, 1)
      : Math.min(elapsed / duration, 0.94);
    setIntroProgress(progress);

    if (progress >= 1) {
      completed = true;
      completeIntroLoader();
      return;
    }

    window.requestAnimationFrame(tick);
  }

  setIntroProgress(0);
  window.requestAnimationFrame(tick);
}

setHeroPhase();
runIntroLoader();
window.addEventListener(
  "scroll",
  () => {
    if (window.matchMedia("(max-width: 720px)").matches) return;
    setHeroPhase();
  },
  { passive: true }
);
window.addEventListener("resize", setHeroPhase);

function smoothstep(edge0, edge1, value) {
  if (edge0 === edge1) return value < edge0 ? 0 : 1;
  const progress = Math.min(Math.max((value - edge0) / (edge1 - edge0), 0), 1);
  return progress * progress * (3 - 2 * progress);
}

function lerp(start, end, progress) {
  return start + (end - start) * progress;
}

function setMarketProgress() {
  if (!marketSection || !marketStage) return;

  const rect = marketSection.getBoundingClientRect();
  const scrollableDistance = Math.max(
    marketSection.offsetHeight - viewportHeight(),
    1
  );
  const marketProgress = Math.min(
    Math.max(-rect.top / scrollableDistance, 0),
    1
  );
  const progress = Math.min(
    Math.max((viewportHeight() - rect.top) / scrollableDistance, 0),
    1
  );
  const stageRect = marketStage.getBoundingClientRect();
  const stageWidth = marketStage.clientWidth;
  const isDesktopStage = stageWidth > 720;
  const settleEnd = isDesktopStage && stageWidth < 1800 ? 0.5 : 0.68;
  const settle = smoothstep(0.02, settleEnd, progress);
  const imageSwap = smoothstep(
    isDesktopStage ? 0.28 : 0.12,
    isDesktopStage ? 0.68 : 0.52,
    progress
  );
  const copyReveal = smoothstep(0.16, 0.34, progress);
  const featureReveal = smoothstep(0.5, 0.78, progress);

  const sideInset = stageWidth <= 720 ? 28 : 51;
  const widthCap = isDesktopStage ? 980 : 569;
  const imageRatio = isDesktopStage ? 2092 / 3466 : 328 / 569;
  const copyBlock = marketSection.querySelector(".section-copy");
  const copyHeadingRect = copyBlock
    ?.querySelector("h2")
    ?.getBoundingClientRect();
  const copyTextRect = copyBlock?.querySelector("p")?.getBoundingClientRect();
  const copyLeft =
    isDesktopStage && copyBlock
      ? copyBlock.getBoundingClientRect().left - stageRect.left
      : Math.min(stageWidth * 0.54, 690);
  const copyTop =
    isDesktopStage && copyHeadingRect
      ? copyHeadingRect.top
      : stageRect.top + 90;
  const copyBottom =
    isDesktopStage && copyTextRect ? copyTextRect.bottom : copyTop + 328;
  const desktopNarrowProgress = smoothstep(1600, 1280, stageWidth);
  const finalLeftOffset =
    stageWidth <= 720 ? sideInset : lerp(-210, 44, desktopNarrowProgress);
  const finalVisualLeftOffset = isDesktopStage
    ? finalLeftOffset + 40
    : finalLeftOffset;
  const availableBeforeCopy = isDesktopStage
    ? Math.max(copyLeft - finalLeftOffset - 20, 240)
    : widthCap;
  const matchedTextWidth = isDesktopStage
    ? Math.max(((copyBottom - copyTop) * 1.1) / imageRatio, 280)
    : widthCap;
  const finalWidth = isDesktopStage
    ? Math.min(
        matchedTextWidth,
        availableBeforeCopy,
        Math.max(stageWidth - sideInset * 2, 280)
      ) * 0.9
    : Math.min(widthCap, Math.max(stageWidth - sideInset * 2, 280));
  const finalHeight = finalWidth * imageRatio;
  const finalLeft = stageRect.left + finalVisualLeftOffset;
  const finalTop = isDesktopStage ? copyTop + 5 : stageRect.top + 90;
  const activeTerminalTransition = progress > 0 && rect.bottom > 0;
  const activeSignalTransition =
    progress > 0 && progress < 0.72 && rect.bottom > 0;
  const sourceRect = getSectionTransitionSourceRect(activeTerminalTransition);

  document.body.classList.toggle(
    "section2-terminal-active",
    activeTerminalTransition
  );
  document.body.classList.toggle(
    "section2-signal-active",
    activeSignalTransition
  );
  document.body.classList.toggle(
    "market-section-active",
    progress > 0 && marketProgress < 1
  );
  document.documentElement.style.setProperty(
    "--section2-image-left",
    `${lerp(sourceRect.left, finalLeft, settle).toFixed(2)}px`
  );
  document.documentElement.style.setProperty(
    "--section2-image-top",
    `${lerp(sourceRect.top, finalTop, settle).toFixed(2)}px`
  );
  document.documentElement.style.setProperty(
    "--section2-image-width",
    `${lerp(sourceRect.width, finalWidth, settle).toFixed(2)}px`
  );
  document.documentElement.style.setProperty(
    "--section2-image-height",
    `${lerp(sourceRect.height, finalHeight, settle).toFixed(2)}px`
  );
  marketImageSwapProgress = imageSwap;
  setTerminalImageSwap();
  const mobileTerminalRect = mobileMarketTerminal?.getBoundingClientRect();
  const mobileTerminalMidpoint = mobileTerminalRect
    ? mobileTerminalRect.top + mobileTerminalRect.height / 2
    : stageRect.top + Math.min(227, viewportHeight() * 0.2665) / 2;
  const mobileTerminalSwap =
    isDesktopStage || mobileTerminalMidpoint <= viewportHeight() / 2 ? 1 : 0;
  const roadmapRect = marketRoadmap?.getBoundingClientRect();
  const roadmapStickyHeight =
    marketRoadmapSticky?.offsetHeight || viewportHeight();
  const roadmapScrollDistance = marketRoadmap
    ? Math.max(marketRoadmap.offsetHeight - roadmapStickyHeight, 1)
    : 1;
  const stickyOffset = header?.offsetHeight || 0;
  const roadmapProgress =
    !isDesktopStage && roadmapRect
      ? Math.min(
          Math.max((stickyOffset - roadmapRect.top) / roadmapScrollDistance, 0),
          1
        )
      : 0;
  const mobileFeatureY = 0;
  const isMobileRoadmapPinned =
    !isDesktopStage && roadmapRect && roadmapRect.top <= stickyOffset;
  const roadmapCopyOpacity = isMobileRoadmapPinned ? 1 : 0;
  const mobileFeatureX = -1005 * roadmapProgress;
  const mobileTerminalExit = 0;
  const activeRoadmapIndex = Math.min(
    3,
    Math.max(0, Math.round(roadmapProgress * 3))
  );

  if (!isDesktopStage) {
    marketSection.classList.toggle(
      "is-roadmap-pinned",
      Boolean(isMobileRoadmapPinned)
    );
    marketRoadmapSteps.forEach((step, index) =>
      step.classList.toggle("is-active", index === activeRoadmapIndex)
    );
    marketRoadmapCards.forEach((card, index) =>
      card.classList.toggle("is-active", index === activeRoadmapIndex)
    );
  }

  marketSection.style.setProperty(
    "--mobile-market-terminal-in-opacity",
    mobileTerminalSwap.toFixed(3)
  );
  marketSection.style.setProperty(
    "--mobile-market-terminal-out-opacity",
    (1 - mobileTerminalSwap).toFixed(3)
  );
  marketSection.style.setProperty(
    "--mobile-market-terminal-opacity",
    (1 - mobileTerminalExit).toFixed(3)
  );
  marketSection.style.setProperty(
    "--mobile-market-terminal-y",
    (-227 * mobileTerminalExit).toFixed(1) + "px"
  );
  marketSection.style.setProperty(
    "--mobile-market-copy-y",
    mobileFeatureY.toFixed(1) + "px"
  );
  marketSection.style.setProperty(
    "--mobile-feature-rail-y",
    mobileFeatureY.toFixed(1) + "px"
  );
  marketSection.style.setProperty(
    "--mobile-roadmap-copy-opacity",
    roadmapCopyOpacity.toFixed(3)
  );
  marketSection.style.setProperty(
    "--mobile-feature-rail-x",
    mobileFeatureX.toFixed(1) + "px"
  );
  marketSection.style.setProperty("--mobile-chain-opacity", "1");
  marketSection.style.setProperty(
    "--section2-copy-opacity",
    copyReveal.toFixed(3)
  );
  marketSection.style.setProperty(
    "--section2-feature-opacity",
    featureReveal.toFixed(3)
  );
  marketSection.style.setProperty(
    "--section2-line-scale",
    featureReveal.toFixed(3)
  );
  marketSection.style.setProperty(
    "--section2-copy-offset",
    `${((1 - copyReveal) * 24).toFixed(2)}px`
  );
  marketSection.style.setProperty(
    "--section2-feature-offset",
    `${((1 - featureReveal) * 28).toFixed(2)}px`
  );
}

function getSectionTransitionSourceRect(active) {
  if (!active || !terminalTransitionLayer) {
    sectionTransitionStartRect = null;
  }

  const sourceEl =
    terminalPreviewIn || document.querySelector(".terminal-preview-out");

  if (active && !sectionTransitionStartRect && sourceEl) {
    const rect = sourceEl.getBoundingClientRect();
    const isDesktopTransition = window.innerWidth > 720;
    const startHeight = isDesktopTransition
      ? rect.width * (2092 / 3466)
      : rect.height;
    sectionTransitionStartRect = {
      left: rect.left,
      top: isDesktopTransition
        ? rect.top + (rect.height - startHeight) / 2
        : rect.top,
      width: rect.width,
      height: startHeight,
    };
  }

  return (
    sectionTransitionStartRect || {
      left: 0,
      top: 0,
      width: window.innerWidth,
      height: viewportHeight(),
    }
  );
}

function setTerminalPreviewProgress() {
  if (!terminalPreviewSection) return;

  const rect = terminalPreviewSection.getBoundingClientRect();
  const scrollableDistance = Math.max(
    terminalPreviewSection.offsetHeight - viewportHeight(),
    1
  );
  const progress = Math.min(Math.max(-rect.top / scrollableDistance, 0), 1);
  const crossfade = smoothstep(0.05, 0.95, progress);

  terminalPreviewSection.style.setProperty(
    "--preview-out-opacity",
    (1 - crossfade).toFixed(3)
  );
  terminalPreviewSection.style.setProperty(
    "--preview-in-opacity",
    crossfade.toFixed(3)
  );
}

setTerminalPreviewProgress();
setMarketProgress();
window.addEventListener("scroll", setTerminalPreviewProgress, {
  passive: true,
});
window.addEventListener("resize", setTerminalPreviewProgress);
window.addEventListener("scroll", setMarketProgress, { passive: true });
window.addEventListener("resize", setMarketProgress);

menuToggle?.addEventListener("click", () => {
  const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
  setMenuOpen(!isOpen);
});

mobileLinks.forEach((link) => {
  link.addEventListener("click", () => setMenuOpen(false));
});

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    setMenuOpen(false);
  }
});

function activateStep(step) {
  if (!step || !stepPreviewImage) return;
  const steps = Array.from(stepItems);
  const activeIndex = steps.indexOf(step);
  if (activeIndex < 0) return;

  steps.forEach((item, index) =>
    item.classList.toggle("is-active", index <= activeIndex)
  );
  const image = step.dataset.stepImage;
  if (stepPreviewImage.getAttribute("src") !== image) {
    stepPreviewImage.setAttribute("src", image);
  }
}

stepItems.forEach((step) => {
  step.addEventListener("mouseenter", () => activateStep(step));
  step.addEventListener("focusin", () => activateStep(step));
  step.addEventListener("click", () => activateStep(step));
});

if (
  "IntersectionObserver" in window &&
  stepItems.length &&
  !document.querySelector(".steps-section")
) {
  const observer = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

      if (visible) {
        activateStep(visible.target);
      }
    },
    { threshold: [0.45, 0.7] }
  );

  stepItems.forEach((step) => observer.observe(step));
}
(() => {
  const isMobileView = () => window.matchMedia("(max-width: 720px)").matches;

  const initMobileCapabilityCarousel = (section, grid, cards) => {
    const dotsContainer = document.querySelector(".mobile-cap-dots");
    if (!dotsContainer) return;

    // Build numbered dot spans
    dotsContainer.innerHTML = cards
      .map((_, i) => `<span>${i + 1}</span>`)
      .join("");
    const dots = Array.from(dotsContainer.querySelectorAll("span"));

    const updateActiveDot = () => {
      const cardWidth = grid.clientWidth || 1;
      const activeIndex = Math.min(
        Math.round(grid.scrollLeft / cardWidth),
        cards.length - 1
      );
      dots.forEach((dot, i) =>
        dot.classList.toggle("is-active", i === activeIndex)
      );
      cards.forEach((card, i) =>
        card.classList.toggle("is-active", i === activeIndex)
      );
    };

    dots.forEach((dot, i) => {
      dot.addEventListener("click", () => {
        grid.scrollTo({ left: i * grid.clientWidth, behavior: "smooth" });
      });
    });

    grid.addEventListener("scroll", updateActiveDot, { passive: true });
    updateActiveDot();
  };

  const initMobileFeatureTabs = () => {
    const workflowSpans = Array.from(
      document.querySelectorAll(".workflow-row span")
    );
    const featureGrid = document.querySelector(".feature-grid");
    const featureArticles = Array.from(
      document.querySelectorAll(".feature-grid article")
    );

    if (!featureGrid || !workflowSpans.length || !featureArticles.length)
      return;

    const updateActiveTab = () => {
      const cardWidth = featureGrid.clientWidth || 1;
      const activeIndex = Math.min(
        Math.round(featureGrid.scrollLeft / cardWidth),
        workflowSpans.length - 1
      );
      workflowSpans.forEach((span, i) =>
        span.classList.toggle("is-active", i === activeIndex)
      );
    };

    workflowSpans.forEach((span, i) => {
      span.style.cursor = "pointer";
      span.addEventListener("click", () => {
        featureGrid.scrollTo({
          left: i * featureGrid.clientWidth,
          behavior: "smooth",
        });
      });
    });

    featureGrid.addEventListener("scroll", updateActiveTab, { passive: true });
    updateActiveTab();
  };

  const setMobileCapabilitiesProgress = () => {
    if (!isMobileView()) return;

    const section = document.querySelector(".capabilities-section");
    const cards = Array.from(
      document.querySelectorAll(".capabilities-section .capability-card")
    );
    const dots = Array.from(document.querySelectorAll(".mobile-cap-dots span"));
    if (!section || !cards.length) return;

    const rect = section.getBoundingClientRect();
    const scrollableDistance = Math.max(
      section.offsetHeight - viewportHeight(),
      1
    );
    const progress = Math.min(Math.max(-rect.top / scrollableDistance, 0), 1);
    const activeIndex = Math.min(
      Math.floor(progress * cards.length),
      cards.length - 1
    );
    section.style.setProperty("--mobile-cap-y", "0px");
    section.style.setProperty("--mobile-cap-active-shift", "0px");
    cards.forEach((card, index) => {
      card.classList.toggle("is-active", index === activeIndex);
      card.classList.toggle("is-next", index === activeIndex + 1);
      card.classList.toggle("is-after-next", index === activeIndex + 2);
    });
    dots.forEach((dot, index) =>
      dot.classList.toggle("is-active", index === activeIndex)
    );
  };

  const initCapabilityScroll = () => {
    const section = document.querySelector(".capabilities-section");
    const cards = Array.from(
      document.querySelectorAll(".capabilities-section .capability-card")
    );
    const grid = document.querySelector(
      ".capabilities-section .capability-grid"
    );

    if (!section || !grid || !cards.length) return;

    // Strip "01 / " numbering prefix from all card labels (desktop + mobile)
    cards.forEach((card) => {
      const label = card.querySelector("p");
      if (label) {
        label.textContent = label.textContent.replace(/^\s*\d+\s*\/\s*/u, "");
      }
    });

    if (isMobileView()) {
      const heading = section.querySelector(".capabilities-heading");
      const dotsContainer = section.querySelector(".mobile-cap-dots");
      if (heading && heading.parentElement !== grid) {
        grid.prepend(heading);
      }
      if (dotsContainer && dotsContainer.parentElement !== grid) {
        grid.appendChild(dotsContainer);
      }

      initMobileCapabilityCarousel(section, grid, cards);
      initMobileFeatureTabs();
      setMobileCapabilitiesProgress();
      window.addEventListener("scroll", setMobileCapabilitiesProgress, {
        passive: true,
      });
      window.addEventListener("resize", setMobileCapabilitiesProgress);
      return;
    }

    // Desktop: move heading into grid, build index rail, scroll-driven animation
    const heading = section.querySelector(".capabilities-heading");
    if (heading && heading.parentElement !== grid) {
      grid.prepend(heading);
    }

    let indexRail = grid.querySelector(".capability-index");
    if (!indexRail) {
      indexRail = document.createElement("div");
      indexRail.className = "capability-index";
      indexRail.setAttribute("aria-hidden", "true");
      indexRail.innerHTML = cards
        .map((_, index) => `<span>${index + 1}</span>`)
        .join("");
      grid.appendChild(indexRail);
    }

    const railItems = Array.from(indexRail.querySelectorAll("span"));
    const clampLocal = (value, min, max) => Math.min(Math.max(value, min), max);

    const setActiveCapability = () => {
      const sectionRect = section.getBoundingClientRect();
      const sectionTop = sectionRect.top + window.scrollY;
      const scrollRange = Math.max(section.offsetHeight - viewportHeight(), 1);
      const progress = clampLocal(
        (window.scrollY - sectionTop) / scrollRange,
        0,
        1
      );
      const thresholds = [0, 1 / 6, 2 / 6, 3 / 6, 4 / 6, 5 / 6];
      const activeIndex = thresholds.reduce(
        (active, threshold, index) => (progress >= threshold ? index : active),
        0
      );
      const isPinned =
        sectionRect.top <= 0 && sectionRect.bottom >= viewportHeight();

      section.classList.toggle("is-pinned", isPinned);

      cards.forEach((card, index) => {
        card.classList.toggle("is-active", index === activeIndex);
      });

      railItems.forEach((item, index) => {
        item.classList.toggle("is-active", index === activeIndex);
      });
    };

    setActiveCapability();
    window.addEventListener("scroll", setActiveCapability, { passive: true });
    window.addEventListener("resize", setActiveCapability);
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initCapabilityScroll, {
      once: true,
    });
  } else {
    initCapabilityScroll();
  }
})();

(() => {
  const initStepScroll = () => {
    const section = document.querySelector(".steps-section");
    const layout = section?.querySelector(".steps-layout");
    const steps = Array.from(section?.querySelectorAll(".step-item") || []);
    const previewImage = section?.querySelector(".step-preview img");

    if (!section || !layout || !steps.length) return;

    const clampLocal = (value, min, max) => Math.min(Math.max(value, min), max);

    if (window.matchMedia("(max-width: 720px)").matches) {
      const setActiveStep = (activeIndex) => {
        steps.forEach((step, index) => {
          step.classList.toggle("is-active", index <= activeIndex);
          step.classList.toggle("is-current", index === activeIndex);
        });
      };

      const updateMobileStepScroll = () => {
        const rect = section.getBoundingClientRect();
        const progress = clampLocal(
          (viewportHeight() - rect.top) / Math.max(rect.height, 1),
          0,
          1
        );
        let activeIndex = 0;

        steps.forEach((step, index) => {
          const stepRect = step.getBoundingClientRect();
          if (stepRect.top <= viewportHeight() * 0.72) {
            activeIndex = index;
          }
        });

        const previewRect = section
          .querySelector(".step-preview")
          ?.getBoundingClientRect();
        const imageFade = previewRect
          ? smoothstep(
              viewportHeight() * 0.24,
              viewportHeight() * 0.13,
              previewRect.top
            )
          : smoothstep(0.18, 0.32, progress);
        section.style.setProperty(
          "--mobile-step-image-two-opacity",
          imageFade.toFixed(3)
        );
        section.classList.remove("is-pinned");
        setActiveStep(activeIndex);
      };

      updateMobileStepScroll();
      window.addEventListener("scroll", updateMobileStepScroll, {
        passive: true,
      });
      window.addEventListener("resize", updateMobileStepScroll);
      return;
    }
    const setActiveStep = (activeIndex) => {
      steps.forEach((step, index) => {
        step.classList.toggle("is-active", index <= activeIndex);
      });

      const activeStep = steps[activeIndex];
      const image = activeStep?.dataset.stepImage;
      if (previewImage && image && previewImage.getAttribute("src") !== image) {
        previewImage.setAttribute("src", image);
      }
    };

    const updateStepScroll = () => {
      const rect = section.getBoundingClientRect();
      const sectionTop = rect.top + window.scrollY;
      const scrollRange = Math.max(section.offsetHeight - viewportHeight(), 1);
      const progress = clampLocal(
        (window.scrollY - sectionTop) / scrollRange,
        0,
        0.999
      );
      const activeIndex = clampLocal(
        Math.floor(progress * steps.length),
        0,
        steps.length - 1
      );
      const isPinned = rect.top <= 0 && rect.bottom >= viewportHeight();

      section.classList.toggle("is-pinned", isPinned);
      setActiveStep(activeIndex);
    };

    updateStepScroll();
    window.addEventListener("scroll", updateStepScroll, { passive: true });
    window.addEventListener("resize", updateStepScroll);
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initStepScroll, {
      once: true,
    });
  } else {
    initStepScroll();
  }
})();

(() => {
  const rails = Array.from(document.querySelectorAll(".section-rail"));
  const globalRail = document.querySelector(".global-scroll-rail");
  const globalRailIndicator = globalRail?.querySelector("span");

  function updateGlobalRail() {
    if (!globalRail || !globalRailIndicator) return;

    const scrollRange = Math.max(
      document.documentElement.scrollHeight - viewportHeight(),
      1
    );
    const progress = Math.min(Math.max(window.scrollY / scrollRange, 0), 1);
    const trackTravel = Math.max(
      globalRail.offsetHeight - globalRailIndicator.offsetHeight,
      0
    );
    globalRail.style.setProperty(
      "--global-rail-pos",
      (progress * trackTravel).toFixed(1) + "px"
    );
  }

  function updateSectionRails() {
    rails.forEach((rail) => {
      const section = rail.closest("section") || rail.parentElement;
      const indicator = rail.querySelector("span");
      if (!section || !indicator) return;

      const rect = section.getBoundingClientRect();
      const scrollRange = Math.max(section.offsetHeight - viewportHeight(), 1);
      const progress = Math.min(Math.max(-rect.top / scrollRange, 0), 1);
      const trackTravel = Math.max(
        rail.offsetHeight - indicator.offsetHeight,
        0
      );
      rail.style.setProperty(
        "--rail-pos",
        (progress * trackTravel).toFixed(1) + "px"
      );
    });
  }

  function updateRails() {
    updateGlobalRail();
    updateSectionRails();
  }

  updateRails();
  window.addEventListener("scroll", updateRails, { passive: true });
  window.addEventListener("resize", updateRails);
})();

(() => {
  const mobileHeroQuery = window.matchMedia("(max-width: 720px)");
  const heroMedia = document.querySelector(".hero-media");
  if (!heroSection || !heroMedia) return;

  const figmaImageRatio = 1540 / 859;

  function clearMobileHeroScroll() {
    [
      "--mobile-hero-progress",
      "--mobile-hero-image-width",
      "--mobile-hero-image-height",
      "--mobile-hero-image-top",
      "--mobile-content-top",
      "--mobile-content-opacity",
      "--mobile-content-y",
      "--mobile-loader-kicker-opacity",
      "--mobile-headline-opacity",
      "--mobile-headline-y",
      "--mobile-copy-opacity",
      "--mobile-copy-y",
      "--mobile-actions-opacity",
      "--mobile-actions-y",
      "--mobile-signal-opacity",
      "--mobile-signal-y",
      "--mobile-signal-top",
      "--mobile-signal-height",
    ].forEach((property) => heroSection.style.removeProperty(property));
  }

  function updateMobileHeroScroll() {
    if (!mobileHeroQuery.matches) {
      clearMobileHeroScroll();
      return;
    }

    const rect = heroSection.getBoundingClientRect();
    const scrollableDistance = Math.max(
      heroSection.offsetHeight - viewportHeight(),
      1
    );
    const rawProgress = Math.min(
      Math.max(-rect.top / scrollableDistance, 0),
      1
    );
    const visualProgress = Math.min(rawProgress / 0.68, 1);
    const progress = heroIntroComplete ? visualProgress : 0;
    const viewportH = viewportHeight();

    const signalOpacity = 0;
    const imageHeightBase = lerp(viewportH + 7, viewportH * 0.3685, progress);
    const imageHeight = lerp(imageHeightBase, 222, signalOpacity);
    const imageTop = lerp(-7, -132, signalOpacity);
    const imageWidth = imageHeight * figmaImageRatio;
    const contentTopEnd = Math.max(190, Math.min(279, viewportH * 0.327));
    const contentTopStart = Math.max(viewportH * 0.493, contentTopEnd + 130);
    const contentTopBase = lerp(
      contentTopStart,
      contentTopEnd,
      smoothstep(0.36, 0.96, progress)
    );
    const contentTop = contentTopBase - 125 * signalOpacity;
    const signalHeight = 219;
    const signalTopStart = Math.min(825, viewportH - 26);
    const signalTopEnd = Math.max(
      560,
      Math.min(650, viewportH - signalHeight - 12)
    );
    const signalTop = lerp(signalTopStart, signalTopEnd, signalOpacity);

    heroSection.style.setProperty(
      "--mobile-hero-progress",
      progress.toFixed(4)
    );
    heroSection.style.setProperty(
      "--mobile-hero-image-width",
      imageWidth.toFixed(1) + "px"
    );
    heroSection.style.setProperty(
      "--mobile-hero-image-height",
      imageHeight.toFixed(1) + "px"
    );
    heroSection.style.setProperty(
      "--mobile-hero-image-top",
      imageTop.toFixed(1) + "px"
    );
    heroSection.style.setProperty(
      "--mobile-content-top",
      contentTop.toFixed(1) + "px"
    );
    const contentOpacity = smoothstep(0.2, 0.48, progress);
    const headlineOpacity = smoothstep(0.3, 0.62, progress);
    const copyOpacity = smoothstep(0.44, 0.76, progress);
    const actionsOpacity = smoothstep(0.54, 0.88, progress);

    heroSection.style.setProperty(
      "--mobile-content-opacity",
      contentOpacity.toFixed(3)
    );
    heroSection.style.setProperty(
      "--mobile-content-y",
      ((1 - contentOpacity) * 18).toFixed(1) + "px"
    );
    heroSection.style.setProperty(
      "--mobile-loader-kicker-opacity",
      (1 - smoothstep(0.14, 0.42, progress)).toFixed(3)
    );
    heroSection.style.setProperty(
      "--mobile-headline-opacity",
      headlineOpacity.toFixed(3)
    );
    heroSection.style.setProperty(
      "--mobile-headline-y",
      ((1 - headlineOpacity) * 22).toFixed(1) + "px"
    );
    heroSection.style.setProperty(
      "--mobile-copy-opacity",
      copyOpacity.toFixed(3)
    );
    heroSection.style.setProperty(
      "--mobile-copy-y",
      ((1 - copyOpacity) * 18).toFixed(1) + "px"
    );
    heroSection.style.setProperty(
      "--mobile-actions-opacity",
      actionsOpacity.toFixed(3)
    );
    heroSection.style.setProperty(
      "--mobile-actions-y",
      ((1 - actionsOpacity) * 18).toFixed(1) + "px"
    );
    heroSection.style.setProperty(
      "--mobile-signal-opacity",
      signalOpacity.toFixed(3)
    );
    heroSection.style.setProperty(
      "--mobile-signal-y",
      ((1 - signalOpacity) * 24).toFixed(1) + "px"
    );
    heroSection.style.setProperty(
      "--mobile-signal-top",
      signalTop.toFixed(1) + "px"
    );
    heroSection.style.setProperty(
      "--mobile-signal-height",
      signalHeight.toFixed(1) + "px"
    );
  }

  updateMobileHeroScroll();
  window.addEventListener("scroll", updateMobileHeroScroll, { passive: true });
  window.addEventListener("resize", updateMobileHeroScroll);
  mobileHeroQuery.addEventListener?.("change", updateMobileHeroScroll);
})();

(() => {
  const mobileSignalItems = Array.from(
    document.querySelectorAll(
      ".signal-bar--mobile > div, .mobile-benefit-handoff > div"
    )
  );
  if (!mobileSignalItems.length) return;

  mobileSignalItems.forEach((item) => {
    item.setAttribute("role", "button");
    item.setAttribute("tabindex", "0");
    item.addEventListener("click", () => {
      mobileSignalItems.forEach((signalItem) =>
        signalItem.classList.remove("is-selected")
      );
      item.classList.add("is-selected");
    });
    item.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      item.click();
    });
  });
})();

(function lockMobileHorizontalScroll() {
  var mobileQuery = window.matchMedia("(max-width: 720px)");

  function resetHorizontalScroll() {
    if (!mobileQuery.matches) return;
    if (document.documentElement.scrollLeft)
      document.documentElement.scrollLeft = 0;
    if (document.body.scrollLeft) document.body.scrollLeft = 0;
  }

  window.addEventListener("scroll", resetHorizontalScroll, { passive: true });
  window.addEventListener("resize", resetHorizontalScroll);
  resetHorizontalScroll();
})();

(function preventMobileSideDrag() {
  var mobileQuery = window.matchMedia("(max-width: 720px)");
  var startX = 0;
  var startY = 0;

  document.addEventListener(
    "touchstart",
    function (event) {
      if (!mobileQuery.matches || event.touches.length !== 1) return;
      startX = event.touches[0].clientX;
      startY = event.touches[0].clientY;
    },
    { passive: true }
  );

  document.addEventListener(
    "touchmove",
    function (event) {
      if (!mobileQuery.matches || event.touches.length !== 1) return;

      var deltaX = event.touches[0].clientX - startX;
      var deltaY = event.touches[0].clientY - startY;
      if (Math.abs(deltaX) > 6 && Math.abs(deltaX) > Math.abs(deltaY)) {
        event.preventDefault();
      }
    },
    { passive: false }
  );
})();

(function initWebsiteI18n() {
  "use strict";

  const STORAGE_KEY = "sparta:language";
  const DEFAULT_LANGUAGE = "en";
  const SUPPORTED_LANGUAGES = ["en", "nl-NL", "zh-CN"];
  const LANGUAGE_OPTIONS = [
    {
      code: "en",
      flag: "🇬🇧",
      shortLabel: "EN",
      label: { en: "English", "nl-NL": "Engels", "zh-CN": "英语" },
    },
    {
      code: "nl-NL",
      flag: "🇳🇱",
      shortLabel: "NL",
      label: { en: "Dutch", "nl-NL": "Nederlands", "zh-CN": "荷兰语" },
    },
    {
      code: "zh-CN",
      flag: "🇨🇳",
      shortLabel: "ZH",
      label: {
        en: "Simplified Chinese",
        "nl-NL": "Vereenvoudigd Chinees",
        "zh-CN": "简体中文",
      },
    },
  ];
  const SELECTOR_LABEL = { en: "Language", "nl-NL": "Taal", "zh-CN": "语言" };
  const ATTRIBUTES = ["aria-label", "alt", "content"];

  const TRANSLATIONS = {
    en: {
      "01 / AI Trading": "AI Trading",
      "02 / Multi-Chain": "Multi-Chain",
      "03 / Keyword Trading": "Keyword Trading",
      "04 / Copytrade": "Copytrade",
      "05 / Trading Signals": "Trading Signals",
      "06 / Gasless Spam": "Gasless Spam",
    },
    "nl-NL": {
      "01 / AI Trading": "AI Trading",
      "02 / Multi-Chain": "Multi-chain",
      "03 / Keyword Trading": "Keyword trading",
      "04 / Copytrade": "Copytrade",
      "05 / Trading Signals": "Tradingsignalen",
      "06 / Gasless Spam": "Gasless spam",
      "Sparta | Move Before The Market Does":
        "Sparta | Beweeg voordat de markt beweegt",
      "Sparta is a professional multi-chain trading terminal for traders who want speed, structure, and control.":
        "Sparta is een professionele multi-chain tradingterminal voor traders die snelheid, structuur en controle willen.",
      "Loading Sparta": "Sparta laden",
      "Primary navigation": "Primaire navigatie",
      Terminal: "Terminal",
      Features: "Functies",
      "Telegram Bot": "Telegram Bot",
      Contact: "Contact",
      "Sparta home": "Sparta home",
      "View Docs": "Docs bekijken",
      "Open Terminal": "Terminal openen",
      "Open navigation": "Navigatie openen",
      "Built For Serious Traders": "Gebouwd voor serieuze traders",
      "Move before the": "Beweeg voordat",
      "market does.": "de markt beweegt.",
      "The unfair advantage onchain traders have been waiting for. AI-powered, fully automated, and built to put you on the right side of every trade.":
        "Het voordeel waar onchain traders op wachtten. AI-gestuurd, volledig geautomatiseerd en gebouwd om je aan de goede kant van elke trade te zetten.",
      "Launch Terminal": "Terminal starten",
      "Open Telegram": "Telegram openen",
      "Sparta terminal benefits": "Voordelen van de Sparta-terminal",
      "Real time data": "Realtime data",
      "Safety Scans": "Safety scans",
      "AI Trading Signals": "AI-tradingsignalen",
      "Keyword Trading": "Keyword trading",
      "Sparta trading terminal": "Sparta tradingterminal",
      "Built for active trading, built for professionals":
        "Gebouwd voor actieve trading, gebouwd voor professionals",
      "Sparta is your ultimate champion for trading on BSC, Ethereum, Base, and Solana. The terminal keeps discovery, execution, orders, and automation close together so traders can react quickly without losing time.":
        "Sparta is je ultieme kampioen voor trading op BSC, Ethereum, Base en Solana. De terminal houdt discovery, execution, orders en automatisering dicht bij elkaar, zodat traders snel kunnen reageren zonder tijd te verliezen.",
      "Sparta trading workflow": "Sparta tradingworkflow",
      Discovery: "Discovery",
      Signal: "Signaal",
      Execution: "Execution",
      Control: "Controle",
      "New tokens": "Nieuwe tokens",
      "Track live launches, surface fresh listings, and move from scan to action quickly.":
        "Volg live launches, vind nieuwe listings en ga snel van scan naar actie.",
      "AI picks": "AI picks",
      "Use AI trading to stay active in the market and automate entries and exits around the clock.":
        "Gebruik AI trading om actief te blijven in de markt en entries en exits dag en nacht te automatiseren.",
      "Trade fast": "Snel traden",
      "Trade directly from the terminal with wallet actions, fast execution, and chain-specific strategies.":
        "Trade direct vanuit de terminal met walletacties, snelle execution en chain-specifieke strategieen.",
      "Stay synced": "Blijf synchroon",
      "Manage settings, transfers, bridge tools, copy trading, and monitoring from one connected workspace.":
        "Beheer instellingen, transfers, bridge-tools, copy trading en monitoring vanuit een verbonden workspace.",
      "Supported chains": "Ondersteunde chains",
      Capabilities: "Mogelijkheden",
      "Core platform capabilities": "Kernmogelijkheden van het platform",
      "Platform capability highlights": "Highlights van platformmogelijkheden",
      "AI Trading": "AI Trading",
      "Automated Trading Setup": "Geautomatiseerde trading setup",
      "Automate your trading with Sparta AI Agents. They scan markets in real time and handle entries and exits for you.":
        "Automatiseer je trading met Sparta AI Agents. Ze scannen markten realtime en regelen entries en exits voor je.",
      "Multi-Chain": "Multi-chain",
      "Support for the 4 Biggest Chains": "Support voor de 4 grootste chains",
      "Trade seamlessly across Binance Chain, Base, Ethereum, and Solana from one terminal.":
        "Trade soepel op Binance Chain, Base, Ethereum en Solana vanuit een terminal.",
      "Keyword Based Trading": "Keyword-gestuurde trading",
      "Set up keyword triggers and let the agent buy new launches when a name or symbol matches your criteria.":
        "Stel keyword triggers in en laat de agent nieuwe launches kopen wanneer naam of symbool past bij je criteria.",
      Copytrade: "Copytrade",
      "Follow Your Favorite Traders": "Volg je favoriete traders",
      "Copy wallets you follow automatically. Add the address, choose presets, and enable copy trading.":
        "Kopieer wallets die je volgt automatisch. Voeg het adres toe, kies presets en schakel copy trading in.",
      "Trading Signals": "Tradingsignalen",
      "Sparta AI Token Signals": "Sparta AI token signals",
      "Sparta agents monitor markets 24/7 and surface AI Picks so you can spot opportunities earlier.":
        "Sparta agents monitoren markten 24/7 en tonen AI Picks zodat je kansen eerder ziet.",
      "Gasless Spam": "Gasless spam",
      "Spam Token Contracts": "Spam tokencontracten",
      "Spam new token contracts with no gas paid on failed attempts. You only pay for successful transactions.":
        "Spam nieuwe tokencontracten zonder gas te betalen voor mislukte pogingen. Je betaalt alleen voor succesvolle transacties.",
      "Start Trading In Seconds": "Start met traden in seconden",
      "Open a token, choose the wallet and amount, confirm the trade, and keep the market context visible while the position is active.":
        "Open een token, kies wallet en bedrag, bevestig de trade en houd marktcontext zichtbaar terwijl de positie actief is.",
      "Trading steps": "Tradingstappen",
      Scan: "Scan",
      "Find the opportunity": "Vind de kans",
      "Use discovery feeds, token views, and chain filters to identify setups worth acting on.":
        "Gebruik discovery feeds, tokenviews en chainfilters om setups te vinden die actie waard zijn.",
      Execute: "Execute",
      "One-click execution": "Execution met een klik",
      "Move straight from token review into buy and sell controls without leaving the terminal or bot.":
        "Ga direct van tokenreview naar buy- en sell-controls zonder terminal of bot te verlaten.",
      Manage: "Beheer",
      "Track what happens next": "Volg wat daarna gebeurt",
      "Keep wallet, position, and performance visibility near the same actions you use daily.":
        "Houd wallet, positie en performance dicht bij de acties die je dagelijks gebruikt.",
      "Sparta trading controls": "Sparta tradingcontrols",
      "By traders, for traders": "Door traders, voor traders",
      "Two interfaces, one platform": "Twee interfaces, een platform",
      "Sparta is designed and built by experienced traders and software engineers who understand what active traders need from a serious trading platform.":
        "Sparta is ontworpen en gebouwd door ervaren traders en software engineers die begrijpen wat actieve traders nodig hebben van een serieus tradingplatform.",
      "Open Sparta Telegram Bot": "Sparta Telegram Bot openen",
      "Trade directly through Telegram with the Sparta trading bot. Same platform, different interface.":
        "Trade direct via Telegram met de Sparta trading bot. Hetzelfde platform, een andere interface.",
      "Open Sparta Trading Terminal": "Sparta Trading Terminal openen",
      "Trading Terminal": "Trading Terminal",
      "Trade through the Sparta trading terminal and stay ahead of the market with everything you need in one place.":
        "Trade via de Sparta tradingterminal en blijf de markt voor met alles wat je nodig hebt op een plek.",
      "Any suggestions?": "Suggesties?",
      "Have feedback or ideas? Reach out through any of the contact options and let us know.":
        "Heb je feedback of ideeen? Neem contact op via een van de contactopties en laat het ons weten.",
      "Start Trading Like A Pro": "Trade als een pro",
      "Sparta brings together professional trading tools, fast execution, and multi-chain access in one connected platform built for serious traders.":
        "Sparta brengt professionele tradingtools, snelle execution en multi-chain toegang samen in een verbonden platform voor serieuze traders.",
      "Sparta is a professional multi-chain trading platform built for speed, execution, and the workflows active traders rely on every day.":
        "Sparta is een professioneel multi-chain tradingplatform gebouwd voor snelheid, execution en de workflows waar actieve traders elke dag op vertrouwen.",
      Documentation: "Documentatie",
      Community: "Community",
      "Social links": "Sociale links",
      "Sparta on X": "Sparta op X",
      "Sparta on Telegram": "Sparta op Telegram",
      "Privacy Policy": "Privacybeleid",
      "Terms of Service": "Servicevoorwaarden",
      "Sparta trading © 2026": "Sparta trading © 2026",
    },
    "zh-CN": {
      "01 / AI Trading": "AI 交易",
      "02 / Multi-Chain": "多链",
      "03 / Keyword Trading": "关键词交易",
      "04 / Copytrade": "复制交易",
      "05 / Trading Signals": "交易信号",
      "06 / Gasless Spam": "免 Gas Spam",
      "Sparta | Move Before The Market Does": "Sparta | 领先市场一步",
      "Sparta is a professional multi-chain trading terminal for traders who want speed, structure, and control.":
        "Sparta 是面向交易者的专业多链交易终端，强调速度、结构和控制力。",
      "Loading Sparta": "正在加载 Sparta",
      "Primary navigation": "主导航",
      Terminal: "终端",
      Features: "功能",
      "Telegram Bot": "Telegram 机器人",
      Contact: "联系",
      "Sparta home": "Sparta 首页",
      "View Docs": "查看文档",
      "Open Terminal": "打开终端",
      "Open navigation": "打开导航",
      "Built For Serious Traders": "为严肃交易者打造",
      "Move before the": "先于市场",
      "market does.": "采取行动。",
      "The unfair advantage onchain traders have been waiting for. AI-powered, fully automated, and built to put you on the right side of every trade.":
        "链上交易者一直等待的优势。由 AI 驱动，完全自动化，帮助你在每笔交易中站到正确一侧。",
      "Launch Terminal": "启动终端",
      "Open Telegram": "打开 Telegram",
      "Sparta terminal benefits": "Sparta 终端优势",
      "Real time data": "实时数据",
      "Safety Scans": "安全扫描",
      "AI Trading Signals": "AI 交易信号",
      "Keyword Trading": "关键词交易",
      "Sparta trading terminal": "Sparta 交易终端",
      "Built for active trading, built for professionals":
        "为活跃交易而建，为专业人士而建",
      "Sparta is your ultimate champion for trading on BSC, Ethereum, Base, and Solana. The terminal keeps discovery, execution, orders, and automation close together so traders can react quickly without losing time.":
        "Sparta 是你在 BSC、Ethereum、Base 和 Solana 上交易的核心工具。终端把发现、执行、订单和自动化集中在一起，让交易者快速反应，不浪费时间。",
      "Sparta trading workflow": "Sparta 交易流程",
      Discovery: "发现",
      Signal: "信号",
      Execution: "执行",
      Control: "控制",
      "New tokens": "新代币",
      "Track live launches, surface fresh listings, and move from scan to action quickly.":
        "跟踪实时发行，发现新上市项目，并快速从扫描进入操作。",
      "AI picks": "AI 精选",
      "Use AI trading to stay active in the market and automate entries and exits around the clock.":
        "使用 AI 交易保持市场活跃，并全天候自动处理进场和出场。",
      "Trade fast": "快速交易",
      "Trade directly from the terminal with wallet actions, fast execution, and chain-specific strategies.":
        "直接在终端中完成钱包操作、快速执行和面向不同链的策略。",
      "Stay synced": "保持同步",
      "Manage settings, transfers, bridge tools, copy trading, and monitoring from one connected workspace.":
        "在一个连接的工作区中管理设置、转账、跨链桥、复制交易和监控。",
      "Supported chains": "支持的链",
      Capabilities: "能力",
      "Core platform capabilities": "核心平台能力",
      "Platform capability highlights": "平台能力亮点",
      "AI Trading": "AI 交易",
      "Automated Trading Setup": "自动化交易设置",
      "Automate your trading with Sparta AI Agents. They scan markets in real time and handle entries and exits for you.":
        "用 Sparta AI Agents 自动化交易。它们实时扫描市场，并为你处理进场和出场。",
      "Multi-Chain": "多链",
      "Support for the 4 Biggest Chains": "支持 4 大主流链",
      "Trade seamlessly across Binance Chain, Base, Ethereum, and Solana from one terminal.":
        "从一个终端顺畅交易 Binance Chain、Base、Ethereum 和 Solana。",
      "Keyword Based Trading": "基于关键词的交易",
      "Set up keyword triggers and let the agent buy new launches when a name or symbol matches your criteria.":
        "设置关键词触发器，当名称或符号符合条件时，让代理买入新发行项目。",
      Copytrade: "复制交易",
      "Follow Your Favorite Traders": "跟随你喜欢的交易者",
      "Copy wallets you follow automatically. Add the address, choose presets, and enable copy trading.":
        "自动复制你关注的钱包。添加地址、选择预设，然后启用复制交易。",
      "Trading Signals": "交易信号",
      "Sparta AI Token Signals": "Sparta AI 代币信号",
      "Sparta agents monitor markets 24/7 and surface AI Picks so you can spot opportunities earlier.":
        "Sparta agents 24/7 监控市场并展示 AI Picks，帮助你更早发现机会。",
      "Gasless Spam": "免 Gas Spam",
      "Spam Token Contracts": "Spam 代币合约",
      "Spam new token contracts with no gas paid on failed attempts. You only pay for successful transactions.":
        "对新代币合约进行 spam，失败尝试不支付 gas。你只为成功交易付费。",
      "Start Trading In Seconds": "几秒内开始交易",
      "Open a token, choose the wallet and amount, confirm the trade, and keep the market context visible while the position is active.":
        "打开代币，选择钱包和金额，确认交易，并在仓位活跃时保持市场上下文可见。",
      "Trading steps": "交易步骤",
      Scan: "扫描",
      "Find the opportunity": "找到机会",
      "Use discovery feeds, token views, and chain filters to identify setups worth acting on.":
        "使用发现信息流、代币视图和链筛选器，识别值得操作的设置。",
      Execute: "执行",
      "One-click execution": "一键执行",
      "Move straight from token review into buy and sell controls without leaving the terminal or bot.":
        "从代币审查直接进入买卖控制，无需离开终端或机器人。",
      Manage: "管理",
      "Track what happens next": "跟踪后续变化",
      "Keep wallet, position, and performance visibility near the same actions you use daily.":
        "让钱包、仓位和表现数据靠近你每天使用的操作。",
      "Sparta trading controls": "Sparta 交易控件",
      "By traders, for traders": "由交易者打造，服务交易者",
      "Two interfaces, one platform": "两个界面，一个平台",
      "Sparta is designed and built by experienced traders and software engineers who understand what active traders need from a serious trading platform.":
        "Sparta 由经验丰富的交易者和软件工程师设计并构建，他们了解活跃交易者对严肃交易平台的需求。",
      "Open Sparta Telegram Bot": "打开 Sparta Telegram 机器人",
      "Trade directly through Telegram with the Sparta trading bot. Same platform, different interface.":
        "通过 Telegram 使用 Sparta 交易机器人直接交易。同一平台，不同界面。",
      "Open Sparta Trading Terminal": "打开 Sparta 交易终端",
      "Trading Terminal": "交易终端",
      "Trade through the Sparta trading terminal and stay ahead of the market with everything you need in one place.":
        "通过 Sparta 交易终端交易，把所需工具集中在一处，领先市场一步。",
      "Any suggestions?": "有建议吗？",
      "Have feedback or ideas? Reach out through any of the contact options and let us know.":
        "有反馈或想法？通过任意联系方式告诉我们。",
      "Start Trading Like A Pro": "像专业人士一样交易",
      "Sparta brings together professional trading tools, fast execution, and multi-chain access in one connected platform built for serious traders.":
        "Sparta 将专业交易工具、快速执行和多链接入整合到一个为严肃交易者打造的连接平台中。",
      "Sparta is a professional multi-chain trading platform built for speed, execution, and the workflows active traders rely on every day.":
        "Sparta 是一个专业多链交易平台，为速度、执行和活跃交易者每天依赖的工作流程而建。",
      Documentation: "文档",
      Community: "社区",
      "Social links": "社交链接",
      "Sparta on X": "Sparta 的 X",
      "Sparta on Telegram": "Sparta 的 Telegram",
      "Privacy Policy": "隐私政策",
      "Terms of Service": "服务条款",
      "Sparta trading © 2026": "Sparta trading © 2026",
    },
  };

  function normalizeText(value) {
    return String(value || "")
      .replace(/\s+/g, " ")
      .trim();
  }

  function normalizeLanguage(language) {
    if (!language) return DEFAULT_LANGUAGE;
    if (SUPPORTED_LANGUAGES.includes(language)) return language;
    const value = String(language).toLowerCase();
    if (value === "zh" || value === "zh-cn" || value.indexOf("zh-hans") === 0)
      return "zh-CN";
    if (value === "nl" || value === "nl-nl" || value.indexOf("nl-") === 0)
      return "nl-NL";
    if (value === "en" || value.indexOf("en-") === 0) return "en";
    return DEFAULT_LANGUAGE;
  }

  function getSavedLanguage() {
    try {
      return normalizeLanguage(
        window.localStorage.getItem(STORAGE_KEY) || navigator.language
      );
    } catch (error) {
      return DEFAULT_LANGUAGE;
    }
  }

  function saveLanguage(language) {
    try {
      window.localStorage.setItem(STORAGE_KEY, language);
    } catch (error) {
      // localStorage can be unavailable in private or embedded browsing contexts.
    }
  }

  let currentLanguage = getSavedLanguage();

  function translate(key) {
    return (
      TRANSLATIONS[currentLanguage]?.[key] ??
      TRANSLATIONS[DEFAULT_LANGUAGE]?.[key] ??
      key
    );
  }

  function createLanguageSelector(variant) {
    const menu = document.createElement("details");
    const summary = document.createElement("summary");
    const flag = document.createElement("span");
    const code = document.createElement("span");
    const dropdown = document.createElement("div");

    menu.className = `site-language-menu site-language-menu--${variant}`;
    menu.setAttribute("data-site-language-menu", variant);
    summary.className = "site-language-summary";
    flag.className = "site-language-current-flag";
    flag.setAttribute("aria-hidden", "true");
    code.className = "site-language-current-code";
    code.setAttribute("aria-hidden", "true");
    dropdown.className = "site-language-dropdown";

    LANGUAGE_OPTIONS.forEach((option) => {
      const button = document.createElement("button");
      const optionFlag = document.createElement("span");
      const optionLabel = document.createElement("span");

      button.className = "site-language-option";
      button.type = "button";
      button.setAttribute("data-site-language-option", option.code);
      optionFlag.className = "site-language-option-flag";
      optionFlag.setAttribute("aria-hidden", "true");
      optionFlag.textContent = option.flag;
      optionLabel.className = "site-language-option-label";
      button.append(optionFlag, optionLabel);
      button.addEventListener("click", () => {
        setLanguage(option.code);
        menu.removeAttribute("open");
      });
      dropdown.appendChild(button);
    });

    summary.append(flag, code);
    menu.append(summary, dropdown);
    return menu;
  }

  function injectLanguageSelectors() {
    const desktopActions = document.querySelector(".desktop-actions");
    if (
      desktopActions &&
      !desktopActions.querySelector("[data-site-language-menu]")
    ) {
      desktopActions.insertBefore(
        createLanguageSelector("desktop"),
        desktopActions.querySelector(".header-button")
      );
    }

    const mobileActions = document.querySelector(".mobile-menu-actions");
    if (
      mobileActions &&
      !mobileActions.querySelector("[data-site-language-menu]")
    ) {
      mobileActions.insertBefore(
        createLanguageSelector("mobile"),
        mobileActions.querySelector(".outline-button")
      );
    }
  }

  function updateLanguageSelectors() {
    const activeOption =
      LANGUAGE_OPTIONS.find((option) => option.code === currentLanguage) ||
      LANGUAGE_OPTIONS[0];
    document.querySelectorAll(".site-language-menu").forEach((menu) => {
      const summary = menu.querySelector(".site-language-summary");
      const flag = menu.querySelector(".site-language-current-flag");
      const code = menu.querySelector(".site-language-current-code");
      if (summary) {
        summary.setAttribute(
          "aria-label",
          SELECTOR_LABEL[currentLanguage] || SELECTOR_LABEL.en
        );
        summary.setAttribute(
          "title",
          SELECTOR_LABEL[currentLanguage] || SELECTOR_LABEL.en
        );
      }
      if (flag) flag.textContent = activeOption.flag;
      if (code) code.textContent = activeOption.shortLabel;

      menu.querySelectorAll(".site-language-option").forEach((button) => {
        const option =
          LANGUAGE_OPTIONS.find(
            (item) =>
              item.code === button.getAttribute("data-site-language-option")
          ) || LANGUAGE_OPTIONS[0];
        const label = button.querySelector(".site-language-option-label");
        const isActive = option.code === currentLanguage;
        button.classList.toggle("is-active", isActive);
        button.setAttribute("aria-pressed", String(isActive));
        if (label)
          label.textContent = option.label[currentLanguage] || option.label.en;
      });
    });
  }

  function storeTextKeys(root) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        if (!normalizeText(node.nodeValue)) return NodeFilter.FILTER_REJECT;
        if (node.parentElement?.closest("script, style, .site-language-menu"))
          return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      },
    });

    while (walker.nextNode()) {
      const node = walker.currentNode;
      if (!node.__spartaI18nKey)
        node.__spartaI18nKey = normalizeText(node.nodeValue);
    }
  }

  function storeAttributeKeys() {
    document.querySelectorAll("*").forEach((element) => {
      ATTRIBUTES.forEach((attribute) => {
        if (!element.hasAttribute(attribute)) return;
        const key = normalizeText(element.getAttribute(attribute));
        if (!key) return;
        element.__spartaI18nAttrs = element.__spartaI18nAttrs || {};
        if (!element.__spartaI18nAttrs[attribute])
          element.__spartaI18nAttrs[attribute] = key;
      });
    });
  }

  function applyTranslations() {
    injectLanguageSelectors();
    storeTextKeys(document.body);
    storeAttributeKeys();

    document.documentElement.setAttribute("lang", currentLanguage);
    document.title = translate("Sparta | Move Before The Market Does");

    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode(node) {
          return node.__spartaI18nKey
            ? NodeFilter.FILTER_ACCEPT
            : NodeFilter.FILTER_REJECT;
        },
      }
    );

    while (walker.nextNode()) {
      const node = walker.currentNode;
      node.nodeValue = translate(node.__spartaI18nKey);
    }

    document.querySelectorAll("*").forEach((element) => {
      const attrs = element.__spartaI18nAttrs;
      if (!attrs) return;
      Object.keys(attrs).forEach((attribute) => {
        element.setAttribute(attribute, translate(attrs[attribute]));
      });
    });

    updateLanguageSelectors();
    window.dispatchEvent(new Event("resize"));
  }

  function setLanguage(language) {
    currentLanguage = normalizeLanguage(language);
    saveLanguage(currentLanguage);
    applyTranslations();
  }

  document.addEventListener("click", (event) => {
    document.querySelectorAll(".site-language-menu[open]").forEach((menu) => {
      if (!menu.contains(event.target)) menu.removeAttribute("open");
    });
  });

  window.SpartaWebsiteI18n = {
    getLanguage: () => currentLanguage,
    setLanguage,
    t: translate,
  };

  applyTranslations();
})();
