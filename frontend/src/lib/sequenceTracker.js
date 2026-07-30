/**
 * HAFROSE — Race Condition Sequence Tracker (Phase 4)
 * 
 * Protects against out-of-order response overwrites:
 * - Assigns monotonically increasing sequence IDs to query keys (e.g. search inputs).
 * - Rejects old responses if a newer request for the same key has already been dispatched.
 */

class SequenceTracker {
  constructor() {
    this.sequences = new Map();
  }

  /**
   * Next sequence ID for key
   */
  nextSequence(key) {
    const current = this.sequences.get(key) || 0;
    const next = current + 1;
    this.sequences.set(key, next);
    return next;
  }

  /**
   * Checks if response is current
   */
  isCurrent(key, seqId) {
    return (this.sequences.get(key) || 0) === seqId;
  }

  reset(key) {
    if (key) {
      this.sequences.delete(key);
    } else {
      this.sequences.clear();
    }
  }
}

export const sequenceTracker = new SequenceTracker();
