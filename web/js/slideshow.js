(function ($) {
  'use strict';

  function readData($el) {
    var o = {};
    var interval = parseInt($el.data('interval'), 10);
    if (!isNaN(interval)) o.interval = interval;
    var speed = parseInt($el.data('speed'), 10);
    if (!isNaN(speed)) o.speed = speed;
    var auto = $el.data('auto');
    if (typeof auto !== 'undefined') o.auto = auto !== false && auto !== 'false';
    return o;
  }

  function FVSlider($root, options) {
    var settings = $.extend({
      selector: '.fv-slide',
      interval: 4000,   // 1枚の表示時間(ms)
      speed: 2000,       // フェード時間(ms)
      auto: true,
      pauseOnHover: true,
      arrows: false     // 必要なら true
    }, options || {}, readData($root));

    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var $slides = $root.find(settings.selector);
    var len = $slides.length;
    if (!len) return;

    var current = 0;
    var timer = null;

    $root.attr({
      role: 'region',
      'aria-roledescription': 'carousel',
      'aria-live': 'polite'
    }).css({ position: 'relative', overflow: 'hidden' });

    // 初期配置
    $slides.each(function (i) {
      $(this).css({ position: 'absolute', inset: 0, display: i === 0 ? 'block' : 'none' })
             .attr({ id: 'fv-slide-' + i, 'aria-hidden': i === 0 ? 'false' : 'true' });
    });

    // 自動再生
    if (settings.auto && !reduce && len > 1) start();

    // タブ非表示時は停止
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) stop();
      else if (settings.auto && !reduce) start();
    });

    function start() { if (!timer) timer = setInterval(next, settings.interval); }
    function stop()  { if (timer) { clearInterval(timer); timer = null; } }
    function next()  { go((current + 1) % len, false); }

    function go(nextIndex, fromUser) {
      if (nextIndex === current) return;
      var $cur = $slides.eq(current);
      var $nxt = $slides.eq(nextIndex);
      $cur.stop(true, true).fadeOut(settings.speed).attr('aria-hidden', 'true');
      $nxt.stop(true, true).fadeIn(settings.speed).attr('aria-hidden', 'false');
      current = nextIndex;

      if ($dots.length) {
        $dots.find('.fv-dot').attr('aria-selected', 'false').removeClass('is-active')
          .eq(current).attr('aria-selected', 'true').addClass('is-active');
      }
      if (fromUser && settings.auto) { stop(); start(); }
    }

    // 外から操作したい場合の簡易API
    $root.data('fvSlider', { next: next, start: start, stop: stop, go: function (i) { go(i, true); } });
  }

  // 自動初期化（.js-fv-slider を対象）
  $(function () {
    $('.js-fv-slider').each(function () { FVSlider($(this)); });
  });
})(jQuery);
