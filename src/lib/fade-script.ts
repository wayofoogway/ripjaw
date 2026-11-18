/**
 * The script behind <Fade>, inlined in the document head by the root layout.
 *
 * It runs before the page is drawn and does not wait for the React bundle, so
 * content at the top of a page starts to fade in with the first frame, and a
 * visitor whose bundle fails to load still sees every section.
 *
 * It marks the document with `data-js` (the stylesheet hides fades only then),
 * watches for `[data-fade=""]` elements as the page is parsed or as React adds
 * them on a later navigation, and sets `data-fade="in"` once on each when it
 * enters the viewport. A browser without the two observers gets no `data-js`,
 * so nothing is ever hidden there.
 */
export const fadeScript = [
  "(function(){",
  "var d=document,r=d.documentElement;",
  'if(!("IntersectionObserver" in window&&"MutationObserver" in window))return;',
  "var io=new IntersectionObserver(function(entries){",
  "entries.forEach(function(entry){",
  'if(entry.isIntersecting){entry.target.setAttribute("data-fade","in");io.unobserve(entry.target)}',
  "})});",
  "new MutationObserver(function(){",
  "d.querySelectorAll('[data-fade=\"\"]').forEach(function(el){io.observe(el)})",
  "}).observe(r,{childList:true,subtree:true});",
  'r.setAttribute("data-js","")',
  "})()",
].join("");
