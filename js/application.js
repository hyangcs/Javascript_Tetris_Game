window.Tetris = Ember.Application.create();

Tetris.ApplicationAdapter = DS.LSAdapter.extend({
  namespace: 'tetris-emberjs'
});

Tetris.ApplicationRoute = Ember.Route.extend({
  setupController: function(controller) {
    controller.set('createdAt', new Date());
  }
});

Ember.Handlebars.registerBoundHelper('format-date', function(format, date) {
  return moment(date).format(format);
});