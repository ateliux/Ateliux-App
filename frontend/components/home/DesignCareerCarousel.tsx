"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";

const mobileCarouselQuery = "(max-width: 1023px)";

type DesignCareerCarouselProps = {
  children: ReactNode;
};

type DragState = {
  pointerId: number;
  startX: number;
  startScrollLeft: number;
};

export function DesignCareerCarousel({ children }: DesignCareerCarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<DragState | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const centerMiddleCard = useCallback(() => {
    const track = trackRef.current;

    if (!track || !window.matchMedia(mobileCarouselQuery).matches) {
      return;
    }

    const middleCard = track.querySelector<HTMLElement>(
      '[data-carousel-card="middle"]',
    );

    if (!middleCard) {
      return;
    }

    const centeredPosition =
      middleCard.offsetLeft - (track.clientWidth - middleCard.offsetWidth) / 2;
    const previousScrollBehavior = track.style.scrollBehavior;

    track.style.scrollBehavior = "auto";
    track.scrollLeft = Math.max(
      0,
      Math.min(centeredPosition, track.scrollWidth - track.clientWidth),
    );
    track.style.scrollBehavior = previousScrollBehavior;
  }, []);

  useEffect(() => {
    const track = trackRef.current;

    if (!track) {
      return;
    }

    const mediaQuery = window.matchMedia(mobileCarouselQuery);
    let viewportWidth = window.innerWidth;

    const syncCarouselPosition = () => {
      if (mediaQuery.matches) {
        centerMiddleCard();
      } else {
        track.scrollLeft = 0;
      }
    };

    const handleResize = () => {
      if (window.innerWidth === viewportWidth) {
        return;
      }

      viewportWidth = window.innerWidth;
      syncCarouselPosition();
    };

    syncCarouselPosition();
    mediaQuery.addEventListener("change", syncCarouselPosition);
    window.addEventListener("resize", handleResize);

    return () => {
      mediaQuery.removeEventListener("change", syncCarouselPosition);
      window.removeEventListener("resize", handleResize);
    };
  }, [centerMiddleCard]);

  const finishDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;

    if (!drag || drag.pointerId !== event.pointerId) {
      return;
    }

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    dragRef.current = null;
    setIsDragging(false);
  };

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (
      event.pointerType !== "mouse" ||
      event.button !== 0 ||
      !window.matchMedia(mobileCarouselQuery).matches
    ) {
      return;
    }

    const target = event.target;

    if (
      target instanceof Element &&
      target.closest("a, button, input, select, textarea")
    ) {
      return;
    }

    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startScrollLeft: event.currentTarget.scrollLeft,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
    setIsDragging(true);
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;

    if (!drag || drag.pointerId !== event.pointerId) {
      return;
    }

    event.preventDefault();
    event.currentTarget.scrollLeft =
      drag.startScrollLeft - (event.clientX - drag.startX);
  };

  const handlePointerLeave = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.buttons === 0) {
      finishDrag(event);
    }
  };

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (
      !window.matchMedia(mobileCarouselQuery).matches ||
      (event.key !== "ArrowLeft" && event.key !== "ArrowRight")
    ) {
      return;
    }

    event.preventDefault();
    event.currentTarget.scrollBy({
      left:
        event.key === "ArrowRight"
          ? event.currentTarget.clientWidth * 0.85
          : event.currentTarget.clientWidth * -0.85,
      behavior: "smooth",
    });
  };

  return (
    <div
      ref={trackRef}
      role="region"
      aria-label="Demonstrações visuais do processo de design"
      aria-roledescription="carrossel"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={finishDrag}
      onPointerCancel={finishDrag}
      onPointerLeave={handlePointerLeave}
      onLostPointerCapture={() => {
        dragRef.current = null;
        setIsDragging(false);
      }}
      className={`scrollbar-none relative mx-auto mt-10 flex max-w-6xl touch-auto select-none items-start gap-5 overflow-x-auto scroll-smooth px-3 pb-8 focus:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-4 lg:pointer-events-none lg:mt-16 lg:cursor-default lg:snap-none lg:justify-center lg:gap-8 lg:overflow-visible lg:px-8 lg:pb-0 lg:focus-visible:ring-0 ${
        isDragging
          ? "cursor-grabbing snap-none"
          : "cursor-grab snap-x snap-mandatory"
      }`}
    >
      {children}
    </div>
  );
}
