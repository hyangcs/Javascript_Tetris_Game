Tetris.RecordsController = Ember.ArrayController.extend({
  actions: {
    createScore: function () {
      var name = this.get('newName');
      var points = this.get('newPoints');
      if(name ===undefined) name = '';
      if (!name.trim()) name = 'You';

      // Create the new Todo model
      var record = this.store.createRecord('record', {
         name: name,
         score: points,
         date: new Date()
      });

      this.set('newName', '');
      this.set('newPoints', 0);

      // Save the new model
      record.save();

      $('#new_score_row').css("display", "none");
    }
  }, 

  sortedContent: function(){
    return this.slice(0, 10)
  }.property('@each'), 

  sortProperties: ['score'],
  sortAscending: false
});
