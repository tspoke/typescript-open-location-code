import { expect } from 'chai';
import 'mocha';
import OpenLocationCode from "../src/open-location-code";

describe('Recover Tests', () => {

  it('testRecoveryNearSouthPole', () => {
    expect(OpenLocationCode.recoverNearest("XXXXXX+XX", -81.0,0.0)).to.equal("2CXXXXXX+XX");
  });

  it('testRecoveryNearNorthPole', () => {
    expect(OpenLocationCode.recoverNearest("2222+22", 89.6, 0.0)).to.equal("CFX22222+22");
  });

});
