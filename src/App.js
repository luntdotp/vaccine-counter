import React from 'react';
import axios from 'axios';
import './App.css';

class Counter extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      avgPerSecond: 0,
      baseCount: 0,
      baseCorrection: 0,
      additionalCorrection: 0,
      dataDate: null,
    }
  }
  componentWillMount() {
    axios({
      method: 'get',
      url: 'https://api.coronavirus.data.gov.uk/v2/data?areaType=overview&metric=cumPeopleVaccinatedFirstDoseByPublishDate&format=json'
    }).then((response) => {
      const dateArray = response.data.body[0].date.split("-")
      const dataDate = new Date(dateArray[0], parseInt(dateArray[1]) - 1, dateArray[2], 23, 59, 59)
      this.setState({
        baseCount: response.data.body[0].cumPeopleVaccinatedFirstDoseByPublishDate,
        dataDate: dataDate
      });

      axios({
        method: 'get',
        url: 'https://api.coronavirus.data.gov.uk/v2/data?areaType=overview&metric=newPeopleVaccinatedFirstDoseByPublishDate&format=json'
      }).then((response) => {
        const lastSeven = response.data.body.slice(0, 6);
        const totalLastSeven = lastSeven.flatMap(day => day.newPeopleVaccinatedFirstDoseByPublishDate).reduce((a, b) => a + b, 0);
        const avgPerSecond = totalLastSeven/(7*24*60*60);
        const timeForOne = Math.floor((1 / avgPerSecond) *  1000);

        this.setState({
          avgPerSecond
        });
        
        this.getBaseCorrection()

        this.timer = setInterval(() => {
          this.setState({
            additionalCorrection: this.state.additionalCorrection + 1
          });
        }, timeForOne);
      })
    })
  }
  componentWillUnmount(){
      clearTimeout(this.timer);
  }
  getBaseCorrection() {
    const dateNow = new Date();
    const secondsSinceDataPublished = Math.floor((dateNow.getTime() - this.state.dataDate.getTime()) / 1000);
    const baseCorrection = Math.floor(this.state.avgPerSecond * secondsSinceDataPublished);

    this.setState({
      baseCorrection,
    });
  }
  render() {
    return (
      <div>
        {this.state.baseCount + this.state.baseCorrection + this.state.additionalCorrection}
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
          Estimated people who have received 1st dose of COVID-19 vaccination in the UK.
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
