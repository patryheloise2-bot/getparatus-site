(() => {
  const dialog = document.getElementById('video-dialog');
  const film = document.getElementById('film');
  function openFilm(){if(!dialog)return;dialog.showModal();film?.play().catch(()=>{});}
  function closeFilm(){if(!dialog)return;film?.pause();dialog.close();}
  document.getElementById('open-video')?.addEventListener('click',openFilm);
  document.getElementById('preview-video')?.addEventListener('click',openFilm);
  document.getElementById('close-video')?.addEventListener('click',closeFilm);
  dialog?.addEventListener('click',e=>{if(e.target===dialog)closeFilm();});
  dialog?.addEventListener('close',()=>film?.pause());
  if(!window.matchMedia('(prefers-reduced-motion: reduce)').matches && 'IntersectionObserver' in window){
    const items=[...document.querySelectorAll('[data-appear]')];
    if(items.length){document.documentElement.classList.add('has-js');
      const obs=new IntersectionObserver(entries=>{for(const e of entries){if(e.isIntersecting){e.target.classList.add('shown');obs.unobserve(e.target)}}},{threshold:.08,rootMargin:'0px 0px 80px 0px'});
      items.forEach(el=>obs.observe(el));
    }
  }
})();
