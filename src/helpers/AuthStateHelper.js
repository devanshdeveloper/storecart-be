const AuthState = require("../constants/AuthState");

class AuthStateHelper {
  constructor() {
    this.states = Object.values(AuthState);
  }

  /**
   * Get the index of a state in the state sequence
   * @param {string} state - The state to get index for
   * @returns {number} - Index of the state (-1 if not found)
   */
  getStateIndex(state) {
    return this.states.indexOf(state);
  }

  /**
   * Check if a state is valid
   * @param {string} state - The state to validate
   * @returns {boolean} - True if state is valid
   */
  isValidState(state) {
    return this.states.includes(state);
  }

  /**
   * Get the next state in the sequence
   * @param {string} currentState - The current state
   * @returns {string|null} - Next state or null if current state is the last one
   */
  getNextState(currentState) {
    const currentIndex = this.getStateIndex(currentState);
    if (currentIndex === -1 || currentIndex === this.states.length - 1) {
      return null;
    }
    return this.states[currentIndex + 1];
  }

  /**
   * Check if a state transition is allowed
   * @param {string} fromState - Current state
   * @param {string} toState - Target state
   * @returns {boolean} - True if transition is allowed
   */
  isValidTransition(fromState, toState) {
    const fromIndex = this.getStateIndex(fromState);
    const toIndex = this.getStateIndex(toState);
    
    if (fromIndex === -1 || toIndex === -1) {
      return false;
    }

    // Allow moving to the next state or any previous state
    return toIndex === fromIndex + 1 || toIndex < fromIndex;
  }

  /**
   * Get all states that come before a given state
   * @param {string} state - The target state
   * @returns {Array<string>} - Array of previous states
   */
  getPreviousStates(state) {
    const stateIndex = this.getStateIndex(state);
    if (stateIndex === -1) return [];
    return this.states.slice(0, stateIndex);
  }

  /**
   * Check if all required states up to a given state are completed
   * @param {string} currentState - The current state
   * @param {Array<string>} completedStates - Array of completed states
   * @returns {boolean} - True if all required states are completed
   */
  areRequiredStatesCompleted(currentState, completedStates) {
    const requiredStates = this.getPreviousStates(currentState);
    return requiredStates.every(state => completedStates.includes(state));
  }

  /**
   * Get the initial state
   * @returns {string} - The first state in the sequence
   */
  getInitialState() {
    return this.states[0];
  }

  /**
   * Check if a state is the final state
   * @param {string} state - The state to check
   * @returns {boolean} - True if state is the final state
   */
  isFinalState(state) {
    return state === this.states[this.states.length - 1];
  }
}

module.exports = AuthStateHelper;