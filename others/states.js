class State {
  constructor(curState = false, data = null) {
    this.currentState = curState;
    this.data = data;
    this.setState = (st) => {
      this.currentState = st;
    };
    this.setData = (da) => {
      this.data = da;
    };
  }
}

const fileObjsState = new State(true, []);
const fileLinksState = new State(true, []);
const totalState = new State(true, 0);

module.exports = { fileObjsState, fileLinksState, totalState };
