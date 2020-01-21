/**
 * Test encoding and decoding Open Location Codes.
 * @format latitude,longitude,length,expected code (empty if the input should cause an error)
 */
export default [
  [20.375,2.775,6,"7FG49Q00+"],
  [20.3700625,2.7821875,10,"7FG49QCJ+2V"],
  [20.3701125,2.782234375,11,"7FG49QCJ+2VX"],
  [20.3701135,2.78223535156,13,"7FG49QCJ+2VXGJ"],
  [47.0000625,8.0000625,10,"8FVC2222+22"],
  [-41.2730625,174.7859375,10,"4VCPPQGP+Q9"],
  [0.5,-179.5,4,"62G20000+"],
  [-89.5,-179.5,4,"22220000+"],
  [20.5,2.5,4,"7FG40000+"],
  [-89.9999375,-179.9999375,10,"22222222+22"],
  [0.5,179.5,4,"6VGX0000+"],
  [1,1,11,"6FH32222+222"],
  [90,1,4,"CFX30000+"],
  [92,1,4,"CFX30000+"],
  [1,180,4,"62H20000+"],
  [1,181,4,"62H30000+"],
  [90,1,10,"CFX3X2X2+X2"],
  [1.2,3.4,10,"6FH56C22+22"],
  [37.539669125,-122.375069724,15,"849VGJQF+VX7QR3J"],
  [37.539669125,-122.375069724,16,"849VGJQF+VX7QR3J"],
  [37.539669125,-122.375069724,100,"849VGJQF+VX7QR3J"],
  [35.6,3.033,10,"8F75J22M+26"],
  [-48.71,142.78,8,"4R347QRJ+"],
  [-70,163.7,8,"3V252P22+"],
  [-2.804,7.003,13,"6F9952W3+C6222"],
  [13.9,164.88,12,"7V56WV2J+2222"],
  [-13.23,172.77,8,"5VRJQQCC+"],
  [40.6,129.7,8,"8QGFJP22+"],
  [-52.166,13.694,14,"3FVMRMMV+JJ2222"],
  [-14,106.9,6,"5PR82W00+"],
  [70.3,-87.64,13,"C62J8926+22222"],
  [66.89,-106,10,"95RPV2R2+22"],
  [2.5,-64.23,11,"67JQGQ2C+222"],
  [-56.7,-47.2,14,"38MJ8R22+222222"],
  [-34.45,-93.719,6,"46Q8H700+"],
  [-35.849,-93.75,12,"46P85722+C222"],
  [65.748,24.316,12,"9GQ6P8X8+6C22"],
  [-57.32,130.43,12,"3QJGMCJJ+2222"],
  [17.6,-44.4,6,"789QJJ00+"],
  [-27.6,-104.8,6,"554QC600+"],
  [41.87,-145.59,13,"83HPVCC6+22222"],
  [-4.542,148.638,13,"6R7CFJ5Q+66222"],
  [-37.014,-159.936,10,"43J2X3P7+CJ"],
  [-57.25,125.49,15,"3QJ7QF2R+2222222"],
  [48.89,-80.52,13,"86WXVFRJ+22222"],
  [53.66,170.97,14,"9V5GMX6C+222222"],
  [0.49,-76.97,15,"67G5F2RJ+2222222"],
  [40.44,-36.7,12,"89G5C8R2+2222"],
  [58.73,69.95,8,"9JCFPXJ2+"],
  [16.179,150.075,12,"7R8G53HG+J222"],
  [-55.574,-70.061,12,"37PFCWGQ+CJ22"],
  [76.1,-82.5,15,"C68V4G22+2222222"],
  [58.66,149.17,10,"9RCFM56C+22"],
  [-67.2,48.6,6,"3H4CRJ00+"],
  [-5.6,-54.5,14,"6867CG22+222222"],
  [-34,145.5,14,"4RR72G22+222222"],
  [-34.2,66.4,12,"4JQ8RC22+2222"],
  [17.8,-108.5,6,"759HRG00+"],
  [10.734,-168.294,10,"722HPPM4+JC"],
  [-28.732,54.32,8,"5H3P789C+"],
  [64.1,107.9,12,"9PP94W22+2222"],
  [79.7525,6.9623,8,"CFF8QX36+"],
  [-63.6449,-25.1475,8,"398P9V43+"],
  [35.019,148.827,11,"8R7C2R9G+JR2"],
  [71.132,-98.584,15,"C6334CJ8+RC22222"],
  [53.38,-51.34,12,"985C9MJ6+2222"],
  [-1.2,170.2,12,"6VCGR622+2222"],
  [50.2,-162.8,11,"922V6622+222"],
  [-25.798,-59.812,10,"5862652Q+R6"],
  [81.654,-162.422,14,"C2HVMH3H+J62222"],
  [-75.7,-35.4,8,"29P68J22+"],
  [67.2,115.1,11,"9PVQ6422+222"],
  [-78.137,-42.995,12,"28HVV274+6222"],
  [-56.3,114.5,11,"3PMPPG22+222"],
  [10.767,-62.787,13,"772VQ687+R6222"],
  [-19.212,107.423,10,"5PG9QCQF+66"],
  [21.192,-45.145,15,"78HP5VR4+R222222"],
  [16.701,148.648,14,"7R8CPJ2X+C62222"],
  [52.25,-77.45,15,"97447H22+2222222"],
  [-68.54504,-62.81725,11,"373VF53M+X4J"],
  [76.7,-86.172,12,"C68MPR2H+2622"],
  [-6.2,96.6,13,"6M5RRJ22+22222"],
  [59.32,-157.21,12,"93F48QCR+2222"],
  [29.7,39.6,12,"7GXXPJ22+2222"],
  [-18.32,96.397,10,"5MHRM9JW+2R"],
  [-30.3,76.5,11,"4JXRPG22+222"],
  [50.342,-112.534,15,"95298FR8+RC22222"],
  [80.0100000001,58.57,15,"CHGW2H6C+2222222"],
  [80.0099999999,58.57,15,"CHGW2H5C+X2RRRRR"],
  [-80.0099999999,58.57,15,"2HFWXHRC+2222222"],
  [-80.0100000001,58.57,15,"2HFWXHQC+X2RRRRR"],
  [47.000000080000000,8.00022229,15,"8FVC2222+235235C"],
  [68.3500147997595,113.625636875353,15,"9PWM9J2G+272FWJV"],
  [38.1176000887231,165.441989844555,15,"8VC74C9R+2QX445C"],
  [-28.1217794010122,-154.066811473758,15,"5337VWHM+77PR2GR"],
];
