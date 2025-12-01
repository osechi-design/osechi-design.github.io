    (function () {
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      function typeText(el, htmlText, speed, delay) {
        // reduceMotionなら即表示
        if (reduceMotion) {
          el.innerHTML = htmlText;
          el.classList.add('is-done');
          el.style.minHeight = '';
          return;
        }

        el.innerHTML = ''; // 初期化
        el.classList.add('is-typing');

        // innerHTMLのタグを1文字ずつ扱う：タグを無視せずに処理
        let i = 0;
        const chars = htmlText.match(/(<[^>]+>|[^<])/g); // タグも1単位扱い

        const tick = () => {
          if (i < chars.length) {
            el.innerHTML += chars[i++];
            setTimeout(tick, speed);
          } else {
            el.classList.remove('is-typing');
            el.classList.add('is-done');
            el.style.minHeight = '';
          }
        };

        setTimeout(tick, delay);
      }

      const io = new IntersectionObserver((entries, observer) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const el = entry.target;
          observer.unobserve(el);

          if (el.dataset.typed === '1') continue;
          el.dataset.typed = '1';

          const text = el.getAttribute('data-original-text') ?? el.textContent;

          // ここで高さを確保してから可視化→消去→タイプ開始
          const h = el.getBoundingClientRect().height;
          el.style.minHeight = h + 'px';
          el.style.visibility = 'visible';

          const speed = parseInt(el.dataset.speed, 10) || 36;
          const delay = parseInt(el.dataset.delay, 10) || 0;

          typeText(el, text, speed, delay);
        }
      }, {
        root: null,
        threshold: 0.2,
        rootMargin: '0px 0px -10% 0px'
      });

      document.addEventListener('DOMContentLoaded', () => {
        document.querySelectorAll('.type-on-scroll').forEach(el => {
          const html = el.innerHTML; // ← ここをtextContent→innerHTMLに変更
          el.setAttribute('data-original-text', html);

          if (reduceMotion) {
            el.innerHTML = html;
            el.classList.add('is-done');
            el.style.visibility = 'visible';
          } else {
            el.style.visibility = 'hidden';
          }
          io.observe(el);
        });
      });
    })();