'use strict';

const e = React.createElement;
const VIP_BONUSES = [0, 0.1, 0.2, 0.3, 0.45, 0.6, 0.75, 0.9, 1.1, 1.3, 1.5, 2, 2, 2];


class Calculator extends React.Component {
  constructor(props) {
    super(props);
    this.state = { playerLevel: 1, expGained: 0, vip: 0 };
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(e) {
    this.setState({ [e.target.name]: e.target.value });
  }

  getHumanReadableTime(seconds) {
    var parts = [];
    var days = (seconds / 86400 >> 0);
    var hours = (seconds / 3600 >> 0) % 24; 
    var minutes = (seconds / 60 >> 0) % 60; 
    var seconds = (seconds >> 0) % 60; 
    
    if (days) parts.push(days + ' days')
    if (hours) parts.push(hours + ' hours')
    if (minutes) parts.push(minutes + ' minutes')
    if (seconds) parts.push(seconds + ' seconds')

    return parts.join(' ');
  }

  getIdleHeroesTime(seconds) {
    var parts = [];
    var hours = (seconds / 3600 >> 0); 
    var minutes = (seconds / 60 >> 0) % 60; 
    var seconds = (seconds >> 0) % 60; 
    
    if (hours) parts.push(hours + ' hours')
    if (minutes) parts.push(minutes + ' minutes')
    if (seconds) parts.push(seconds + ' seconds')

    return parts.join(' ');
  }

  calculate() {
    var progression = [];
    var playerLevel = +this.state.playerLevel;
    var expGained = +this.state.expGained;
    var vip = +this.state.vip;
    var currentExp = CUMULATIVE_EXPERIENCE[playerLevel - 1] + expGained;
    for (var i = 1, stage, previousStage; i < Campaign.length; i++) {
      previousStage = Campaign[i - 1];
      stage = Campaign[i];
      if (currentExp < stage.required) {
        var expGain = (previousStage.exp * (1.0 + VIP_BONUSES[vip]) >> 0);
        var delta = ((stage.required - currentExp + expGain - 1) / expGain >> 0) * 5;
        progression.push({
          from: Math.max(previousStage.level, playerLevel),
          to: stage.level,
          stage: previousStage.stage,
          expGain: expGain,
          delta: delta,
        });
      }
      currentExp = Math.max(currentExp, stage.required);
    }
    return progression;
  }

  calculateTime(progression) {
    if (progression.length == 0) {
      return "Congratulations! You are level 90."
    }
    else {
      var time = 0;
      for (var i = 0, currentProgression; i < progression.length; i++) {
        time += progression[i].delta;
      }
      return "You will reach level 90 in " + this.getHumanReadableTime(time) + " (" + this.getIdleHeroesTime(time) + ".)";
    }
  }

  calculateBreakdown(progression) {
    var elements = [];
    for (var i = 0, currentProgression; i < progression.length; i++) {
      currentProgression = progression[i];
      elements.push(e('tr', { key: 'breakdown-table-tbody-tr' + currentProgression.from }, [
        e('td', { key: 'breakdown-table-tbody-from' + currentProgression.from }, currentProgression.from),
        e('td', { key: 'breakdown-table-tbody-to' + currentProgression.from }, currentProgression.to),
        e('td', { key: 'breakdown-table-tbody-stage' + currentProgression.from }, currentProgression.stage),
        e('td', { key: 'breakdown-table-tbody-exp' + currentProgression.from }, currentProgression.expGain),
        e('td', { key: 'breakdown-table-tbody-hrt' + currentProgression.from }, this.getHumanReadableTime(currentProgression.delta)),
      ]));
    }
    return elements;
  }

  getBreakdown(progression) {
    if (progression.length == 0) {
      return null;
    }
    else {
      var vip = +this.state.vip;
      var bonus = '+' + ((VIP_BONUSES[vip] * 100) >> 0) + '%';
      return e('fieldset', { key: 'breakdown-fieldset' }, [
        e('legend', { key: 'breakdown-legend' }, 'Breakdown'),
        e('table', { key: 'breakdown-table' }, [
          e('thead', { key: 'breakdown-table-thead' }, [
            e('tr', { key: 'breakdown-table-thead-tr' }, [
              e('th', { key: 'breakdown-table-thead-from' }, 'From'),
              e('th', { key: 'breakdown-table-thead-to' }, 'To'),
              e('th', { key: 'breakdown-table-thead-stage' }, 'Stage'),
              e('th', { key: 'breakdown-table-thead-exp' }, 'Exp/5s (' + bonus + ')'),
              e('th', { key: 'breakdown-table-thead-hrt' }, 'Time'),
            ]),
          ]),
          e('tbody', { key: 'breakdown-table-tbody' }, [
            this.calculateBreakdown(progression)
          ]),  // tbody
        ]),  // table
      ]);  // fieldset
    }
  }

  render() {
    var progression = this.calculate();
    return e('div', { key: 'calculator' }, [
      e('fieldset', { key: 'info-fieldset' }, [
        e('legend', { key: 'info-legend' }, 'Information'),
        e('div',  { key: 'vip-div' }, [
          e('label', { key: 'vip-label', htmlFor: 'vip' }, 'VIP: '),
          e('input', { key: 'vip-input', type: "number", name: 'vip', value: this.state.vip, min: 0, max: 13, onChange: this.handleChange}),
        ]),
        e('div',  { key: 'player-level-div' }, [
          e('label', { key: 'player-level-label', htmlFor: 'playerLevel' }, 'Player level: '),
          e('input', { key: 'player-level-input', type: "number", name: 'playerLevel', value: this.state.playerLevel, min: 1, max: 90, onChange: this.handleChange}),
        ]),
        e('div', { key: 'exp-gained-div' }, [
          e('label', { key: 'exp-gained-label', htmlFor: "expGained" }, 'Experience gained: '),
          e('input', { key: 'exp-gained-input', type: "number", name: "expGained", value: this.state.expGained, onChange: this.handleChange})
        ])  //  div
      ]),  //  fieldset
      e('fieldset', { key: 'time-fieldset' }, [
        e('legend', { key: 'time-legend' }, 'Time'),
        this.calculateTime(progression)
      ]),  // fieldset
      this.getBreakdown(progression)
    ]);  // calculator
  }
}

const domContainer = document.querySelector('#calculator_container');
ReactDOM.render(e(Calculator), domContainer);
