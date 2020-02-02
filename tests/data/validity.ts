/**
 * Test data for validity tests.
 * Format of each line is: code,isValid,isShort,isFull
 */
export default [
  ["8FWC2345+G6",true,false,true],
  ["8FWC2345+G6G",true,false,true],
  ["8fwc2345+",true,false,true],
  ["8FWCX400+",true,false,true],
  ["WC2345+G6g",true,true,false],
  ["2345+G6",true,true,false],
  ["45+G6",true,true,false],
  ["+G6",true,true,false],
  ["G+",false,false,false],
  ["+",false,false,false],
  ["8FWC2345+G",false,false,false],
  ["8FWC2_45+G6",false,false,false],
  ["8FWC2η45+G6",false,false,false],
  ["8FWC2345+G6+",false,false,false],
  ["8FWC2345G6+",false,false,false],
  ["8FWC2300+G6",false,false,false],
  ["WC2300+G6g",false,false,false],
  ["WC2345+G",false,false,false],
  ["WC2300+",false,false,false],
  ["849VGJQF+VX7QR3J",true,false,true],
  ["849VGJQF+VX7QR3U",false,false,false],
  ["849VGJQF+VX7QR3JW",true,false,true],
  ["849VGJQF+VX7QR3JU",false,false,false]
];
