const progress = document.querySelector('.card__progress')

var bar = new ProgressBar.Circle(progress, {
  color: '#717171',
  strokeWidth: 7,
  trailWidth: 7,
  easing: 'easeInOut',
  duration: 1400,
  text: {
    autoStyleContainer: false
  },
  from: { color: '#7FC396', width: 7 },
  to: { color: '#7FC396', width: 7 },
  step: function (state, circle) {
    circle.path.setAttribute('stroke', state.color);
    circle.path.setAttribute('stroke-width', state.width);

    var value = Math.round(circle.value() * 100);
    if (value === 0) {
      circle.setText('');
    } else {
      circle.setText(`${value}%`);
    }

  }
});
bar.text.style.fontFamily = '"Raleway", Helvetica, sans-serif';
bar.text.style.fontSize = '2rem';

bar.animate(0.6);