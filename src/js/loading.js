const loadingAnimation = () => {
  // Set common initial properties
  gsap.set('.loudness-container, .structure-container, .appearance-circle', {
    scale: 0.5,
    transformOrigin: '50% 50%'
  });

  // Reveal the stream circle (central, colored)
  const revealStream = () => {
    let tl = gsap.timeline();
    tl.to('.stream', {
        duration: 1,
        scale: 0,
        transformOrigin: '50% 50%',
        ease: 'elastic.in(1, 0.3)',
        stagger: {
          each: 0.01,
          from: 'random',
        }
      })
      tl.reverse(0);

    return tl;
  };

  // Reveal loudness circles
  const revealLoudnessCircles = () => {
    let tl = gsap.timeline();
    tl.to('.loudness-container', {
      duration: 0.2,
      opacity: 1,
      scale: 1,
      ease: Power3.easeOut
    });

    return tl;
  };

  // Reveal structure circles
  const revealStructureCircles = () => {
    let tl = gsap.timeline();
    tl.to('.structure-container, .appearance-circle', {
        duration: 0.1,
        opacity: 1,
        scale: 1,
        ease: Power3.easeOut
      });

    return tl;
  };

  // Rotate inner circles
  const rotateCircles = () => {
    let tl = gsap.timeline();
    tl.set('.circles-container', {
        transformOrigin: '50% 50%'
      })
      .to('.circles-container', {
        duration: 2,
        rotation: 360,
        repeat: 10,
        ease: Power0.easeNone
      });

    return tl;
  };

  // Reveal top arcs
  const revealTopArcs = () => {
    document.querySelectorAll('.top-arcs-section').forEach(arcSection => {
      const delay = Math.ceil(Math.random() * 200);
      setTimeout(() => {
        let i = 0;
        for (let path of arcSection.children) {
          setTimeout(() => {
            path.classList.add('visible');
          }, i * 150);
          i++;
        }
      }, delay);
    });
  };
  setTimeout(() => {
    revealTopArcs();
  }, 2000);

  // Reveal info
  const revealInfo = () => {
    d3.selectAll('.track-info')
      .classed('visible', true);
  };
  setTimeout(() => {
    revealInfo();
  }, 3500);

  // Master timeline
  var master = gsap.timeline();
  master.add(revealStream())
        .add(revealLoudnessCircles(), '-=0.5')
        .add(revealStructureCircles(), '-=0.08')
        .add(rotateCircles());
};