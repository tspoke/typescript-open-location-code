import { expect } from 'chai';
import 'mocha';
import OpenLocationCode from "../libs/open-location-code";

const SHORT_CODE = "FFF4+W7FH";
const CODE = "8CVX" + SHORT_CODE;
const LATITUDE = 47.474812;
const LONGITUDE = -0.544313;

describe('Location Plus Code Tests', () => {
  it('should encode correctly with differents precisions', () => {
    expect(OpenLocationCode.encode(LATITUDE, LONGITUDE, 8)).to.equal(CODE.substr(0, 9)); // +1 for the + sign
    expect(OpenLocationCode.encode(LATITUDE, LONGITUDE, 10)).to.equal(CODE.substr(0, 11));
    expect(OpenLocationCode.encode(LATITUDE, LONGITUDE, 11)).to.equal(CODE.substr(0, 12));
    expect(OpenLocationCode.encode(LATITUDE, LONGITUDE, 12)).to.equal(CODE.substr(0, 13));
  });

  it('should encode correctly with small precisions and fill with zeros', () => {
    expect(OpenLocationCode.encode(LATITUDE, LONGITUDE, 6)).to.equal(CODE.substr(0, 6) + "00+");
    expect(OpenLocationCode.encode(LATITUDE, LONGITUDE, 4)).to.equal(CODE.substr(0, 4) + "0000+");
    expect(OpenLocationCode.encode(LATITUDE, LONGITUDE, 2)).to.equal(CODE.substr(0, 2) + "000000+");
  });

  it('should decode', () => {
    const codeArea = OpenLocationCode.decode(CODE);
    expect(codeArea.latitudeHi - LATITUDE > 0.00001).to.equal(false);
    expect(codeArea.longitudeHi - LONGITUDE > 0.00001).to.equal(false);
    expect(codeArea.codeLength).to.equal(12);
  });

  it('should find nearest', () => {
    expect(OpenLocationCode.recoverNearest(SHORT_CODE, LATITUDE, LONGITUDE)).to.equal(CODE);
  });
});

