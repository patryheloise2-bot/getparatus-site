"use strict";
(() => {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const targets = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window) || reduced) targets.forEach(el=>el.classList.add('is-visible'));
  else {
    const io=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('is-visible');io.unobserve(entry.target)}}),{rootMargin:'0px 0px -40px 0px',threshold:.1});
    targets.forEach(el=>io.observe(el));
  }
  // Gentle visual parallax, constrained so layout remains stable.
  if(!reduced){
    const art=document.querySelector('.hero-art');
    let waiting=false;
    const update=()=>{const p=Math.min(window.scrollY,800);art?.style.setProperty('--shift',Math.round(p*.07)+'px');waiting=false};
    window.addEventListener('scroll',()=>{if(!waiting){waiting=true;requestAnimationFrame(update)}},{passive:true});
  }
  const dialog=document.getElementById('trailer-dialog'), video=document.getElementById('trailer-video');
  document.getElementById('video-open')?.addEventListener('click',()=>{
    if(typeof dialog?.showModal==='function'){dialog.showModal();video?.play().catch(()=>{})}
    else if(video){video.scrollIntoView();video.controls=true}
  });
  document.getElementById('video-close')?.addEventListener('click',()=>dialog?.close());
  dialog?.addEventListener('close',()=>{if(video){video.pause();video.currentTime=0}});
  dialog?.addEventListener('click',e=>{if(e.target===dialog) dialog.close()});
})();
