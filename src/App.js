import React from 'react';
import axios from 'axios';
import './App.css';

class Counter extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      baseCount: 0,
      correction: 0,
    }
  }
  componentWillMount() {
    axios({
      method: 'get',
      url: 'https://api.coronavirus.data.gov.uk/v2/data?areaType=overview&metric=cumPeopleVaccinatedFirstDoseByPublishDate&format=json'
    }).then((response) => {
      this.setState({
        baseCount: response.data.body[0].cumPeopleVaccinatedFirstDoseByPublishDate
      });
    })

    axios({
      method: 'get',
      url: 'https://api.coronavirus.data.gov.uk/v2/data?areaType=overview&metric=newPeopleVaccinatedFirstDoseByPublishDate&format=json'
    }).then((response) => {
      const lastSeven = response.data.body.slice(0, 6);
      const totalLastSeven = lastSeven.flatMap(day => day.newPeopleVaccinatedFirstDoseByPublishDate).reduce((a, b) => a + b, 0);
      const avgLastSeven = totalLastSeven / 7;
      const avgPerSecond = avgLastSeven/(24*60*60);
      const date = new Date();
      const seconds = date.getSeconds() + (60 * (date.getMinutes() + (60 * date.getHours())));
      const correction = Math.floor(avgPerSecond * seconds);
      const timeForOne = Math.floor((1 / avgPerSecond) *  1000);

      this.setState({
        correction: correction
      });
      
      this.timer = setInterval(() => {
        this.setState({
          correction: this.state.correction += 1
        });
      }, timeForOne);
    })
  }
  componentWillUnmount(){
      clearTimeout(this.timer);
  }
  render() {
    return (
      <div>
        {this.state.baseCount + this.state.correction}
      </div>
    );
  }
};

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <div className="App-counter">
          <Counter />
        </div>
        <p>
          Estimated people who have received 1st dose COVID-19 vaccinations.
        </p>
        <p className="App-license-info">
          This is not official information. For entertainment purposes only. Based on data from the <a className="App-link" href="https://coronavirus.data.gov.uk/" target="_blank" rel="noopener noreferrer">UK Government</a>.
          <br />
          Contains public sector information licensed under the <a className="App-link" href="https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/" target="_blank" rel="noopener noreferrer">Open Government Licence v3.0</a>.</p>
        <p className="App-license-info">
        <a className="App-link" href="https://github.com/luntdotp/vaccine-counter" target="_blank" rel="noopener noreferrer">Source Code</a>
        </p>
      </header>
    </div>
  );
}


export default App;
