export default function withStorage(reducer, saveToStorage, transform = (s) => s) {
  return (state, action) => {
    const nextState = reducer(state, action);
    const toSave = transform(nextState);
    saveToStorage(toSave);
    return nextState;
  };
}
