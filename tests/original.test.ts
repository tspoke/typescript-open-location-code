import {expect} from "chai";
import "mocha";
import OpenLocationCode from "../src/index";

describe.only("", () => {

  it("test encode", () => {
    // Each test has a code, the lat/lng of the center, lat/lng lo and lat/lng hi.
    const tests = [
      [
        "7FG49Q00+",
        20.375,
        2.775,
        20.35,
        2.75,
        20.4,
        2.8
      ],
      [
        "7FG49QCJ+2V",
        20.3700625,
        2.7821875,
        20.37,
        2.782125,
        20.370125,
        2.78225
      ],
      [
        "7FG49QCJ+2VX",
        20.3701125,
        2.782234375,
        20.3701,
        2.78221875,
        20.370125,
        2.78225
      ],
      [
        "7FG49QCJ+2VXGJ",
        20.3701135,
        2.78223535156,
        20.370113,
        2.782234375,
        20.370114,
        2.78223632813
      ],
      [
        "8FVC2222+22",
        47.0000625,
        8.0000625,
        47.0,
        8.0,
        47.000125,
        8.000125
      ],
      [
        "4VCPPQGP+Q9",
        -41.2730625,
        174.7859375,
        -41.273125,
        174.785875,
        -41.273,
        174.786
      ],
      [
        "62G20000+",
        0.5,
        -179.5,
        0.0,
        -180.0,
        1,
        -179
      ],
      [
        "22220000+",
        -89.5,
        -179.5,
        -90,
        -180,
        -89,
        -179
      ],
      [
        "7FG40000+",
        20.5,
        2.5,
        20.0,
        2.0,
        21.0,
        3.0
      ],
      [
        "22222222+22",
        -89.9999375,
        -179.9999375,
        -90.0,
        -180.0,
        -89.999875,
        -179.999875
      ],
      [
        "6VGX0000+",
        0.5,
        179.5,
        0,
        179,
        1,
        180
      ],
      // Special cases over 90 latitude and 180 longitude
      [
        "CFX30000+",
        90,
        1,
        89,
        1,
        90,
        2
      ],
      [
        "CFX30000+",
        92,
        1,
        89,
        1,
        90,
        2
      ],
      [
        "62H20000+",
        1,
        180,
        1,
        -180,
        2,
        -179
      ],
      ["62H30000+", 1, 181, 1, -179, 2, -178]
    ];

    for (let i = 0; i < tests.length; i++) {
      const td = tests[i];
      // Decode the code.
      const ca = OpenLocationCode.decode(<string>td[0]);
      // Encode the center coordinates.
      const code = OpenLocationCode.encode(<number>td[1], <number>td[2], ca.codeLength);
      // Did we get the same code?
      expect(td[0]).to.equal(code, "Test " + i);
      // Check that the decode gave the correct coordinates.
      expect(td[3]).approximately(ca.latitudeLo, 1e-10);
      expect(td[4]).approximately(ca.longitudeLo, 1e-10);
      expect(td[5]).approximately(ca.latitudeHi, 1e-10);
      expect(td[6]).approximately(ca.longitudeHi, 1e-10);
    }
  });

  it("testShortCodes", () => {
    const tests = [
      // full code, lat, lng, shortcode
      [
        "9C3W9QCJ+2VX",
        51.3701125,
        -1.217765625,
        "+2VX"
      ],
      // Adjust so we can't trim by 8 (+/- .000755)
      [
        "9C3W9QCJ+2VX",
        51.3708675,
        -1.217765625,
        "CJ+2VX"
      ],
      [
        "9C3W9QCJ+2VX",
        51.3693575,
        -1.217765625,
        "CJ+2VX"
      ],
      [
        "9C3W9QCJ+2VX",
        51.3701125,
        -1.218520625,
        "CJ+2VX"
      ],
      [
        "9C3W9QCJ+2VX",
        51.3701125,
        -1.217010625,
        "CJ+2VX"
      ],
      // Adjust so we can't trim by 6 (+/- .0151)
      [
        "9C3W9QCJ+2VX",
        51.3852125,
        -1.217765625,
        "9QCJ+2VX"
      ],
      [
        "9C3W9QCJ+2VX",
        51.3550125,
        -1.217765625,
        "9QCJ+2VX"
      ],
      [
        "9C3W9QCJ+2VX",
        51.3701125,
        -1.232865625,
        "9QCJ+2VX"
      ],
      [
        "9C3W9QCJ+2VX",
        51.3701125,
        -1.202665625,
        "9QCJ+2VX"
      ],
      // Added to detect error in recoverNearest functionality
      [
        "8FJFW222+",
        42.899,
        9.012,
        "22+"
      ],
      [
        "796RXG22+",
        14.95125,
        -23.5001,
        "22+"
      ]
    ];
    for (let i = 0; i < tests.length; i++) {
      const td = tests[i];
      // Shorten the code.
      const short = OpenLocationCode.shorten(<string>td[0], <number>td[1], <number>td[2]);
      expect(td[3]).to.equal(short, "Test " + i);
      const recovered = OpenLocationCode.recoverNearest(short, <number>td[1], <number>td[2]);
      expect(td[0]).to.equal(recovered, "Test " + i);
    }
  });

  it("testRecoveryNearPoles", () => {
    expect(OpenLocationCode.recoverNearest("XXXXXX+XX", -81.0, 0.0)).to.equal("2CXXXXXX+XX");
    expect(OpenLocationCode.recoverNearest("2222+22", 89.6, 0.0)).to.equal("CFX22222+22");
  });

  it("testValidity", () => {
    const tests = [
      //   code,isValid,isShort,isFull
      // Valid full codes:
      [
        "8FWC2345+G6",
        true,
        false,
        true
      ],
      [
        "8FWC2345+G6G",
        true,
        false,
        true
      ],
      [
        "8fwc2345+",
        true,
        false,
        true
      ],
      [
        "8FWCX400+",
        true,
        false,
        true
      ],
      // Valid short codes:
      [
        "WC2345+G6g",
        true,
        true,
        false
      ],
      [
        "2345+G6",
        true,
        true,
        false
      ],
      [
        "45+G6",
        true,
        true,
        false
      ],
      [
        "+G6",
        true,
        true,
        false
      ],
      // Invalid codes
      [
        "G+",
        false,
        false,
        false
      ],
      [
        "+",
        false,
        false,
        false
      ],
      [
        "8FWC2345+G",
        false,
        false,
        false
      ],
      [
        "8FWC2_45+G6",
        false,
        false,
        false
      ],
      [
        "8FWC2η45+G6",
        false,
        false,
        false
      ],
      [
        "8FWC2345+G6+",
        false,
        false,
        false
      ],
      [
        "8FWC2300+G6",
        false,
        false,
        false
      ],
      [
        "WC2300+G6g",
        false,
        false,
        false
      ],
      [
        "WC2345+G",
        false,
        false,
        false
      ]
    ];
    for (let i = 0; i < tests.length; i++) {
      const td = tests[i];
      expect(OpenLocationCode.isValid(<string>td[0])).to.equal(td[1], "Test valid " + i);
      expect(OpenLocationCode.isShort(<string>td[0])).to.equal(td[2], "Test full " + i);
      expect(OpenLocationCode.isFull(<string>td[0])).to.equal(td[3], "Test full " + i);
    }
  });
});