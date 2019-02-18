import {expect} from "chai";
import "mocha";
import OpenLocationCode from "../src/open-location-code";
import dataset from "./data/short-codes";


class TestData {
  public readonly code: string;
  public readonly referenceLatitude: number;
  public readonly referenceLongitude: number;
  public readonly shortCode: string;
  public readonly testType: string;

  public constructor(parts: Array<any>) {
    this.code = <string>parts[0];
    this.referenceLatitude = Number.parseFloat(parts[1]);
    this.referenceLongitude = Number.parseFloat(parts[2]);
    this.shortCode = parts[3];
    this.testType = parts[4];
  }
}

describe("Shortening Tests", () => {
  const testDataList: TestData[] = dataset.map(data => new TestData(data));

  it("testShortening", () => {
    testDataList.forEach(testData => {
      if ("B" !== testData.testType && "S" !== testData.testType) {
        return;
      }
      const olc = new OpenLocationCode(testData.code);
      const shortened = OpenLocationCode.shorten(olc.getCode(), testData.referenceLatitude, testData.referenceLongitude);
      expect(testData.shortCode, shortened);
    });
  });

  it("testRecovering", () => {
    testDataList.forEach(testData => {
      if ("B" !== testData.testType && "R" !== testData.testType) {
        return;
      }
      const olc = new OpenLocationCode(testData.code);
      const recovered = OpenLocationCode.recoverNearest(olc.getCode(), testData.referenceLatitude, testData.referenceLongitude);
      expect(testData.shortCode, recovered);
    });
  });
});
