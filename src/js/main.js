/*************************************/
/* Initialize variables              */
/*************************************/

// Colors
const white = '#EDEBEE';
const blackish = '#262626';
const grey = '#9A9CA0';
const greyDark = '#616366';
const greyPale = '#C2C3C7';
const electro = '#09D4C7';
const rock = '#0072A0';
const hip_hop = '#BEF201';
const rb = '#FFFF28';
const latin = '#FE9700';
const pop = '#E498C8';
const dance = '#DF3937';
const women = '#EB5BA7';
const men = '#0072A0';

// Screen size's related variables
const screenWidth = window.innerWidth;
const vizWidth = 200;
const vizPerRow = screenWidth >= 1600 ? 8 : Math.round((screenWidth - 30) / vizWidth);
const vizHeight = 330;
const circlesYCenter = 120;
const infoYPosition = 220;



/*************************************/
/* Load data                         */
/*************************************/

let promises = [];
promises.push(d3.csv('../data/top_streamed_songs.csv'));
promises.push(d3.csv('../data/artists_appearances_count.csv'));
Promise.all(promises).then(data => {
  topSongs = data[0];
  artistsAppearances = data[1];

  // Format numbers properly
  topSongs.forEach(d => {
    d.acous = +d.acous;
    d.bpm = +d.bpm;
    d.dB = +d.dB;
    d.dnce = +d.dnce;
    d.dur = +d.dur;
    d.live = +d.live;
    d.nrgy = +d.nrgy;
    d.pop = +d.pop;
    d.rank = +d.rank;
    d.spch = +d.spch;
    d.streams_millions = +d.streams_millions;
    d.val = +d.val;
  });

  initializeDisplay(topSongs, artistsAppearances);
});



/*************************************/
/* Append SVG                        */
/*************************************/

