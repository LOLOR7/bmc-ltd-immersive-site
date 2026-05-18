/** Body scroll lock for mobile nav overlay — shared by Header and project pages. */

export function lockBodyScroll(): () => void {
  const scrollY = window.scrollY;
  const { style } = document.body;
  const prev = {
    position: style.position,
    top: style.top,
    width: style.width,
    overflow: style.overflow,
  };

  style.position = "fixed";
  style.top = `-${scrollY}px`;
  style.width = "100%";
  style.overflow = "hidden";
  document.body.classList.add("mobile-nav-open");

  return () => {
    style.position = prev.position;
    style.top = prev.top;
    style.width = prev.width;
    style.overflow = prev.overflow;
    document.body.classList.remove("mobile-nav-open");
    window.scrollTo(0, scrollY);
  };
}
