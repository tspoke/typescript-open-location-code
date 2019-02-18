import { expect } from 'chai';
import 'mocha';
import OpenLocationCode from "../src/open-location-code";
import dataset from "./data/encoding";

class TestData {
  public readonly code: string;
  public readonly latitude: number;
  public readonly longitude: number;
  public readonly decodedLatitudeLo: number;
  public readonly  decodedLatitudeHi: number;
  public readonly decodedLongitudeLo: number;
  public readonly  decodedLongitudeHi: number;

  public constructor(parts: Array<any>) {
    this.code = <string>parts[0];
    this.latitude = Number.parseFloat(parts[1]);
    this.longitude = Number.parseFloat(parts[2]);
    this.decodedLatitudeLo = Number.parseFloat(parts[3]);
    this.decodedLongitudeLo = Number.parseFloat(parts[4]);
    this.decodedLatitudeHi = Number.parseFloat(parts[5]);
    this.decodedLongitudeHi = Number.parseFloat(parts[6]);
  }
}

describe('Encoding Tests', () => {
  const testDataList: TestData[] = dataset.map(data => new TestData(data));

  it('testEncodeFromLatLong', () => {
    testDataList.forEach(testData => {
      let codeLength = testData.code.length - 1;
      if (testData.code.indexOf("0") !== -1) {
        codeLength = testData.code.indexOf("0");
      }
      expect(testData.code).to.equal( OpenLocationCode.encode(testData.latitude, testData.longitude, codeLength))
    });
  });

  it('testDecode', () => {
    testDataList.forEach(testData => {
      const decoded = OpenLocationCode.decode(testData.code);
      expect(testData.decodedLatitudeLo).approximately(decoded.latitudeLo, 1e-10);
      expect(testData.decodedLongitudeLo).approximately(decoded.longitudeLo, 1e-10);
      expect(testData.decodedLatitudeHi).approximately(decoded.latitudeHi, 1e-10);
      expect(testData.decodedLongitudeHi).approximately(decoded.longitudeHi, 1e-10);
    });
  });

  it('testClipping', () => {
    expect(OpenLocationCode.encode(-90, 5)).to.equal(OpenLocationCode.encode(-91, 5));
    expect(OpenLocationCode.encode(90, 5)).to.equal(OpenLocationCode.encode(91, 5));
    expect(OpenLocationCode.encode(5, 175)).to.equal(OpenLocationCode.encode(5, -185));
    expect(OpenLocationCode.encode(5, 175)).to.equal(OpenLocationCode.encode(5, -905));
    expect(OpenLocationCode.encode(5, -175)).to.equal(OpenLocationCode.encode(5, 905));
  });

  it('testContains', () => {
    testDataList.forEach(testData => {
      const olc = new OpenLocationCode(testData.code);
      const decoded = OpenLocationCode.decode(olc.getCode());

      expect(olc.contains(decoded.latitudeCenter, decoded.longitudeCenter)).to.equal(true);
      expect(olc.contains(decoded.latitudeLo, decoded.longitudeLo)).to.equal(true);
      expect(olc.contains(decoded.latitudeHi, decoded.longitudeHi)).to.equal(false);
      expect(olc.contains(decoded.latitudeLo, decoded.longitudeHi)).to.equal(false);
      expect(olc.contains(decoded.latitudeHi, decoded.longitudeLo)).to.equal(false);
    });
  });
});
