Tetris.Router.map(function () {
  this.resource('records', { path: '/' });
});

Tetris.RecordsRoute = Ember.Route.extend({
  model: function () {
    return this.store.find('record');
  }
});