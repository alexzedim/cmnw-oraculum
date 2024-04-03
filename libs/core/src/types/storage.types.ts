export interface VotingCounter {
  yes: number;
  no: number;
  voters: Set<string>;
}
