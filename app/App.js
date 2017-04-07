var React = require('react');
var ReactDOM = require('react-dom');
var _ = require('underscore');

var Jumbotron = require('react-bootstrap').Jumbotron;
var Panel = require('react-bootstrap').Panel;
var ListGroup = require('react-bootstrap').ListGroup;
var ListGroupItem = require('react-bootstrap').ListGroupItem;
var Button = require('react-bootstrap').Button;
var Grid = require('react-bootstrap').Grid;

var Exercise = require('./Exercise');
var allExercises = require('./exercises');


var App = React.createClass({

  getInitialState: function () {
    var initialExercises = _.sample(allExercises, 3);
    var initialCategories = _.map(initialExercises, (ex) => ex.categories[0]);
    return {
      saved: [0, 0, 0],
      exercises: initialExercises,
      categories: initialCategories,
    };
  },

  saveExercise: function (id) {
    var saved = this.state.saved.slice();
    saved[id] = saved[id] ? 0 : 1;
    this.setState({saved});
  },

  saveWorkout: function() {
    var workoutName = window.prompt('Enter workout name: ');
    console.log(`Saving workout as ${workoutName}`);
    var params = {method: 'POST',
                  mode: 'cors',
                  headers: {
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify({
                    workoutName,
                    exerciseList: this.state.exercises,
                  })
                }
    fetch('http://localhost:3000/api/save_workout', params)
      .then(
        function(response) {
          console.log('made request');
          if (response.ok) {
            console.log(response);
          } else {
            console.log(`Response status not OK.  Got: ${response.status}`);
          };
        }
      )
      .catch(function(error) {
        console.log(`There was an error with your request: ${error}`);
      });
  },

  setCategory: function (id, newCategory) {
    var categories = this.state.categories.slice();
    categories[id] = newCategory;
    this.setState({categories});
  },

  rerollWorkout: function () {
    var exercises = this.state.exercises.map((exercise, index) => {
        if (this.state.saved[index]) {
          return exercise;
        } else {
          return this.chooseExercise(exercise, this.state.categories[index]);
        }
      }
    );
    this.setState({exercises});
  },

  chooseExercise: function (currentExercise, category) {
    var categoryExercises = _.filter(allExercises, function (ex) {
      return _.contains(ex.categories, category);
    });
    return _.sample(_.reject(categoryExercises, function (ex) {
      return ex === currentExercise;
    }));
  },

  render: function () {
    var workout = this.state.exercises.map((exercise, index) =>
      <ListGroupItem key={index}>
        <Exercise
          onSaveToggle={() => this.saveExercise(index)}
          onCategoryChange={(category) => this.setCategory(index, category)}
          allExercises={allExercises}
          exercise={this.state.exercises[index]}
          category={this.state.categories[index]}
          dropdownKey={index}
          saved={this.state.saved[index]}/>
      </ListGroupItem>
    );
    return (
      <Panel>
        <Jumbotron>
          <h1>Your randomized workout:</h1>
        </Jumbotron>
          <ListGroup>
            {workout}
          </ListGroup>

        <Button
          bsStyle="primary" bsSize="large"
          onClick={this.rerollWorkout}>
          Reroll Workout
        </Button>

        <Button
          bsStyle="primary" bsSize="large"
          onClick={this.saveWorkout}>
          Save Workout
        </Button>

      </Panel>
    );
  },
});

module.exports = App;
