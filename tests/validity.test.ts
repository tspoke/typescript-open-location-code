import {expect} from "chai";
import "mocha";
import OpenLocationCode from "../src/open-location-code";
import dataset from "./data/validity";


class TestData {
  public readonly code: string;
  public  readonly isValid: boolean;
  public  readonly isShort: boolean;
  public  readonly isFull: boolean;

  public constructor(parts: Array<any>) {
    this.code = <string>parts[0];
    this.isValid = parts[1];
    this.isShort = parts[2];
    this.isFull = parts[3];
  }
}

describe("Validity Tests", () => {
  const testDataList: TestData[] = dataset.map(data => new TestData(data));

  it("testIsValid", () => {
    testDataList.forEach(testData => {
      expect(testData.isValid).equal(OpenLocationCode.isValid(testData.code),
          `${testData.code} is ${OpenLocationCode.isValid(testData.code) ? 'valid': 'not valid'}, but should be ${testData.isValid? 'valid': 'not valid'}`);
    });
  });

  it("testIsShort", () => {
    testDataList.forEach(testData => {
      expect(testData.isShort).to.equal(OpenLocationCode.isShort(testData.code),
          `${testData.code} is ${OpenLocationCode.isShort(testData.code) ? 'short': 'not short'}, but should be ${testData.isShort? 'short': 'not short'}`);
    });
  });

  it("testIsFull", () => {
    testDataList.forEach(testData => {
      expect(testData.isFull).to.equal(OpenLocationCode.isFull(testData.code));
    });
  });
});
