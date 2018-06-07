import { expect } from 'chai';
import 'mocha';
import OpenLocationCode from "../src/index";

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

});