const initializeDisplay = (topSongs, artistsAppearances) => {
  // Append main element to container
  let viz = d3.select('#visualization');
  
  // Append each svg elements and format as a grid (using css classes)
  let tracks = viz.selectAll('div')
    .data(topSongs)
    .enter()
    .append('div')
      .attr('class', 'viz-container')
      .append('svg')
        .attr('class', d => {
          return 'track track-' + d.rank;
        })
        .attr('width', '100%')
        .attr('height', vizHeight);



  /***********************************************************************/
  /* SVG definitions                                                     */
  /* Based on a tutorial by Nadieh Bremer                                */
  /* https://www.visualcinnamon.com/2016/06/glow-filter-d3-visualization */
  /***********************************************************************/

  // Append filter element to each svg
  let defs = tracks.append('defs');
  let filters = defs.append('filter')
    .attr('id', d => 'glow-' + d.rank);

  // Apply blur
  filters.append('feGaussianBlur')
    .attr('stdDeviation', '3.5')
    .attr('result', 'coloredBlur');

  // Place the original (sharp) element on top of the blured one
  let feMerge = filters.append('feMerge');
  feMerge.append('feMergeNode')
    .attr('in', 'coloredBlur');
  feMerge.append('feMergeNode')
    .attr('in', 'SourceGraphic');



  /*************************************/
  /* Number of streams (in millions)   */
  /* most inner circle                    */
  /*************************************/

  // Create linear scale to size circles (representing the number of streams)
  const streamScale = d3.scaleLinear()
    .domain(d3.extent( topSongs, d => d.streams_millions))
    .range([10, 50]);

  // Append inner circles (representing the number of streams)
  tracks.append('circle')
    .attr('cx', '50%')
    .attr('cy', circlesYCenter)
    .attr('r', d => {
      return streamScale(d.streams_millions);
    })
    .attr('fill', d => {
      // Apply fill based on track genre
      switch(d.genre_currated) {
        case 'electro':
          return electro;
        case 'rock':
          return rock;
        case 'hip hop':
          return hip_hop;
        case 'r&b':
          return rb;
        case 'latin':
          return latin;
        case 'pop':
          return pop;
        case 'dance':
          return dance;
        default:
          return white;
      }
    })
    .style('filter', d => `url(#glow-${d.rank})`);


    /*************************************/
    /* Popularity   */
    /* most outward circle                    */
    /*************************************/

    // Create linear scale to size circles (representing the number of streams)
    const popularityScale = d3.scaleLinear()
      .domain([0, d3.max( topSongs, d => d.pop)])
      .range([0, 70]);

    // Append outward circles (popularity)
    tracks.append('circle')
      .attr('cx', '50%')
      .attr('cy', circlesYCenter)
      .attr('r', d => {
        return popularityScale(d.pop);
      })
      .attr('fill', 'none')
      .attr('stroke', greyDark)
      .attr('stroke-width', 8);


    /*************************************/
    /* Loudness (dB)                     */
    /* number of grey circle borders     */
    /*************************************/

    // Create scale for number of circles to display
    const loudnessScale = d3.scaleLinear()
      .domain(d3.extent( topSongs, d => d.dB))
      .range([0, 5]);

    // Append circles
    const appendLoudnessCircles = (rank, numCircles) => {
      for (let i = 0; i <= numCircles; i++) {
        d3.select('#rank-' + rank).append('circle')
          .attr('class', 'loudness')
          .attr('cx', '50%')
          .attr('cy', circlesYCenter)
          .attr('fill', 'none')
          .attr('stroke', greyPale)
          .attr('stroke-width', '1')
          .attr('r', 30 + (3 * i));
      }
    };

    tracks.append('g')
      .attr('id', d => {
        return 'rank-' + d.rank;
      })
      .attr('class', d => {
        appendLoudnessCircles(d.rank, Math.ceil(loudnessScale(d.dB)));
        return 'loudness-container';
      });
    


    /*************************************************/
    /* Structure (women, men, collaboration or band) */
    /* color & number of circle borders              */
    /*************************************************/

    // Append circles
    const appendStructureCircle = (structure, rank, strokeColor, strokeWidth, radius) => {
      d3.select('#structure-' + rank).append('circle')
        .attr('class', 'structure structure-' + structure)
        .attr('cx', '50%')
        .attr('cy', circlesYCenter)
        .attr('fill', 'none')
        .attr('stroke', strokeColor)
        .attr('stroke-width', strokeWidth)
        .attr('r', radius);
    };

    tracks.append('g')
    .attr('id', d => {
      return 'structure-' + d.rank;
    })
    .attr('class', d => {
      switch (d.sex_structure) {
        case 'women':
        case 'men':
          const structureColor = d.sex_structure === 'women' ? women : men;
          appendStructureCircle(d.sex_structure, d.rank, structureColor, 2, 50);
          break;
        case 'collaboration':
          for (let i = 0; i < 2; i++) {
            appendStructureCircle(d.sex_structure, d.rank, white, 2, 50 + (6 * i));
          }
          break;
        case 'band':
          for (let i = 0; i < 2; i++) {
            appendStructureCircle(d.sex_structure, d.rank, white, 2, 50 + (6 * i));
          }
          appendStructureCircle(d.sex_structure, d.rank, white, 1, 53);
          break;
      }

      return 'structure-container';
    });



    /*****************************************************************/
    /* Number of appearances of the primary artist(s) in the top 100 */
    /* outward dots                                                  */
    /*****************************************************************/

    // Get number of appearances
    const getNumberOfAppearances = (artist) => {
      const numAppearances = artistsAppearances.find(item => item.artist === artist).count;
      return +numAppearances;
    };

    // Display number of appearances
    const appendAppearances = (rank, numArtists, totalAppearances, numAppearances_1, numAppearances_2, numAppearances_3) => {
      const angle = degreesToRadians(360 / totalAppearances);
      let appearanceColor = blackish;

      const appearancesContainer = d3.select('.track-' + rank).append('g')
        .attr('class', 'appearances-container');

      for (let i = 0; i < totalAppearances; i++) {
        if (i === numAppearances_1) {
          appearanceColor = white;
        } else if (i === numAppearances_2 && numAppearances_2 !== 0) {
          appearanceColor = grey;
        }

        appearancesContainer.append('circle')
          .attr('class', 'appearance-circle')
          .attr('cx', 85 + (70 * Math.sin(angle * i)))
          .attr('cy', circlesYCenter - (70 * Math.cos(angle * i)))
          .attr('r', 3)
          .attr('fill', appearanceColor)
          .attr('stroke', 'none');
      }
    };
    
    tracks.append('circle')
      .attr('class', 'appearances-arc')
      .attr('cx', '50%')
      .attr('cy', circlesYCenter)
      .attr('r', 70)
      .attr('fill', 'none')
      .attr('stroke', 'none')
      .attr('stroke-width', d => {
        // Get number of appearances of each primary artist(s)
        let numArtists = 1;
        const numAppearances_1 = getNumberOfAppearances(d.primary_artist_1);
        let numAppearances_2 = 0;
        let numAppearances_3 = 0;
        if (d.primary_artist_2 !== '') {
          numArtists += 1;
          numAppearances_2 = getNumberOfAppearances(d.primary_artist_2); 
        }
        if (d.primary_artist_3 !== '') {
          numArtists += 1;
          numAppearances_3 = getNumberOfAppearances(d.primary_artist_3);
        }
        
        const totalAppearances = numAppearances_1 + numAppearances_2 + numAppearances_3;

        appendAppearances(d.rank, numArtists, totalAppearances, numAppearances_1, numAppearances_2, numAppearances_3);
        
        return 1;
      });



    /*************************************************/
    /* Arcs                                          */
    /* Liveness/Acousticness & Duration              */
    /*************************************************/

    const sideArcGenerator = d3.arc()
      .innerRadius(81)
      .outerRadius(85)
      .cornerRadius(3);

    //  Duration (sec)
    const durationArcs = tracks.append('g')
      .attr('class', 'duration-arcs');
    
    const durationScale = d3.scaleLinear()
      .domain(d3.extent( topSongs, d => d.dur))
      .range([135, 45]);

    durationArcs.append('path')
      .attr('class', 'arc-bg arc-duration-bg')
      .attr('fill', blackish)
      .style('transform', `translate(50%, ${circlesYCenter}px)`)
      .attr('d', d => sideArcGenerator({
        startAngle: degreesToRadians(135),
        endAngle: degreesToRadians(45)
      }));

    durationArcs.append('path')
      .attr('class', 'arc-sup arc-duration-sup')
      .attr('fill', white)
      .style('transform', `translate(50%, ${circlesYCenter}px)`)
      .attr('d', d => sideArcGenerator({
        startAngle: degreesToRadians(135),
        endAngle: degreesToRadians(durationScale(d.dur))
      }));

    // Liveness / Acousticness
    const livenessArcs = tracks.append('g')
      .attr('class', 'liveness-arcs');
    
    const livenessScale = d3.scaleLinear()
      .domain(d3.extent( topSongs, d => d.live))
      .range([-90, -45]);
    const acousticnessScale = d3.scaleLinear()
      .domain(d3.extent( topSongs, d => d.acous))
      .range([-90, -135]);

    livenessArcs.append('path')
      .attr('class', 'arc-bg arc-liveness-bg')
      .attr('fill', blackish)
      .style('transform', `translate(50%, ${circlesYCenter}px)`)
      .attr('d', d => sideArcGenerator({
        startAngle: degreesToRadians(-135),
        endAngle: degreesToRadians(-45)
      }));

    livenessArcs.append('path')
      .attr('class', 'arc-sup arc-liveness-sup')
      .attr('fill', white)
      .style('transform', `translate(50%, ${circlesYCenter}px)`)
      .attr('d', d => sideArcGenerator({
        startAngle: degreesToRadians(-90),
        endAngle: degreesToRadians(livenessScale(d.live))
      }));

    livenessArcs.append('path')
      .attr('class', 'arc-sup arc-acousticness-sup')
      .attr('fill', white)
      .style('transform', `translate(50%, ${circlesYCenter}px)`)
      .attr('d', d => sideArcGenerator({
        startAngle: degreesToRadians(-90),
        endAngle: degreesToRadians(acousticnessScale(d.acous))
      }));



    /****************************************************/
    /* Arcs                                             */
    /* tempo, energy, danceability, valence, speechness */
    /****************************************************/

    const tempoScale = d3.scaleLinear()
      .domain([60, 190])
      .range([0, 10]);

    const topArcScale = d3.scaleLinear()
      .domain([0, 100])
      .range([0, 10]);
    
    const topArcGenerator = d3.arc()
      .cornerRadius(3);

    const topArcs = tracks.append('g')
      .attr('arc', 'top-arcs-container');
    
    const appendTopArcs = (id, numberOfArcs, startAngle, endAngle) => {
      for (let i = 0; i < numberOfArcs; i++) {
        const j = i;
        const angle_start = startAngle;
        const angle_end = endAngle;

        d3.select('#' + id).append('path')
          .attr('class', 'top-arc top-arc-danceability')
          .attr('fill', white)
          .style('transform', `translate(50%, ${circlesYCenter}px)`)
          .attr('d', d => topArcGenerator({
            innerRadius: 85 + (3 * j),
            outerRadius: 87 + (3 * j),
            startAngle: angle_start,
            endAngle: angle_end
          }));
      }
    };

    // Tempo
    const bpmContainer = topArcs.append('g')
      .attr('id', d => 'top-arcs-bpm-' + d.rank)
      .attr('class', d => {
        appendTopArcs(
          'top-arcs-bpm-' + d.rank,
          Math.ceil(tempoScale(d.bpm)),
          degreesToRadians(-29),
          degreesToRadians(-18)
        );
        
        return 'top-arcs-section top-arcs-danceability';
      });

    // Energy
    const energyContainer = topArcs.append('g')
      .attr('id', d => 'top-arcs-energy-' + d.rank)
      .attr('class', d => {
        appendTopArcs(
          'top-arcs-energy-' + d.rank,
          Math.ceil(topArcScale(d.nrgy)),
          degreesToRadians(-17),
          degreesToRadians(-6)
        );
        
        return 'top-arcs-section top-arcs-danceability';
      });

    // Danceability
    const danceabilityContainer = topArcs.append('g')
      .attr('id', d => 'top-arcs-danceability-' + d.rank)
      .attr('class', d => {
        appendTopArcs(
          'top-arcs-danceability-' + d.rank,
          Math.ceil(topArcScale(d.dnce)),
          degreesToRadians(-5),
          degreesToRadians(5)
        );
        
        return 'top-arcs-section top-arcs-danceability';
      });

    // Valence
    const valenceContainer = topArcs.append('g')
      .attr('id', d => 'top-arcs-valence-' + d.rank)
      .attr('class', d => {
        appendTopArcs(
          'top-arcs-valence-' + d.rank,
          Math.ceil(topArcScale(d.val)),
          degreesToRadians(6),
          degreesToRadians(17)
        );

        return 'top-arcs-section top-arcs-danceability';
      });

    // Speechness
    const speechnessContainer = topArcs.append('g')
      .attr('id', d => 'top-arcs-speechness-' + d.rank)
      .attr('class', d => {
        appendTopArcs(
          'top-arcs-speechness-' + d.rank,
          Math.ceil(topArcScale(d.spch)),
          degreesToRadians(18),
          degreesToRadians(29)
        );

        return 'top-arcs-section top-arcs-danceability';
      });



    /*************************************************/
    /* Track info                                    */
    /* song's title, artist, genre and year          */
    /*************************************************/

    const trackInfo = tracks.append('g')
      .attr('class', 'track-info');
      
    // Append title
    trackInfo.append('text')
        .attr('id', d => 'info-title-' + d.rank)
        .attr('class', 'info-title')
        .attr('x', 85)
        .attr('y', infoYPosition)
        .attr('dy', 0.2)
        .attr('text-anchor', 'middle')
        .text(d => d.song)
        .call(wrap, 170);

    // Append artist(s)
    trackInfo.append('text')
      .attr('id', d => 'info-artist-' + d.rank)
      .attr('class', 'info-artist')
      .attr('x', 85)
      .attr('y', d => {
        var infoTitleHeight = Math.round(document.getElementById('info-title-' + d.rank).getBBox().height);
        return infoYPosition + infoTitleHeight;
      })
      .attr('dy', 0.3)
      .attr('text-anchor', 'middle')
      .text(d => d.artist)
      .call(wrap, 170);

    // Append genre + year
    trackInfo.append('text')
      .attr('class', 'info-genre-year')
      .attr('x', 85)
      .attr('y', d => {
        var infoTitleHeight = Math.round(document.getElementById('info-title-' + d.rank).getBBox().height);
        var infoArtistHeight = Math.round(document.getElementById('info-artist-' + d.rank).getBBox().height);
        return infoYPosition + infoTitleHeight + infoArtistHeight + 10;
      })
      .attr('dy', 0.3)
      .attr('text-anchor', 'middle')
      .text(d => {
        const year = d.date_published.substring(0, 4);
        return `${d.genre}, ${year}`;
      })
      .call(wrap, 170);
};



/*************************************************/
/* Helper functions                              */
/*************************************************/

// Convert degrees to radians
const degreesToRadians = (angle) => {
  return angle * Math.PI / 180;
};

// Wrap text - Function originally written by Mike Bostocks
const wrap = (text, width) => {
  text.each(function() {
    let text = d3.select(this),
        words = text.text().split(/\s+/).reverse(),
        word,
        line = [],
        lineNumber = 0,
        lineHeight = 1.1, // ems
        x = text.attr("x"),
        y = text.attr("y"),
        dy = parseFloat(text.attr("dy")),
        tspan = text.text(null).append("tspan").attr("x", x).attr("y", y).attr("dy", dy + "em");
    
    while (word = words.pop()) {
      line.push(word);
      tspan.text(line.join(" "));
      if (tspan.node().getComputedTextLength() > width) {
        line.pop();
        tspan.text(line.join(" "));
        line = [word];
        tspan = text.append("tspan").attr("x", x).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
      }
    }
  });
};
