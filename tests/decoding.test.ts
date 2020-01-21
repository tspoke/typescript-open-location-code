import { expect } from 'chai';
import 'mocha';
import OpenLocationCode from "../src/open-location-code";
import dataset from "./data/decoding";

class TestData {
    public readonly code: string;
    public readonly codeLength: number;
    public readonly latitudeLo: number;
    public readonly longitudeLo: number;
    public readonly latitudeHi: number;
    public readonly longitudeHi: number;

    public constructor(parts: Array<any>) {
        this.code = <string>parts[0];
        this.codeLength = Number.parseFloat(parts[1]);
        this.latitudeLo = Number.parseFloat(parts[2]);
        this.longitudeLo = Number.parseFloat(parts[3]);
        this.latitudeHi = Number.parseFloat(parts[4]);
        this.longitudeHi = Number.parseFloat(parts[5]);
    }
}

describe('Decoding Tests', () => {
    const testDataList: TestData[] = dataset.map(data => new TestData(data));
    const precision = 1e-10;

    it('testDecode', () => {
        expect(testDataList.length).to.greaterThan(1);

        testDataList.forEach(testData => {
            const area = OpenLocationCode.decode(testData.code);
            expect(area.codeLength).to.equal(testData.codeLength);
            expect(area.latitudeLo).to.approximately(testData.latitudeLo, precision);
            expect(area.longitudeLo).to.approximately(testData.longitudeLo, precision);
            expect(area.latitudeHi).to.approximately(testData.latitudeHi, precision);
            expect(area.longitudeHi).to.approximately(testData.longitudeHi, precision);
        });
    });
});
