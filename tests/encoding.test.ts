import { expect } from 'chai';
import 'mocha';
import OpenLocationCode from "../src/open-location-code";
import dataset from "./data/encoding";

class TestData {
  public readonly latitude: number;
  public readonly longitude: number;
  public readonly codeLength: number;
  public readonly code: string;

  public constructor(parts: Array<any>) {
    this.latitude = Number.parseFloat(parts[0]);
    this.longitude = Number.parseFloat(parts[1]);
    this.codeLength = Number.parseFloat(parts[2]);
    this.code = <string>parts[3];
  }
}

describe('Encoding Tests', () => {
  const testDataList: TestData[] = dataset.map(data => new TestData(data));

  it('testEncode', () => {
    expect(testDataList.length).to.greaterThan(1);

    testDataList.forEach(testData => {
      expect(testData.code).to.equal(OpenLocationCode.encode(testData.latitude, testData.longitude, testData.codeLength));
    });
  });
});
