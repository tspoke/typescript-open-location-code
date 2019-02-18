import { expect } from 'chai';
import 'mocha';
import OpenLocationCode from "../src/open-location-code";

describe('Precision Tests', () => {

  it('testWidthInDegrees', () => {
    expect(OpenLocationCode.decode("67000000+").getLongitudeWidth()).approximately(20.0, 0);
    expect(OpenLocationCode.decode("67890000+").getLongitudeWidth()).approximately(1., 0.01);
    expect(OpenLocationCode.decode("6789CF00+").getLongitudeWidth()).approximately(0.05, 0.01);
    expect(OpenLocationCode.decode("6789CFGH+").getLongitudeWidth()).approximately(0.0025, 0.0001);
    expect(OpenLocationCode.decode("6789CFGH+JM").getLongitudeWidth()).approximately(0.000125, 0.00001);
    expect(OpenLocationCode.decode("6789CFGH+JMP").getLongitudeWidth()).approximately(0.00003125, 0.00001);
  });

  it('testHeightInDegrees', () => {
    expect(OpenLocationCode.decode("67000000+").getLatitudeHeight()).approximately(20.0, 0);
    expect(OpenLocationCode.decode("67890000+").getLatitudeHeight()).approximately(1., 0.01);
    expect(OpenLocationCode.decode("6789CF00+").getLatitudeHeight()).approximately(0.05, 0.01);
    expect(OpenLocationCode.decode("6789CFGH+").getLatitudeHeight()).approximately(0.0025, 0.0001);
    expect(OpenLocationCode.decode("6789CFGH+JM").getLatitudeHeight()).approximately(0.000125, 0.00001);
    expect(OpenLocationCode.decode("6789CFGH+JMP").getLatitudeHeight()).approximately(0.00003125, 0.00001);
  });

  it("testMaxCodeLength", () => {
    const code = OpenLocationCode.encode(51.3701125, -10.202665625, 1000000);
    expect(code.length).equals(16, "Encoded code should have length of MAX_DIGIT_COUNT + 1 for the plus symbol.");
    expect(OpenLocationCode.isValid(code)).equals(true, "Code should be valid.");

    let tooLongCode = code + "W";
    expect(OpenLocationCode.isValid(tooLongCode)).equals(true, "Too long code with all valid characters should be valid.");

    tooLongCode = code + "U"; // Extend the code with an invalid character and make sure it is invalid.
    expect(OpenLocationCode.isValid(tooLongCode)).equals(false, "Too long code with invalid character should be invalid.");
  });

});
