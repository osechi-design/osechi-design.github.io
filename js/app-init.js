// js/app-init.js
(() => {
  'use strict';

  // DOM ready ユーティリティ
  const onReady = (fn) => {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  };

  onReady(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const GLOBAL_START_DELAY = 400; // 可視後の“タメ”のデフォルト(ms)

    /* =========================
       1) jQuery.ripples（任意）
       ========================= */
    if (window.jQuery && jQuery.fn && typeof jQuery.fn.ripples === 'function') {
      try { jQuery('.ripple').length && jQuery('.ripple').ripples({ resolution: 512, dropRadius: 20, perturbance: 0.04 }); } catch(e){ console.warn('ripples .ripple:', e); }
      try { jQuery('.ripple-profile').length && jQuery('.ripple-profile').ripples({ resolution: 512, dropRadius: 20, perturbance: 0.05 }); } catch(e){ console.warn('ripples .ripple-profile:', e); }
      try { jQuery('.ripple-works').length && jQuery('.ripple-works').ripples({ resolution: 512, dropRadius: 80, perturbance: 0.04 }); } catch(e){ console.warn('ripples .ripple-works:', e); }
    } else {
      // 読み込んでいないページでは黙ってスキップ
      // console.info('ripples plugin not loaded or no targets.');
    }

    /* =========================
       2) slick（任意・使うページのみ）
       ========================= */
    if (window.jQuery && jQuery.fn && typeof jQuery.fn.slick === 'function') {
      const $thumb = jQuery('.thumb');
      const $main  = jQuery('.slider_thumb');
      if ($thumb.length && $main.length) {
        if (!$main.hasClass('slick-initialized')) {
          $main.slick({ arrows: false, asNavFor: '.thumb', slidesToShow: 1, adaptiveHeight: true });
        }
        if (!$thumb.hasClass('slick-initialized')) {
          $thumb.slick({
            slidesToShow: 5,
            slidesToScroll: 1,
            asNavFor: '.slider_thumb',
            focusOnSelect: true,
            centerMode: false,
            responsive: [
              { breakpoint: 1024, settings: { slidesToShow: 4 } },
              { breakpoint: 640,  settings: { slidesToShow: 3 } }
            ]
          });
        }
        // 任意：現在サムネの視覚状態
        $thumb.off('afterChange.osechi').on('afterChange.osechi', function(e, slick, idx){
          jQuery(this).find('.slick-slide').removeClass('is-active')
                       .eq(idx).addClass('is-active');
        });
      }
    } else {
      // console.info('slick not loaded or no slider targets.');
    }

    /* =========================================
       3) Worksアニメ（行分割＋IntersectionObserver）
       ========================================= */
    try {
      // a) <br>で1行ずつに分割 → <span class="line">…</span>
      document.querySelectorAll('.fadeup-lines').forEach(el => {
        if (el.dataset.linesBuilt === '1') return; // 二重実行ガード
        const parts = el.innerHTML.split(/<br\s*\/?>/i).map(s => s.trim());
        el.innerHTML = parts.map(s => `<span class="line">${s}</span>`).join('');
        const base = parseInt(el.dataset.delay || '0', 10) || 0;
        const interval = parseInt(el.dataset.interval || '70', 10) || 70;
        el.querySelectorAll('.line').forEach((line, i) => {
          line.style.transitionDelay = (base + i * interval) + 'ms';
        });
        el.dataset.linesBuilt = '1';
      });

      // b) 可視→（data-start か GLOBAL_START_DELAY 待ち）→ .is-in
      const io = new IntersectionObserver((entries, obs) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const el = entry.target;

          const local = parseInt(el.dataset.start || '', 10);
          const startDelay = Number.isFinite(local) && !isNaN(local) ? local : GLOBAL_START_DELAY;

          if (reduce) {
            el.classList.add('is-in');   // モーション削減時は即時
            obs.unobserve(el);
            continue;
          }
          setTimeout(() => { el.classList.add('is-in'); }, startDelay);
          obs.unobserve(el);             // 一度きり
        }
      }, { threshold: 0.15, rootMargin: '0px 0px -10% 0px' });

      // c) 対象登録
      document.querySelectorAll('.slidein-left, .fadeup-lines').forEach(el => {
        reduce ? el.classList.add('is-in') : io.observe(el);
      });
    } catch (e) {
      console.error('Works animation init error:', e);
    }
  });
})();
