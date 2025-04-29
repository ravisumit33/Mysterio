export default function withStorage(reducer, saveToStorage) {
  return (state, action) => {
    const nextState = reducer(state, action);
    saveToStorage(nextState);
    return nextState;
  };
}
